import { dialog, ipcMain, BrowserWindow } from 'electron'
var log = require('electron-log')
// 和编辑器有关的
export const edit = (win, type) => {
    win.webContents.send('AGANI::edit', { type })
}
