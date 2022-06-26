/* extension.js
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

/* exported init */

const GETTEXT_DOMAIN = 'my-indicator-extension';

const { GObject, Gio, St, Clutter, Pango } = imports.gi;

const ExtensionUtils = imports.misc.extensionUtils;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;

const Soup = imports.gi.Soup;

const _ = ExtensionUtils.gettext;


const Indicator = GObject.registerClass(
class Indicator extends PanelMenu.Button {
    
    
    _init() {
        super._init(0.0, _('My Shiny Indicator'));

        //log(Object.getOwnPropertyNames(Soup));
        log(Soup.MAJOR_VERSION);
        log(Soup.MINOR_VERSION);

        var _httpSession = new Soup.SessionAsync();
        Soup.Session.prototype.add_feature.call(_httpSession, new Soup.ProxyResolverDefault());

        this.add_child(new St.Icon({
            icon_name: 'face-smile-symbolic',
            style_class: 'system-status-icon',
        }));

        //get settings
        this.settings = ExtensionUtils.getSettings(
            'com.ilmarsl.ilmarsl.extensions.leonext');

        const key = this.settings.get_string( 
                'api-key',
            );

        log('api key is: ');
        log(key);

        
        //TODO deafult menu item, remove later
        /* 
        let item = new PopupMenu.PopupMenuItem(_('Show Notification'));
        item.connect('activate', () => {
            Main.notify(_('Whatʼs up, folks?'));
        });
        this.menu.addMenuItem(item);
        */
        
        //log('class output');
        //log(Object.getOwnPropertyNames(myItem)); //this shows something, maybe get parent properties?

        //add scrollArea
        const scrollArea = new St.ScrollView();
        scrollArea.vscrollbar_policy = St.PolicyType.AUTOMATIC; //TODO  does not work for some reason
        const vscroll = scrollArea.get_vscroll_bar();
        const vscrollAdjustment = vscroll.get_adjustment();

        // Scroll to bottom after new label is added
        vscrollAdjustment.connect('changed', () => {
            log('Vscrolladjustment changed');
            vscrollAdjustment.set_value(vscrollAdjustment.upper);
        });

        //add chatarea
        const chatArea = new St.BoxLayout({
            vertical: true,
            x_expand: true,
            y_expand: true,
        });
        chatArea.set_size(100,100); //this is probably wrong way to set size, but seems to work
        scrollArea.add_actor(chatArea);
        this.menu.box.add_actor(scrollArea);

       

        //add entry (input field)
        let myEntry = new St.Entry();
        myEntry.clutter_text.connect('activate', (e) => {
            log(`activate signal happened ${e.text}`);

            const userInputLabel = new St.Label();
            userInputLabel.set_text(e.text);
            const clutterText = userInputLabel.get_clutter_text();
            clutterText.set_ellipsize(Pango.EllipsizeMode.NONE);
            clutterText.set_line_wrap(true);
            chatArea.add_child(userInputLabel);

            //send http message
            const url = "http://localhost:1337/api/query";


            const body = JSON.stringify({'query': e.text});
            myEntry.set_text('');

            let message = Soup.Message.new('POST', url);
            //log('allProperties:');
            //log(getAllProperties(message));

            message.request_headers.append('x-api-key', key);
            

            message.set_request('application/json', 2,body);
            _httpSession.queue_message(message, function (_httpSession, message){
                const leonOutputLabel = new St.Label();
                const response = JSON.parse(message.response_body.data);
                leonOutputLabel.set_text(response.speeches[0]);
                const clutterOutputText = leonOutputLabel.get_clutter_text();
                clutterOutputText.set_ellipsize(Pango.EllipsizeMode.NONE);
                clutterOutputText.set_line_wrap(true);
                chatArea.add_child(leonOutputLabel);
        });
            //message

            //create promise and do https request
        });
        this.menu.box.add_child(myEntry);

        //const entry = new St.Entry();
        //this does not work
        //this.menu.addMenuItem(entry);
    }
});

class Extension {
    constructor(uuid) {
        this._uuid = uuid;

        ExtensionUtils.initTranslations(GETTEXT_DOMAIN);
    }

    enable() {
        this._indicator = new Indicator();
        Main.panel.addToStatusArea(this._uuid, this._indicator);
    }

    disable() {
        this._indicator.destroy();
        this._indicator = null;
    }
}

function init(meta) {
    return new Extension(meta.uuid);
}
