// Spitfire BBS Command Shell for Synchronet
// Inspired by the Spitfire BBS interface
// 
//
// Co-authored-by: Claude Sonnet 4.6 <claude@anthropic.com>
//
// Menu files go in: sbbs/text/menu/spitfire/
//   main.msg  - Main menu
//   msg.msg   - Message menu
//   file.msg  - File menu
//   qwk.msg   - QWK menu       (displayed by bbs.qwk_sec() internally)
//   mail.msg  - Email menu     (displayed by bbs.email_sec() internally)
//
// Register in SCFG -> Command Shells:
//   Name:          Spitfire
//   Internal Code: SPITFIRE

"use strict";

require("sbbsdefs.js", "K_UPPER");
require("userdefs.js", "UFLAG_T");
require("nodedefs.js", "NODE_MAIN");
require("key_defs.js", "KEY_UP");
require("gettext.js", "gettext");
load("termsetup.js");
var shell = load({}, "shell_lib.js");

system.settings &= ~SYS_RA_EMU; // Use (R)e-read and (A)uto-reply keys

shell.help_key = '?';

// Time display: used if unlimited time exemption, remaining otherwise
const time_code = user.security.exemptions & UFLAG_T ? "@TUSED@" : "@TLEFT@";

// ── Prompt builder ───────────────────────────────────────────────────────────

function sf_prompt(section) {
	return "\x01n\x01c\xfe \x01b\x01h" + section
		+ " \x01n\x01c\xfe \x01h" + time_code
		+ " \x01n\x01c[\x01h@GN@\x01n\x01c]: \x01n";
}

// ── Email section ─────────────────────────────────────────────────────────────
// Custom loop so we can display spitfire/mail instead of the default e-mail.msg

shell.sf_email_sec = function() {
	require("sbbsdefs.js", "WM_NONE");
	require("userdefs.js", "USER_EXPERT");
	var userprops = bbs.mods.userprops || load(bbs.mods.userprops = {}, "userprops.js");

	while(bbs.online) {
		if(!(user.settings & USER_EXPERT)) {
			console.clear();
			bbs.menu("spitfire/mail");
		}
		bbs.nodesync();
		console.newline();
		console.print("\x01_\x01y\x01hE-mail: \x01n");
		var key = console.getkeys("SARUFNKQ?\r", 0, K_UPPER);
		switch(key) {
			case 'R':	// Read Mail Sent to You
			case 'U':	// Read your un-read mail
			case 'K':	// Read/Kill mail you have sent
				const MAIL_LM_MODE = LM_REVERSE;
				var lm_mode = user.mail_settings & MAIL_LM_MODE;
				if(key == 'U')
					lm_mode |= LM_UNREAD;
				var new_lm_mode = bbs.read_mail(key == 'K' ? MAIL_SENT : MAIL_YOUR, user.number, lm_mode) & MAIL_LM_MODE;
				if(new_lm_mode != (lm_mode & MAIL_LM_MODE)) {
					if(new_lm_mode & MAIL_LM_MODE)
						user.mail_settings |= MAIL_LM_MODE;
					else
						user.mail_settings &= ~MAIL_LM_MODE;
				}
				break;
			case 'F':	// Feedback to Sysop
				shell.send_feedback();
				break;
			case 'A':	// Send File Attachment
				shell.send_email(WM_FILE);
				break;
			case 'S':	// Send mail to local user
				shell.send_email();
				break;
			case 'N':	// Send NetMail
				shell.send_netmail();
				break;
			case '?':
				if(user.settings & USER_EXPERT) {
					console.clear();
					bbs.menu("spitfire/mail");
				}
				break;
			default:
				return;	// Q or Enter — back to message menu
		}
	}
}


// ── Chat section ──────────────────────────────────────────────────────────────
// Custom loop so we can display spitfire/chat instead of the default chat.msg

shell.sf_chat_sec = function() {
	require("sbbsdefs.js", 'USER_EXPERT');
	require("nodedefs.js", 'NODE_CHAT');

	var options = load("modopts.js", "chat");
	if (!options) options = load("modopts.js", "chat_sec");
	if (!options) options = {};
	if (options.irc     === undefined) options.irc     = true;
	if (options.finger  === undefined) options.finger  = true;
	if (options.imsg    === undefined) options.imsg    = true;
	if (options.irc_seclevel === undefined) options.irc_seclevel = 90;

	var irc_servers  = (options.irc_server  !== undefined) ? options.irc_server.split(',')  : ["irc.synchro.net 6667"];
	var irc_channels = (options.irc_channel !== undefined) ? options.irc_channel.split(',') : ["#Synchronet"];
	for (var i in irc_servers)  irc_servers[i]  = irc_servers[i].trim();
	for (var i in irc_channels) irc_channels[i] = irc_channels[i].trim();

	if (user.security.restrictions & UFLAG_C) {
		write(bbs.text(bbs.text.R_Chat));
		return;
	}

	function on_or_off(on) { return bbs.text(on ? bbs.text.On : bbs.text.Off); }

	chat:
	while (bbs.online && !console.aborted) {
		if (!(user.settings & USER_EXPERT)) {
			console.clear();
			bbs.menu("spitfire/chat");
		}
		bbs.node_action = NODE_CHAT;
		bbs.nodesync();
		write(bbs.text(bbs.text.ChatPrompt));

		var keys = "CDJPQST?\r";
		if (options.imsg   && (options.imsg_requirements   === undefined || user.compare_ars(options.imsg_requirements)))   keys += "I";
		if (options.irc    && (options.irc_requirements    === undefined || user.compare_ars(options.irc_requirements)))    keys += "R";
		if (options.finger && (options.finger_requirements === undefined || user.compare_ars(options.finger_requirements))) keys += "F";

		switch (console.getkeys(keys, 0, K_UPPER)) {
			case 'S':
				var val = user.chat_settings ^= CHAT_SPLITP;
				write("\x01n\r\nPrivate split-screen chat is now: \x01h");
				writeln(on_or_off(val & CHAT_SPLITP));
				break;
			case 'A':
				var val = user.chat_settings ^= CHAT_NOACT;
				write("\x01n\r\nNode activity alerts are now: \x01h");
				writeln(on_or_off(!(val & CHAT_NOACT)));
				system.node_list[bbs.node_num-1].misc ^= NODE_AOFF;
				break;
			case 'D':
				var val = user.chat_settings ^= CHAT_NOPAGE;
				write("\x01n\r\nUser chat/messaging availability is now: \x01h");
				writeln(on_or_off(!(val & CHAT_NOPAGE)));
				system.node_list[bbs.node_num-1].misc ^= NODE_POFF;
				break;
			case 'F':
				writeln("");
				load("finger.js");
				break;
			case 'I':
				writeln("");
				load({}, "sbbsimsg.js");
				break;
			case 'R':
			{
				var server = irc_servers[0];
				if (irc_servers.length > 1) {
					for (var i = 0; i < irc_servers.length; i++)
						console.uselect(i, "IRC Server", irc_servers[i]);
					var i = console.uselect();
					if (i < 0) break;
					server = irc_servers[i];
				}
				if (user.security.level >= options.irc_seclevel || user.security.exemptions & UFLAG_C) {
					write("\r\n\x01n\x01y\x01hIRC Server: ");
					server = console.getstr(server, 40, K_EDIT|K_LINE|K_AUTODEL);
					if (console.aborted || server.length < 4) break;
				}
				var channel_list = irc_channels;
				if (options[server] !== undefined) channel_list = options[server].split(',');
				var channel;
				if (channel_list.length > 1) {
					for (var i = 0; i < channel_list.length; i++) {
						channel_list[i] = channel_list[i].trim();
						console.uselect(i, "IRC Channel", channel_list[i]);
					}
					var i = console.uselect();
					if (i < 0) break;
					channel = channel_list[i];
				} else {
					write("\r\n\x01n\x01y\x01hIRC Channel: ");
					channel = console.getstr(channel_list[0], 40, K_EDIT|K_LINE|K_AUTODEL);
				}
				if (server.indexOf(' ') < 0) server += " 6667";
				if (!console.aborted && channel.length) {
					log("IRC to " + server + " " + channel);
					bbs.exec("?irc -a " + server + " " + channel);
				}
				break;
			}
			case 'J':
				bbs.multinode_chat();
				break;
			case 'P':
				bbs.private_chat();
				break;
			case 'C':
				shell.page_sysop();
				break;
			case 'T':
				bbs.page_guru();
				break;
			case '?':
				if (user.settings & USER_EXPERT) {
					console.clear();
					bbs.menu("spitfire/chat");
				}
				break;
			default:
				break chat;	// Q or Enter — back to main menu
		}
	}
};

// ── MESSAGE MENU ─────────────────────────────────────────────────────────────

shell.msg_menu = {
	file: "spitfire/msg",
	cls: true,
	eval: 'bbs.main_cmds++',
	node_action: NODE_MAIN,
	prompt: sf_prompt("Message"),
	num_input: shell.get_sub_num,
	slash_num_input: shell.get_grp_num,
	command: {
		'N':  { eval: 'bbs.scan_subs(SCAN_NEW)',                   // New Message Scan
		        msg: '\r\n\x01c\x01hNew Message Scan\x01n\r\n' },
		'L':  { eval: 'bbs.list_msgs()' },                         // List/View Messages
		'R':  { eval: 'bbs.scan_msgs()' },                         // Read Message Prompt
		'J':  { eval: 'select_msg_area()' },                       // Jump to new MSG Area
		'K':  { eval: 'bbs.qwk_sec()' },                          // QWK Menu
		'E':  { eval: 'sf_email_sec()' },                         // E-Mail/NetMail Menu
		'A':  { eval: 'bbs.auto_msg()' },                          // Logon Auto-Message
		'P':  { eval: 'bbs.post_msg()' },                          // Post Message
		'/P': { exec: 'postpoll.js' },                             // Poll Question
		'V':  { exec: 'scanpolls.js' },                            // View/Vote-in Polls
		'F':  { eval: 'bbs.scan_subs(SCAN_FIND)',                  // Find text in Msg
		        msg: '\r\n\x01c\x01hFind Text in Messages\x01n\r\n' },
		'S':  { eval: 'bbs.scan_subs(SCAN_TOYOU)',                 // Scan for Msgs to You
		        msg: '\r\n\x01c\x01hScan for Messages Posted to You\x01n\r\n' },
		'*':  { eval: 'show_subs(bbs.curgrp)' },                   // List Sub-Boards
		'/*': { eval: 'show_grps()' },                             // List Groups
		'O':  { eval: 'logoff(false)' },                           // Log Off
		'/O': { eval: 'logoff(true)' },                            // Quick Log Off
		'!':  { eval: 'bbs.menu("sysmain")',
		        ars: 'SYSOP or EXEMPT Q or I or N' },
	},
	nav: {
		'\r': { },
		'Q':  { eval: 'menu = main_menu' },                        // Quit to Main
		'>':  { eval: 'sub_up()' },
		'}':  { eval: 'sub_up()' },
		')':  { eval: 'sub_up()' },
		'+':  { eval: 'sub_up()' },
		'=':  { eval: 'sub_up()' },
		'<':  { eval: 'sub_down()' },
		'{':  { eval: 'sub_down()' },
		'(':  { eval: 'sub_down()' },
		'-':  { eval: 'sub_down()' },
		']':  { eval: 'grp_up()' },
		'[':  { eval: 'grp_down()' },
	},
};

shell.msg_menu.nav[KEY_UP]    = { eval: 'sub_up()' };
shell.msg_menu.nav[KEY_DOWN]  = { eval: 'sub_down()' };
shell.msg_menu.nav[KEY_RIGHT] = { eval: 'grp_up()' };
shell.msg_menu.nav[KEY_LEFT]  = { eval: 'grp_down()' };

// ── MAIN MENU ────────────────────────────────────────────────────────────────

shell.main_menu = {
	file: "spitfire/main",
	cls: true,
	eval: 'bbs.main_cmds++',
	node_action: NODE_MAIN,
	prompt: sf_prompt("Main"),
	num_input: shell.get_sub_num,
	slash_num_input: shell.get_grp_num,
	command: {
		'M':  { eval: 'menu = msg_menu' },                          // Message Section
		'F':  { eval: 'enter_file_section(); menu = file_menu' },   // File Section
		'D':  { eval: 'bbs.xtrn_sec()' },                          // Door Section
		'B':  { exec: 'bullseye.js' },                              // Bulletins
		'G':  { eval: 'bbs.text_sec()' },                          // Text File Section
		'C':  { eval: 'sf_chat_sec()' },                          // Chat Menu
		'U':  { eval: 'list_users()' },                            // User List
		'Y':  { eval: 'bbs.user_config(); exit()' },               // Your Config
		'I':  { eval: 'main_info()' },                             // Information
		'/A': { exec: 'avatar_chooser.js',                         // Change your Avatar
		        ars: 'ANSI and not GUEST',
		        err: '\r\n\x01c\x01hSorry, only regular users with ANSI terminals can do that.\x01n\r\n' },
		'/L': { eval: 'bbs.list_nodes()' },                        // Node Activity
		'O':  { eval: 'logoff(false)' },                           // Logoff BBS
		'/O': { eval: 'logoff(true)' },                            // Quick Logoff
		'!':  { eval: 'bbs.menu("sysmain")',                       // Sysop menu
		        ars: 'SYSOP or EXEMPT Q or I or N' },
	},
	nav: {
		'\r': { },
		'>':  { eval: 'sub_up()' },
		'}':  { eval: 'sub_up()' },
		')':  { eval: 'sub_up()' },
		'+':  { eval: 'sub_up()' },
		'=':  { eval: 'sub_up()' },
		'<':  { eval: 'sub_down()' },
		'{':  { eval: 'sub_down()' },
		'(':  { eval: 'sub_down()' },
		'-':  { eval: 'sub_down()' },
		']':  { eval: 'grp_up()' },
		'[':  { eval: 'grp_down()' },
	},
};

shell.main_menu.nav[KEY_UP]    = { eval: 'sub_up()' };
shell.main_menu.nav[KEY_DOWN]  = { eval: 'sub_down()' };
shell.main_menu.nav[KEY_RIGHT] = { eval: 'grp_up()' };
shell.main_menu.nav[KEY_LEFT]  = { eval: 'grp_down()' };

if (typeof bbs.email_sec != 'function')
	shell.main_menu.command['E'] = { exec: 'email_sec.js' };

// ── FILE MENU ────────────────────────────────────────────────────────────────

shell.file_menu = {
	file: "spitfire/file",
	cls: true,
	eval: 'bbs.file_cmds++',
	node_action: NODE_XFER,
	prompt: sf_prompt("File"),
	num_input: shell.get_dir_num,
	slash_num_input: shell.get_lib_num,
	command: {
		'L':  { eval: 'list_files()' },                            // List files in Dir
		'J':  { eval: 'select_file_area()' },                      // Jump to New File Area
		'N':  { eval: 'bbs.scan_dirs(FL_ULTIME)',                  // New File Scan
		        msg: '\r\n\x01c\x01hNew File Scan\x01n\r\n' },
		'/N': { eval: 'bbs.scan_dirs(FL_ULTIME, true)' },
		'*':  { eval: 'show_dirs(bbs.curlib)' },                   // List Directories
		'/*': { eval: 'show_libs()' },                             // List Libraries
		'E':  { eval: 'view_file_info(FI_INFO)',                   // Extended File Info
		        msg: '\r\n\x01c\x01hList Extended File Information\x01n\r\n' },
		'F':  { eval: 'bbs.scan_dirs(FL_FINDDESC)',                // Find Text in Descrip
		        msg: '\r\n\x01c\x01hFind Text in File Descriptions\x01n\r\n' },
		'/F': { eval: 'bbs.scan_dirs(FL_FINDDESC, true)' },
		'S':  { eval: 'bbs.scan_dirs(FL_NO_HDR)',                  // Search for Filename
		        msg: '\r\n\x01c\x01hSearch for Filename(s)\x01n\r\n' },
		'/S': { eval: 'bbs.scan_dirs(FL_NO_HDR, true)' },
		'D':  { eval: 'download_files()',                          // Download a File
		        msg: '\r\n\x01c\x01hDownload File(s)\x01n\r\n',
		        ars: 'REST NOT D' },
		'/D': { eval: 'download_user_files()',                     // Download from User
		        msg: '\r\n\x01c\x01hDownload File(s) from User(s)\x01n\r\n',
		        ars: 'REST NOT D' },
		'U':  { eval: 'upload_file()',                             // Upload a File
		        msg: '\r\n\x01c\x01hUpload File\x01n\r\n' },
		'/U': { eval: 'upload_user_file()',                        // Upload to User
		        msg: '\r\n\x01c\x01hUpload File to User\x01n\r\n' },
		'B':  { eval: 'bbs.batch_menu()' },                        // Batch/Bi-Dir Xfers
		'Z':  { eval: 'upload_sysop_file()',                       // Upload to Sysop
		        msg: '\r\n\x01c\x01hUpload File to Sysop\x01n\r\n' },
		'T':  { eval: 'bbs.temp_xfer()' },                        // Temp Dir/Archive cmds
		'R':  { eval: 'view_file_info(FI_REMOVE)',                 // Remove/Edit File
		        msg: '\r\n\x01c\x01hRemove/Edit File(s)\x01n\r\n' },
		'&':  { exec: 'filescancfg.js' },                          // File Scan Config
		'I':  { eval: 'file_info()' },                             // Information
		'V':  { eval: 'view_files()',                              // View File Contents
		        msg: '\r\n\x01c\x01hView File(s)\x01n\r\n' },
		'C':  { eval: 'sf_chat_sec()' },                          // Chat Menu
		'/L': { eval: 'bbs.list_nodes()' },                        // Node Activity
		'O':  { eval: 'logoff(false)' },                           // Logoff BBS
		'/O': { eval: 'logoff(true)' },                            // Quick Logoff
		'!':  { eval: 'bbs.menu("sysxfer")', ars: 'SYSOP' },
	},
	nav: {
		'\r': { },
		'Q':  { eval: 'menu = main_menu' },                        // Quit to Main Menu
		'>':  { eval: 'dir_up()' },
		'}':  { eval: 'dir_up()' },
		')':  { eval: 'dir_up()' },
		'+':  { eval: 'dir_up()' },
		'=':  { eval: 'dir_up()' },
		'<':  { eval: 'dir_down()' },
		'{':  { eval: 'dir_down()' },
		'(':  { eval: 'dir_down()' },
		'-':  { eval: 'dir_down()' },
		']':  { eval: 'lib_up()' },
		'[':  { eval: 'lib_down()' },
	},
};

shell.file_menu.nav[KEY_UP]    = { eval: 'dir_up()' };
shell.file_menu.nav[KEY_DOWN]  = { eval: 'dir_down()' };
shell.file_menu.nav[KEY_RIGHT] = { eval: 'lib_up()' };
shell.file_menu.nav[KEY_LEFT]  = { eval: 'lib_down()' };

// ── Boot the shell ───────────────────────────────────────────────────────────

shell.menu = shell.main_menu;
shell.menu_loop();
