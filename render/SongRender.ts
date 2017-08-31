import Component from 'vue-class-component';
import {Searcher} from "./Searcher";
import {Translaters} from "./Translaters";
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
    protected translatedSong;
    protected shell;
    protected searcher: Searcher;
    protected translaters: Translaters;
    protected showError;
    protected timer = null;
    protected settings;

    data() {
        return {
            song: null,
            translatedSong: {},
            lastSongSync: {},
            searcher: new Searcher(),
            translaters: new Translaters(),
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
        this.resizeOnLyricsHide();
        console.log('refreshing');
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
                this.translatedSong = {};
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

    translateLyrics() {
        console.log("Language: " + this.settings.translateLang);
        this.translatedSong = {
            lyrics: 'Searching translated lyrics...',
            sourceName: '',
            sourceUrl: ''
        };

        this.translaters.translate(this.song.title, this.song.artist, (err, result) => {
            if(!err) {
                try{
                    result.translated.forEach((translated) => {
                        if(translated.lang == this.settings.translateLang){
                            console.log("Founded translated lyrics");
                            this.translatedSong = translated;
                            this.translatedSong.sourceName = result.sourceName;
                            this.translatedSong.sourceUrl = result.sourceUrl;
                        }
                    });
                } catch(e) {
                    this.translatedSong = {
                        lyrics: 'Translated lyrics not founded.',
                        sourceName: '',
                        sourceUrl: ''
                    };
                }
            }
        });
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
