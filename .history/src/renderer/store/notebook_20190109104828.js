import axios from 'axios'
import Swal from 'sweetalert2'

const popFail = (obj) => {
    Swal({
        type: 'error',
        title: (obj && obj.message) || '网络请求失败',
        toast: true,
        position: 'top',
        showConfirmButton: false,
        timer: 3000
    })
}

const popSuccess = (message) => {
    Swal({
        type: 'success',
        title: message || '网络请求失败',
        toast: true,
        position: 'top',
        showConfirmButton: false,
        timer: 3000
    })
}

const state = {
    // 左侧的目录
    catalog: [],
    // 中间的笔记列表
    notelist: [],
    // 0 是原样，1 是放大
    scaleStatus: 0,
    // 左边栏，0待复习，1笔记本 2代办清单
    sideBarSelected: 0,
    // 笔记本 【中间栏】 选中的
    noteItemSelected: 0,
    // 待复习 【中间栏】 选中的
    reviewItemSelected: 0,
    // 目录【左边栏】 选中的
    selectedCatalogId: 0
}

const getters = {
    currentNote: (state) => {
        let item = ''
        for (let i = 0; i < state.notelist.length; i++) {
            if (state.notelist[i].note_id === state.noteItemSelected) {
                item = state.notelist[i]
            }
        }
        return item
    }
}

const mutations = {
    SET_NOTEBOOK (state, {name, value}) {
        state[name] = value
    },
    SET_SCALE_STATUS (state, {num}) {
        state.scaleStatus = num
    },
    SET_SELECTED (state, {num}) {
        state.sideBarSelected = num
    },
    SET_CATALOG (state, { catalog }) {
        state.catalog = catalog
    },
    ADD_CATALOG (state, {item}) {
        state.catalog.unshift(item)
    },
    ADD_NOTE (state, {item}) {
        state.notelist.unshift(item)
    },
    SET_NOTELIST (state, { noteList }) {
        if (noteList && Array.isArray(noteList)) {
            for (let i = 0; i < noteList.length; i++) {
                noteList[i].content = base64.Base64.decode(noteList[i].content)
            }
        }
        state.notelist = noteList
    }
}

const actions = {
    async ADD_CATALOG ({commit}, {catalogId, parentId, name}) {
        let params = {
            catalog_id: catalogId,
            parent_id: parentId,
            name
        }
        try {
            let result = (await axios({
                method: 'post',
                url: 'http://127.0.0.1:8991/notebook?method=add_catalog',
                data: params
            })).data
            if (!result || !result.success) {
                popFail(result)
            }
            await this.dispatch('GET_CATALOG')
        } catch (e) {
            popFail(e)
        }
    },
    async ADD_NOTE ({commit}, {catalogId, noteId, title, content}) {
        let params = {
            catalog_id: catalogId,
            note_id: noteId,
            title,
            content
        }
        try {
            let result = (await axios({
                method: 'post',
                url: 'http://127.0.0.1:8991/notebook?method=add_note',
                data: params
            })).data
            if (!result || !result.success) {
                popFail(result)
            }
            await this.dispatch('GET_CATALOG')
            await this.dispatch('GET_NOTE_LIST', {catalogId})
            commit('SET_NOTEBOOK', {
                name: 'selectedCatalogId',
                value: catalogId
            })
            commit('SET_NOTEBOOK', {
                name: 'noteItemSelected',
                value: noteId
            })
        } catch (e) {
            popFail(e)
        }
    },
    async DELETE_NOTE ({commit}, {noteId, catalogId, nextNote}) {
        let params = {
            note_id: noteId
        }
        try {
            let result = (await axios({
                method: 'post',
                url: 'http://127.0.0.1:8991/notebook?method=delete_note',
                data: params
            })).data
            if (!result || !result.success) {
                popFail(result)
            }
            await this.dispatch('GET_CATALOG')
            await this.dispatch('GET_NOTE_LIST', {catalogId})
            commit('SET_NOTEBOOK', {
                name: 'selectedCatalogId',
                value: catalogId
            })

            let newNoteItemSelected = 0
            if (nextNote) {
                newNoteItemSelected = nextNote.note_id
            }
            commit('SET_NOTEBOOK', {
                name: 'noteItemSelected',
                value: newNoteItemSelected
            })
        } catch (e) {
            popFail(e)
        }
    },
    async REMOVE_CATALOG ({commit}, {catalogId}) {
        let params = {
            catalog_id: catalogId
        }
        try {
            let result = (await axios({
                method: 'post',
                url: 'http://127.0.0.1:8991/notebook?method=remove_catalog',
                data: params
            })).data
            if (!result || !result.success) {
                popFail(result)
                return
            }
            await this.dispatch('GET_CATALOG')
        } catch (e) {
            popFail(e)
        }
    },
    async RENAME_CATALOG ({commit}, {catalogId, newName}) {
        let params = {
            catalog_id: catalogId,
            new_name: newName
        }
        try {
            let result = (await axios({
                method: 'post',
                url: 'http://127.0.0.1:8991/notebook?method=rename_catalog',
                data: params
            })).data
            if (!result || !result.success) {
                popFail(result)
                return
            }
        } catch (e) {
            popFail(e)
        }
    },
    async MOVE_CATALOG ({commit}, {catalogId, parentId}) {
        let params = {
            catalog_id: catalogId,
            parent_id: parentId
        }
        try {
            let result = (await axios({
                method: 'post',
                url: 'http://127.0.0.1:8991/notebook?method=move_catalog',
                data: params
            })).data
            if (!result || !result.success) {
                popFail(result)
                return
            }
            console.log(result)
        } catch (e) {
            popFail(e)
        }
    },
    async GET_CATALOG ({commit}) {
        try {
            let result = (await axios({
                method: 'get',
                url: 'http://127.0.0.1:8991/notebook?method=get_catalog'
            })).data
            if (!result || !result.success) {
                popFail(result)
                return
            }
            let data = result.data
            let catalog = data.catalog_tree
            commit('SET_CATALOG', { catalog })
        } catch (e) {
            popFail(e)
        }
    },
    async GET_NOTE_LIST ({commit}, {catalogId}) {
        let params = {
            catalog_id: catalogId
        }
        try {
            let result = (await axios({
                method: 'post',
                url: 'http://127.0.0.1:8991/notebook?method=get_note_list',
                data: params
            })).data
            if (!result || !result.success) {
                popFail(result)
                return
            }
            let data = result.data
            commit('SET_NOTELIST', {noteList: data.noteList})
        } catch (e) {
            popFail(e)
        }
    }
}

export default {state, getters, mutations, actions}
