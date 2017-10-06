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
    protected $parent;
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
        }
    }

    beforeCompile() {
        this.searcher = new Searcher();
    }



    scheduleNextCall() {
        if (this.timer) {
            clearTimeout(this.timer);
        }
        this.timer = setTimeout(this.refresh.bind(this), this.settings.refreshInterval);
    }

    ready() {
        this.refresh();
    }

    refresh() {
        this.resizeOnLyricsHide();
        this.getSpotify().getCurrentSong((err, song) => {
            if (err) {
                this.showError('Current song error: ' + err);
                this.scheduleNextCall();
            } else if (this.isLastSong(song)) {
                console.log('is last song nothing to do here');
                this.scheduleNextCall();
            } else if (this.settings.hideLyrics) {
                this.displaySong(song);
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
                    if (!result || result.lyric === null) {
                      song.lyric = 'Sorry, couldn\'t find lyrics for this song!';
                      song.sourceUrl = null;
                      song.sourceName = null;
                    } else {
                      song.lyric = result.lyric;
                      song.sourceUrl = result.sourceUrl;
                      song.sourceName = result.sourceName;
                    }
                    this.displaySong(song);
                    console.log(this.settings.autoScroll);
                    if(this.settings.autoScroll) {
                        this.scrollPage(song)
                    }
                    this.scheduleNextCall();
                });
            }
        });
    }
    scrollPage(song) {
        this['$nextTick'](() => {
            document.getElementById("lyricBox").scrollTop = 0;
            let scrollHeight = document.getElementById("lyricBox").scrollHeight;
            var height = document.getElementById("lyricBox").offsetHeight;
            console.log("Time: " + typeof song.duration);
            var waitTime = height / scrollHeight * song.duration / 2 * 1000;
            var scrollInterval = 1 / scrollHeight * song.duration * 1000;
            setTimeout(this.pageScroll.bind(null, this.song, scrollHeight - height, scrollInterval), waitTime);
        });
    }

    pageScroll(currentSong, scrollCount, interval) {
        document.getElementById("lyricBox").scrollTop += 1;
        if(this.song.title != currentSong.title) {
            console.log("Switched song")
        }
        else if(scrollCount > 0 ) {
            setTimeout(this.pageScroll.bind(null, currentSong, scrollCount-1, interval), interval);
        }

    }

    displaySong(song) {
      this.song = Object.assign({}, song);
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

    resizeOnLyricsHide() {
        if (!this.settings.hideLyrics) {
            return;
        }
        const header = document.getElementsByTagName('header').length ? document.getElementsByTagName('header')[0] : null;
        if (header) {
            const width = Math.max(header.clientWidth, 300);
            const height = Math.max(header.clientHeight, 150);
            window.resizeTo(width, height);
            this.$parent.changeView('SongRender');
        }
    }

}
