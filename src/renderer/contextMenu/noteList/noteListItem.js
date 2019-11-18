import bus from '../../bus/index.js'

export const SEPARATOR_NOTELISTITEM = {
  type: 'separator'
}
export const DELETE = {
  label: '删除',
  id: 'deleteMenuItem',
  click (menuItem, browserWindow) {
    bus.$emit('deleteNoteItem')
  }
}
