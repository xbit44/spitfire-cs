// Spitfire BBS Command Shell for Synchronet
// Inspired by the Spitfire BBS interface
// Developed for Unix-Bit BBS / x-bit.org
//
// Co-authored-by: Claude Sonnet 4.6 <claude@anthropic.com>
//
// Menu files go in: sbbs/text/menu/spitfire/
//   main.msg  - Main menu
//   msg.msg   - Message menu
//   file.msg  - File menu
//   chat.msg  - Chat menu
//   mail.msg  - E-Mail/NetMail menu
//   qwk.msg   - QWK menu
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

// All shell menus live in text/menu/spitfire/
bbs.menu_dir = "spitfire";

// ── Prompt builder ───────────────────────────────────────────────────────────

function sf_prompt(section) {
	return "\x01n\x01c\xfe \x01b\x01h" + section
		+ " \x01n\x01c\xfe \x01h" + time_code
		+ " \x01n\x01c[\x01h@GN@\x01n\x01c]: \x01n";
}

// ── Section wrappers ─────────────────────────────────────────────────────────
// Set bbs.menu_dir before each monolithic section call so it finds our
// Spitfire-styled menus, then reset it immediately after.

shell.sf_chat_sec = function() {
	console.clear();
	bbs.menu_dir = "spitfire";
	bbs.chat_sec();
	bbs.menu_dir = "spitfire";
};

shell.sf_email_sec = function() {
	console.clear();
	bbs.menu_dir = "spitfire";
	bbs.email_sec();
	bbs.menu_dir = "spitfire";
};

shell.sf_qwk_sec = function() {
	console.clear();
	bbs.menu_dir = "spitfire";
	bbs.qwk_sec();
	bbs.menu_dir = "spitfire";
};

shell.sf_temp_xfer = function() {
	console.clear();
	bbs.menu_dir = "";
	bbs.temp_xfer();
	bbs.menu_dir = "spitfire";
};

shell.sf_batch_menu = function() {
	console.clear();
	bbs.menu_dir = "";
	bbs.batch_menu();
	bbs.menu_dir = "spitfire";
};

shell.sf_text_sec = function() {
	console.clear();
	bbs.menu_dir = "";
	bbs.text_sec();
	bbs.menu_dir = "spitfire";
};

shell.sf_xtrn_sec = function() {
	console.clear();
	bbs.menu_dir = "";
	bbs.xtrn_sec();
	bbs.menu_dir = "spitfire";
};

// ── MESSAGE MENU ─────────────────────────────────────────────────────────────

shell.msg_menu = {
	file: "msg",
	cls: true,
	eval: 'bbs.menu_dir="spitfire"; bbs.main_cmds++',
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
		'K':  { eval: 'sf_qwk_sec()' },                           // QWK Menu
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
	file: "main",
	cls: true,
	eval: 'bbs.menu_dir="spitfire"; bbs.main_cmds++',
	node_action: NODE_MAIN,
	prompt: sf_prompt("Main"),
	num_input: shell.get_sub_num,
	slash_num_input: shell.get_grp_num,
	command: {
		'M':  { eval: 'menu = msg_menu' },                          // Message Section
		'F':  { eval: 'enter_file_section(); menu = file_menu' },   // File Section
		'D':  { eval: 'sf_xtrn_sec()' },                          // Door Section
		'B':  { exec: 'bullseye.js' },                              // Bulletins
		'G':  { eval: 'sf_text_sec()' },                          // Text File Section
		'C':  { eval: 'sf_chat_sec()' },                           // Chat Menu
		'U':  { eval: 'list_users()' },                            // User List
		'Y':  { eval: 'bbs.menu_dir=""; bbs.user_config(); exit()' }, // Your Config
		'I':  { eval: 'bbs.menu_dir=""; main_info(); bbs.menu_dir="spitfire"' }, // Information
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
	file: "file",
	cls: true,
	eval: 'bbs.menu_dir="spitfire"; bbs.file_cmds++',
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
		'B':  { eval: 'sf_batch_menu()' },                        // Batch/Bi-Dir Xfers
		'Z':  { eval: 'upload_sysop_file()',                       // Upload to Sysop
		        msg: '\r\n\x01c\x01hUpload File to Sysop\x01n\r\n' },
		'T':  { eval: 'sf_temp_xfer()' },                        // Temp Dir/Archive cmds
		'R':  { eval: 'view_file_info(FI_REMOVE)',                 // Remove/Edit File
		        msg: '\r\n\x01c\x01hRemove/Edit File(s)\x01n\r\n' },
		'&':  { exec: 'filescancfg.js' },                          // File Scan Config
		'I':  { eval: 'file_info()' },                             // Information
		'V':  { eval: 'view_files()',                              // View File Contents
		        msg: '\r\n\x01c\x01hView File(s)\x01n\r\n' },
		'C':  { eval: 'sf_chat_sec()' },                           // Chat Menu
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
