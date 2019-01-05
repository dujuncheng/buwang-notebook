const state = {
    // 0 是原样，1 是放大
    scaleStatus: 0
}

const getters = {}

const mutations = {
    SET_SCALE_STATUS (state, {num}) {
        state.scaleStatus = num
    }
}

const actions = {}

export default {state, getters, mutations, actions}
