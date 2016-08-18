"use strict";
var request = require('request');
var async = require('async');
var SpotifyService = (function () {
    function SpotifyService() {
        this.port = 4370;
        this.portTries = 15;
        this.oAuthToken = {
            t: null,
            expires: null
        };
        this.csrfToken = null;
        this.queue = [];
    }
    SpotifyService.prototype.headers = function () {
        return { 'Origin': 'https://open.spotify.com' };
    };
    SpotifyService.prototype.subDomain = function () {
        return (Math.floor(Math.random() * (999999999999))).toString();
    };
    SpotifyService.prototype.url = function (u) {
        return "https://" + this.subDomain() + ".spotilocal.com:" + this.port + u;
    };
    SpotifyService.prototype.getOAuthToken = function (cb) {
        var _this = this;
        if (this.oAuthToken.t) {
            return cb(null, this.oAuthToken.t);
        }
        request.debug = true;
        request.get('https://open.spotify.com/token', function (err, status, body) {
            var json = JSON.parse(body);
            _this.oAuthToken.t = json.t;
            return cb(null, json.t);
        });
    };
    SpotifyService.prototype.detectPort = function (cb) {
        var _this = this;
        async.retry(this.portTries, function (finish) {
            _this.getCsrfToken(function (err, token) {
                if (err) {
                    _this.port++;
                    console.log('TRYING WITH PORT: ', _this.port);
                }
                finish(err, token);
            });
        }, cb);
    };
    SpotifyService.prototype.getCsrfToken = function (cb) {
        var _this = this;
        if (this.csrfToken) {
            return cb(null, this.csrfToken);
        }
        var url = this.url('/simplecsrf/token.json');
        request(url, {
            headers: this.headers(),
            'rejectUnauthorized': false
        }, function (err, status, body) {
            if (err) {
                return cb(err);
            }
            var json = JSON.parse(body);
            _this.csrfToken = json.token;
            cb(null, _this.csrfToken);
        });
    };
    SpotifyService.prototype.needsTokens = function (fn) {
        var _this = this;
        this.detectPort(function (err, ok) {
            if (err) {
                console.log('No port found! Is spotify running?');
                return fn('No port found! Is spotify running?');
            }
            async.parallel({
                csrf: _this.getCsrfToken.bind(_this),
                oauth: _this.getOAuthToken.bind(_this),
            }, fn);
        });
    };
    SpotifyService.prototype.getStatus = function (cb) {
        var _this = this;
        this.needsTokens(function (err, tokens) {
            var params = {
                'oauth': tokens.oauth,
                'csrf': tokens.csrf,
            };
            var url = _this.url('/remote/status.json') + '?' + _this.encodeData(params);
            request(url, {
                headers: _this.headers(),
                'rejectUnauthorized': false,
            }, function (err, status, body) {
                if (err) {
                    return cb(err);
                }
                var json = JSON.parse(body);
                cb(null, json);
            });
        });
    };
    SpotifyService.prototype.getCurrentSong = function (cb) {
        this.getStatus(function (err, status) {
            if (status.track) {
                return cb(null, {
                    artist: status.track.artist_resource.name,
                    title: status.track.track_resource.name
                });
            }
            return cb('No song', null);
        });
    };
    SpotifyService.prototype.encodeData = function (data) {
        return Object.keys(data).map(function (key) {
            return [key, data[key]].map(encodeURIComponent).join("=");
        }).join("&");
    };
    return SpotifyService;
}());
exports.SpotifyService = SpotifyService;
//# sourceMappingURL=SpotifyService.js.map