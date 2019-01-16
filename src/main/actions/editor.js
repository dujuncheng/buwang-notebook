// 和编辑器有关的
export const edit = (win, type) => {
    win.webContents.send('AGANI::edit', { type })
}
