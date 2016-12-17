
interface SearchResult {
    lyric : string;
    url : string;
}

export class SearchLyrics {
    protected req;
    public name  = 'Generic';

    public constructor(req = null) {
        this.req = req;
    }

    protected doReq(url, cb) {
        let opt = {
            jar: true,
            method: 'GET',
            uri: url,
            gzip: true,
            followRedirect: true,
            maxRedirects: 10,
            resolveWithFullResponse: true,
            headers: {
                'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.116 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Encoding': 'gzip, deflate, sdch',
                'Accept-Language': 'es,en-US;q=0.8,en;q=0.6,pt;q=0.4',
            }
        };
        return this.req(opt, cb);
    }

    public search(title: string, artist: string, cb: (error?: any, result?: SearchResult) => void) {

    }
}

