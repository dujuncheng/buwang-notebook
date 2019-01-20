import { ipcRenderer } from 'electron'
import bus from '../bus/index.js'

const state = {}

const getters = {}

const mutations = {}

const actions = {
  LISTEN_FOR_EDIT ({commit}) {
    console.log('start  LISTEN_FOR_EDIT')
    ipcRenderer.on('AGANI::edit', (e, { type }) => {
      bus.$emit(type, type)
    })
  },
  LISTEN_FOR_PARAGRAPH_INLINE_STYLE ({ commit }) {
    ipcRenderer.on('AGANI::paragraph', (e, { type }) => {
      bus.$emit('paragraph', type)
    })
    ipcRenderer.on('AGANI::format', (e, { type }) => {
      bus.$emit('format', type)
    })
  }
}

const listenForMain = {
  state,
  getters,
  mutations,
  actions
}

export default listenForMain
