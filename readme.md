Gnome extension that adds [Leon personal assitant](https://getleon.ai/) dialog to Gnome top bar.

HTTP api key and Leon URL can be set in extension settings. To do that you need to instal gnome extensions app for that (gnome-shell-extension-prefs package).

## Installation
1. Copy contents of the repository to `~/.local/share/gnome-shell/extensions/leonext@ilmarsl.ilmarsl.com`
2. Reboot (logging out and back in might be enough)
3. Enter http api key from leon .env file in extension settings app.
Tested on Ubuntu 22.04. LTS


## Additional notes:
If the Leon installation is on a different server it might be a good idea to use reverse proxy or something similar, since Leon currently supports only http.
