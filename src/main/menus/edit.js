import * as actions from '../actions/editor.js'
import keybindings from '../shortcutHandle.js'

export default {
    label: '编辑',
    submenu: [{
        label: 'Save',
        accelerator: keybindings.getAccelerator('fileSave'),
        click (menuItem, browserWindow) {
            actions.edit(browserWindow, 'save')
        }
    },{
        label: '撤销',
        accelerator: keybindings.getAccelerator('editUndo'),
        click: (menuItem, browserWindow) => {
            actions.edit(browserWindow, 'undo')
        }
    }, {
        label: '重做',
        accelerator: keybindings.getAccelerator('editRedo'),
        click: (menuItem, browserWindow) => {
            actions.edit(browserWindow, 'redo')
        }
    }, {
        type: 'separator'
    }, {
        label: '剪切',
        accelerator: keybindings.getAccelerator('editCut'),
        role: 'cut'
    }, {
        label: '复制',
        accelerator: keybindings.getAccelerator('editCopy'),
        role: 'copy'
    }, {
        label: '粘贴',
        accelerator: keybindings.getAccelerator('editPaste'),
        role: 'paste'
    }, {
        type: 'separator'
    }, {
        label: '复制为Markdown',
        accelerator: keybindings.getAccelerator('editCopyAsMarkdown'),
        click (menuItem, browserWindow) {
            actions.edit(browserWindow, 'copyAsMarkdown')
        }
    }, {
        label: '复制为HTML',
        click (menuItem, browserWindow) {
            actions.edit(browserWindow, 'copyAsHtml')
        }
    }, {
        label: '粘贴为无格式',
        accelerator: keybindings.getAccelerator('editCopyAsPlaintext'),
        click (menuItem, browserWindow) {
            actions.edit(browserWindow, 'pasteAsPlainText')
        }
    }, {
        type: 'separator'
    },{
        label: '全选',
        accelerator: keybindings.getAccelerator('editSelectAll'),
        role: 'selectall'
    },{
        type: 'separator'
    }, {
        label: '查找',
        accelerator: keybindings.getAccelerator('editFind'),
        click (menuItem, browserWindow) {
            actions.edit(browserWindow, 'find')
        }
    },
    ]
}
