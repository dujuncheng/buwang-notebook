import { remote } from 'electron'
import {
  SEPARATOR_NOTELISTITEM,
  DELETE
} from './noteListItem.js'

import orderList from './noteListOrder.js'

const { Menu, MenuItem } = remote

export const showItemContext = (event) => {
  const menu = new Menu()
  const win = remote.getCurrentWindow()
  const CONTEXT_ITEMS = [
    DELETE,
    SEPARATOR_NOTELISTITEM
  ]

  CONTEXT_ITEMS.forEach(item => {
    menu.append(new MenuItem(item))
  })
  menu.popup({ window: win, x: event.clientX, y: event.clientY })
}

export const showOrderContext = (event, id) => {
  const menu = new Menu()
  const win = remote.getCurrentWindow()
  orderList.forEach((item, index) => {
    let obj = new MenuItem(item)
    if (item && item.type === 'checkbox' && Number(item.id) === id) {
      obj.checked = true
    }
    menu.append(obj)
  })
  menu.popup({ window: win, x: event.clientX, y: event.clientY })
}
