"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var vue_class_component_1 = require('vue-class-component');
var SettingsRender = (function () {
    function SettingsRender() {
    }
    SettingsRender.prototype.data = function () {
        return {
            modal: {
                show: false,
                title: '',
                message: ''
            },
            settings: {
                port: ''
            }
        };
    };
    SettingsRender.prototype.ready = function () {
        var _this = this;
        console.log('Settings ready!');
        this.ipc.send('get-settings');
        this.ipc.on('settings-update', function (event, arg) {
            _this.settings = arg;
        });
    };
    SettingsRender.prototype.saveSettings = function () {
        this.ipc.send('save-settings', JSON.parse(JSON.stringify(this.settings)));
        this.modal.show = true;
        this.modal.title = 'Saved!';
        this.modal.message = 'Settings updated';
    };
    SettingsRender.prototype.closeModal = function () {
        this.modal.show = false;
        this.modal.title = '';
        this.modal.message = '';
    };
    SettingsRender.prototype.openExternal = function (url) {
        this.shell.openExternal(url);
    };
    SettingsRender = __decorate([
        vue_class_component_1.default({
            props: {
                'ipc': {
                    'type': Object
                },
                'shell': {
                    'type': Object
                }
            },
            template: "\n    <style>\n        .modal {\n            top: 110px;\n        }\n    </style>\n    \n    <h2 class=\"flow-text\">Settings!</h2>\n    <hr />\n    \n    <div class=\"row\">\n        <div class=\"input-field col s12\">\n            <input placeholder=\"Token\" id=\"fontSize\" type=\"number\" max=\"30\" min=\"10\"  v-model=\"settings.fontSize\">\n            <label for=\"fontSize\" v-bind:class=\"{ active: settings.fontSize }\">Font Size</label>\n            <br />\n        </div>\n    </div>\n    \n    <div class=\"row\">\n        <div class=\"input-field col s12\">\n            <input placeholder=\"Port\" id=\"port\" type=\"number\"    v-model=\"settings.port\">\n            <label for=\"port\" v-bind:class=\"{ active: settings.port }\">Spotify Port</label>\n            <small>This is usually 4372 but you can run <code>netstat -apn | grep spotify</code> to verify.</small>\n            <br />\n        </div>\n    </div>    \n    \n\n    <div class=\"row\">\n        <button class=\"btn waves-effect waves-light\" type=\"submit\" v-on:click=\"saveSettings\">Save</button>\n    </div>\n    \n    \n    <div  class=\"modal\" v-if=\"modal.show\" style=\"display:block;\" v-cloak>\n        <div class=\"modal-content\">\n            <h4>{{modal.title}}</h4>\n            <p>{{modal.message}}</p>\n        </div>\n        <div class=\"modal-footer\">\n            <a href=\"#!\" v-on:click=\"closeModal\" class=\"modal-action modal-close waves-effect waves-green btn-flat\">OK!</a>\n        </div>\n    </div>\n  "
        })
    ], SettingsRender);
    return SettingsRender;
}());
exports.SettingsRender = SettingsRender;
//# sourceMappingURL=SettingsRender.js.map