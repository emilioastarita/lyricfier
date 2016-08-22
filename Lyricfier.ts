///<reference path="typings/index.d.ts"/>
import electron = require('electron');
import storage = require('electron-json-storage');
import BrowserWindow = Electron.BrowserWindow;


interface Settings {
    port:string;
}



export class Lyricfier {
    protected rootDir = '';
    protected window:Electron.BrowserWindow;
    protected app:Electron.App;
    protected appIcon:Electron.Tray;
    protected settings:Settings = {
        port: '4372'
    };

    constructor(app, root) {
        this.app = app;
        this.rootDir = root;
        this.setupEvents();
        storage.get('settings', (err, savedSettings:Settings) => {
            if (err) return;
            if (!savedSettings) return;
            this.settings = savedSettings;
        });

    }


    createWindow() {
        let options = {
            width: 500,
            height: 600,
            icon: this.getImg('icon.png'),
            show: false
        };
        this.window = new electron.BrowserWindow(options);
        this.window.on('close', (e) => {
            e.preventDefault();
            this.window.hide();
        });
        this.window.loadURL(this.getView('index'));
        this.window.once('ready-to-show', () => {
            this.window.show();
        })

        return this.window;
    }

    getWindow():Electron.BrowserWindow {
        return this.window;
    }

    createAppIcon() {
        const iconPath = this.getImg('icon.png');
        this.appIcon = new electron.Tray(iconPath);
        this.appIcon.setContextMenu(this.createTrayMenu());
    }

    setupEvents() {
        this.app.on('ready', () => {
            this.createAppIcon();
            this.createWindow();
        });
        electron.ipcMain.on('get-settings', (event) => {
            event.sender.send('settings-update', this.settings);
        });

        electron.ipcMain.on('save-settings', (event, newSettings) => {
            let oldSettings = {};
            for (let attr in newSettings) {
                oldSettings[attr] = this.settings[attr];
            }
            if (JSON.stringify(newSettings) === JSON.stringify(oldSettings)) {
                console.log('no modifications')
            } else {
                console.log('modified settings!')
                for (let attr in newSettings) {
                    this.settings[attr] = newSettings[attr];
                }
                storage.set('settings', this.settings, (err) => {
                    if (err) console.log('Err saving settings', err);
                });
            }
            event.sender.send('settings-update', this.settings);
        });
    }

    getImg(name) {
        return `/${this.rootDir}/render/img/${name}`;
    }

    getView(name) {
        return `file://${this.rootDir}/render/views/${name}.html`;
    }

    createTrayMenu() {
        const menu = [
            ['Lyrics', 'showLyrics'],
            ['Settings', 'showSettings'],
            ['Open Developer Tools', 'openDeveloperTools'],
            ['Quit', 'quit']
        ];

        const template = menu.map((item) => {
            let [label, fn] = item;
            return {
                label: label,
                click: this[fn].bind(this)
            };
        });
        return electron.Menu.buildFromTemplate(template);
    }

    quit() {
        process.exit(0);
    }

    showSettings() {
        this.getOpenWindow().webContents.send('change-view', 'Settings');
    }

    showLyrics() {
        this.getOpenWindow().webContents.send('change-view', 'SongLyrics');
    }


    getOpenWindow() {
        if (!this.window.isVisible()) {
            this.window.show();
        }
        if (this.window.isMinimized()) {
            console.log('restor called');
            this.window.restore();
        }
        if (!this.window.isFocused()) {
            this.window.focus();
        }
        return this.window;
    }


    openDeveloperTools() {
        return this.getOpenWindow().webContents.openDevTools();
    }
}
