import Component from 'vue-class-component'

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
    template: `
    <div class="lyric-view">
        <h2 class="flow-text">Settings</h2>
        <div>
          <input
            type="checkbox"
            id="alwaysOnTopCheckbox"
            v-model="settings.alwaysOnTop"
            v-on:change="onChangeSettings()"
          >
          <label for="alwaysOnTopCheckbox">Always On Top</label>
        </div>
        <div>
          <select
            id="themeSelector"
            v-model="settings.theme"
            v-on:change="onChangeSettings()"
          >
              <option>dark</option>
              <option>light</option>
          </select>
          <label for="themeSelector">Theme</label>
        </div>
    </div>
  `
})
export class SettingsRender {
    protected settings;
    protected ipc;
    protected shell;
    protected onChangeSettings;

    data() {
        return {
        }
    }

    openExternal(url) {
        this.shell.openExternal(url);
    }

}
