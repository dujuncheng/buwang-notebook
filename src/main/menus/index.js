import edit from './edit.js'
import paragraph from './paragraph.js'
import format from './format.js'
var log = require('electron-log')

let MenuTemplate = [
    {
        label: 'test21232',
        submenu: [{}]
    },
    edit,
    paragraph,
    format
]
export default MenuTemplate
