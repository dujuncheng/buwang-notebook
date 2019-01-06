import axios from 'axios'

const state = {
    // 0 是原样，1 是放大
    scaleStatus: 0,
    // 左边栏，0待复习，1笔记本
    sideBarSelected: 0,
    // 笔记本选中的
    noteItemSelected: 0,
    // 待复习选中的
    reviewItemSelected: 0,
    catalog: []
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
            let result = await axios({
                method: 'post',
                url: 'http://127.0.0.1:8991/notebook?method=add_catalog',
                data: params
            })
            console.log(result)
        } catch (e) {
            console.log(e)
        }
    },
    REMOVE_CATALOG () {

    },
    RENAME_CATALOG () {

    },
    MOVE_CATALOG () {

    },
    async GET_CATALOG ({commit}) {
        try {
            let result = (await axios({
                method: 'get',
                url: 'http://127.0.0.1:8991/notebook?method=get_catalog'
            })).data
            if (!result || !result.success) {
                return
            }
            let data = result.data
            let catalog = data.catalog_tree
            commit('SET_CATALOG', { catalog })
        } catch (e) {
            console.log(e)
        }
    }
}

export default {state, getters, mutations, actions}
