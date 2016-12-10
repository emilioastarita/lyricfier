import {SearchLyrics} from './plugins/SearchLyrics';
import {SearchWikia} from "./plugins/SearchWikia";
import {MusicMatch} from "./plugins/MusicMatch";
const async = require('async');
const plugins = [MusicMatch, SearchWikia];
const request = require('request').defaults({timeout: 5000});

export class Searcher {
    protected plugins:SearchLyrics[];

    constructor() {
        this.loadPlugins();
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
}
