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
                //  No matches in tracks, search all results. Tracks might be listed with/without addendum like a word or phrase in parenthesis.
                let url = `https://www.musixmatch.com/search/${encodeURIComponent(artist)} ${encodeURIComponent(title)}`;
                this.doReq(url, (err, res, body) => {
                    if (err || res.statusCode != 200) {
                        return cb('Error response searching music match');
                    }
                    try {
                        let firstUrl = /"track_share_url":"([^"]+)"/.exec(body)[1];
                        return this.getSong(firstUrl, cb);
                    } catch (e) {
                        //  No matches in all results either, try expected lyrics url directly
                        let artistEncoded = artist.replace(/[^\w]/gi, '-');
                        let titleEncoded = title.replace(/[^\w]/gi, '-');
                        let url = "https://www.musixmatch.com/lyrics/" + artistEncoded + "/" + titleEncoded;
                        this.doReq(url, (err, res, body) => {
                            if (err || res.statusCode != 200) {
                                return cb('Error response searching music match');
                            }
                            try {
                                return this.getSong(url, cb);
                            } catch (e) {
                                cb('Music match fail');
                            }
                        });
                    }
                });
            }
        });
    }

    public parseContent(body:string) : string  {
        //  Check if there is a missing lyrics error, for example when trying expected lyrics url directly as last resort
        if (body.indexOf('"error":{"status":404') !== -1) {
            return null;
        }
        //  Don't get lyrics from crowdLyricsList, get the proper lyrics instead
        let properLyricsObjectStart = body.indexOf('"lyrics":{"id":');
        if (properLyricsObjectStart === -1) {
            //  No lyrics
            return null;
        }
        let correctLyricsStart = body.indexOf('"body":"', properLyricsObjectStart) + 8;
        let restrictedStart = body.indexOf('"restricted":1', properLyricsObjectStart);
        if (restrictedStart !== -1 && restrictedStart < correctLyricsStart) {
            //  Lyrics are restricted
            return null;
        }
        let correctLyricsEnd = body.indexOf('","', correctLyricsStart);
        let correctLyricsBody = body.substring(correctLyricsStart, correctLyricsEnd)
        let correctLyrics = correctLyricsBody.replace(/\\n/g, "\n").replace(/\\"/g, '"');
        return(correctLyrics);
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
