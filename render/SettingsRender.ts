import Component from 'vue-class-component'
import {template} from './template';

@Component({
    props: {
        'ipc': {
            'type': Object
        },
        'shell': {
            'type': Object
        },
        'settings': {
            'type': Object
        },
        'onChangeSettings': {
            'type': Function
        }
    },
    template: template('Settings')
})
export class SettingsRender {
    protected settings;
    protected ipc;
    protected shell;
    protected onChangeSettings;
    protected $parent;

    openExternal(url) {
        this.shell.openExternal(url);
    }

    setTheme(theme) {
        this.settings.theme = theme;
    }

    goBack() {
        this.$parent.changeView('SongRender');
    }
}
