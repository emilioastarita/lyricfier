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

        const tasks = this.plugins.map((plugin : SearchLyrics) => {
            return (callback) => {
                console.log('Searching with', plugin, 'normalizedTitle', normalizedTitle, 'artist', artist);
                plugin.search(normalizedTitle, artist, (err, result) => {
                    console.warn('Result with', plugin, 'normalizedTitle', normalizedTitle, 'artist', artist, 'err', err, 'result', result);
                    if (err) {
                        return callback(err);
                    }
                    from.lyric = result.lyric;
                    from.sourceName = plugin.name;
                    from.sourceUrl = result.url;
                    callback(null, from);
                })
            }
        });
        async.parallel(async.reflectAll(tasks), (err, results) => {
            const result = results.find(x => !x.error);
            if (result) {
                cb(null, result.value);
            } else {
                cb(err, null);
            }
        });
    }
}
