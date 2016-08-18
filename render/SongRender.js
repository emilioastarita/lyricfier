"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var vue_class_component_1 = require('vue-class-component');
var SongRender = (function () {
    function SongRender() {
    }
    SongRender.prototype.data = function () {
        return {
            song: null,
        };
    };
    SongRender.prototype.ready = function () {
        var _this = this;
        console.log('SongRender ready!');
        this.ipc.on('song-sync', function (event, song) {
            console.log('song sync', song);
            _this.song = {};
            _this.song.title = song.title;
            _this.song.artist = song.artist;
            _this.song.lyric = song.lyric;
            console.log('updated!');
        });
    };
    SongRender.prototype.sync = function () {
        this.ipc.send('get-lyrics');
    };
    SongRender.prototype.openExternal = function (url) {
        this.shell.openExternal(url);
    };
    SongRender = __decorate([
        vue_class_component_1.default({
            props: {
                'ipc': {
                    'type': Object
                },
                'shell': {
                    'type': Object
                }
            },
            template: "\n    <a @click=\"sync\" title=\"Sync current song\" class=\"btn-floating btn-large waves-effect waves-light red\"><i class=\"material-icons\">replay</i></a>\n    <h2 class=\"flow-text\">lyricfier</h2>\n    <hr />\n    <div v-if=\"song\">\n        <h3 class=\"flow-text\">{{song.title}}</h3>  \n        <h4 class=\"flow-text\">{{song.artist}}</h4>  \n        <hr />\n        <pre>{{song.lyric}}</pre>    \n    </div>\n    <div v-if=\"!song\">\n        <h3 class=\"flow-text\">Play a song on spotify!</h3>\n    </div>\n        \n    \n  "
        })
    ], SongRender);
    return SongRender;
}());
exports.SongRender = SongRender;
//# sourceMappingURL=SongRender.js.map