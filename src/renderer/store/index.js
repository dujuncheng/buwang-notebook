import Vue from 'vue'
import Vuex from 'vuex'

import listenForMain from './listenForMain.js'

Vue.use(Vuex)

const state = {}

const getters = {}

const mutations = {}

const actions = {}

const store = new Vuex.Store({
    state,
    getters,
    mutations,
    actions,
    modules: {
        // have no states
        listenForMain
    }
})

export default store
