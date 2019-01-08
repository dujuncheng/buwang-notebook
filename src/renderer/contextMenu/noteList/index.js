import { remote } from 'electron'
import {
    SEPARATOR,
    DELETE
} from './noteListItem.js'

const { Menu, MenuItem } = remote

export const showContextMenu = (event) => {
    const menu = new Menu()
    const win = remote.getCurrentWindow()
    const CONTEXT_ITEMS = [
        DELETE,
        SEPARATOR
    ]

    CONTEXT_ITEMS.forEach(item => {
        menu.append(new MenuItem(item))
    })
    menu.popup({ window: win, x: event.clientX, y: event.clientY })
}
