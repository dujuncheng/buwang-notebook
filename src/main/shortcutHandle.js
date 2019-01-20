import { isOsx } from './config'

class Keybindings {
  constructor () {
    this.keys = new Map([
      // marktext - macOS only
      ['mtHide', 'Command+H'],
      ['mtHideOthers', 'Command+Alt+H'],

      // file menu
      ['fileNewFile', 'CmdOrCtrl+N'],
      ['fileNewTab', 'CmdOrCtrl+Shift+T'],
      ['fileOpenFile', 'CmdOrCtrl+O'],
      ['fileOpenFolder', 'CmdOrCtrl+Shift+O'],
      ['fileCloseTab', 'CmdOrCtrl+W'],
      ['fileSave', 'CmdOrCtrl+S'],
      ['fileSaveAs', 'CmdOrCtrl+Shift+S'],
      ['filePrint', 'CmdOrCtrl+P'],
      ['filePreferences', 'CmdOrCtrl+,'], // marktext menu in macOS
      ['fileQuit', isOsx ? 'Command+Q' : 'Alt+F4'],

      // edit menu
      ['editUndo', 'CmdOrCtrl+Z'],
      ['editRedo', 'CmdOrCtrl+Shift+Z'],
      ['editCut', 'CmdOrCtrl+X'],
      ['editCopy', 'CmdOrCtrl+C'],
      ['editPaste', 'CmdOrCtrl+V'],
      ['editCopyAsMarkdown', 'CmdOrCtrl+Shift+C'],
      ['editCopyAsPlaintext', 'CmdOrCtrl+Shift+V'],
      ['editSelectAll', 'CmdOrCtrl+A'],
      ['editFind', 'CmdOrCtrl+F'],
      ['editFindNext', 'CmdOrCtrl+Alt+U'],
      ['editFindPrevious', 'CmdOrCtrl+Shift+U'],
      ['editReplace', 'CmdOrCtrl+Alt+F'],
      ['editAidou', 'CmdOrCtrl+/'],

      // paragraph menu
      ['paragraphHeading1', 'CmdOrCtrl+1'],
      ['paragraphHeading2', 'CmdOrCtrl+2'],
      ['paragraphHeading3', 'CmdOrCtrl+3'],
      ['paragraphHeading4', 'CmdOrCtrl+4'],
      ['paragraphHeading5', 'CmdOrCtrl+5'],
      ['paragraphHeading6', 'CmdOrCtrl+6'],
      ['paragraphUpgradeHeading', 'CmdOrCtrl+='],
      ['paragraphDegradeHeading', 'CmdOrCtrl+-'],
      ['paragraphTable', 'CmdOrCtrl+T'],
      ['paragraphCodeFence', 'CmdOrCtrl+Alt+C'],
      ['paragraphQuoteBlock', 'CmdOrCtrl+Alt+Q'],
      ['paragraphMathBlock', 'CmdOrCtrl+Alt+M'],
      ['paragraphHtmlBlock', isOsx ? 'CmdOrCtrl+Alt+J' : 'CmdOrCtrl+Alt+H'],
      ['paragraphOrderList', 'CmdOrCtrl+Alt+O'],
      ['paragraphBulletList', 'CmdOrCtrl+Alt+U'],
      ['paragraphTaskList', 'CmdOrCtrl+Alt+X'],
      ['paragraphLooseListItem', 'CmdOrCtrl+Alt+L'],
      ['paragraphParagraph', 'CmdOrCtrl+0'],
      ['paragraphHorizontalLine', 'CmdOrCtrl+Alt+-'],
      ['paragraphYAMLFrontMatter', 'CmdOrCtrl+Alt+Y'],

      // format menu
      ['formatStrong', 'CmdOrCtrl+B'],
      ['formatEmphasis', 'CmdOrCtrl+I'],
      ['formatInlineCode', 'CmdOrCtrl+`'],
      ['formatStrike', 'CmdOrCtrl+D'],
      ['formatHyperlink', 'CmdOrCtrl+L'],
      ['formatImage', 'CmdOrCtrl+Shift+I'],
      ['formatClearFormat', 'Shift+CmdOrCtrl+R'],

      // window menu
      ['windowMinimize', 'CmdOrCtrl+M'],
      ['windowCloseWindow', 'CmdOrCtrl+Shift+W'],

      // view menu
      ['viewToggleFullScreen', isOsx ? 'Ctrl+Command+F' : 'F11'],
      ['viewChangeFont', 'CmdOrCtrl+.'],
      ['viewSourceCodeMode', 'CmdOrCtrl+Alt+S'],
      ['viewTypewriterMode', 'CmdOrCtrl+Alt+T'],
      ['viewFocusMode', 'CmdOrCtrl+Shift+F'],
      ['viewToggleSideBar', 'CmdOrCtrl+J'],
      ['viewToggleTabBar', 'CmdOrCtrl+Alt+B'],
      ['viewDevToggleDeveloperTools', isOsx ? 'Alt+Command+I' : 'Ctrl+Shift+I'],
      ['viewDevReload', 'CmdOrCtrl+R']
    ])
  }
  getAccelerator (id) {
    const name = this.keys.get(id)
    if (!name) {
      return ''
    }
    return name
  }
}

const keybindings = new Keybindings()

export default keybindings
