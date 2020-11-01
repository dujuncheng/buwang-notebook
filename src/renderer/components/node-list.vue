<template>
    <div class="node-list-container" :style="nodeListStyle">
        <div class="title-container" v-if="sideBarSelected === 1">
            <i class="sort-icon el-icon-sort" @click="clickOrder($event)"></i>
            <div class="title">笔记本</div>
            <i class="add-icon el-icon-plus" @click="addNote"></i>
        </div>
        <div class="search-container" v-if="sideBarSelected === 1">
            <input type="text" class="search-input" placeholder="查找笔记">
        </div>
        <!-- 笔记本列表 -->
        <div class="note-list-container" v-if="sideBarSelected === 1">
            <div class="list">
                <div class="item"
                     :id="note.note_id"
                     :key="index"
                     v-for="(note, index) in notelist"
                     :class="noteItemSelected == note.note_id ?'item-selected':''"
                     @click="clickNote(note.note_id, index)"
                     @contextmenu.prevent="addContextBoard($event,note)"
                >
                    <noteListItem :note="note"></noteListItem>
                </div>
            </div>
        </div>
        <!-- 待复习列表 -->
        <div class="review-list-container" v-if="sideBarSelected === 0">
            <!--  有列表时，则渲染列表-->
            <div class="list" v-if="reviewlist && reviewlist.length !== 0">
                <div class="item"
                     v-for="(review , index) in reviewlist"
                     :key="index"
                     :class="reviewItemSelected == review.note_id ? 'item-selected':''"
                     @click="clickReview(review.note_id, index)"
                >
                    <reviewListItem :review="review"></reviewListItem>
                </div>
            </div>
            <!--   没有列表时，渲染提示文字   -->
            <div class="empty-tip-container" v-if="!reviewlist || reviewlist.length === 0">
              <div>
                <i class="el-icon-folder-opened icon"></i>
              </div>
              您还没有任何待复习的笔记，请先去创建新的笔记吧
            </div>
        </div>
    </div>
</template>

<script>
    import bus from '../bus/index.js'
    import { showItemContext, showOrderContext } from '../contextMenu/noteList/index.js'
    import { getRandomNum } from '@/utils/index.js'
    import { mapState, mapGetters } from 'vuex'
    import noteListItem from './middle-list/note-list-item.vue'
    import reviewListItem from './middle-list/review-list-item.vue'
    import eventBus from '../utils/eventBus'
    export default {
      components: {
        noteListItem,
        reviewListItem
      },
      computed: {
        nodeListStyle () {
          if (this.notelist.length === 0 && this.reviewlist.length === 0) {
            return {
              'background-image': 'url(http://h0.hucdn.com/open/201902/4bc76cd6687f7a50_749x1405.png)',
              'background-size': '100% 100%',
              'background-position': 'center center',
              'background-repeat': 'no-repeat'
            }
          } else {
            return {}
          }
        },
        ...mapState({
          'sideBarSelected': state => state.notebook.sideBarSelected,
          'reviewItemSelected': state => state.notebook.reviewItemSelected,
          'noteItemSelected': state => state.notebook.noteItemSelected,
          'selectedCatalogId': state => state.notebook.selectedCatalogId,
          'notelist': state => state.notebook.notelist,
          'reviewlist': state => state.notebook.reviewlist,
          'titleChanged': state => state.notebook.titleChanged,
          'contentChanged': state => state.notebook.contentChanged,
          'selectedOrder': state => state.notebook.selectedOrder
        }),
        ...mapGetters(['currentNote'])
      },
      data () {
        return {
          isSelected: 2
        }
      },
      mounted () {
        bus.$on('deleteNoteItem', this.deleteNoteItem)
        bus.$on('orderNoteItem', this.orderNoteItem)
      },
      methods: {
        getNext (noteId, arr) {
          if (!noteId || !Array.isArray(arr)) {
            return
          }
          let currentIndex = 0
          let result = false
          for (let i = 0; i < arr.length; i++) {
            if (arr[i].note_id === noteId) {
              currentIndex = i
            }
          }
          if (arr[currentIndex + 1]) {
            result = {
              index: currentIndex + 1,
              note: arr[currentIndex + 1]
            }
          } else if (arr[currentIndex - 1]) {
            result = {
              index: currentIndex - 1,
              note: arr[currentIndex - 1]
            }
          } else {
            result = false
          }
          return result
        },
        // 删除笔记
        deleteNoteItem () {
          if (this.noteItemSelected === undefined) {
            return
          }
          let nextNote = this.getNext(this.noteItemSelected, this.notelist)
          this.$store.dispatch('DELETE_NOTE', {
            catalogId: this.selectedCatalogId,
            noteId: this.noteItemSelected
          })
          if (nextNote) {
            let {index, note} = nextNote
            this.clickNote(note.note_id, index)
          } else {
            bus.$emit('clearEditBox')
          }
        },
        // 设置选中的排序
        orderNoteItem ({id}) {
          if (this.noteItemSelected === undefined) {
            return
          }
          // 设置选中的笔记
          this.$store.commit('SET_NOTEBOOK', {
            name: 'selectedOrder',
            value: Number(id)
          })
          this.$store.dispatch('GET_NOTE_LIST', {catalogId: this.selectedCatalogId})
        },
        // 排序
        clickOrder (e) {
          showOrderContext(e, this.selectedOrder)
        },
        // 用户右键
        addContextBoard (e, note) {
          if (!note || !note.note_id) {
            return
          }
          if (note.note_id !== this.noteItemSelected) {
            this.$store.commit('SET_NOTEBOOK', {
              name: 'noteItemSelected',
              value: note.note_id
            })
          }
          showItemContext(e)
        },
        // 添加笔记
        async addNote () {
          if (!this.selectedCatalogId) {
            return
          }
          let timeStamp = Number(String(new Date().getTime()).slice(2))
          let randomNum = getRandomNum(1, 1000, 0)
          // 生成noteId
          let noteId = Number(`${timeStamp}${randomNum}`)
          let params = {
            catalogId: this.selectedCatalogId,
            noteId,
            title: '',
            content: ''
          }
          await this.$store.dispatch('ADD_NOTE', params)
          document.getElementById(noteId).scrollIntoView()
          this.$nextTick(() => {
            this.clickNote(noteId, 0)
          })
        },
        // 选择 中间列表的中的一个笔记
        clickNote (noteId, index) {
          if (noteId === undefined) {
            return
          }
          // 设置选中的笔记
          this.$store.commit('SELECT_NOTE', {noteId, index})
          // 设置编辑器为展示
          this.$store.commit('SET_NOTEBOOK', {name: 'showEdit', value: true})
        },
        clickReview (noteId, index) {
          if (noteId === undefined) {
            return
          }
          // 设置选中的笔记
          this.$store.commit('SELECT_REVIEW', {noteId, index})
        }
      }
    }
</script>

<style scoped lang="less">
::-webkit-scrollbar {
    width: 0 !important
}
.node-list-container {
    width: 100%;
    height: 100%;
    background-color: #FAFAFA;
    position: relative;
    .title-container {
        width: 100%;
        height: 36px;
        position: relative;
        box-sizing: border-box;
        overflow: hidden;
        cursor: pointer;
        .sort-icon {
            display: inline-block;
            width: 24px;
            height: 24px;
            position: absolute;
            top: 50%;
            transform: translate(0, -50%);
            text-align: center;
            line-height: 24px;
            font-size: 16px;
            left: 12px;
            color: #646464;
            font-weight: 600;
        }
        .title {
            cursor: pointer;
            position: absolute;
            top: 50%;
            transform: translate(-50%, -50%);
            left: 50%;
            color: #646464;
            font-weight: 600;
        }
        .add-icon {
            display: inline-block;
            width: 24px;
            height: 24px;
            position: absolute;
            top: 50%;
            transform: translate(0, -50%);
            right: 8px;
            text-align: center;
            line-height: 24px;
            font-size: 16px;
            right: 12px;
            color: #646464;
            font-weight: 600;
        }
    }
    .search-container {
        width: 100%;
        .search-input {
            width: 90%;
            height: 30px;
            margin: 10px auto;
            display: block;
            border-radius: 4px;
            padding-left: 12px;
            padding-right: 12px;
            box-sizing: border-box;
            background-color: white;
            border: 1px solid rgba(0,0,0,0.1);
        }
    }
    .note-list-container {
        width: 100%;
        position: absolute;
        top: 90px;
        bottom: 0;
        left: 0;
        right: 0;
        overflow-y: scroll;
        overflow-x: hidden;
        .list {
            padding-bottom: 30px;
            width: 100%;
            .item-selected {
                border-left: 6px solid #488DF7!important;
                background-color: #E7F3FF;
            }
            .item {
                cursor: pointer;
                width: 100%;
                height: 96px;
                position: relative;
                color: #4A4A4A;
                box-sizing: border-box;
                padding: 6px;
                padding-left: 45px;
                padding-right: 12px;
                border-left: 6px solid transparent;
            }
        }
    }
    .review-list-container {
        width: 100%;
        height: 100%;
        overflow-y: scroll;
        overflow-x: hidden;
        -webkit-overflow-scrolling: touch;
        position: relative;
        .list {
            .item-selected {
                border-left: 6px solid #488DF7!important;
                background-color: #E7F3FF;
            }
            .item {
                cursor: pointer;
                width: 100%;
                height: 96px;
                position: relative;
                color: #4A4A4A;
                box-sizing: border-box;
                padding: 6px;
                padding-left: 45px;
                padding-right: 20px;
                border-left: 6px solid transparent;
            }
        }
        .empty-tip-container {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
          .icon {
            font-size: 30px;
            text-align: center;
          }
        }
    }
}
</style>
