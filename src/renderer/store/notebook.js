import ajax from '../utils/ajax.js'
import Swal from 'sweetalert2'
import {friendlyTime} from '../utils/friendTime.js'
const base64 = require('js-base64')

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
    title: message || '操作成功',
    toast: true,
    position: 'top',
    showConfirmButton: false,
    timer: 3000
  })
}

const cleanStorageChange = (noteId) => {
  let cacheChange = window.localStorage.getItem('_change_note')
  if (cacheChange) {
    let obj = JSON.parse(cacheChange)
    if (obj[noteId]) {
      delete obj[noteId]
      window.localStorage.setItem('_change_note', JSON.stringify(obj))
    }
  }
}

const state = {
  loading: false,
  // 全局的被修改的note
  changeNote: [],
  // 左侧的目录
  catalog: [],
  // 中间的笔记列表
  notelist: [],
  // 待复习列表
  reviewlist: [],
  contentChanged: '',
  titleChanged: '',
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
    if (state.sideBarSelected === 1) {
      for (let i = 0; i < state.notelist.length; i++) {
        if (state.notelist[i].note_id === state.noteItemSelected) {
          item = state.notelist[i]
        }
      }
    } else if (state.sideBarSelected === 0) {
      for (let i = 0; i < state.reviewlist.length; i++) {
        if (state.reviewlist[i].note_id === state.reviewItemSelected) {
          item = state.reviewlist[i]
        }
      }
    }
    return item
  }
}

const mutations = {
  CLEAN_CHANGE_NOTE (state) {
    state.changeNote = []
  },
  PUSH_CHANGE_NOTE (state, {noteId}) {
    state.changeNote.push(noteId)
  },
  // 选中笔记
  SELECT_NOTE (state, {noteId, index}) {
    state.noteItemSelected = noteId
    state.contentChanged = state.notelist[index].content
    state.titleChanged = state.notelist[index].title
  },
  // 选中待复习
  SELECT_REVIEW (state, {noteId, review}) {
    state.reviewItemSelected = noteId
    state.contentChanged = review.content
    state.titleChanged = review.title
  },
  SET_NOTEBOOK (state, {name, value}) {
    state[name] = value
  },
  SET_SCALE_STATUS (state, {num}) {
    state.scaleStatus = num
  },
  SET_SELECTED (state, {num}) {
    if (Number(num) === Number(state.sideBarSelected)) {
      return
    }
    state.sideBarSelected = num
    if (num === 0) {
      // 如果是待复习状态
      this.dispatch('GET_REVIEWLIST', {page: 0, page_size: 0, need_page: false})
    } else if (num === 1) {
      // 如果是笔记本状态
      let catalogId = state.selectedCatalogId || 0
      this.dispatch('GET_NOTE_LIST', {catalogId})
    }
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
  /**
     * 设置一条笔记列表
     * @param state
     * @param notelist
     * @constructor
     */
  SET_NOTELIST (state, { notelist }) {
    // base64 解码
    if (notelist && Array.isArray(notelist)) {
      for (let i = 0; i < notelist.length; i++) {
        try {
          notelist[i].content = base64.Base64.decode(notelist[i].content)
        } catch (e) {
          console.log(e)
        }
      }
    }
    // 设置
    state.notelist = notelist
    let sameNote = 0
    for (let i = 0; i < notelist.length; i++) {
      if (notelist[i].note_id === state.noteItemSelected) {
        sameNote = i
      }
    }
    // 如果没有选择中间的nodelist, 则默认是第一个
    if (state.notelist[sameNote]) {
      state.noteItemSelected = state.notelist[sameNote].note_id
      state.contentChanged = state.notelist[sameNote].content
      state.titleChanged = state.notelist[sameNote].title
    }
  },
  SET_REVIEW_LIST (state, { reviewlist }) {
    // base64 解码
    if (reviewlist && Array.isArray(reviewlist)) {
      for (let i = 0; i < reviewlist.length; i++) {
        try {
          reviewlist[i].content = base64.Base64.decode(reviewlist[i].content)
        } catch (e) {
          console.log(e)
        }
      }
    }
    // 设置
    state.reviewlist = reviewlist
    let sameNote = 0
    // 如果已经有选择的reviewItemSelected，则选择那个
    for (let i = 0; i < reviewlist.length; i++) {
      if (reviewlist[i].note_id === state.reviewItemSelected) {
        sameNote = i
      }
    }
    // 如果没有选择中间的nodelist, 则默认是第一个
    if (state.reviewlist[sameNote]) {
      state.reviewItemSelected = state.reviewlist[sameNote].note_id
      state.contentChanged = state.reviewlist[sameNote].content
      state.titleChanged = state.reviewlist[sameNote].title
    }
  },
  UPDATA_NOTE_CONTENT_TITLE (state, {noteId, title, content}) {
    for (let i = 0; i < state.notelist.length; i++) {
      if (state.notelist[i].note_id === noteId) {
        state.notelist[i].title = title
        state.notelist[i].content = content
      }
    }
  }
}

const actions = {
  /**
   * 已经复习了这个笔记的接口
   * @param commit
   * @param noteId
   * @returns {Promise<void>}
   * @constructor
   */
  async HAS_REVIEW ({commit}, {noteId}) {
    let params = {
      note_id: noteId
    }
    try {
      let result = await ajax('post', 'review_this', params)
      if (!result || !result.success || !result.data) {
        popFail(result)
        return
      }
      let data = result.data
      let nextTime = friendlyTime(data.next_notify_time)
      popSuccess(`复习成功，下次复习时间为${nextTime}`)
      commit('SET_NOTEBOOK', {
        name: 'reviewItemSelected',
        value: 0
      })
      await this.dispatch('GET_REVIEWLIST', {page: 0, page_size: 0, need_page: false})
    } catch (e) {
      popFail(e)
    }
  },
  /**
     * 获取待复习列表
     * @param commit
     * @returns {Promise<void>}
     * @constructor
     */
  async GET_REVIEWLIST ({commit}, params) {
    try {
      console.log(params, '1111')
      let result = await ajax('post', 'get_review_list', params)
      if (!result || !result.success) {
        popFail(result)
        return
      }
      if (!result.review_list || !Array.isArray(result.review_list)) {
        popFail({
          message: '网络错误，返回的不是列表'
        })
        return
      }
      commit('SET_REVIEW_LIST', {reviewlist: result.review_list})
    } catch (e) {
      popFail(e)
    }
  },
  /**
     * 增加一个目录
     * @param commit
     * @param catalogId  新增的目录id
     * @param parentId   新增的目录id的父亲id
     * @param name       新增的目录名称
     * @returns {Promise<void>}
     * @constructor
     */
  async ADD_CATALOG ({commit}, {catalogId, parentId, name}) {
    let params = {
      catalog_id: catalogId,
      parent_id: parentId,
      name
    }
    try {
      let result = await ajax('post', 'add_catalog', params)
      if (!result || !result.success) {
        popFail(result)
        return
      }
      await this.dispatch('GET_CATALOG')
    } catch (e) {
      popFail(e)
    }
  },
  /**
     * 增加一条笔记
     * @param commit
     * @param catalogId   该笔记所属的目录
     * @param noteId      该笔记的id
     * @param title       该笔记的标题
     * @param content     该笔记的内容
     * @returns {Promise<void>}
     * @constructor
     */
  async ADD_NOTE ({commit}, {catalogId, noteId, title, content}) {
    let params = {
      catalog_id: catalogId,
      note_id: noteId,
      title,
      content
    }
    try {
      let result = await ajax('post', 'add_note', params)

      if (!result || !result.success) {
        popFail(result)
        return
      }
      commit('SET_NOTEBOOK', {
        name: 'noteItemSelected',
        value: noteId
      })
      await this.dispatch('GET_CATALOG')
      await this.dispatch('GET_NOTE_LIST', {catalogId})
      commit('SET_NOTEBOOK', {
        name: 'selectedCatalogId',
        value: catalogId
      })
    } catch (e) {
      popFail(e)
    }
  },
  /**
     *  删除一台笔记
     * @param commit
     * @param noteId
     * @param catalogId
     * @param nextNote
     * @returns {Promise<void>}
     * @constructor
     */
  async DELETE_NOTE ({commit}, {noteId, catalogId, nextNote}) {
    let params = {
      note_id: noteId
    }
    try {
      let result = await ajax('post', 'delete_note', params)

      if (!result || !result.success) {
        popFail(result)
        return
      }
      cleanStorageChange(noteId)

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
  /**
     * 移动一条目录
     * @param commit
     * @param catalogId
     * @returns {Promise<void>}
     * @constructor
     */
  async REMOVE_CATALOG ({commit}, {catalogId}) {
    let params = {
      catalog_id: catalogId
    }
    try {
      let result = await ajax('post', 'remove_catalog', params)
      if (!result || !result.success) {
        popFail(result)
        return
      }
      await this.dispatch('GET_CATALOG')
    } catch (e) {
      popFail(e)
    }
  },
  /**
     * 对目录进行重命名
     * @param commit
     * @param catalogId
     * @param newName
     * @returns {Promise<void>}
     * @constructor
     */
  async RENAME_CATALOG ({commit}, {catalogId, newName}) {
    let params = {
      catalog_id: catalogId,
      new_name: newName
    }
    try {
      let result = await ajax('post', 'rename_catalog', params)
      if (!result || !result.success) {
        popFail(result)
        return
      }
    } catch (e) {
      popFail(e)
    }
  },
  /**
     * 移动目录
     * @param commit
     * @param catalogId
     * @param parentId
     * @returns {Promise<void>}
     * @constructor
     */
  async MOVE_CATALOG ({commit}, {catalogId, parentId}) {
    let params = {
      catalog_id: catalogId,
      parent_id: parentId
    }
    try {
      let result = await ajax('post', 'move_catalog', params)

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
      let result = await ajax('get', 'get_catalog', {})

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
  /**
     * 获取一条笔记列表
     * @param commit
     * @param catalogId
     * @returns {Promise<void>}
     * @constructor
     */
  async GET_NOTE_LIST ({commit}, {catalogId}) {
    let params = {
      catalog_id: catalogId
    }
    try {
      let result = await ajax('post', 'get_note_list', params)

      if (!result || !result.success) {
        popFail(result)
        return
      }
      let data = result.data
      commit('SET_NOTELIST', {notelist: data.noteList})
    } catch (e) {
      popFail(e)
    }
  },
  /**
     * 提交修改
     * @param commit
     * @param state
     * @param changeArr
     * @returns {Promise<void>}
     * @constructor
     */
  async CHANGE_NOTE ({commit, state}, {changeArr}) {
    let params = {
      change_arr: changeArr
    }
    try {
      let result = await ajax('post', 'change_arr', params)

      if (!result || !result.success) {
        // 如果更新失败
        popFail(result)
        return
      }

      if (state.sideBarSelected === 0) {
        // 待复习状态
        await this.dispatch('GET_REVIEWLIST', {page: 0, page_size: 0, need_page: false})
      } else if (state.sideBarSelected === 1) {
        // 记笔记的状态
        await this.dispatch('GET_NOTE_LIST', {catalogId: state.selectedCatalogId})
      }

      // 如果更新成功，清空全局的 changeNote
      commit('CLEAN_CHANGE_NOTE')
      commit('SET_NOTEBOOK', {
        name: 'loading',
        value: false
      })
      window.localStorage.setItem('_change_note', JSON.stringify({}))
    } catch (e) {
      popFail(e)
    }
  }
}

export default {state, getters, mutations, actions}
