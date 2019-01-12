<template>
    <div class="wrap">
        <div class="title-container">
            <input type="text" class="title" placeholder="未命名" v-model="title"/>
        </div>
        <div class="box-container">
            <editorBox></editorBox>
        </div>
        <div class="editor-container"
             :class="[{ 'typewriter': typewriter, 'focus': focus, 'source': sourceCode }, theme]"
             :style="{ 'color': theme === 'dark' ? darkColor : lightColor, 'lineHeight': lineHeight, 'fontSize': fontSize,
'font-family': editorFontFamily}"
        >
            <div class="J_editor editor"></div>
        </div>
        <el-dialog
            :visible.sync="dialogTableVisible"
            :show-close="isShowClose"
            :modal="true"
            custom-class="ag-dialog-table"
            width="454px"
            center
            dir='ltr'
        >
            <el-form :model="tableChecker" :inline="true">
                <el-form-item label="Rows">
                    <el-input-number
                        ref="rowInput"
                        size="mini"
                        v-model="tableChecker.rows"
                        controls-position="right"
                        :min="2"
                        :max="20"
                    ></el-input-number>
                </el-form-item>
                <el-form-item label="Columns">
                    <el-input-number
                        size="mini"
                        v-model="tableChecker.columns"
                        controls-position="right"
                        :min="2"
                        :max="20"
                    ></el-input-number>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogTableVisible = false" icon="el-icon-close">
                </el-button>
                <el-button type="primary" @click="handleDialogTableConfirm" icon="el-icon-check">
                </el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
    import { mapState, mapGetters } from 'vuex'
    import editorBox from './editor-box/editor-box-container.vue'
    import Muya from '../../muya/lib/index.js'
    import TablePicker from '../../muya/lib/ui/tablePicker'
    import QuickInsert from '../../muya/lib/ui/quickInsert'
    import CodePicker from '../../muya/lib/ui/codePicker'
    import EmojiPicker from '../../muya/lib/ui/emojiPicker'
    import ImagePathPicker from '../../muya/lib/ui/imagePicker'
    import FormatPicker from '../../muya/lib/ui/formatPicker'
    import bus from '../bus/index.js'
    import { animatedScrollTo } from '../utils/index.js'
    import Printer from '../services/printService.js'
    import {convertLineEndings} from '../store/help.js'

    import { showContextMenu } from '../contextMenu/editor/index.js'
    const base64 = require('js-base64')

    const STANDAR_Y = 320

    export default {
        name: 'editor-container',
        computed: {
            ...mapState({
                'preferLooseListItem': state => state.preferences.preferLooseListItem,
                'autoPairBracket': state => state.preferences.autoPairBracket,
                'autoPairMarkdownSyntax': state => state.preferences.autoPairMarkdownSyntax,
                'autoPairQuote': state => state.preferences.autoPairQuote,
                'bulletListMarker': state => state.preferences.bulletListMarker,
                'tabSize': state => state.preferences.tabSize,
                'lineHeight': state => state.preferences.lineHeight,
                'fontSize': state => state.preferences.fontSize,
                'lightColor': state => state.preferences.lightColor,
                'darkColor': state => state.preferences.darkColor,
                'editorFontFamily': state => state.preferences.editorFontFamily,
                'typewriter': state => state.preferences.typewriter,
                'focus': state => state.preferences.focus,
                'sourceCode': state => state.preferences.sourceCode,
                'currentFile': state => state.editor.currentFile,
                'markdown': state => state.notebook.markdown,
                'titleChanged': state => state.notebook.titleChanged,
                'contentChanged': state => state.notebook.contentChanged,
                // 全局的被修改的note列表
                'changeNote': state => state.notebook.changeNote,
                'noteItemSelected': state => state.notebook.noteItemSelected,
                'loading': state => state.notebook.loading
            }),
            ...mapGetters(['currentNote'])
        },
        components: {
            editorBox
        },
        data () {
            return {
                title: '',
                theme: 'light',
                editor: null,
                isShowClose: false,
                dialogTableVisible: false,
                tableChecker: {
                    rows: 4,
                    columns: 3
                }
            }
        },
        mounted () {

        },
        watch: {
            typewriter: function (value) {
                if (value) {
                    this.scrollToCursor()
                }
            },
            focus: function (value) {
                this.editor.setFocusMode(value)
            },
            theme: function (value, oldValue) {
                const { editor } = this
                if (value !== oldValue && editor) {
                    editor.setTheme(value)
                    this.addThemeStyle(value)
                }
            },
            fontSize: function (value, oldValue) {
                const { editor } = this
                if (value !== oldValue && editor) {
                    editor.setFont({ fontSize: value })
                }
            },
            lineHeight: function (value, oldValue) {
                const { editor } = this
                if (value !== oldValue && editor) {
                    editor.setFont({ lineHeight: value })
                }
            },
            preferLooseListItem: function (value, oldValue) {
                const { editor } = this
                if (value !== oldValue && editor) {
                    editor.setListItemPreference(value)
                }
            },
            tabSize: function (value, oldValue) {
                const { editor } = this
                if (value !== oldValue && editor) {
                    editor.setTabSize(value)
                }
            },
            contentChanged: function (value, oldValue) {
                // 笔记区域更新
                this.editor.clearHistory()
                if (this.currentFile.markdown !== value) {
                    this.blurEditor()
                    this.editor.setMarkdown(value)
                }
            },
            // 检测当前的笔记变化
            titleChanged: function (value, oldValue) {
                this.title = value
            },
            title (value) {
                if (value === this.titleChanged) {
                    return
                }
                this.$store.commit('SET_NOTEBOOK', {
                    name: 'titleChanged',
                    value: value
                })
                let noteId = this.noteItemSelected
                let title = value
                this.setCacheTitle({noteId, title})
                this.setChangeNote({noteId})
            }
        },
        created () {
            this.$nextTick(() => {
                this.init()
            })
        },
        methods: {
            init () {
                const ele = document.querySelector('.J_editor')
                let config = {
                    autoPairBracket: true,
                    autoPairMarkdownSyntax: true,
                    autoPairQuote: true,
                    bulletListMarker: '',
                    focusMode: false,
                    markdown: this.contentChanged,
                    preferLooseListItem: true,
                    tabSize: 4,
                    theme: ''
                }
                const {container} = this.editor = new Muya(ele, config)
                const {
                    theme,
                    focus: focusMode,
                    markdown,
                    preferLooseListItem,
                    typewriter,
                    autoPairBracket,
                    autoPairMarkdownSyntax,
                    autoPairQuote,
                    bulletListMarker,
                    tabSize
                } = this
                // use muya UI plugins
                Muya.use(TablePicker)
                Muya.use(QuickInsert)
                Muya.use(CodePicker)
                Muya.use(EmojiPicker)
                Muya.use(ImagePathPicker)
                Muya.use(FormatPicker)

                // the default theme is light write in the store
                this.addThemeStyle(theme)

                bus.$on('file-loaded', this.setMarkdownToEditor)
                bus.$on('undo', this.handleUndo)
                bus.$on('save', this.handleSave)
                bus.$on('redo', this.handleRedo)
                bus.$on('export', this.handleExport)
                bus.$on('paragraph', this.handleEditParagraph)
                bus.$on('format', this.handleInlineFormat)
                bus.$on('searchValue', this.handleSearch)
                bus.$on('replaceValue', this.handReplace)
                bus.$on('find', this.handleFind)
                bus.$on('insert-image', this.handleSelect)
                bus.$on('image-uploaded', this.handleUploadedImage)
                bus.$on('file-changed', this.handleMarkdownChange)
                bus.$on('editor-blur', this.blurEditor)
                bus.$on('image-auto-path', this.handleImagePath)
                bus.$on('copyAsMarkdown', this.handleCopyPaste)
                bus.$on('copyAsHtml', this.handleCopyPaste)
                bus.$on('pasteAsPlainText', this.handleCopyPaste)
                bus.$on('insertParagraph', this.handleInsertParagraph)
                bus.$on('editTable', this.handleEditTable)
                bus.$on('scroll-to-header', this.scrollToHeader)
                bus.$on('copy-block', this.handleCopyBlock)
                bus.$on('print', this.handlePrint)

                this.editor.on('insert-image', type => {
                    if (type === 'absolute' || type === 'relative') {
                        this.$store.dispatch('ASK_FOR_INSERT_IMAGE', type)
                    } else if (type === 'upload') {
                        bus.$emit('upload-image')
                    }
                })

                this.editor.on('image-path-autocomplement', src => {
                    this.$store.dispatch('ASK_FOR_IMAGE_AUTO_PATH', src)
                })

                this.editor.on('change', changes => {
                    if (!changes) {
                        return
                    }
                    this.$store.dispatch('LISTEN_FOR_CONTENT_CHANGE', changes)
                    let params = {
                        noteId: this.noteItemSelected,
                        content: changes.markdown,
                        title: this.titleChanged
                    }
                    this.handleChange(params, changes)
                })

                this.editor.on('selectionChange', changes => {
                    const { y } = changes.cursorCoords
                    if (this.typewriter) {
                        animatedScrollTo(container, container.scrollTop + y - STANDAR_Y, 100)
                    }

                    this.selectionChange = changes
                    this.$store.dispatch('SELECTION_CHANGE', changes)
                })

                this.editor.on('selectionFormats', formats => {
                    this.$store.dispatch('SELECTION_FORMATS', formats)
                })

                this.editor.on('contextmenu', (event, selectionChanges) => {
                    showContextMenu(event, selectionChanges)
                })
            },
            // listen for markdown change form source mode or change tabs etc
            handleMarkdownChange ({ markdown, cursor, renderCursor, history }) {
                const { editor } = this
                if (editor) {
                    if (history) {
                        editor.setHistory(history)
                    }
                    editor.setMarkdown(markdown, cursor, renderCursor)
                }
            },
            handleImagePath (files) {
                const { editor } = this
                editor && editor.showAutoImagePath(files)
            },
            handleInsertParagraph (location) {
                const { editor } = this
                editor && editor.insertParagraph(location)
            },
            addThemeStyle (theme) {
                const linkId = 'ag-theme'
                const href = process.env.NODE_ENV !== 'production'
                    ? `./src/muya/themes/${theme}.css`
                    : `./static/themes/${theme}.css`
                let link = document.querySelector(`#${linkId}`)

                if (!link) {
                    link = document.createElement('link')
                    link.setAttribute('rel', 'stylesheet')
                    link.id = linkId
                    document.head.appendChild(link)
                }
                link.href = href
            },
            handleUndo () {
                if (this.editor) {
                    this.editor.undo()
                }
            },
            // 监听 ctrl + s
            handleSave () {
                let cache = window.localStorage.getItem('_change_note')
                if (this.changeNote.length === 0 ||
                    !cache ||
                    Object.keys(JSON.parse(cache)).length === 0
                ) {
                    return
                }
                let changeArr = this.getCacheData(cache)
                this.$store.commit('SET_NOTEBOOK', {
                    name: 'loading',
                    value: true
                })
                this.$store.dispatch('CHANGE_NOTE', {changeArr})
            },
            getCacheData (cache) {
                let obj = JSON.parse(cache)
                let keyArr = Object.keys(obj)
                let result = []
                for (let i = 0; i < keyArr.length; i++) {
                    let item = {}
                    item.note_id = Number(keyArr[i])
                    item.title = obj[keyArr[i]].title
                    item.content = base64.Base64.encode(obj[keyArr[i]].content)
                    result.push(item)
                }
                return result
            },
            // 监听内容的变化
            handleChange ({noteId, content, title}, changes) {
                if (!noteId) {
                    return
                }
                let realChange = this.checkRealChange(noteId, content, changes)
                if (!realChange) {
                    return
                }
                this.setCacheContent({noteId, content, title})
                this.setChangeNote({noteId})
            },
            // 设置内容的localStorage
            // todo 这里使用web sql是不是更好？
            setCacheContent ({noteId, content, title}) {
                content = convertLineEndings(content, 'lf')
                let cacheChange = window.localStorage.getItem('_change_note')
                if (cacheChange) {
                    let obj = JSON.parse(cacheChange)
                    obj[noteId] = {
                        content,
                        title
                    }
                    window.localStorage.setItem('_change_note', JSON.stringify(obj))
                }
                if (!cacheChange) {
                    let obj = {}
                    obj[noteId] = {
                        content,
                        title
                    }
                    window.localStorage.setItem('_change_note', JSON.stringify(obj))
                }
            },
            setCacheTitle ({noteId, title}) {
                let cacheChange = window.localStorage.getItem('_change_note')
                if (cacheChange) {
                    let obj = JSON.parse(cacheChange)
                    if (obj[noteId]) {
                        obj[noteId].title = title
                    }
                    if (!obj[noteId]) {
                        obj[noteId] = {
                            title: title,
                            content: this.contentChanged
                        }
                    }

                    window.localStorage.setItem('_change_note', JSON.stringify(obj))
                }
                if (!cacheChange) {
                    let obj = {}
                    obj[noteId] = {
                        content: '',
                        title
                    }
                    window.localStorage.setItem('_change_note', JSON.stringify(obj))
                }
            },
            // 设置changeNote
            setChangeNote ({noteId}) {
                if (this.changeNote.indexOf(noteId) > -1) {
                    return
                }
                this.$store.commit('PUSH_CHANGE_NOTE', {noteId})
            },
            // 检查是否真正变化
            // 目的是规避，点击一次就认定修改了
            checkRealChange (noteId, content, changes) {
                if (this.loading) {
                    return false
                }

                let result = false
                if (this.changeNote.indexOf(noteId) > -1) {
                    // 历史上被修改的, 那一定是修改了
                    result = true
                } else {
                    let nowcontent = String(content).trim()
                    let oldcontent = String(this.currentNote.content).trim()
                    // 没有被修改的, 和异步结果中比较
                    result = (nowcontent !== oldcontent)
                }
                return result
            },
            // 从localStorage中拿到内容
            getCache (noteId) {
                let result = ''
                let cacheChange = window.localStorage.getItem('_change_note')
                if (!cacheChange) {
                    return ''
                } else {
                    cacheChange = JSON.parse(cacheChange)
                    result = cacheChange[noteId]
                }
                return result
            },
            handleRedo () {
                if (this.editor) {
                    this.editor.redo()
                }
            },
            // Custom copyAsMarkdown copyAsHtml pasteAsPlainText
            handleCopyPaste (type) {
                if (this.editor) {
                    this.editor[type]()
                }
            },
            handleSelect (url) {
                if (!this.sourceCode) {
                    this.editor && this.editor.insertImage(url)
                }
            },

            handleSearch (value, opt) {
                const searchMatches = this.editor.search(value, opt)
                this.$store.dispatch('SEARCH', searchMatches)
                this.scrollToHighlight()
            },

            handReplace (value, opt) {
                const searchMatches = this.editor.replace(value, opt)
                this.$store.dispatch('SEARCH', searchMatches)
            },

            handleUploadedImage (url, deletionUrl) {
                this.handleSelect(url)
                this.$store.dispatch('SHOW_IMAGE_DELETION_URL', deletionUrl)
            },

            scrollToCursor () {
                this.$nextTick(() => {
                    const { container } = this.editor
                    const { y } = this.editor.getSelection().cursorCoords
                    animatedScrollTo(container, container.scrollTop + y - STANDAR_Y, 300)
                })
            },

            scrollToHighlight () {
                return this.scrollToElement('.ag-highlight')
            },

            scrollToHeader (slug) {
                return this.scrollToElement(`[data-id="${slug}"]`)
            },

            scrollToElement (selector) {
                // Scroll to search highlight word
                const { container } = this.editor
                const anchor = document.querySelector(selector)
                if (anchor) {
                    const { y } = anchor.getBoundingClientRect()
                    const DURATION = 300
                    animatedScrollTo(container, container.scrollTop + y - STANDAR_Y, DURATION)
                }
            },

            handleEditParagraph (type) {
                if (type === 'table') {
                    this.tableChecker = { rows: 4, columns: 3 }
                    this.dialogTableVisible = true
                    this.$nextTick(() => {
                        this.$refs.rowInput.focus()
                    })
                } else {
                    this.editor && this.editor.updateParagraph(type)
                }
            },
            handleEditTable (data) {
                const { editor } = this
                editor && editor.editTable(data)
            },
            handleDialogTableConfirm () {
                this.dialogTableVisible = false
                this.editor && this.editor.createTable(this.tableChecker)
            },
            handleFind (action) {
                const searchMatches = this.editor.find(action)
                this.$store.dispatch('SEARCH', searchMatches)
                this.scrollToHighlight()
            },
            handlePrint () {
                const html = this.editor.exportHtml()
                const printer = new Printer(html)
                printer.print()
            },
            handleExport (type) {
                const markdown = this.editor.getMarkdown()
                switch (type) {
                case 'styledHtml': {
                    const content = this.editor.exportStyledHTML(this.filename)
                    this.$store.dispatch('EXPORT', { type, content, markdown })
                    break
                }

                case 'pdf': {
                    const html = this.editor.exportStyledHTML()
                    this.printer.renderMarkdown(html)
                    this.$store.dispatch('EXPORT', { type, markdown })
                    break
                }
                }
            },
            blurEditor () {
                this.editor.blur()
            },

            handleCopyBlock (name) {
                this.editor.copy(name)
            },
            handleInlineFormat (type) {
                this.editor && this.editor.format(type)
            }
        },
        beforeDestroy () {
            bus.$off('file-loaded', this.setMarkdownToEditor)
            bus.$off('undo', this.handleUndo)
            bus.$off('redo', this.handleRedo)
            bus.$off('export', this.handleExport)
            bus.$off('paragraph', this.handleEditParagraph)
            bus.$off('format', this.handleInlineFormat)
            bus.$off('searchValue', this.handleSearch)
            bus.$off('replaceValue', this.handReplace)
            bus.$off('find', this.handleFind)
            bus.$off('dotu-select', this.handleSelect)
            bus.$off('editor-blur', this.blurEditor)
            bus.$off('image-auto-path', this.handleImagePath)
            bus.$off('copyAsMarkdown', this.handleCopyPaste)
            bus.$off('copyAsHtml', this.handleCopyPaste)
            bus.$off('pasteAsPlainText', this.handleCopyPaste)
            bus.$off('insertParagraph', this.handleInsertParagraph)
            bus.$off('editTable', this.handleEditTable)
            bus.$off('scroll-to-header', this.scrollToHeader)
            bus.$off('copy-block', this.handleCopyBlock)
            bus.$off('print', this.handlePrint)

            this.editor.destroy()
            this.editor = null
        }
    }
</script>

<style lang="less">
    @import "~@/less/index.less";

    .wrap {
        width: 100%;
        height: 100%;
        position: relative;
        overflow-x: hidden;
        ._no_scroll_bar();
        .empty-container {
            width: 100%;
            height: 100%;
            background-color: red;
        }
        .title-container {
            width: 100%;
            height: 48px;
            position: absolute;
            top: 0;
            left: 0;
            .title {
                width: 100%;
                height: 100%;
                display: inline-block;
                font-size: 18px;
                padding-left: 18px;
                box-sizing: border-box;
                text-align: center;
            }
        }
        .box-container {
            width: 100%;
            height: 30px;
            background-color: #F8F8F8;
            position: absolute;
            top: 46px;
            left: 0;
        }
        .editor-container {
            position: absolute;
            left: 0;
            bottom: 0;
            top: 78px;
            right: 0;
            background-color: white;
            width: 90%;
            margin: 0 auto;
            box-sizing: border-box;
            overflow-y: scroll;
            ._no_scroll_bar();
            .editor {
                width: 100%;
                height: 100%;
            }
        }
        .ag-dialog-table {
            border-radius: 5px;
            box-shadow: 0 1px 3px rgba(230, 230, 230, .3);
        }

        .dark .ag-dialog-table {
            box-shadow: 0 1px 3px rgba(0, 0, 0, .3);
        }

        .ag-dialog-table .dialog-title svg {
            width: 1.5em;
            height: 1.5em;
        }
    }
</style>
