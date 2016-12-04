import electron = require('electron');
import storage = require('electron-json-storage');
import BrowserWindow = Electron.BrowserWindow;
const platform = require('os').platform();
const path = require('path');


interface Settings {
    alwaysOnTop: boolean;
}

export class Lyricfier {
    protected rootDir = '';
    protected window: Electron.BrowserWindow;
    protected app: Electron.App;
    protected appIcon: Electron.Tray;
    protected settings: Settings = {
        alwaysOnTop: false
    };

    constructor(app, root) {
        this.app = app;
        this.rootDir = root;
        storage.get('settings', (err, savedSettings: Settings) => {
            if (err) savedSettings = <Settings>{};
            if (('alwaysOnTop' in savedSettings) === false) {
                savedSettings['alwaysOnTop'] = this.settings.alwaysOnTop;
            }
            this.settings = savedSettings;
            this.alwaysOnTopSetup();
        });
        this.setupEvents();
    }

    getTrayIcon() {
        let trayImage = this.getImg('icon.png');
        // Determine appropriate icon for platform
        if (platform == 'darwin') {
            trayImage = this.getImg('tray-icon-mac.png');
        }
        else if (platform == 'win32') {
            trayImage = this.getImg('tray-icon-win.ico');
        }
        return trayImage;
    }

    createWindow() {
        let options = {
            width: 500,
            height: 600,
            icon: this.getTrayIcon(),
            frame: false,
            show: false
        };
        this.window = new electron.BrowserWindow(options);
        this.window.on('close', (e) => {
            e.preventDefault();
            this.window.hide();
        });
        this.window.loadURL(this.getView('index'));
        this.window.on('ready-to-show', () => {
            this.window.show();
        });

        return this.window;
    }

    getWindow(): Electron.BrowserWindow {
        return this.window;
    }

    createAppIcon() {
        const iconPath = this.getTrayIcon();
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
        return path.join(this.rootDir, 'render', 'img', name );
    }

    getView(name) {
        return `file://${this.rootDir}/render/views/${name}.html`;
    }

    alwaysOnTopSetup() {
        this.getWindow().setAlwaysOnTop(this.settings.alwaysOnTop);
        this.getWindow().focus();
        this.appIcon.setContextMenu(this.createTrayMenu());
    }

    alwaysOnTopToggle() {
        this.settings.alwaysOnTop = !this.settings.alwaysOnTop;
        storage.set('settings', this.settings, (err) => {
            if (err) console.log('Err saving settings', err);
        });
        this.alwaysOnTopSetup();
    }

    createTrayMenu() {
        const alwaysOnTopChecked = this.settings.alwaysOnTop ? '✓' : '';
        const menu = [
            ['Lyrics', 'showLyrics'],
            ['Always on top ' + alwaysOnTopChecked, 'alwaysOnTopToggle'],
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
            this.window.restore();
        }
        if (!this.window.isFocused()) {
            this.window.focus();
        }
        return this.window;
    }

    openDeveloperTools() {
        this.getOpenWindow().webContents.send('live-reload', true);
        return this.getOpenWindow().webContents.openDevTools();
    }
}
