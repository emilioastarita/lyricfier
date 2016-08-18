import Component from 'vue-class-component'



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
    <a @click="sync" title="Sync current song" class="btn-floating btn-large waves-effect waves-light red"><i class="material-icons">replay</i></a>
    <h2 class="flow-text">lyricfier</h2>
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

    data() {
        return {
            song: null,
        }
    }

    ready() {
        console.log('SongRender ready!');

        this.ipc.on('song-sync', (event, song) => {
            console.log('song sync', song);
            this.song = {};
            this.song.title = song.title;
            this.song.artist = song.artist;
            this.song.lyric = song.lyric;
            console.log('updated!');
        });
    }

    sync() {
        this.ipc.send('get-lyrics');
    }

    openExternal(url) {
        this.shell.openExternal(url);
    }


}
