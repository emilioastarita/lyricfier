/// <reference path="./render-typings.d.ts" />

import Component from 'vue-class-component';
import {ipcRenderer, shell}  from 'electron';
import {SettingsRender} from './SettingsRender';
import {SongRender} from './SongRender';
import {template} from './template';
import {defaultSettings, SettingsValues} from '../Settings';
const toastr = require('toastr');
toastr.options.positionClass = 'toast-bottom-left';
toastr.options.timeout = '60000';

@Component({
    components: {
        SettingsRender,
        SongRender
    },
    template: template('Lyricfier')
})
class LyricfierRender {
    protected ipc;
    protected currentView;
    protected liveReload = false;
    protected settings: SettingsValues;
    protected lastMessageTime = 0;
    protected lastMessage = '';

    listenStatus(msg) {
        if (msg === this.lastMessage) {
            // not spamming same message.
            const now = new Date();
            const last = new Date(this.lastMessageTime);
            last.setMilliseconds(last.getMilliseconds() + 4500);
            if (now < last) {
                return;
            }
        }
        this.lastMessageTime = (new Date()).getTime();
        this.lastMessage = msg;
        toastr.info(msg);
    }

    data() {
        return {
            menu: [
                'SongRender',
                'SettingsRender'
            ],
            ipc: ipcRenderer,
            shell: shell,
            liveReload: false,
            currentView: 'SongRender',
            settings: defaultSettings,
        }
    }

    ready() {
        this.ipc.send('get-settings');
        console.log('setting update setup')
        this.ipc.on('settings-update', (event, arg) => {
            this.settings = arg;
            console.log(arg);
        });

        this.ipc.on('change-view', (event, page) => {
            this.changeView(page);
        });

        this.ipc.on('live-reload', (event, status) => {
            this.liveReload = status;
        });

        this.ipc.on('status', (event, msg) => {
            this.listenStatus(msg);
        });
    }

    saveSettings() {
        this.ipc.send('settings-update', JSON.parse(JSON.stringify(this.settings)));
    }

    switchView() {
        if (this.isView('SongRender')) {
            this.changeView('SettingsRender');
        } else {
            this.changeView('SongRender');
        }
    }

    changeView(page) {
        this.currentView = page;
    }

    isView(page) {
        return this.currentView === page;
    }
}

export = LyricfierRender;
