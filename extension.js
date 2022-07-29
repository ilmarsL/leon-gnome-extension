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

const GETTEXT_DOMAIN = 'leon-gnome-extension';

const { GObject, St, Clutter, Pango } = imports.gi;

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

        const leonUrl = this.settings.get_string(
            'leon-url',
        );

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
            vertical: true
        });
        chatArea.set_size(100,150); //this is probably wrong way to set size, but seems to work
        scrollArea.add_actor(chatArea);
        this.menu.box.add_actor(scrollArea);

        //add entry (input field)
        let myEntry = new St.Entry();
        myEntry.set_width(100);

        myEntry.clutter_text.connect('activate', (e) => {
            const userInputLabel = new St.Label({
                style_class : 'userText'
            });
            userInputLabel.set_text(e.text);     

            //set line wrap
            const clutterText = userInputLabel.get_clutter_text();
            clutterText.set_ellipsize(Pango.EllipsizeMode.NONE);
            clutterText.set_line_wrap(true);
            clutterText.set_line_alignment(Pango.Alignment.RIGHT);

            //put label into a container to prevent horizontal expand
            const userLabelcontainer = new St.BoxLayout({
                    vertical: false,
                    x_align: Clutter.ActorAlign.END,
                });
            userLabelcontainer.add_child(userInputLabel);
            chatArea.add_child(userLabelcontainer);

            //send http message
            const body = JSON.stringify({'utterance': e.text});
            myEntry.set_text('');

            let message = Soup.Message.new('POST', leonUrl);
            message.request_headers.append('x-api-key', key);
            message.set_request('application/json', 2,body);

            _httpSession.queue_message(message, function (_httpSession, message){
                const leonOutputLabel = new St.Label({
                    style_class : 'leonText'
                });
                const response = JSON.parse(message.response_body.data);
                if (response.success && response.hasOwnProperty('speeches')) {
                    leonOutputLabel.set_text(response.speeches[0]);
                }
                else {
                    leonOutputLabel.set_text(`Error: ${JSON.stringify(response)}`);
                }
                

                //set line wrap
                const clutterOutputText = leonOutputLabel.get_clutter_text();
                clutterOutputText.set_ellipsize(Pango.EllipsizeMode.NONE);
                clutterOutputText.set_line_wrap(true);

                //put label into a container to prevent horizontal expand
                const leonLabelcontainer = new St.BoxLayout({
                    vertical: false,
                    x_align: Clutter.ActorAlign.START,
                });
                leonLabelcontainer.add_child(leonOutputLabel);
                chatArea.add_child(leonLabelcontainer);
            });
        });
        this.menu.box.add_child(myEntry);
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
