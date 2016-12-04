import {Lyricfier} from "./Lyricfier";
import electron = require("electron");
import {Settings} from "./Settings";
const app:Electron.App = electron.app;
const settings = new Settings();
const lyricfier = new Lyricfier(app, settings, __dirname);
