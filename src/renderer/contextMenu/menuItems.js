import * as contextMenu from './actions'

export const CUT = {
    label: '剪切',
    id: 'cutMenuItem', // not used yet!
    role: 'cut'
}

export const COPY = {
    label: '复制',
    id: 'copyMenuItem',
    role: 'copy'
}

export const PASTE = {
    label: '粘贴',
    id: 'pasteMenuItem',
    role: 'paste'
}

export const COPY_TABLE = {
    label: '复制表格',
    id: 'copyTableMenuItem',
    click (menuItem, browserWindow) {
        contextMenu.copyTable()
    }
}

export const COPY_AS_MARKDOWN = {
    label: '复制为markDown',
    id: 'copyAsMarkdownMenuItem',
    click (menuItem, browserWindow) {
        contextMenu.copyAsMarkdown()
    }
}

export const COPY_AS_HTML = {
    label: '复制为html',
    id: 'copyAsHtmlMenuItem',
    click (menuItem, browserWindow) {
        contextMenu.copyAsHtml()
    }
}

export const PASTE_AS_PLAIN_TEXT = {
    label: '纯文本黏贴',
    id: 'pasteAsPlainTextMenuItem',
    click (menuItem, browserWindow) {
        contextMenu.pasteAsPlainText()
    }
}

export const INSERT_BEFORE = {
    label: '在前面插入段落',
    id: 'insertParagraphBeforeMenuItem',
    click (menuItem, browserWindow) {
        contextMenu.insertParagraph('before')
    }
}

export const INSERT_AFTER = {
    label: '在后面插入段落',
    id: 'insertParagraphAfterMenuItem',
    click (menuItem, browserWindow) {
        contextMenu.insertParagraph('after')
    }
}

export const INSERT_ROW = {
    label: '插入行',
    submenu: [{
        label: '插在上面',
        click (menuItem, browserWindow) {
            contextMenu.editTable({
                location: 'previous',
                action: 'insert',
                target: 'row'
            })
        }
    }, {
        label: '插在下面',
        click (menuItem, browserWindow) {
            contextMenu.editTable({
                location: 'next',
                action: 'insert',
                target: 'row'
            })
        }
    }]
}

export const REMOVE_ROW = {
    label: '删除行',
    submenu: [{
        label: '前一行',
        click (menuItem, browserWindow) {
            contextMenu.editTable({
                location: 'previous',
                action: 'remove',
                target: 'row'
            })
        }
    }, {
        label: '当前行',
        click (menuItem, browserWindow) {
            contextMenu.editTable({
                location: 'current',
                action: 'remove',
                target: 'row'
            })
        }
    }, {
        label: '下一行',
        click (menuItem, browserWindow) {
            contextMenu.editTable({
                location: 'next',
                action: 'remove',
                target: 'row'
            })
        }
    }]
}

export const INSERT_COLUMN = {
    label: '插入列',
    submenu: [{
        label: '插左边',
        click (menuItem, browserWindow) {
            contextMenu.editTable({
                location: 'left',
                action: 'insert',
                target: 'column'
            })
        }
    }, {
        label: '插右边',
        click (menuItem, browserWindow) {
            contextMenu.editTable({
                location: 'right',
                action: 'insert',
                target: 'column'
            })
        }
    }]
}

export const REMOVE_COLUMN = {
    label: '删除列',
    submenu: [{
        label: '左一列',
        click (menuItem, browserWindow) {
            contextMenu.editTable({
                location: 'left',
                action: 'remove',
                target: 'column'
            })
        }
    }, {
        label: '当前列',
        click (menuItem, browserWindow) {
            contextMenu.editTable({
                location: 'current',
                action: 'remove',
                target: 'column'
            })
        }
    }, {
        label: '右一列',
        click (menuItem, browserWindow) {
            contextMenu.editTable({
                location: 'right',
                action: 'remove',
                target: 'column'
            })
        }
    }]
}

export const SEPARATOR = {
    type: 'separator'
}
