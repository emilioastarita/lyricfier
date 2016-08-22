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
    
    <p>Some day you will configure the lyricfier email client here, meanwhile there is no settings.</p>    

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
    protected ipc;
    protected shell;


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
