import {SearchLyrics} from "./SearchLyrics";
const cheerio = require("cheerio");
export class SearchSonglyrics extends SearchLyrics {

    public name = 'Songlyrics.com';

    public search(title: string, artist: string, cb: (error?: any, result?) => void) {
        let url = `http://www.songlyrics.com/${this.slugify(artist)}/${this.slugify(title)}-lyrics/`;
        this.doReq(url, (err, res, body) => {
            if (err || res.statusCode != 200) {
                return cb('Error response searching Songlyrics');
            }
            try {
                let lyrics = this.getLyrics(body, cb);
                return cb(null, {lyric: lyrics, url: url});
            } catch (e) {
                cb('Songlyrics failed');
            }
        });
    }

    private slugify(text) {

        return text.toString().toLowerCase()

            .replace(/\s+/g, '-')           // Replace spaces with -

            .replace(/[^\w\-]+/g, '')       // Remove all non-word chars

            .replace(/\-\-+/g, '-')         // Replace multiple - with single -

            .replace(/^-+/, '')             // Trim - from start of text

            .replace(/-+$/, '');            // Trim - from end of text

    }

    private getLyrics(body: any, cb: (error?: any, result?) => void) {
        let lyrics = cheerio.load(body)('#songLyricsDiv').text();
        if(lyrics.indexOf('Please check the spelling and try again to') > 1){
            return cb('Error response searching songlyrics');
        }
        let el = document.createElement("textarea");
        el.innerHTML = lyrics;
        return el.value;
    }
}