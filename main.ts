import {Lyricfier} from "./Lyricfier";
import electron = require("electron");
const app:Electron.App = electron.app
const lyricfier = new Lyricfier(app, __dirname);
