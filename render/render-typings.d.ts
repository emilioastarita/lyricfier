/// <reference path="../node_modules/@types/electron/index.d.ts" />
/// <reference path="../node_modules/@types/jquery/index.d.ts" />
/// <reference path="../node_modules/@types/node/index.d.ts" />
/// <reference path="../node_modules/@types/vue/index.d.ts" />

declare let Notification : any;

interface JQuery {
    sideNav(command?: string): JQuery;
}
