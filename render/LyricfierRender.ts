/// <reference path="./render-typings.d.ts" />

declare const Materialize;
import Component from 'vue-class-component';
import {ipcRenderer, shell}  from 'electron';
import {SettingsRender} from './SettingsRender';
import {SongRender} from './SongRender';
import {template} from './template';

@Component({
    components: {
        'SettingsRender': SettingsRender,
        'SongRender': SongRender
    },
    template: template('lyricfier')
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