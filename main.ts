import {app, BrowserWindow} from 'electron'

let mainWindows = null;

app.on('ready', () => {
  mainWindows = new BrowserWindow({width: 800, height: 600});
  mainWindows.loadURL('file://' + __dirname + '/index.html');
});
