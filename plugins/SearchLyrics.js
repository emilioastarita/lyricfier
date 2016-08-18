"use strict";
var SearchLyrics = (function () {
    function SearchLyrics(req) {
        this.req = req;
    }
    SearchLyrics.prototype.doReq = function (url, cb) {
        var opt = {
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
    };
    SearchLyrics.prototype.search = function (title, artist, cb) {
    };
    return SearchLyrics;
}());
exports.SearchLyrics = SearchLyrics;
//# sourceMappingURL=SearchLyrics.js.map