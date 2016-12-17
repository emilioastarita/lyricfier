import {SearchLyrics} from "./SearchLyrics";
let cheerio = require('cheerio')
let he = require('he');

export class SearchWikia extends SearchLyrics {

    public name  = 'Wikia';


    public search(title: string, artist: string, cb: (error?: any, lyrics?) => void) {
        let url = `http://lyrics.wikia.com/api.php?action=lyrics&artist=${encodeURIComponent(artist)}&song=${encodeURIComponent(title)}&fmt=json&func=getSong`;

        this.doReq(url, (err, res, body) => {
            if (err || res.statusCode != 200) {
                return cb('Error response searching wikia');
            }
            try {
                let json = JSON.parse(body.replace(/'/g, '"').replace('song = ', ''));
                if (json.lyrics === 'Not found') {
                    return cb('Lyrics not found');
                }
                return this.getSong(json.url, cb);
            } catch (e) {
                cb('Wikia fail');
            }
        });
    }

    protected getSong(url, cb) {

        this.doReq(url, (err, res, body) => {

            if (err || res.statusCode != 200) {
                console.log('Err', err);
                console.log('Res', res);
                return cb('Error response getting song from wikia');
            }
            let rawHtml = cheerio.load(body)('.lyricbox').html().replace(/<br>/g, '!NEWLINE!');
            let decodedHtml = he.decode(rawHtml);
            let text = cheerio.load('<div class="lyrics-spotify">' + decodedHtml + '</div>')('.lyrics-spotify').text()
            let lyric = text.replace(/!NEWLINE!/g, "\n");
            return cb(null, {lyric: lyric, url: url});
        });
    }
}
