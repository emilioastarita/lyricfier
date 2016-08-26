/// <reference path="./render-typings.d.ts" />

declare const Materialize;
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
        body {
            background-color: #fff;
        }
        .main-view {
            padding: 5px 15px;
            margin-top: 40px;
        } 
        nav {
            top: 0;
            position: fixed;
            background-color: #333;
            -webkit-app-region: drag;
        }
        a, ul.side-nav, ul.side-nav li {
            -webkit-app-region: no-drag;
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
            <componet :is="currentView" :ipc="ipc"  :shell="shell" v-on:status="listenStatus" keep-alive></componet>
      </div>
    
  `
})
class LyricfierRender {
    protected materialize;
    protected ipc;
    protected currentView;

    listenStatus(msg) {
        Materialize.toast(msg, 5000);
    }


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

    ready() {
        $(".button-collapse").sideNav();
        this.ipc.on('change-view', (event, page) => {
            this.changeView(page);
        });

        this.ipc.on('status', (event, msg) => {
           this.listenStatus(msg);
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