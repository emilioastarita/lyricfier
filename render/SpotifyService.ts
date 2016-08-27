const request = require('request');
const async = require('async');

export class SpotifyService {

    protected port = 4370;
    protected portTries = 15;

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
        return `https://127.0.0.1:${this.port}${u}`;
    }

    public getOAuthToken(cb) {
        if (this.oAuthToken.t) {
            return cb(null, this.oAuthToken.t);
        }
        request.get('https://open.spotify.com/token', (err, status, body) => {
            let json = JSON.parse(body);
            this.oAuthToken.t = json.t;
            return cb(null, json.t);
        });
    }

    public detectPort(cb) {
        async.retry(this.portTries, (finish) => {
            this.getCsrfToken((err, token) => {
                if (err) {
                    this.port++;
                    console.log('TRYING WITH PORT: ', this.port)
                    return finish(err);
                }
                console.log('VALID PORT', this.port);
                finish(err, token)
            });
        }, cb);
    }


    public getCsrfToken(cb) {
        if (this.csrfToken) {
            return cb(null, this.csrfToken);
        }
        let url = this.url('/simplecsrf/token.json');
        request(url, {
            headers: this.headers(),
            'rejectUnauthorized': false
        }, (err, status, body) => {
            if (err) {
                return cb(err);
            }
            let json = JSON.parse(body);
            this.csrfToken = json.token;
            cb(null, this.csrfToken);
        });
    }

    public needsTokens(fn) {
        this.detectPort((err, ok) => {
            if (err) {
                return fn('No port found! Is spotify running?');
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
            let params = {
                'oauth': tokens.oauth,
                'csrf': tokens.csrf,
            };
            let url = this.url('/remote/status.json') + '?' + this.encodeData(params);
            request(url, {
                headers: this.headers(),
                'rejectUnauthorized': false,
            }, (err, status, body) => {
                if (err) {
                    return cb(err);
                }
                let json = JSON.parse(body);
                cb(null, json);
            });
        });
    }

    protected getAlbumImages(albumUri:string, cb) {
        let id = albumUri.split('spotify:album:')[1];
        let url = `https://api.spotify.com/v1/albums/${id}?oauth=${this.oAuthToken.t}`;

        request(url, (err, status, body) => {
            if (err) {
                return cb(err, null)
            }
            let parsed = JSON.parse(body);
            cb(null, parsed.images);
        });
    }

    public getCurrentSong(cb) {
        this.getStatus((err, status)=> {

            if (err) return cb(err);
            if (status.track) {
                return this.getAlbumImages(status.track.album_resource.uri, (err, images) => {
                    return cb(null, {
                        artist: status.track.artist_resource.name,
                        title: status.track.track_resource.name,
                        album: {
                            name: status.track.album_resource.name,
                            images: images
                        }
                    })
                })

            }
            return cb('No song', null)
        });
    }

    protected encodeData(data) {
        return Object.keys(data).map(function (key) {
            return [key, data[key]].map(encodeURIComponent).join("=");
        }).join("&");
    }

}