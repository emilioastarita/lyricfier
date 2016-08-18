"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var SearchLyrics_1 = require("./SearchLyrics");
var cheerio = require('cheerio');
var he = require('he');
var SearchWikia = (function (_super) {
    __extends(SearchWikia, _super);
    function SearchWikia() {
        _super.apply(this, arguments);
    }
    SearchWikia.prototype.search = function (title, artist, cb) {
        var _this = this;
        var url = "http://lyrics.wikia.com/api.php?action=lyrics&artist=" + encodeURIComponent(artist) + "&song=" + encodeURIComponent(title) + "&fmt=json&func=getSong";
        this.doReq(url, function (err, res, body) {
            if (err || res.statusCode != 200) {
                return cb('Error response searching wikia');
            }
            var json = JSON.parse(body.replace(/'/g, '"').replace('song = ', ''));
            if (json.lyrics === 'Not found') {
                return cb('Lyrics not found');
            }
            return _this.getSong(json.url, cb);
        });
    };
    SearchWikia.prototype.getSong = function (url, cb) {
        this.doReq(url, function (err, res, body) {
            if (err || res.statusCode != 200) {
                console.log('ERROR: ', err);
                console.log('response', res);
                return cb('Error response getting song from wikia');
            }
            var rawHtml = cheerio.load(body)('.lyricbox').html().replace(/<br>/g, '!NEWLINE!');
            var decodedHtml = he.decode(rawHtml);
            var text = cheerio.load('<div class="lyrics-spotify">' + decodedHtml + '</div>')('.lyrics-spotify').text();
            var lyrics = text.replace(/!NEWLINE!/g, "\n");
            return cb(null, lyrics);
        });
    };
    return SearchWikia;
}(SearchLyrics_1.SearchLyrics));
exports.SearchWikia = SearchWikia;
//# sourceMappingURL=SearchWikia.js.map