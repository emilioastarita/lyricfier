/// <reference path="./render-typings.d.ts" />
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var vue_class_component_1 = require('vue-class-component');
var electron_1 = require('electron');
var SettingsRender_1 = require('./SettingsRender');
var SongRender_1 = require('./SongRender');
var LyricfierRender = (function () {
    function LyricfierRender() {
    }
    LyricfierRender.prototype.data = function () {
        return {
            menu: [
                'SongRender',
                'SettingsRender'
            ],
            ipc: electron_1.ipcRenderer,
            shell: electron_1.shell,
            'currentView': 'SongRender'
        };
    };
    LyricfierRender.prototype.ready = function () {
        var _this = this;
        console.log('Loaded....');
        $(".button-collapse").sideNav();
        this.ipc.on('change-view', function (event, page) {
            _this.changeView(page);
        });
        this.ipc.on('song-sync', function (event, song) {
            console.log('ipc receive notification', song);
            new Notification(song.title, {
                body: "Playing " + song.title + " - " + song.artist,
                icon: '../img/icon.png'
            });
        });
    };
    LyricfierRender.prototype.changeView = function (page) {
        this.currentView = page;
        $('#mobile-navbar').sideNav('hide');
    };
    LyricfierRender.prototype.isView = function (page) {
        return this.currentView === page;
    };
    LyricfierRender = __decorate([
        vue_class_component_1.default({
            components: {
                'SettingsRender': SettingsRender_1.SettingsRender,
                'SongRender': SongRender_1.SongRender
            },
            template: "\n      <style>\n         .main-view {\n            padding: 15px;            \n         }   \n      </style>\n      <nav>\n            <div class=\"nav-wrapper \">\n              <a class=\"button-collapse\" data-activates=\"mobile-navbar\" href=\"#\">\n                <i class=\"material-icons\">menu</i>\n              </a>\n              <ul class=\"left hide-on-med-and-down\" id=\"nav-mobile\">\n                <li v-for=\"page in menu\" v-bind:class=\"{ 'active': isView(page) }\">\n                    <a href=\"#\" v-on:click=\"changeView(page)\">{{page}}</a>\n                </li>\n              </ul>\n              <ul class=\"side-nav\" id=\"mobile-navbar\" >\n                <li v-for=\"page in menu\" v-bind:class=\"{ 'active': isView(page) }\">\n                    <a href=\"#\" v-on:click=\"changeView(page)\">{{page}}</a>\n                </li>\n              </ul>      \n            </div>\n      </nav>\n      \n      <div class=\"main-view\">\n            <componet :is=\"currentView\" :ipc=\"ipc\" :shell=\"shell\"></componet>\n      </div>\n    \n  "
        })
    ], LyricfierRender);
    return LyricfierRender;
}());
module.exports = LyricfierRender;
//# sourceMappingURL=LyricfierRender.js.map