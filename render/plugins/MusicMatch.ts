import {SearchLyrics} from "./SearchLyrics";

export class MusicMatch extends SearchLyrics {

    public name  = 'MusicMatch';

    public search(title: string, artist: string, cb: (error?: any, result?) => void) {
        let url = `https://www.musixmatch.com/search/${encodeURIComponent(artist)} ${encodeURIComponent(title)}/tracks`;
        this.doReq(url, (err, res, body) => {
            if (err || res.statusCode != 200) {
                return cb('Error response searching music match');
            }
            try {
                let firstUrl = /"track_share_url":"([^"]+)"/.exec(body)[1];
                return this.getSong(firstUrl, cb);
            } catch (e) {
                cb('Music match fail');
            }
        });
    }

    public parseContent(body:string) : string  {
        let str = body.split('"body":"')[1].replace(/\\n/g, "\n");
        let result = [];
        const len = str.length;
        for (let i = 0 ;  i < len; i++) {
            if (str[i] === '"' && (i === 0 || str[i - 1] !== '\\')) {
                return result.join('');
            } else if (str[i] === '"') {
                result.pop();
            }
            result.push(str[i]) ;
        }
        return result.join('');
    }

    protected getSong(url, cb) {
        this.doReq(url, (err, res, body) => {

            if (err || res.statusCode != 200) {
                console.log('Err', err);
                console.log('Res', res);
                return cb('Error response getting song from MusicMatch');
            }

            try {
                let lyric = this.parseContent(body);
                return cb(null, {lyric: lyric, url: url});
            } catch (e) {
                cb("Music match fail parsing getSong");
            }
        });
    }
}
