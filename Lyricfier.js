///<reference path="typings/index.d.ts"/>
"use strict";
var electron = require('electron');
var storage = require('electron-json-storage');
var SpotifyService_1 = require('./SpotifyService');
var SearchWikia_1 = require("./plugins/SearchWikia");
var MusicMatch_1 = require("./plugins/MusicMatch");
var request = require('request');
var async = require('async');
var plugins = [MusicMatch_1.MusicMatch, SearchWikia_1.SearchWikia];
var Lyricfier = (function () {
    function Lyricfier(app, root) {
        var _this = this;
        this.rootDir = '';
        this.settings = {
            port: '4372'
        };
        this.app = app;
        this.rootDir = root;
        this.setupEvents();
        storage.get('settings', function (err, savedSettings) {
            if (err)
                return;
            if (!savedSettings)
                return;
            _this.settings = savedSettings;
        });
        this.loadPlugins();
    }
    Lyricfier.prototype.loadPlugins = function () {
        this.plugins = plugins.map(function (Plugin) {
            return new Plugin(request);
        });
    };
    Lyricfier.prototype.search = function (title, artist, cb) {
        var lyric = null;
        // run plugins on series
        // if some returns success getting a lyric
        // stop and save the lyric result
        async.detectSeries(this.plugins, function (plugin, callback) {
            plugin.search(title, artist, function (err, result) {
                if (!err) {
                    lyric = result;
                }
                callback(err, result);
            });
        }, function (err) {
            cb(err, lyric);
        });
    };
    Lyricfier.prototype.getSpotify = function () {
        if (!this.service) {
            this.service = new SpotifyService_1.SpotifyService(this.settings);
        }
        return this.service;
    };
    Lyricfier.prototype.createWindow = function () {
        var _this = this;
        this.window = new electron.BrowserWindow({ width: 500, height: 600, show: false });
        this.window.on('close', function (e) {
            e.preventDefault();
            _this.window.hide();
        });
        return this.window;
    };
    Lyricfier.prototype.getWindow = function () {
        return this.window;
    };
    Lyricfier.prototype.createAppIcon = function () {
        var iconPath = this.getImg('icon.png');
        this.appIcon = new electron.Tray(iconPath);
        this.appIcon.setContextMenu(this.createTrayMenu());
    };
    Lyricfier.prototype.setupEvents = function () {
        var _this = this;
        this.app.on('ready', function () {
            _this.createAppIcon();
            _this.createWindow();
        });
        electron.ipcMain.on('get-settings', function (event) {
            event.sender.send('settings-update', _this.settings);
        });
        electron.ipcMain.on('get-lyrics', function (event) {
            _this.syncLyrics();
        });
        electron.ipcMain.on('save-settings', function (event, newSettings) {
            var oldSettings = {};
            for (var attr in newSettings) {
                oldSettings[attr] = _this.settings[attr];
            }
            if (JSON.stringify(newSettings) === JSON.stringify(oldSettings)) {
                console.log('no modifications');
            }
            else {
                console.log('modified settings!');
                for (var attr in newSettings) {
                    _this.settings[attr] = newSettings[attr];
                }
                storage.set('settings', _this.settings, function (err) {
                    if (err)
                        console.log('Err saving settings', err);
                });
                _this.service = null;
            }
            event.sender.send('settings-update', _this.settings);
        });
    };
    Lyricfier.prototype.getImg = function (name) {
        return "/" + this.rootDir + "/render/img/" + name;
    };
    Lyricfier.prototype.getView = function (name) {
        return "file://" + this.rootDir + "/render/views/" + name + ".html";
    };
    Lyricfier.prototype.createTrayMenu = function () {
        var _this = this;
        var menu = [
            ['Sync Current', 'syncLyrics'],
            ['Settings', 'showSettings'],
            ['Lyrics', 'showLyrics'],
            ['Open Developer Tools', 'openDeveloperTools'],
            ['Quit', 'quit']
        ];
        var template = menu.map(function (item) {
            var label = item[0], fn = item[1];
            return {
                label: label,
                click: _this[fn].bind(_this)
            };
        });
        return electron.Menu.buildFromTemplate(template);
    };
    Lyricfier.prototype.quit = function () {
        process.exit(0);
    };
    Lyricfier.prototype.showSettings = function () {
        this.getOpenWindow().webContents.send('change-view', 'Settings');
    };
    Lyricfier.prototype.showLyrics = function () {
        this.getOpenWindow().webContents.send('change-view', 'SongLyrics');
    };
    Lyricfier.prototype.syncLyrics = function () {
        var _this = this;
        this.getSpotify().getCurrentSong(function (err, song) {
            if (err) {
                return;
            }
            _this.search(song.title, song.artist, function (err, lyric) {
                if (err) {
                    return;
                }
                song.lyric = lyric;
                _this.getOpenWindow().webContents.send('song-sync', song);
            });
        });
    };
    Lyricfier.prototype.getOpenWindow = function () {
        if (!this.window.isVisible()) {
            this.window.show();
            this.window.loadURL(this.getView('index'));
        }
        if (this.window.isMinimized()) {
            this.window.restore();
        }
        return this.window;
    };
    Lyricfier.prototype.openDeveloperTools = function () {
        return this.getOpenWindow().webContents.openDevTools();
    };
    return Lyricfier;
}());
exports.Lyricfier = Lyricfier;
//# sourceMappingURL=Lyricfier.js.map