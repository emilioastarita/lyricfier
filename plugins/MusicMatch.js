"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var SearchLyrics_1 = require("./SearchLyrics");
var cheerio = require('cheerio');
var he = require('he');
var MusicMatch = (function (_super) {
    __extends(MusicMatch, _super);
    function MusicMatch() {
        _super.apply(this, arguments);
    }
    MusicMatch.prototype.search = function (title, artist, cb) {
        var _this = this;
        var url = "https://www.musixmatch.com/search/" + encodeURIComponent(artist) + " " + encodeURIComponent(title);
        console.log('MusicMatch', url);
        this.doReq(url, function (err, res, body) {
            if (err || res.statusCode != 200) {
                return cb('Error response searching music match');
            }
            try {
                var firstUrl = /"track_share_url":"([^"]+)"/.exec(body)[1];
                return _this.getSong(firstUrl, cb);
            }
            catch (e) {
                console.log('Music match fail ', e);
                cb('Music match fail');
            }
        });
    };
    MusicMatch.prototype.getSong = function (url, cb) {
        this.doReq(url, function (err, res, body) {
            if (err || res.statusCode != 200) {
                console.log('ERROR: ', err);
                console.log('response', res);
                return cb('Error response getting song from wikia');
            }
            try {
                var lyric = /"body":"([^"]+)"/.exec(body)[1].replace(/\\n/g, "\n");
                return cb(null, lyric);
            }
            catch (e) {
                cb("Music match fail parsing getSong");
            }
        });
    };
    return MusicMatch;
}(SearchLyrics_1.SearchLyrics));
exports.MusicMatch = MusicMatch;
//# sourceMappingURL=MusicMatch.js.map