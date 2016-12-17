import Component from 'vue-class-component';
import {Searcher} from "./Searcher";
import {template} from './template';
import {SpotifyService} from './SpotifyService';

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
    protected song;
    protected shell;
    protected searcher: Searcher;
    protected showError;
    protected timer = null;
    protected settings;

    data() {
        return {
            song: null,
            lastSongSync: {},
            searcher: new Searcher(),
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
        this.getSpotify().getCurrentSong((err, song) => {
            if (err) {
                this.showError('Current song error: ' + err);
                this.scheduleNextCall();
            } else if (this.isLastSong(song)) {
                console.log('is last song nothing to do here');
                this.scheduleNextCall();
            } else {
                console.log('is not last song searching by title and artist');
                song.lyric = 'Loading Lyrics...';
                this.displaySong(song);
                this.saveLastSong(song);
                this.searcher.search(song.title, song.artist, (err, result) => {
                    if (err) {
                        this.showError('Plugin error: ' + err);
                        return;
                    }
                    if (result.lyric === null) {
                      song.lyric = 'Sorry, couldn\'t find lyrics for this song!';
                      song.sourceUrl = null;
                      song.sourceName = null;
                    } else {
                      song.lyric = result.lyric;
                      song.sourceUrl = result.sourceUrl;
                      song.sourceName = result.sourceName;
                    }
                    this.displaySong(song);
                    this['$nextTick'](() => {
                        document.getElementById("lyricBox").scrollTop = 0;
                    });
                    this.scheduleNextCall();
                });
            }
        });
    }

    displaySong(song) {
      const newSongObject = {};
      for (let k of Object.keys(song)) {
          newSongObject[k] = song[k];
      }
      this.song = newSongObject;
    }

    isLastSong(song) {
        for (let k of ['artist', 'title']) {
            if (song[k] !== this.lastSongSync[k]) {
                return false;
            }
        }
        return true;
    }

    saveLastSong(song) {
        for (let k of Object.keys(song)) {
            this.lastSongSync[k] = song[k];
        }
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
