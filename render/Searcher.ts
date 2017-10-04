import {SearchLyrics} from './plugins/SearchLyrics';
import {SearchWikia} from "./plugins/SearchWikia";

import {Genius} from "./plugins/Genius";
import {NormalizeTitles} from "./NormalizeTitles";
const async = require('async');
const plugins = [SearchWikia, Genius];
const request = require('request').defaults({timeout: 5000});

interface Result {
    lyric : string;
    sourceName : string;
    sourceUrl : string;
}

export class Searcher {
    protected plugins:SearchLyrics[];
    protected normalizer : NormalizeTitles;

    constructor() {
        this.normalizer = new NormalizeTitles();
        this.loadPlugins();
    }

    loadPlugins() {
        this.plugins = plugins.map(Plugin => new Plugin(request));
    }

    search(title:string, artist:string, cb : (error : any, result : Result) => void) {
        const from = { lyric: null, sourceName: '', sourceUrl: ''};
        const normalizedTitle = this.normalizer.normalize(title);
        // run plugins on series
        // if some returns success getting a lyric
        // stop and save the lyric result
        async.detect(this.plugins, (plugin : SearchLyrics, callback) => {
            console.log('Searching with', plugin, 'normalizedTitle', normalizedTitle, 'artist', artist);
            plugin.search(normalizedTitle, artist, (err, result) => {
                console.warn('Result with', plugin, 'normalizedTitle', normalizedTitle, 'artist', artist, 'err', err, 'result', result);
                if (err) {
                    return callback(err, false);
                }
                from.lyric = result.lyric;
                from.sourceName = plugin.name;
                from.sourceUrl = result.url;
                callback(null, from);
            })
        }, err => cb(err, from));
    }
}
