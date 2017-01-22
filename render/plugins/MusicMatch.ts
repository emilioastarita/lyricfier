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
        if (body.indexOf('"countryDenied":"XW"') != -1) {           
            //  Lyric are restricted worldwide         
            return null;}    
        //  Don't get lyrics from crowdLyricsList, get the right lyrics instead    
        let properLyricsObjectStart = body.indexOf('"lyrics":{"id":');   
        if (properLyricsObjectStart === -1) {         
            //  No lyrics            return null;  
        }      
        let correctLyricsStart = body.indexOf('"body":"', properLyricsObjectStart) + 8;       
        let correctLyricsEnd = body.indexOf('","', correctLyricsStart);      
        let correctLyrics = body.substring(correctLyricsStart, correctLyricsEnd).replace(/\\n/g, "\n").replace(/\\"/g, '"');   
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
