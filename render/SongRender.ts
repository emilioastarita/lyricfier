import Component from 'vue-class-component';
import {Searcher} from "./Searcher";
import {template} from './template';

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
    protected song;
    protected shell;
    protected searcher: Searcher;
    protected $dispatch;
    protected timer = null;
    protected nextCallTime: number;

    data() {
        return {
            song: null,
            searcher: new Searcher(this.notifyStatus),
            nextCallTime: 5000
        }
    }

    scheduleNextCall() {
        if (this.timer) {
            clearTimeout(this.timer);
        }
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
        this.searcher.syncLyrics((song, changed) => {
            this.song = song;
            if (changed) {
                new Notification(song.title, {
                    body: `Playing ` + song.title + ` - ` + song.artist,
                    icon: '../img/icon.png',
                    silent: true
                });
            }
            this.scheduleNextCall();
        });
    }

    openExternal(url) {
        this.shell.openExternal(url);
    }
}
