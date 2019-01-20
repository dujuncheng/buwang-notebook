import * as actions from '../actions/format'
import keybindings from '../shortcutHandle.js'

export default {
  id: 'formatMenuItem',
  label: '格式',
  submenu: [{
    id: 'strongMenuItem',
    label: '加粗',
    type: 'checkbox',
    accelerator: keybindings.getAccelerator('formatStrong'),
    click (menuItem, browserWindow) {
      actions.format(browserWindow, 'strong')
    }
  }, {
    id: 'emphasisMenuItem',
    label: '强调',
    type: 'checkbox',
    accelerator: keybindings.getAccelerator('formatEmphasis'),
    click (menuItem, browserWindow) {
      actions.format(browserWindow, 'em')
    }
  }, {
    id: 'inlineCodeMenuItem',
    label: '单行代码',
    type: 'checkbox',
    accelerator: keybindings.getAccelerator('formatInlineCode'),
    click (menuItem, browserWindow) {
      actions.format(browserWindow, 'inline_code')
    }
  }, {
    type: 'separator'
  }, {
    id: 'strikeMenuItem',
    label: '删除线',
    type: 'checkbox',
    accelerator: keybindings.getAccelerator('formatStrike'),
    click (menuItem, browserWindow) {
      actions.format(browserWindow, 'del')
    }
  }, {
    id: 'hyperlinkMenuItem',
    label: '超链接',
    type: 'checkbox',
    accelerator: keybindings.getAccelerator('formatHyperlink'),
    click (menuItem, browserWindow) {
      actions.format(browserWindow, 'link')
    }
  }, {
    id: 'imageMenuItem',
    label: '图片',
    type: 'checkbox',
    accelerator: keybindings.getAccelerator('formatImage'),
    click (menuItem, browserWindow) {
      actions.format(browserWindow, 'image')
    }
  }, {
    type: 'separator'
  }, {
    label: '清除格式',
    accelerator: keybindings.getAccelerator('formatClearFormat'),
    click (menuItem, browserWindow) {
      actions.format(browserWindow, 'clear')
    }
  }]
}
