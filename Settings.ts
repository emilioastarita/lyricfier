import storage = require('electron-json-storage');

interface SettingsValues {
    alwaysOnTop: boolean;
}


export class Settings {

    protected raw: SettingsValues;

    getRaw() {
        return this.raw;
    }

    load(ready) {
        storage.get('settings', (err, savedSettings: SettingsValues) => {
            if (err) savedSettings = <SettingsValues>{};
            if (('alwaysOnTop' in savedSettings) === false) {
                savedSettings['alwaysOnTop'] = this.raw.alwaysOnTop;
            }
            this.raw = savedSettings;
            ready();
        });
    }

    save(newSettings, ready) {
        let oldSettings = {};
        for (let attr in newSettings) {
            oldSettings[attr] = this.raw[attr];
        }
        if (JSON.stringify(newSettings) === JSON.stringify(oldSettings)) {
            console.log('no modifications')
        } else {
            console.log('modified settings!')
            for (let attr in newSettings) {
                this.raw[attr] = newSettings[attr];
            }
            this.persist();
        }
        ready();
    }

    persist(ready?) {
        storage.set('settings', this.raw, (err) => {
            if (err) console.log('Err persisting settings', err);
            ready(err);
        });
    }

    set(key, value) {
        this.raw[key] = value;
        this.persist();
    }

    get(key) {
        return this.raw[key];
    }


}