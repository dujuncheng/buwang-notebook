import Vue from 'vue'
import Vuex from 'vuex'

import listenForMain from './listenForMain.js'
import preferences from './preferences.js'
import editor from './editor.js'
// 笔记本的全局属性
import notebook from './notebook.js'

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
    listenForMain,
    preferences,
    editor,
    notebook
  }
})

export default store
