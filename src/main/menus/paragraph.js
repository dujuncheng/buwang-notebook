import * as actions from '../actions/paragraph'
import keybindings from '../shortcutHandle.js'

export default {
    id: 'paragraphMenuEntry',
    label: '段落',
    submenu: [{
        id: 'heading1MenuItem',
        label: '标题 1',
        type: 'checkbox',
        accelerator: keybindings.getAccelerator('paragraphHeading1'),
        click (menuItem, browserWindow) {
            actions.paragraph(browserWindow, 'heading 1')
        }
    }, {
        id: 'heading2MenuItem',
        label: '标题 2',
        type: 'checkbox',
        accelerator: keybindings.getAccelerator('paragraphHeading2'),
        click (menuItem, browserWindow) {
            actions.paragraph(browserWindow, 'heading 2')
        }
    }, {
        id: 'heading3MenuItem',
        label: '标题 3',
        type: 'checkbox',
        accelerator: keybindings.getAccelerator('paragraphHeading3'),
        click (menuItem, browserWindow) {
            actions.paragraph(browserWindow, 'heading 3')
        }
    }, {
        id: 'heading4MenuItem',
        label: '标题 4',
        type: 'checkbox',
        accelerator: keybindings.getAccelerator('paragraphHeading4'),
        click (menuItem, browserWindow) {
            actions.paragraph(browserWindow, 'heading 4')
        }
    }, {
        id: 'heading5MenuItem',
        label: '标题 5',
        type: 'checkbox',
        accelerator: keybindings.getAccelerator('paragraphHeading5'),
        click (menuItem, browserWindow) {
            actions.paragraph(browserWindow, 'heading 5')
        }
    }, {
        id: 'heading6MenuItem',
        label: '标题 6',
        type: 'checkbox',
        accelerator: keybindings.getAccelerator('paragraphHeading6'),
        click (menuItem, browserWindow) {
            actions.paragraph(browserWindow, 'heading 6')
        }
    }, {
        type: 'separator'
    }, {
        id: 'upgradeHeadingMenuItem',
        label: '升一级',
        accelerator: keybindings.getAccelerator('paragraphUpgradeHeading'),
        click (menuItem, browserWindow) {
            actions.paragraph(browserWindow, 'upgrade heading')
        }
    }, {
        id: 'degradeHeadingMenuItem',
        label: '降一级',
        accelerator: keybindings.getAccelerator('paragraphDegradeHeading'),
        click (menuItem, browserWindow) {
            actions.paragraph(browserWindow, 'degrade heading')
        }
    }, {
        type: 'separator'
    }, {
        id: 'tableMenuItem',
        label: '表格',
        type: 'checkbox',
        accelerator: keybindings.getAccelerator('paragraphTable'),
        click (menuItem, browserWindow) {
            actions.paragraph(browserWindow, 'table')
        }
    }, {
        id: 'codeFencesMenuItem',
        label: '代码',
        type: 'checkbox',
        accelerator: keybindings.getAccelerator('paragraphCodeFence'),
        click (menuItem, browserWindow) {
            actions.paragraph(browserWindow, 'pre')
        }
    }, {
        id: 'quoteBlockMenuItem',
        label: '引用',
        type: 'checkbox',
        accelerator: keybindings.getAccelerator('paragraphQuoteBlock'),
        click (menuItem, browserWindow) {
            actions.paragraph(browserWindow, 'blockquote')
        }
    }, {
        id: 'mathBlockMenuItem',
        label: '公式',
        type: 'checkbox',
        accelerator: keybindings.getAccelerator('paragraphMathBlock'),
        click (menuItem, browserWindow) {
            actions.paragraph(browserWindow, 'mathblock')
        }
    }, {
        id: 'htmlBlockMenuItem',
        label: 'Html',
        type: 'checkbox',
        accelerator: keybindings.getAccelerator('paragraphHtmlBlock'),
        click (menuItem, browserWindow) {
            actions.paragraph(browserWindow, 'html')
        }
    }, {
        type: 'separator'
    }, {
        id: 'orderListMenuItem',
        label: '有序列表',
        type: 'checkbox',
        accelerator: keybindings.getAccelerator('paragraphOrderList'),
        click (menuItem, browserWindow) {
            actions.paragraph(browserWindow, 'ol-order')
        }
    }, {
        id: 'bulletListMenuItem',
        label: '无序列表',
        type: 'checkbox',
        accelerator: keybindings.getAccelerator('paragraphBulletList'),
        click (menuItem, browserWindow) {
            actions.paragraph(browserWindow, 'ul-bullet')
        }
    }, {
        id: 'taskListMenuItem',
        label: '任务清单',
        type: 'checkbox',
        accelerator: keybindings.getAccelerator('paragraphTaskList'),
        click (menuItem, browserWindow) {
            actions.paragraph(browserWindow, 'ul-task')
        }
    }, {
        type: 'separator'
    }, {
        id: 'looseListItemMenuItem',
        label: '不要列表',
        type: 'checkbox',
        accelerator: keybindings.getAccelerator('paragraphLooseListItem'),
        click (menuItem, browserWindow) {
            actions.paragraph(browserWindow, 'loose-list-item')
        }
    }, {
        type: 'separator'
    }, {
        id: 'paragraphMenuItem',
        label: 'Paragraph',
        type: 'checkbox',
        accelerator: keybindings.getAccelerator('paragraphParagraph'),
        click (menuItem, browserWindow) {
            actions.paragraph(browserWindow, 'paragraph')
        }
    }, {
        id: 'horizontalLineMenuItem',
        label: '水平线',
        type: 'checkbox',
        accelerator: keybindings.getAccelerator('paragraphHorizontalLine'),
        click (menuItem, browserWindow) {
            actions.paragraph(browserWindow, 'hr')
        }
    }, {
        id: 'frontMatterMenuItem',
        label: 'YAML Front Matter',
        type: 'checkbox',
        accelerator: keybindings.getAccelerator('paragraphYAMLFrontMatter'),
        click (menuItem, browserWindow) {
            actions.paragraph(browserWindow, 'front-matter')
        }
    }]
}
