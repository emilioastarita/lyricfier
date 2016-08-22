import {SearchLyrics} from './plugins/SearchLyrics';
import {SearchWikia} from "./plugins/SearchWikia";
import {MusicMatch} from "./plugins/MusicMatch";
import {SpotifyService} from './SpotifyService';
const async = require('async');
const plugins = [MusicMatch, SearchWikia];
const request = require('request');

export class Searcher {

    protected service:SpotifyService;
    protected lastSongSync = {};
    protected plugins:SearchLyrics[];
    protected notifier;

    constructor(notifier) {
        this.notifier = notifier;
        this.loadPlugins();
    }


    saveLastSong(song) {
        for (let k of Object.keys(song)) {
            this.lastSongSync[k] = song[k];
        }
    }

    sendStatus(msg) {
        console.log('called send status', msg);
        this.notifier(msg);
    }

    syncLyrics(cb) {
        this.sendStatus('Getting current song!');
        this.getSpotify().getCurrentSong((err, song) => {
            if (err) {
                this.sendStatus('Current song error: ' + err);
                return;
            }
            if (this.isLastSong(song)) {
                this.sendStatus('Sending last song');
                cb(this.lastSongSync);
            }
            this.sendStatus('Current song: ' + song.title);
            this.search(song.title, song.artist, (err, lyric) => {
                if (err) {
                    this.sendStatus('Plugin error: ' + err);
                    return;
                }
                this.sendStatus('Song result!');
                song.lyric = lyric;
                this.saveLastSong(song);
                cb(song);
            });
        });
    }

    isLastSong(song) {
        for (let k of Object.keys(song)) {
            if (song[k] !== this.lastSongSync[k]) {
                return false;
            }
        }
        return true;
    }

    loadPlugins() {
        this.plugins = plugins.map((Plugin) => {
            return new Plugin(request);
        });
    }

    search(title:string, artist:string, cb) {
        let lyric = null;
        // run plugins on series
        // if some returns success getting a lyric
        // stop and save the lyric result
        async.detectSeries(this.plugins, (plugin, callback) => {
            plugin.search(title, artist, (err, result) => {
                if (!err) {
                    lyric = result;
                }
                callback(err, result)
            })
        }, (err) => {
            cb(err, lyric);
        });
    }

    getSpotify() {
        if (!this.service) {
            this.service = new SpotifyService();
        }
        return this.service;
    }

}