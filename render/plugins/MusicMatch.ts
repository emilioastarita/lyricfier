import {SearchLyrics} from "./SearchLyrics";

export class MusicMatch extends SearchLyrics {
    public search(title: string, artist: string, cb: (error?: any, lyrics?: string) => void) {
        let url = `https://www.musixmatch.com/search/${encodeURIComponent(artist)} ${encodeURIComponent(title)}`;
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

    protected getSong(url, cb) {
        this.doReq(url, (err, res, body) => {

            if (err || res.statusCode != 200) {
                console.log('Err', err);
                console.log('Res', res);
                return cb('Error response getting song from wikia');
            }

            try {
                let lyric = /"body":"([^"]+)"/.exec(body)[1].replace(/\\n/g, "\n")
                return cb(null, lyric);
            } catch (e) {
                cb("Music match fail parsing getSong");
            }
        });
    }
}
