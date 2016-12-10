import Component from 'vue-class-component';
import {Searcher} from "./Searcher";
import {template} from './template';
import {SpotifyService} from './SpotifyService';

@Component({
    props: {
        'ipc': {
            'type': Object
        },
        'shell': {
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
    protected $dispatch;
    protected timer = null;
    protected nextCallTime: number;

    data() {
        return {
            song: null,
            lastSongSync: {},
            searcher: new Searcher(),
            nextCallTime: 5000
        }
    }

    scheduleNextCall() {
        if (this.timer) {
            clearTimeout(this.timer);
        }
        console.warn('Scheduling ', this.nextCallTime / 1000 , ' seconds');
        this.timer = setTimeout(() => {
            this.refresh();
        }, this.nextCallTime);
    }

    notifyStatus(msg) {
        this.$dispatch('status', msg)
    }

    ready() {
        this.refresh();
    }

    refresh() {
        console.log('refreshing');
        this.getSpotify().getCurrentSong((err, song) => {
            if (err) {
                this.notifyStatus('Current song error: ' + err);
                this.scheduleNextCall();
            } else if (this.isLastSong(song)) {
                console.log('is last song nothing to do here');
                this.scheduleNextCall();
            } else {
                console.log('is not last song searching by title and artist');
                song.lyric = 'Loading Lyrics...';
                this.displaySong(song);
                this.saveLastSong(song);
                this.searcher.search(song.title, song.artist, (err, lyric) => {
                    if (err) {
                        this.notifyStatus('Plugin error: ' + err);
                        return;
                    }
                    if (lyric === null) {
                      song.lyric = 'Sorry, couldn\'t find lyrics for this song!';
                    } else {
                      song.lyric = lyric;
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
