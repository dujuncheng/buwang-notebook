<template>
    <div class="editor-container"
         :class="[{ 'typewriter': typewriter, 'focus': focus, 'source': sourceCode }, theme]"
         :style="{ 'color': theme === 'dark' ? darkColor : lightColor, 'lineHeight': lineHeight, 'fontSize': fontSize,
    'font-family': editorFontFamily}"
         :dir="textDirection"
    >
        <div class="J_editor editor"></div>
        <el-dialog
            :visible.sync="dialogTableVisible"
            :show-close="isShowClose"
            :modal="true"
            custom-class="ag-dialog-table"
            width="454px"
            center
            dir='ltr'
        >
            <el-forSELECTION_CHANGEm :model="tableChecker" :inline="true">
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
            </el-forSELECTION_CHANGEm>
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
    import { mapState } from 'vuex'
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

    import { showContextMenu } from '../contextMenu/index.js'

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
                // edit modes
                'typewriter': state => state.preferences.typewriter,
                'focus': state => state.preferences.focus,
                'sourceCode': state => state.preferences.sourceCode
            })
        },
        data () {
            return {
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
            }
        },
        created () {
            this.$nextTick(() => {
                const ele = document.querySelector('.J_editor')
                let config = {
                    autoPairBracket: true,
                    autoPairMarkdownSyntax: true,
                    autoPairQuote: true,
                    bulletListMarker: '',
                    focusMode: false,
                    markdown: '',
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
                    this.$store.dispatch('LISTEN_FOR_CONTENT_CHANGE', changes)
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
            })
        },
        methods: {
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
            handleRedo () {
                if (this.editor) {
                    this.editor.redo()
                }
            },
            // Custom copyAsMarkdown copyAsHtml pasteAsPlainText
            handleCopyPaste (type) {
                console.log(type)
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
            },
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
    .editor-container {
        width: 100%;
        height: 100%;
        background-color: white;
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
</style>
