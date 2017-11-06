import {SearchLyrics} from "./SearchLyrics";

const cheerio = require("cheerio");

export class Genius extends SearchLyrics {

    public name = 'Genius';

    public search(title: string, artist: string, cb: (error?: any, result?) => void) {
        let url = `https://genius.com/api/search/multi?per_page=5&q=${encodeURIComponent(artist)}%20${encodeURIComponent(title)}`;
        this.debug('url', url);
        this.doReq(url, (err, res, body) => {
            if (err || res.statusCode != 200) {
                this.debug('Error fetching search', err, res);
                return cb('Error response searching genius');
            }
            try {
                let json = JSON.parse(body);
                if (json.meta.status !== 200) {
                    this.debug('Error fetching search', err, res);
                    return cb('Error response searching genius');
                }
                let i = 0;
                while (i < 5) {
                    if (json.response.sections[i].type === 'song'){
                        let songUrl = json.response.sections[i].hits[0].result.url;
                        this.getSong(songUrl, cb);
                        break;
                    }
                    i++;
                }
            } catch (e) {
                cb('Genius fail');
            }
        });
    }

    private getSong(url: string, cb: (error?: any, result?) => void) {
        this.doReq(url, (err, res, body) => {
            if (err || res.statusCode != 200) {
                this.debug('Error fetching song', err, res);
                return cb("Error response getting song from Genius");
            }
            try {
                let lyric = this.parseContent(body);
                return cb(null, {lyric: lyric, url: url});
            } catch (e) {
                this.debug('Error parsing song', e, body);
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