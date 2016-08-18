import Component from 'vue-class-component'

@Component({
    props: {
        'ipc': {
            'type': Object
        },
        'shell': {
            'type': Object
        }
    },
    template: `
    <style>
        .modal {
            top: 110px;
        }
    </style>
    
    <h2 class="flow-text">Settings!</h2>
    <hr />
    
    <div class="row">
        <div class="input-field col s12">
            <input placeholder="Token" id="fontSize" type="number" max="30" min="10"  v-model="settings.fontSize">
            <label for="fontSize" v-bind:class="{ active: settings.fontSize }">Font Size</label>
            <br />
        </div>
    </div>
    
    <div class="row">
        <div class="input-field col s12">
            <input placeholder="Port" id="port" type="number"    v-model="settings.port">
            <label for="port" v-bind:class="{ active: settings.port }">Spotify Port</label>
            <small>This is usually 4372 but you can run <code>netstat -apn | grep spotify</code> to verify.</small>
            <br />
        </div>
    </div>    
    

    <div class="row">
        <button class="btn waves-effect waves-light" type="submit" v-on:click="saveSettings">Save</button>
    </div>
    
    
    <div  class="modal" v-if="modal.show" style="display:block;" v-cloak>
        <div class="modal-content">
            <h4>{{modal.title}}</h4>
            <p>{{modal.message}}</p>
        </div>
        <div class="modal-footer">
            <a href="#!" v-on:click="closeModal" class="modal-action modal-close waves-effect waves-green btn-flat">OK!</a>
        </div>
    </div>
  `
})
export class SettingsRender {
    protected modal;
    protected settings;


    data() {
        return {
            modal: {
                show: false,
                title: '',
                message: ''
            },
            settings: {
                port: ''
            }
        }
    }

    ready() {
        console.log('Settings ready!');
        this.ipc.send('get-settings');
        this.ipc.on('settings-update', (event, arg) => {
            this.settings = arg;
        });
    }

    saveSettings() {
        this.ipc.send('save-settings', JSON.parse(JSON.stringify(this.settings)));
        this.modal.show = true;
        this.modal.title = 'Saved!';
        this.modal.message = 'Settings updated';
    }

    closeModal() {
        this.modal.show = false;
        this.modal.title = '';
        this.modal.message = '';
    }

    openExternal(url) {
        this.shell.openExternal(url);
    }

}
