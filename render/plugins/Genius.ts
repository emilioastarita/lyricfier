import {SearchLyrics} from "./SearchLyrics";
const cheerio = require("cheerio");

export class Genius extends SearchLyrics {

    public name = 'Genius';

    public search(title: string, artist: string, cb: (error?: any, result?) => void) {
        let url = `http://genius.com/search?q=${encodeURIComponent(artist)} ${encodeURIComponent(title)}`;
        this.doReq(url, (err, res, body) => {
            if (err || res.statusCode != 200) {
                return cb('Error response searching genius');
            }
            try {
                let songUrl = /href="(.*)"\s*class="\s*song_link\s*"/.exec(body)[1];
                this.getSong(songUrl, cb);
            } catch (e) {
                cb('Genius fail');
            }
        });
    }

    private getSong(url: string, cb: (error?: any, result?) => void) {
        this.doReq(url, (err, res, body) => {
            if (err || res.statusCode != 200) {
                return cb("Error response getting song from Genius");
            }
            try {
                let lyric = this.parseContent(body);
                return cb(null, {lyric: lyric, url: url});
            } catch (e) {
                cb("Genius fail parsing lyrics");
            }
        });
    }

    private parseContent(body: string): string {
        let txt = cheerio.load(body)('.lyrics p').text();
        let el = document.createElement("textarea");
        el.innerHTML = txt;
        return el.value;
    }
}