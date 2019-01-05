const state = {
    // 0 是原样，1 是放大
    scaleStatus: 0,
    // 左边栏，0待复习，1笔记本
    sideBarSelected: 0,
}

const getters = {}

const mutations = {
    SET_SCALE_STATUS (state, {num}) {
        state.scaleStatus = num
    },
    SET_SELECTED (state, {num}) {
        state.sideBarSelected = num
    }
}

const actions = {}

export default {state, getters, mutations, actions}
