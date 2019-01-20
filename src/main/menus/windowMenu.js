import keybindings from '../shortcutHandle.js'

export default {
  label: '窗口',
  role: 'window',
  submenu: [{
    label: '最小化',
    accelerator: keybindings.getAccelerator('windowMinimize'),
    role: 'minimize'
  }, {
    label: '关闭',
    accelerator: keybindings.getAccelerator('windowCloseWindow'),
    role: 'close'
  }]
}
