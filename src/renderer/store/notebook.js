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
    // 0 是原样，1 是放大
    scaleStatus: 0,
    // 左边栏，0待复习，1笔记本
    sideBarSelected: 0,
    // 笔记本选中的
    noteItemSelected: 0,
    // 待复习选中的
    reviewItemSelected: 0,
    // 左侧的目录
    catalog: [],
    // 中间的笔记列表
    notelist: []
}

const getters = {}

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
    SET_NOTELIST (state, { noteList }) {
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
