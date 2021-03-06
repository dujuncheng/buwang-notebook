<template>
    <div class="wrap">
        <div v-show="showEdit">
            <div class="title-container" v-if="!isHide">
                <input type="text" class="title" placeholder="未命名" v-model="title"/>
            </div>
            <!-- 在记笔记状态下，才出现 工具箱-->
            <div v-if="!isHide && sideBarSelected === 1" class="editor-box-container">
                <editorBox></editorBox>
            </div>
            <!-- 在复习的状态下，才出现 分割线-->
            <div v-if="!isHide && sideBarSelected === 0" class="review-box-container"></div>

           <div class="editor-container"
                 :class="[{ 'typewriter': typewriter, 'focus': focus, 'source': sourceCode }, theme]"
                 :style="{
                  'color': theme === 'dark' ? 'rgb(128,128,128)' : lightColor,
                  'lineHeight': lineHeight,
                  'fontSize': fontSize,
                  'font-family': editorFontFamily,
                  'top': isHide ? 0 : '78px'
              }"
            >
                <i v-if="isHide" class="el-icon-caret-bottom" @click="handleHide"></i>
                <i v-if="!isHide"  class="el-icon-caret-top" @click="handleHide"></i>
                <!-- 内容编辑区域 -->
                <div class="J_editor editor"></div>
                <!-- 确认复习区域 在复习的状态下，才出现 -->
                <div class="review-btn-container" v-show="sideBarSelected === 0">
                  <div>
                    <el-button
                        class="review-btn"
                        icon="el-icon-circle-check-outline"
                        type="primary"
                        plain
                        @click="hasReview">
                      帮我确定下次review时间
                    </el-button>
                  </div>

                  <div>
                    <el-date-picker
                        class="review-date-picker"
                        v-model="nextReviewTime"
                        type="datetime"
                        size="small"
                        clearable
                        :picker-options="pickerOptions"
                        placeholder="选择日期">
                    </el-date-picker>
                    <el-button
                        class="review-btn"
                        icon="el-icon-circle-check-outline"
                        type="primary"
                        plain
                        @click="hasCustomerReview">自定义review</el-button>
                  </div>
                </div>
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
        <div v-show="!showEdit">
            <div class="empty-area"></div>
        </div>
    </div>
</template>

<script>
    import { shell } from 'electron'
    import { mapState, mapGetters } from 'vuex'
    import editorBox from './editor-box/editor-box-container.vue'
    import Muya from '../../muya/lib/index.js'
    import TablePicker from '../../muya/lib/ui/tablePicker'
    import QuickInsert from '../../muya/lib/ui/quickInsert'
    import CodePicker from '../../muya/lib/ui/codePicker'
    import EmojiPicker from '../../muya/lib/ui/emojiPicker'
    import ImagePathPicker from '../../muya/lib/ui/imagePicker'
    import ImageToolbar from '../../muya/lib/ui/imageToolbar'
    import FormatPicker from '../../muya/lib/ui/formatPicker'
    import ImageSelector from '../../muya/lib/ui/imageSelector'
    import bus from '../bus/index.js'
    import { animatedScrollTo } from '../utils/index.js'
    import Printer from '../services/printService.js'
    import qiniu from '../utils/uploadQiniu.js'

    import '../../muya/themes/default.css'

    import { showContextMenu } from '../contextMenu/editor/index.js'

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
          'changeNote': state => state.notebook.changeNote,
          'noteItemSelected': state => state.notebook.noteItemSelected,
          'reviewItemSelected': state => state.notebook.reviewItemSelected,
          'loading': state => state.notebook.loading,
          'sideBarSelected': state => state.notebook.sideBarSelected,
          'showEdit': state => state.notebook.showEdit
        }),
        ...mapGetters(['currentNote'])

      },
      components: {
        editorBox
      },
      data () {
        return {
          title: '',
          theme: 'dark',
          editor: null,
          isShowClose: false,
          dialogTableVisible: false,
          // 是否需要隐藏
          isHide: false,
          tableChecker: {
            rows: 4,
            columns: 3
          },
          // 自定义的下一次的复习时间
          nextReviewTime: '',
          pickerOptions: {
            shortcuts: [{
              text: '明天',
              onClick (picker) {
                const date = new Date()
                date.setTime(date.getTime() + 3600 * 1000 * 24)
                picker.$emit('pick', date)
              }
            }, {
              text: '后天',
              onClick (picker) {
                const date = new Date()
                date.setTime(date.getTime() + 2 * 3600 * 1000 * 24)
                picker.$emit('pick', date)
              }
            }, {
              text: '3天后',
              onClick (picker) {
                const date = new Date()
                date.setTime(date.getTime() + 3 * 3600 * 1000 * 24 * 7)
                picker.$emit('pick', date)
              }
            },
            {
              text: '1周后',
              onClick (picker) {
                const date = new Date()
                date.setTime(date.getTime() + 7 * 3600 * 1000 * 24 * 7)
                picker.$emit('pick', date)
              }
            },
            {
              text: '2周后',
              onClick (picker) {
                const date = new Date()
                date.setTime(date.getTime() + 14 * 3600 * 1000 * 24 * 7)
                picker.$emit('pick', date)
              }
            },
            {
              text: '1月后',
              onClick (picker) {
                const date = new Date()
                date.setTime(date.getTime() + 30 * 3600 * 1000 * 24 * 7)
                picker.$emit('pick', date)
              }
            },
            {
              text: '2月后',
              onClick (picker) {
                const date = new Date()
                date.setTime(date.getTime() + 60 * 3600 * 1000 * 24 * 7)
                picker.$emit('pick', date)
              }
            },
            {
              text: '3月后',
              onClick (picker) {
                const date = new Date()
                date.setTime(date.getTime() + 90 * 3600 * 1000 * 24 * 7)
                picker.$emit('pick', date)
              }
            },
            {
              text: '6月后',
              onClick (picker) {
                const date = new Date()
                date.setTime(date.getTime() + 6 * 30 * 3600 * 1000 * 24 * 7)
                picker.$emit('pick', date)
              }
            },
            {
              text: '1年后',
              onClick (picker) {
                const date = new Date()
                date.setTime(date.getTime() + 12 * 30 * 3600 * 1000 * 24 * 7)
                picker.$emit('pick', date)
              }
            },
            {
              text: '2年后',
              onClick (picker) {
                const date = new Date()
                date.setTime(date.getTime() + 24 * 30 * 3600 * 1000 * 24 * 7)
                picker.$emit('pick', date)
              }
            }
            ]
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
            this.editor.setMarkdown(value, undefined, false)
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
        handleHide () {
          this.isHide = !this.isHide
        },
        focusEditor () {
          this.editor.focus()
        },
        handleFindAction (action) {
          const searchMatches = this.editor.find(action)
          this.$store.dispatch('SEARCH', searchMatches)
          this.scrollToHighlight()
        },
        // listen for `open-single-file` event, it will call this method only when open a new file.
        setMarkdownToEditor ({ id, markdown, cursor }) {
          const { editor } = this
          if (editor) {
            editor.clearHistory()
            if (cursor) {
              editor.setMarkdown(markdown, cursor, true)
            } else {
              editor.setMarkdown(markdown)
            }
          }
        },
        photoCreatorClick: (url) => {
          shell.openExternal(url)
        },
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
            theme: '',
            hideQuickInsertHint: false,
            imageAction: this.imageAction.bind(this)
          }
          const {
            theme,
            focus
          } = this
          // use muya UI plugins
          Muya.use(TablePicker)
          Muya.use(QuickInsert)
          Muya.use(CodePicker)
          Muya.use(EmojiPicker)
          Muya.use(ImageToolbar)
          Muya.use(ImagePathPicker)
          Muya.use(FormatPicker)
          Muya.use(ImageSelector, {
            unsplashAccessKey: process.env.UNSPLASH_ACCESS_KEY,
            photoCreatorClick: this.photoCreatorClick
          })

          const {container} = this.editor = new Muya(ele, config)

          // the default theme is light write in the store
          this.addThemeStyle(theme)

          bus.$on('file-loaded', this.setMarkdownToEditor)
          bus.$on('undo', this.handleUndo)
          bus.$on('save', this.handleSave)
          bus.$on('redo', this.handleRedo)
          bus.$on('selectAll', this.handleSelectAll)
          bus.$on('paragraph', this.handleEditParagraph)
          bus.$on('format', this.handleInlineFormat)
          bus.$on('searchValue', this.handleSearch)
          bus.$on('replaceValue', this.handReplace)
          bus.$on('find-action', this.handleFindAction)
          bus.$on('insert-image', this.handleSelect)
          bus.$on('image-uploaded', this.handleUploadedImage)
          bus.$on('file-changed', this.handleMarkdownChange)
          bus.$on('editor-blur', this.blurEditor)
          bus.$on('editor-focus', this.focusEditor)
          bus.$on('image-auto-path', this.handleImagePath)
          bus.$on('copyAsMarkdown', this.handleCopyPaste)
          bus.$on('copyAsHtml', this.handleCopyPaste)
          bus.$on('pasteAsPlainText', this.handleCopyPaste)
          bus.$on('duplicate', this.handleParagraph)
          bus.$on('createParagraph', this.handleParagraph)
          bus.$on('deleteParagraph', this.handleParagraph)
          bus.$on('insertParagraph', this.handleInsertParagraph)
          bus.$on('scroll-to-header', this.scrollToHeader)
          bus.$on('clearEditBox', this.clearEditBox)

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

          // 监听到内容的改变
          this.editor.on('change', changes => {
            if (!changes) {
              return
            }
            this.$store.dispatch('LISTEN_FOR_CONTENT_CHANGE', changes)
            let noteId = this.getNoteId()
            let params = {
              noteId: noteId,
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
        // 自定义上传图片的行为
        async imageAction (image) {
          try {
            const result = await qiniu.upload(image)
            return result
          } catch (err) {
            // 上传报错，把图片保存在本地
            console.log(err)
            return ''
          }
        },
        getNoteId () {
          let noteId = 0
          if (this.sideBarSelected === 0) {
            // 待复习模式
            noteId = this.reviewItemSelected
          } else if (this.sideBarSelected === 1) {
            // 笔记复习模式
            noteId = this.noteItemSelected
          }
          return noteId
        },
        clearEditBox () {
          // 编辑器区域
          this.editor.clearHistory()
          this.editor.setMarkdown('', undefined, false)
          // 标题区域
          this.$store.commit('SET_NOTEBOOK', {name: 'showEdit', value: false})
        },
        handleImagePath (files) {
          const { editor } = this
          editor && editor.showAutoImagePath(files)
        },
        handleInsertParagraph (location) {
          const { editor } = this
          editor && editor.insertParagraph(location)
        },
        addThemeStyle (theme) {},
        handleUndo () {
          if (this.editor) {
            this.editor.undo()
          }
        },
        // 监听 ctrl + s
        handleSave () {
          if (!this.showEdit) {
            return
          }
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
        // 监听 已经复习 的按钮点击
        hasReview () {
          let noteId = Number(this.reviewItemSelected)
          if (!noteId) {
            return
          }
          this.$store.dispatch('HAS_REVIEW', {noteId})
        },

        hasCustomerReview () {
          let noteId = Number(this.reviewItemSelected)
          if (!noteId) {
            return
          }
          if (!this.nextReviewTime) {
            this.$message({
              message: '请先选择自定义review时间',
              type: 'error'
            })
            return
          }
          let nextReviewTime = Math.round(this.nextReviewTime.getTime() / 1000)
          this.$store.dispatch('HAS_REVIEW', {
            noteId,
            nextReviewTime: nextReviewTime
          })
        },
        getCacheData (cache) {
          let obj = JSON.parse(cache)
          let keyArr = Object.keys(obj)
          let result = []
          for (let i = 0; i < keyArr.length; i++) {
            let item = {}
            item.note_id = Number(keyArr[i])
            item.title = obj[keyArr[i]].title
            item.content = obj[keyArr[i]].content
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
            let nowcontent = String(content).replace(/[\r\n]/g, '').trim()
            let oldcontent = String(this.currentNote.content || '').replace(/[\r\n]/g, '').trim()
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
        handleSelectAll () {
          if (this.editor && !this.sourceCode) {
            this.editor.selectAll()
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

        // handle `duplicate`, `delete`, `create paragraph bellow`
        handleParagraph (type) {
          const { editor } = this
          if (editor) {
            switch (type) {
              case 'duplicate': {
                return editor.duplicate()
              }
              case 'createParagraph': {
                return editor.insertParagraph('after', '', true)
              }
              case 'deleteParagraph': {
                return editor.deleteParagraph()
              }
              default:
                console.error(`unknow paragraph edit type: ${type}`)
            }
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
        .empty-area {
            width: 100%;
            height: 100%;
            z-index: 100;
            background-color: white;
        }
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
        .editor-box-container {
            width: 100%;
            height: 30px;
            background-color: #F8F8F8;
            position: absolute;
            top: 46px;
            left: 0;
        }
        .review-box-container {
            width: 100%;
            height: 1px;
            background-color: rgba(0,0,0,0.2);
            position: absolute;
            top: 61px;
            left: 0;
        }
        .editor-container {
            position: absolute;
            left: 0;
            bottom: 0;
            right: 0;
            background-color: rgb(52,53,46);
            width: 90%;
            margin: 0 auto;
            box-sizing: border-box;
            overflow-y: scroll;
            ._no_scroll_bar();
            .editor {
                width: 100%;
                height: auto;
                overflow: auto;
                position: relative;
                ._no_scroll_bar();
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

        .review-btn-container {
            width: 100%;
            margin-top: 60px;
            text-align: center;
            padding-bottom: 100px;
            .review-btn {

            }
            .review-date-picker {
              margin-top: 20px;
            }
        }

      code[class*="language-"],
      pre[class*="language-"] {
        text-shadow: none !important;
      }

      .token.operator,
      .token.entity,
      .token.url,
      .language-css .token.string,
      .style .token.string {
        color: #9a6e3a;
        background: transparent!important;
      }
    }
</style>
