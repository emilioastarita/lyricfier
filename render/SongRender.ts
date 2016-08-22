import Component from 'vue-class-component'
import {Searcher} from "./Searcher";



@Component({
    props: {
        'ipc':{
            'type': Object
        },
        'shell':{
            'type': Object
        }

    },
    template: `
    <a @click="refresh" title="Sync current song" class="btn-floating btn-large waves-effect waves-light red"><i class="material-icons">replay</i></a>
    <hr />
    <div v-if="song">
        <h3 class="flow-text">{{song.title}}</h3>  
        <h4 class="flow-text">{{song.artist}}</h4>  
        <hr />
        <pre>{{song.lyric}}</pre>    
    </div>
    <div v-if="!song">
        <h3 class="flow-text">Play a song on spotify!</h3>
    </div>
        
    
  `
})
export class SongRender {
    protected song;
    protected shell;
    protected searcher:Searcher;
    protected $dispatch;
    protected timer = null;
    protected nextCallTime : number;


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
        this.timer = setTimeout(() =>{
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
                    icon: '../img/icon.png'
                });
            }
            this.scheduleNextCall();
        });
    }

    openExternal(url) {
        this.shell.openExternal(url);
    }


}
