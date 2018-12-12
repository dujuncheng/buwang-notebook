import edit from './edit.js'
import paragraph from './paragraph.js'
var log = require('electron-log')

let MenuTemplate = [
    {
        label: 'test21232',
        submenu: [{}]
    },
    edit,
    paragraph
]
export default MenuTemplate
