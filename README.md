# Spitfire Command Shell for Synchronet BBS

A Spitfire BBS-inspired command shell for [Synchronet BBS](https://synchrhonet.net), recreating the classic Spitfire look and feel with authentic SF-styled ANSI menus while using the full Synchronet command set underneath.

![Spitfire Shell Screenshot](spitfire-cc.png)

## Features

- Spitfire BBS-styled ANSI menus for all major sections
- Full Synchronet command set — nothing removed or dumbed down
- Custom menu loops for Chat and E-Mail sections
- Expert mode toggle (X) suppresses menus system-wide
- Linux and Windows compatible
- Drop-in install — no modifications to existing Synchronet files

## Sections

| Section | Key | Notes |
|---|---|---|
| Message | M | Full msg commands including QWK, E-Mail, polls |
| File | F | Full file transfer commands |
| Doors | D | Direct pass-through to Synchronet external programs |
| Chat | C | Custom loop with SF-styled menu |
| E-Mail/NetMail | E (from Message) | Custom loop with SF-styled menu |
| QWK | K (from Message) | Uses default Synchronet QWK display |
| Bulletins | B | Requires bullseye.js |
| Text Files | G | Synchronet text file section |

## Requirements

- Synchronet BBS v3.19 or later
- `bullseye.js` in your `exec/` directory (for Bulletins)

## Installation

### Windows

1. Copy `spitfire.js` to `\sbbs\exec\`
2. Create folder `\sbbs\text\menu\spitfire\`
3. Copy all `.msg` files to `\sbbs\text\menu\spitfire\`
4. In SCFG → Command Shells → Add new entry:
   - Name: `Spitfire`
   - Internal Code: `SPITFIRE`
5. Recycle the Terminal Server or restart Synchronet

### Linux

1. Copy `spitfire.js` to `/sbbs/exec/`
2. Create folder `/sbbs/text/menu/spitfire/`
3. Copy all `.msg` files to `/sbbs/text/menu/spitfire/`
   *(filenames must be lowercase — they already are)*
4. In SCFG → Command Shells → Add new entry:
   - Name: `Spitfire`
   - Internal Code: `SPITFIRE`
5. Recycle the Terminal Server or restart Synchronet

### Assigning the Shell

Users can select the Spitfire shell from their user config (`Y` key), or you can set it as the default for all nodes in SCFG.

## Files

| File | Destination | Description |
|---|---|---|
| `spitfire.js` | `sbbs/exec/` | Command shell |
| `main.msg` | `sbbs/text/menu/spitfire/` | Main menu |
| `msg.msg` | `sbbs/text/menu/spitfire/` | Message menu |
| `file.msg` | `sbbs/text/menu/spitfire/` | File menu |
| `chat.msg` | `sbbs/text/menu/spitfire/` | Chat menu |
| `mail.msg` | `sbbs/text/menu/spitfire/` | E-Mail/NetMail menu |
| `qwk.msg` | `sbbs/text/menu/spitfire/` | QWK menu (reference) |

## Notes

- The QWK section uses the default Synchronet QWK menu display. This is a limitation of `bbs.qwk_sec()` being a monolithic call with no external menu override path.
- Chat and E-Mail sections use custom JS loops so they display the Spitfire-styled menus correctly.
- All menu files are in Synchronet ctrl-A color code format (`.msg`).

## Version History

| Version | Date | Notes |
|---|---|---|
| 1.0 | 2026-05-26 | Initial release |

## Credits

Developed by **Xbit** / [x-bit.org](https://x-bit.org)  
Co-authored with Claude Sonnet 4.6  
Tested on Unix-Bit BBS and 32-Bit BBS

Inspired by the original Spitfire BBS by Buffalo Creek Software.

## See Also

- [Synchronet BBS](https://synchro.net)
- [Synchronet Wiki - Command Shells](https://wiki.synchro.net/custom:command_shell)
- [x-bit.org BBS Network](https://x-bit.org)
