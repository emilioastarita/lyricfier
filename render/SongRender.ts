import Component from 'vue-class-component';
import {Song} from "./Song";
import {template} from './template';
import {SpotifyService} from './SpotifyService';
import {SearchWikia} from "./plugins/SearchWikia";
import {MusicMatch} from "./plugins/MusicMatch";
const plugins = [MusicMatch, SearchWikia];
const request = require('request').defaults({timeout: 5000});

@Component({
    props: {
        'shell': {
            'type': Object
        },
        'showError': {
            'type': Function
        },
        'settings': {
            'type': Object
        }
    },
    template: template('Song')
})

export class SongRender {
    protected lastSongSync;
    protected service:SpotifyService;
    protected song: Song;
    protected shell;
    protected showError;
    protected timer = null;
    protected settings;
    protected plugins;

    data() {
        return {
            song: null,
            plugins: plugins.map((Plugin) => {
                return new Plugin(request);
            })
        }
    }

    scheduleNextCall() {
        if (this.timer) {
            clearTimeout(this.timer);
        }
        console.warn(
          'Scheduling ',
          this.settings.refreshInterval / 1000,
          ' seconds'
        );
        this.timer = setTimeout(() => {
            this.refresh();
        }, this.settings.refreshInterval);
    }

    ready() {
        this.refresh();
    }

    refresh() {
        console.log('refreshing');
        this.getSpotify().getCurrentSong((song) => {
            if (!!this.song && this.song.isSameSong(song)) {
                console.log('is last song nothing to do here');
                this.scheduleNextCall();
            } else {
                console.log('is not last song searching by title and artist');
                this.song = song;
                song.loadLyrics(this.plugins, (song) => {
                    this.song = song;
                    this['$nextTick'](() => {
                        document.getElementById("lyricBox").scrollTop = 0;
                    });
                    this.scheduleNextCall();
                });
            }
        }, (err) => {
            this.showError('Current song error: ' + err);
            this.scheduleNextCall();
        });
    }

    getSpotify() {
        if (!this.service) {
            this.service = new SpotifyService();
        }
        return this.service;
    }

    openExternal(url) {
        this.shell.openExternal(url);
    }
}
