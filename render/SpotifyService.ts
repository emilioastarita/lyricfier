import {Song} from './Song';
const request = require('request').defaults({timeout: 5000});
const async = require('async');
const initialPortTest = 4370;

export class SpotifyService {
    protected https = false;
    protected foundPort  = false;
    protected port : number;
    protected portTries = 15;
    protected albumImagesCache = {};

    protected oAuthToken = {
        t: null,
        expires: null
    };
    protected csrfToken = null;
    protected queue = [];


    protected headers() {
        return {'Origin': 'https://open.spotify.com'};
    }

    protected subDomain() {
        return (Math.floor(Math.random() * (999999999999))).toString();
    }

    protected url(u:string) {
        const protocol = this.https ? 'https' : 'http';
        return `${protocol}://127.0.0.1:${this.port}${u}`;
    }

    public getOAuthToken(cb) {
        if (this.oAuthToken.t) {
            return cb(null, this.oAuthToken.t);
        }
        request.get('https://open.spotify.com/token', (err, status, body) => {
            if (err) {
                return cb(err);
            }
            try {
                const json = JSON.parse(body);
                this.oAuthToken.t = json.t;
                return cb(null, json.t);
            } catch(e) {
                return cb(e);
            }
        });
    }

    public detectPort(cb) {
        if (!this.foundPort) {
            this.port = initialPortTest;
        }
        async.retry(this.portTries * 2, (finish) => {
            this.getCsrfToken((err, token) => {
                if (err) {
                    console.log('FAILED WITH PORT: ', this.port, ' and https is ', this.https);
                    if (this.https) {
                        this.port++;
                        this.https = false;
                    } else {
                        this.https = true;
                    }
                    return finish(err);
                }
                this.foundPort = true;
                console.log('VALID PORT', this.port);
                finish(err, token)
            });
        }, cb);
    }


    public getCsrfToken(cb) {
        if (this.csrfToken) {
            return cb(null, this.csrfToken);
        }
        const url = this.url('/simplecsrf/token.json');
        request(url, {
            headers: this.headers(),
            'rejectUnauthorized': false
        }, (err, status, body) => {
            if (err) {
                console.error('Error getting csrf token URL: ', url);
                return cb(err);
            }
            const json = JSON.parse(body);
            this.csrfToken = json.token;
            cb(null, this.csrfToken);
        });
    }

    public needsTokens(fn) {
        this.detectPort((err, ok) => {
            if (err) {
                const failDetectPort = 'No port found! Is spotify running?';
                console.error(failDetectPort, err);
                return fn(failDetectPort);
            }
            async.parallel({
                csrf: this.getCsrfToken.bind(this),
                oauth: this.getOAuthToken.bind(this),
            }, fn);
        });

    }

    public getStatus(cb) {
        this.needsTokens((err, tokens) => {
            if (err) return cb(err);
            const params = {
                'oauth': tokens.oauth,
                'csrf': tokens.csrf,
            };
            const url = this.url('/remote/status.json') + '?' + this.encodeData(params);

            request(url, {
                headers: this.headers(),
                'rejectUnauthorized': false,
            }, (err, status, body) => {

                if (err) {
                    console.error('Error asking for status', err, ' url used: ', url);
                    return cb(err);
                }
                try {
                    const json = JSON.parse(body);
                    cb(null, json);
                } catch(e) {
                    const msgParseFailed = 'Status response from spotify failed';
                    console.error(msgParseFailed, ' JSON body: ', body);
                    cb(msgParseFailed, null);
                }

            });
        });
    }

    public getAlbumImages(albumUri:string, cb) {
        if (this.albumImagesCache[albumUri]) {
            return cb(null, this.albumImagesCache[albumUri])
        }
        async.retry(2, (finish) => {
            const id = albumUri.split('spotify:album:')[1];
            const url = `https://api.spotify.com/v1/albums/${id}?oauth=${this.oAuthToken.t}`;
            request(url, (err, status, body) => {
                if (err) {
                    console.error('Error getting album images', err, ' URL: ', url);
                    return finish(err, null)
                }
                try {
                    const parsed = JSON.parse(body);
                    finish(null, parsed.images);
                    this.albumImagesCache[albumUri] = parsed.images;
                } catch(e) {
                    const msgParseFail = 'Failed to parse response from spotify api';
                    console.error(msgParseFail, 'URL USED: ',url);
                    finish(msgParseFail, null);
                }

            });
        }, cb);


    }

    public pause(pause:boolean, cb) {
        this.needsTokens((err, tokens) => {
            if (err) return cb(err);
            const params = {
                'oauth': tokens.oauth,
                'csrf': tokens.csrf,
                'pause': pause ? 'true' : 'false',
            };
            const url = this.url('/remote/pause.json') + '?' + this.encodeData(params);
            request(url, {
                headers: this.headers(),
                'rejectUnauthorized': false,
            }, (err, status, body) => {
                if (err) {
                    return cb(err);
                }
                const json = JSON.parse(body);
                cb(null, json);
            });
        });

    }

    public getCurrentSong(cb: (song: Song) => void, errorCb: (error: string) => void) {
        this.getStatus((err, status)=> {
            if (err) return errorCb(err);
            if (status.track && status.track.track_resource) {
                return Song.makeWithAlbumResource(
                  status.playing,
                  status.track.artist_resource.name,
                  status.track.track_resource.name,
                  status.track.album_resource,
                  this,
                  (song) => {cb(song)}
                );
            }
            return errorCb('No song')
        });
    }

    protected encodeData(data) {
        return Object.keys(data).map(function (key) {
            return [key, data[key]].map(encodeURIComponent).join("=");
        }).join("&");
    }

}
