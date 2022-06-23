'use strict';

const { Adw, Gio, Gtk } = imports.gi;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();


function init() {
}

function fillPreferencesWindow(window) {
    // Use the same GSettings schema as in `extension.js`
    const settings = ExtensionUtils.getSettings(
        'com.ilmarsl.ilmarsl.extensions.leonext');
    
    // Create a preferences page and group
    const page = new Adw.PreferencesPage();
    const group = new Adw.PreferencesGroup();
    page.add(group);

    // Create a new preferences row
    const row = new Adw.ActionRow({ title: 'Show Extension Indicator' });
    const row2 = new Adw.ActionRow({ title: 'HTTP API Key' });
    group.add(row);
    group.add(row2);

    // Create the switch and bind its value to the `show-indicator` key
    const toggle = new Gtk.Switch({
        active: settings.get_boolean ('show-indicator'),
        valign: Gtk.Align.CENTER,
    });
    settings.bind(
        'show-indicator',
        toggle,
        'active',
        Gio.SettingsBindFlags.DEFAULT
    );

    const entry = new Gtk.Entry({
        text: settings.get_string('api-key')
    }
    );

    settings.bind(
        'api-key',
        entry,
        'text',
        Gio.SettingsBindFlags.DEFAULT
    );

    // Add the switch to the row
    row.add_suffix(toggle);
    row.activatable_widget = toggle;

    row2.add_suffix(entry);
    row2.activatable_widget = entry;

    // Add our page to the window
    window.add(page);
}