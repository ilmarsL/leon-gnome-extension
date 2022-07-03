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

    // Create preferences rows
    const row = new Adw.ActionRow({ title: 'Leon URL:' });
    const row2 = new Adw.ActionRow({ title: 'HTTP API Key:' });
    group.add(row);
    group.add(row2);

    //Create entry and bind it's value
    const urlEntry = new Gtk.Entry({
        text: settings.get_string('leon-url')
    }
    );
    const entry = new Gtk.Entry({
        text: settings.get_string('api-key')
    }
    );
    
    settings.bind(
        'leon-url',
        urlEntry,
        'text',
        Gio.SettingsBindFlags.DEFAULT
    );

    settings.bind(
        'api-key',
        entry,
        'text',
        Gio.SettingsBindFlags.DEFAULT
    );

    // Add the entries to the row
    row.add_suffix(urlEntry);
    row.activatable_widget = urlEntry
    row2.add_suffix(entry);
    row2.activatable_widget = entry;

    // Add our page to the window
    window.add(page);
}