import { clipboard, ipcRenderer, shell } from 'electron'
import path from 'path'
import bus from '../bus'
import { hasKeys } from '../utils/index.js'
import notice from '../services/notification/index.js'

const toc = require('markdown-toc')
const state = {
    lineEnding: 'lf',
    currentFile: {},
    tabs: [],
    textDirection: 'ltr'
}

const getters = {
    toc: state => {
        const { currentFile } = state
        return toc(currentFile.markdown).json
    }
}

const mutations = {
    // set search key and matches also index
    SET_SEARCH (state, value) {
        state.currentFile.searchMatches = value
    },
    SET_CURRENT_FILE (state, currentFile) {
        const oldCurrentFile = state.currentFile
        if (!oldCurrentFile.id || oldCurrentFile.id !== currentFile.id) {
            const { markdown, cursor, history, pathname } = currentFile
            window.DIRNAME = pathname ? path.dirname(pathname) : ''
            // set state first, then emit file changed event
            state.currentFile = currentFile
            bus.$emit('file-changed', { markdown, cursor, renderCursor: true, history })
        }
    },
    ADD_FILE_TO_TABS (state, currentFile) {
        state.tabs.push(currentFile)
    },
    REMOVE_FILE_WITHIN_TABS (state, file) {
        const { tabs, currentFile } = state
        const index = tabs.indexOf(file)
        tabs.splice(index, 1)
        state.tabs = tabs
        if (file.id === currentFile.id) {
            const fileState = state.tabs[index] || state.tabs[index - 1] || {}
            state.currentFile = fileState
            if (typeof fileState.markdown === 'string') {
                const { markdown, cursor, history } = fileState
                bus.$emit('file-changed', { markdown, cursor, renderCursor: true, history })
            }
        }
    },
    SET_PATHNAME (state, file) {
        const { filename, pathname, id } = file
        if (id === state.currentFile.id && pathname) {
            window.DIRNAME = path.dirname(pathname)
        }

        const targetFile = state.tabs.filter(f => f.id === id)[0]
        if (targetFile) {
            const isSaved = true
            Object.assign(targetFile, { filename, pathname, isSaved })
        }
    },
    SET_SAVE_STATUS (state, status) {
        if (hasKeys(state.currentFile)) {
            state.currentFile.isSaved = status
        }
    },
    SET_SAVE_STATUS_WHEN_REMOVE (state, { pathname }) {
        state.tabs.forEach(f => {
            if (f.pathname === pathname) {
                f.isSaved = false
            }
        })
    },
    SET_MARKDOWN (state, markdown) {
        if (hasKeys(state.currentFile)) {
            state.currentFile.markdown = markdown
        }
    },
    SET_IS_UTF8_BOM_ENCODED (state, isUtf8BomEncoded) {
        if (hasKeys(state.currentFile)) {
            state.currentFile.isUtf8BomEncoded = isUtf8BomEncoded
        }
    },
    SET_LINE_ENDING (state, lineEnding) {
        if (hasKeys(state.currentFile)) {
            state.currentFile.lineEnding = lineEnding
        }
    },
    SET_ADJUST_LINE_ENDING_ON_SAVE (state, adjustLineEndingOnSave) {
        if (hasKeys(state.currentFile)) {
            state.currentFile.adjustLineEndingOnSave = adjustLineEndingOnSave
        }
    },
    SET_WORD_COUNT (state, wordCount) {
        if (hasKeys(state.currentFile)) {
            state.currentFile.wordCount = wordCount
        }
    },
    SET_CURSOR (state, cursor) {
        if (hasKeys(state.currentFile)) {
            state.currentFile.cursor = cursor
        }
    },
    SET_HISTORY (state, history) {
        if (hasKeys(state.currentFile)) {
            state.currentFile.history = history
        }
    },
    CLOSE_TABS (state, arr) {
        arr.forEach(id => {
            const index = state.tabs.findIndex(f => f.id === id)
            state.tabs.splice(index, 1)
            if (state.currentFile.id === id) state.currentFile = {}
        })
        if (!state.currentFile.id && state.tabs.length) {
            state.currentFile = state.tabs[0]
            if (typeof state.currentFile.markdown === 'string') {
                const { markdown, cursor, history } = state.currentFile
                bus.$emit('file-changed', { markdown, cursor, renderCursor: true, history })
            }
        }
    },
    RENAME_IF_NEEDED (state, { src, dest }) {
        const { tabs } = state
        tabs.forEach(f => {
            if (f.pathname === src) {
                f.pathname = dest
                f.filename = path.basename(dest)
            }
        })
    },
    SET_GLOBAL_LINE_ENDING (state, ending) {
        state.lineEnding = ending
    },
    SET_TEXT_DIRECTION (state, textDirection) {
        if (hasKeys(state.currentFile)) {
            state.currentFile.textDirection = textDirection
        }
    }
}

const actions = {
    // when cursor in `![](cursor)`, insert image popup will be shown! `absolute` or `relative`
    ASK_FOR_INSERT_IMAGE ({ commit }, type) {
        ipcRenderer.send('AGANI::ask-for-insert-image', type)
    },
    // image path auto complement
    ASK_FOR_IMAGE_AUTO_PATH ({ commit, state }, src) {
        const { pathname } = state.currentFile
        if (pathname) {
            ipcRenderer.send('AGANI::ask-for-image-auto-path', { pathname, src })
        }
    },

    SEARCH ({ commit }, value) {
        commit('SET_SEARCH', value)
    },

    SHOW_IMAGE_DELETION_URL ({ commit }, deletionUrl) {
        notice.notify({
            title: 'Image deletion URL',
            message: `Click to copy the deletion URL of the uploaded image to the clipboard (${deletionUrl}).`,
            showConfirm: true,
            time: 20000
        })
            .then(() => {
                clipboard.writeText(deletionUrl)
            })
    },

    REMOVE_FILE_IN_TABS ({ commit }, file) {
        commit('REMOVE_FILE_WITHIN_TABS', file)
    },

    // need update line ending when change between windows.
    LISTEN_FOR_LINEENDING_MENU ({ commit, state, dispatch }) {
        ipcRenderer.on('AGANI::req-update-line-ending-menu', e => {
            dispatch('UPDATE_LINEENDING_MENU')
        })
    },

    // need update line ending when change between tabs
    UPDATE_LINEENDING_MENU ({ commit, state }) {
        const { lineEnding } = state.currentFile
        if (lineEnding) {
            ipcRenderer.send('AGANI::update-line-ending-menu', lineEnding)
        }
    },

    LISTEN_FOR_TEXT_DIRECTION_MENU ({ commit, state, dispatch }) {
        ipcRenderer.on('AGANI::req-update-text-direction-menu', e => {
            dispatch('UPDATE_TEXT_DIRECTION_MENU')
        })
    },

    UPDATE_TEXT_DIRECTION_MENU ({ commit, state }) {
        const { textDirection } = state.currentFile
        if (textDirection) {
            ipcRenderer.send('AGANI::update-text-direction-menu', textDirection)
        }
    },

    // need pass some data to main process when `save` menu item clicked
    // LISTEN_FOR_SAVE ({ commit, state, dispatch }) {
    //     ipcRenderer.on('AGANI::ask-file-save', () => {
    //         const { id, pathname, markdown } = state.currentFile
    //         const options = getOptionsFromState(state.currentFile)
    //         if (id) {
    //             ipcRenderer.send('AGANI::response-file-save', { id, pathname, markdown, options })
    //         }
    //     })
    // },

    // need pass some data to main process when `save as` menu item clicked
    // LISTEN_FOR_SAVE_AS ({ commit, state }) {
    //     ipcRenderer.on('AGANI::ask-file-save-as', () => {
    //         const { id, pathname, markdown } = state.currentFile
    //         const options = getOptionsFromState(state.currentFile)
    //         if (id) {
    //             ipcRenderer.send('AGANI::response-file-save-as', { id, pathname, markdown, options })
    //         }
    //     })
    // },

    // LISTEN_FOR_CLOSE ({ commit, state }) {
    //     ipcRenderer.on('AGANI::ask-for-close', e => {
    //         const unSavedFiles = state.tabs.filter(file => !file.isSaved)
    //             .map(file => {
    //                 const { id, filename, pathname, markdown } = file
    //                 const options = getOptionsFromState(file)
    //                 return { id, filename, pathname, markdown, options }
    //             })
    //
    //         if (unSavedFiles.length) {
    //             ipcRenderer.send('AGANI::response-close-confirm', unSavedFiles)
    //         } else {
    //             ipcRenderer.send('AGANI::close-window')
    //         }
    //     })
    // },

    // LISTEN_FOR_SAVE_CLOSE ({ commit, state }) {
    //     ipcRenderer.on('AGANI::save-all-response', (e, { err, data }) => {
    //         if (err) {
    //         } else if (Array.isArray(data)) {
    //             const toBeClosedTabs = [...state.tabs.filter(f => f.isSaved), ...data]
    //             commit('CLOSE_TABS', toBeClosedTabs)
    //         }
    //     })
    //     ipcRenderer.on('AGANI::save-single-response', (e, { err, data }) => {
    //         if (err) {
    //         } else if (Array.isArray(data) && data.length) {
    //             commit('CLOSE_TABS', data)
    //         }
    //     })
    // },

    // ASK_FOR_SAVE_ALL ({ commit, state }, isClose) {
    //     const unSavedFiles = state.tabs.filter(file => !(file.isSaved && /[^\n]/.test(file.markdown)))
    //         .map(file => {
    //             const { id, filename, pathname, markdown } = file
    //             const options = getOptionsFromState(file)
    //             return { id, filename, pathname, markdown, options }
    //         })
    //     if (unSavedFiles.length) {
    //         const EVENT_NAME = isClose ? 'AGANI::save-close' : 'AGANI::save-all'
    //         const isSingle = false
    //         ipcRenderer.send(EVENT_NAME, unSavedFiles, isSingle)
    //     } else if (isClose) {
    //         commit('CLOSE_TABS', state.tabs.map(f => f.id))
    //     }
    // },

    // LISTEN_FOR_MOVE_TO ({ commit, state }) {
    //     ipcRenderer.on('AGANI::ask-file-move-to', () => {
    //         const { id, pathname, markdown } = state.currentFile
    //         const options = getOptionsFromState(state.currentFile)
    //         if (!id) return
    //         if (!pathname) {
    //             // if current file is a newly created file, just save it!
    //             ipcRenderer.send('AGANI::response-file-save', { id, pathname, markdown, options })
    //         } else {
    //             // if not, move to a new(maybe) folder
    //             ipcRenderer.send('AGANI::response-file-move-to', { id, pathname })
    //         }
    //     })
    // },

    // LISTEN_FOR_RENAME ({ commit, state, dispatch }) {
    //     ipcRenderer.on('AGANI::ask-file-rename', () => {
    //         dispatch('RESPONSE_FOR_RENAME')
    //     })
    // },

    // RESPONSE_FOR_RENAME ({ commit, state }) {
    //     const { id, pathname, markdown } = state.currentFile
    //     const options = getOptionsFromState(state.currentFile)
    //     if (!id) return
    //     if (!pathname) {
    //         // if current file is a newly created file, just save it!
    //         ipcRenderer.send('AGANI::response-file-save', { id, pathname, markdown, options })
    //     } else {
    //         bus.$emit('rename')
    //     }
    // },

    // ask for main process to rename this file to a new name `newFilename`
    RENAME ({ commit, state }, newFilename) {
        const { id, pathname, filename } = state.currentFile
        if (typeof filename === 'string' && filename !== newFilename) {
            const newPathname = path.join(path.dirname(pathname), newFilename)
            ipcRenderer.send('AGANI::rename', { id, pathname, newPathname })
        }
    },

    UPDATE_CURRENT_FILE ({ commit, state, dispatch }, currentFile) {
        commit('SET_CURRENT_FILE', currentFile)
        dispatch('UPDATE_TEXT_DIRECTION_MENU', state)
        const { tabs } = state
        if (!tabs.some(file => file.id === currentFile.id)) {
            commit('ADD_FILE_TO_TABS', currentFile)
        }
    },

    // Content change from realtime preview editor and source code editor
    LISTEN_FOR_CONTENT_CHANGE ({ commit, state, rootState }, { markdown, wordCount, cursor, history }) {
        const { autoSave } = rootState.preferences
        const { pathname, markdown: oldMarkdown, id } = state.currentFile
        commit('SET_MARKDOWN', markdown)

        // ignore new line which is added if the editor text is empty (#422)
        if (oldMarkdown.length === 0 && markdown.length === 1 && markdown[0] === '\n') {
            return
        }

        // set word count
        if (wordCount) commit('SET_WORD_COUNT', wordCount)
        // set cursor
        if (cursor) commit('SET_CURSOR', cursor)
        // set history
        if (history) commit('SET_HISTORY', history)

        // change save status/save to file only when the markdown changed!
        if (markdown !== oldMarkdown) {
            // if (projectTree) {
            //     commit('UPDATE_PROJECT_CONTENT', { markdown, pathname })
            // }
            // if (pathname && autoSave) {
            //     ipcRenderer.send('AGANI::response-file-save', { id, pathname, markdown })
            // } else {
            //     commit('SET_SAVE_STATUS', false)
            // }
        }
    },

    SELECTION_CHANGE ({ commit }, changes) {
        const { start, end } = changes
        if (start.key === end.key && start.block.text) {
            const value = start.block.text.substring(start.offset, end.offset)
            commit('SET_SEARCH', {
                matches: [],
                index: -1,
                value
            })
        }

        ipcRenderer.send('AGANI::selection-change', changes)
    },

    SELECTION_FORMATS ({ commit }, formats) {
        ipcRenderer.send('AGANI::selection-formats', formats)
    },

    // listen for export from main process
    LISTEN_FOR_EXPORT_PRINT ({ commit, state }) {
        ipcRenderer.on('AGANI::export', (e, { type }) => {
            bus.$emit('export', type)
        })
        ipcRenderer.on('AGANI::print', e => {
            bus.$emit('print')
        })
    },

    EXPORT ({ commit, state }, { type, content, markdown }) {
        if (!hasKeys(state.currentFile)) return
        const { filename, pathname } = state.currentFile
        ipcRenderer.send('AGANI::response-export', { type, content, filename, pathname, markdown })
    },

    LINTEN_FOR_EXPORT_SUCCESS ({ commit }) {
        ipcRenderer.on('AGANI::export-success', (e, { type, filePath }) => {
            notice.notify({
                title: 'Export',
                message: `Export ${path.basename(filePath)} successfully`,
                showConfirm: true
            })
                .then(() => {
                    shell.showItemInFolder(filePath)
                })
        })
    },

    LISTEN_FOR_INSERT_IMAGE ({ commit, state }) {
        ipcRenderer.on('AGANI::INSERT_IMAGE', (e, { filename: imagePath, type }) => {
            if (!hasKeys(state.currentFile)) return
            if (type === 'absolute' || type === 'relative') {
                const { pathname } = state.currentFile
                if (type === 'relative' && pathname) {
                    imagePath = path.relative(path.dirname(pathname), imagePath)
                }
                bus.$emit('insert-image', imagePath)
            } else {
                // upload to CM
                bus.$emit('upload-image')
            }
        })
    },

    LINTEN_FOR_SET_LINE_ENDING ({ commit, state }) {
        ipcRenderer.on('AGANI::set-line-ending', (e, { lineEnding, ignoreSaveStatus }) => {
            const { lineEnding: oldLineEnding } = state.currentFile
            if (lineEnding !== oldLineEnding) {
                commit('SET_LINE_ENDING', lineEnding)
                commit('SET_ADJUST_LINE_ENDING_ON_SAVE', lineEnding !== 'lf')
                if (!ignoreSaveStatus) {
                    commit('SET_SAVE_STATUS', false)
                }
            }
        })
    },

    LISTEN_FOR_SET_TEXT_DIRECTION ({ commit, state }) {
        ipcRenderer.on('AGANI::set-text-direction', (e, { textDirection }) => {
            const { textDirection: oldTextDirection } = state.currentFile
            if (textDirection !== oldTextDirection) {
                commit('SET_TEXT_DIRECTION', textDirection)
            }
        })
    }
}

export default { state, getters, mutations, actions }
