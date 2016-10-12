import {SearchLyrics} from './plugins/SearchLyrics';
import {SearchWikia} from "./plugins/SearchWikia";
import {MusicMatch} from "./plugins/MusicMatch";
import {SpotifyService} from './SpotifyService';
const async = require('async');
const plugins = [MusicMatch, SearchWikia];
const request = require('request').defaults({timeout: 5000});

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
        this.notifier(msg);
    }

    syncLyrics(cb) {
        console.log('sync lyrics called');
        this.getSpotify().getCurrentSong((err, song) => {
            if (err) {
                this.sendStatus('Current song error: ' + err);
                return cb(true);
            }
            if (this.isLastSong(song)) {
                console.log('is last song nothing to do here');
                return cb(null, this.lastSongSync, false);
            }
            console.log('is not last song searching by title and artist');
            this.sendStatus('Current song: ' + song.title);
            this.search(song.title, song.artist, (err, lyric) => {
                if (err) {
                    this.sendStatus('Plugin error: ' + err);
                    return;
                }
                this.sendStatus('Song result!');
                song.lyric = lyric;
                this.saveLastSong(song);
                cb(null, song, true);
            });
        });
    }

    isLastSong(song) {
        for (let k of ['artist', 'title']) {
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
                callback(null, result)
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