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

//this works, and adds panel

const GETTEXT_DOMAIN = 'my-indicator-extension';

const { GObject, St } = imports.gi;
const Main = imports.ui.main;

let button;

function init() {
     //this adds panel
     let pMonitor = Main.layoutManager.primaryMonitor;

     button = new St.Bin({
         style_class : 'bg-color',
         reactive : true,
         can_focus : true,
         track_hover : true,
         height : 30,
         width : 200,
     });

     button.set_position(0, 50);

}

function enable() {
    Main.uiGroup.add_child(button);
}

function disable() {
    Main.uiGroup.removeChild(button);
}