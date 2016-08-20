/// <reference path="./render-typings.d.ts" />


import Component from 'vue-class-component';
import {ipcRenderer, shell}  from 'electron';
import {SettingsRender} from './SettingsRender';
import {SongRender} from './SongRender';

@Component({
    components: {
        'SettingsRender': SettingsRender,
        'SongRender': SongRender
    },
    template: `
      <style>
         .main-view {
            padding: 15px;            
         }   
      </style>
      <nav>
            <div class="nav-wrapper ">
              <a class="button-collapse" data-activates="mobile-navbar" href="#">
                <i class="material-icons">menu</i>
              </a>
              <ul class="left hide-on-med-and-down" id="nav-mobile">
                <li v-for="page in menu" v-bind:class="{ 'active': isView(page) }">
                    <a href="#" v-on:click="changeView(page)">{{page}}</a>
                </li>
              </ul>
              <ul class="side-nav" id="mobile-navbar" >
                <li v-for="page in menu" v-bind:class="{ 'active': isView(page) }">
                    <a href="#" v-on:click="changeView(page)">{{page}}</a>
                </li>
              </ul>      
            </div>
      </nav>
      
      <div class="main-view">
            <componet :is="currentView" :ipc="ipc" :shell="shell"></componet>
      </div>
    
  `
})
class LyricfierRender {
    protected materialize;
    protected hasFocus = false;

    data() {
        return {
            menu: [
                'SongRender',
                'SettingsRender'
            ],
            ipc: ipcRenderer,
            shell: shell,
            'currentView': 'SongRender'
        }
    }
    setMaterialize(m) {
        this.materialize = m;
    }
    ready() {
        console.log('Loaded....');

        $(".button-collapse").sideNav();
        this.ipc.on('change-view', (event, page) => {
            this.changeView(page);
        });
        this.ipc.on('song-sync', (event, song) => {
            console.log('ipc receive notification', song);
            new Notification(song.title, {
                body: `Playing ` + song.title + ` - ` + song.artist,
                icon: '../img/icon.png'
            });
        });
        this.ipc.on('status', (event, msg) => {
            this.materialize.toast(msg, 5000);
        });
    }

    changeView(page) {
        this.currentView = page;
        $('#mobile-navbar').sideNav('hide');
    }
    isView(page) {
        return this.currentView === page;
    }

}

export = LyricfierRender;