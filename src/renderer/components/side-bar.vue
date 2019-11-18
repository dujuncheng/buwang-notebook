<template>
    <div class="">
        <!-- 待复习 -->
        <div class="category-title-container"
             :style="brainStyle"
             @click="setSelected(0)"
        >
            <p class="title-text">待复习</p>
            <span class="badge" v-show="reviewlist.length > 0">{{reviewlist.length}}</span>
            <i class="brain-icon fas fa-brain"></i>
        </div>
        <!-- 待办清单 -->
        <!--<div class="category-title-container"-->
             <!--:style="todoStyle"-->
             <!--@click="setSelected(2)"-->
        <!--&gt;-->
            <!--<p class="title-text">任务清单</p>-->
            <!--<span class="badge">10</span>-->
            <!--<i class="todo-icon fas fa-clipboard-check"></i>-->
        <!--</div>-->
        <!-- 笔记本 -->
        <div class="category-title-container"
             :style="noteStyle"
             @click="setSelected(1)"
        >
            <p class="title-text">笔记本</p>
            <i class="fas fa-sticky-note title-icon"></i>
            <i class="fas fa-plus-circle plus-icon" @click="addCatalog" v-show="sideBarSelected === 1"></i>
        </div>
        <div class="category-container" v-show="sideBarSelected === 1">
            <div class="notebook-container">
                <el-tree
                    highlight-current
                    draggable
                    @node-drop="handleDrop"
                    @node-click="handleNodeClick"
                    :data="catalog"
                    :props="defaultProps"
                    node-key="id"
                    ref="noteBook">
                    <div class="custom-tree-node"
                         slot-scope="{ node, data }"
                         @contextmenu.prevent="addContextBoard($event,node, data)"
                    >
                        <!-- 如果contextInputId不是本节点，则显示babel -->
                        <span v-if="contextInputId !== data.catalog_id" class="_tree-node-label">{{ node.label }}</span>
                        <!-- 如果contextInputId是本节点，则显示input -->
                        <input class="_tree-node-no-label"
                               v-if="contextInputId == data.catalog_id"
                               type="text"
                               v-model.trim="contextInputText"
                               @keyup.enter="handleEnter(node, data)"
                               @blur="handleBlur(node, data)"
                               ref="_tree_node_input"
                               v-bind:id="'insert_' + data.catalog_id"
                        >
                        <span class="_tree-node-num">{{node.data.note_num}}</span>
                    </div>
                </el-tree>
            </div>
        </div>

        <context-menu id="context-menu" ref="ctxMenu">
            <div class="context-container">
                <div class="context-item" @click="addNoteBook(contextSelectData)">
                    <span class="icon el-icon-plus"></span>
                    <span class="text">添加子笔记本</span>
                </div>
                <div class="context-item" @click="renameNoteBook">
                    <span class="icon el-icon-edit"></span>
                    <span class="text">重命名</span>
                </div>
                <div class="context-item"
                     :style="deleteStyle"
                     @click="deleteNoteBook(contextSelectData)"
                >
                    <span class="icon el-icon-delete"></span>
                    <span class="text">删除</span>
                </div>
            </div>
        </context-menu>
    </div>
</template>

<script>
    import { getRandomNum } from '@/utils/index.js'
    import contextMenu from 'vue-context-menu'
    import {mapState} from 'vuex'
    export default {
      components: { contextMenu },
      data () {
        return {
          inputType: '',
          filterText: '',
          // 右键——选中的父目录的data
          contextSelectData: '',
          contextSelectNode: '',
          // 右键——选中的input的那一项的id
          contextInputId: '',
          // 右键——选中的input的那一项的文本
          contextInputText: '',
          defaultProps: {
            children: 'children',
            label: 'label'
          }
        }
      },
      mounted () {
        this.fetchCatalog()
      },
      computed: {
        deleteStyle () {
          if (this.contextSelectData &&
                    this.contextSelectData.children &&
                    (this.contextSelectData.children.length !== 0 ||
                        this.contextSelectData.note_num !== 0)
          ) {
            return {
              'cursor': 'not-allowed'
            }
          } else {
            return {}
          }
        },
        brainStyle () {
          let style = ''
          if (this.sideBarSelected === 0) {
            style = {
              'color': 'white',
              'background': '#2D2D2D'
            }
          }
          return style
        },
        // 待办清单
        todoStyle () {
          let style = ''
          if (this.sideBarSelected === 2) {
            style = {
              'color': 'white',
              'background': '#2D2D2D'
            }
          }
          return style
        },
        noteStyle () {
          let style = ''
          if (this.sideBarSelected === 1) {
            style = {
              'color': 'white',
              'background': '#2D2D2D'
            }
          }
          return style
        },
        ...mapState({
          'scaleStatus': state => state.notebook.scaleStatus,
          'sideBarSelected': state => state.notebook.sideBarSelected,
          'selectedCatalogId': state => state.notebook.selectedCatalogId,
          'catalog': state => state.notebook.catalog,
          'reviewlist': state => state.notebook.reviewlist
        })
      },
      watch: {
        filterText (val) {
          this.$refs.noteBook.filter(val)
        }
      },
      methods: {
        // 直接点击按钮
        addCatalog () {
          // 把一个新的笔记本塞到数组中
          let timeStamp = Number(String(new Date().getTime()).slice(2))
          let randomNum = getRandomNum(1, 1000, 0)
          let catalogId = Number(`${timeStamp}${randomNum}`)
          let newChild = {
            catalog_id: catalogId,
            label: '',
            children: []
          }
          // input框的那个节点的id
          this.contextInputId = catalogId
          // 显示input框的那个节点文本内容
          this.contextInputText = ''
          this.inputType = 'add'
          // 增加新增的节点
          this.$store.commit('ADD_CATALOG', {item: newChild})
          // 顺便改变一下input样式
          this.$nextTick(() => {
            let str = 'insert_' + this.contextInputId
            let insertDom = document.getElementById(str)
            insertDom.click()
            insertDom.focus()
          })
        },
        handleNodeClick (data) {
          let catalogId = Number(data && data.catalog_id)
          if (catalogId === undefined) {
            alert('没有catalogId报错了')
            return
          }
          if (catalogId === this.selectedCatalogId) {
            return
          }
          // 设置选中的目录
          this.$store.commit('SET_NOTEBOOK', {
            name: 'selectedCatalogId',
            value: catalogId
          })
          this.fetchNoteList(catalogId)
        },
        fetchNoteList (catalogId) {
          this.$store.dispatch('GET_NOTE_LIST', {catalogId})
        },
        fetchCatalog () {
          this.$store.dispatch('GET_CATALOG')
        },
        handleDrop (draggingNode, dropNode, dropType, ev) {
          // 没有拖动
          if (!dropNode || !draggingNode) {
            return
          }
          let selfId = ''
          let parentId = 0
          if (draggingNode.data && draggingNode.data.catalog_id) {
            selfId = draggingNode.data.catalog_id
          }
          if (dropType === 'inner') {
            parentId = dropNode.data.catalog_id
          } else if (dropType === 'before' || dropType === 'after') {
            if (dropNode.parent && dropNode.parent.data.catalog_id) {
              parentId = dropNode.parent && dropNode.parent.data && Number(dropNode.parent.data.catalog_id)
            } else {
              parentId = 0
            }
          }

          if (selfId === undefined || parentId === undefined) {
            alert('handleDrop函数报错了')
          }
          this.moveCatalog({
            selfId,
            parentId
          })
        },
        moveCatalog ({selfId, parentId}) {
          this.$store.dispatch('MOVE_CATALOG', {
            catalogId: selfId,
            parentId: parentId
          })
        },
        // 设置用户点击
        setSelected (num) {
          if (num === undefined) {
            return
          }
          this.$store.commit('SET_SELECTED', {num})
          // 处理第一次打开的情况
          if (!this.selectedCatalogId) {
            this.handleNodeClick({
              catalog_id: this.catalog[0].catalog_id
            })
          }
        },
        // 处理 input blur事件
        handleBlur (node, data) {
          let id = data.catalog_id
          let str = String(this.contextInputText).trim()
          let children = this.contextSelectData.children
          let parentId = (node.parent && node.parent.data && node.parent.data.catalog_id) || 0
          if (this.inputType === 'add') {
            if (!str || str.length === 0) {
              this.cancelAddNote(children, id)
            } else {
              this.confirmAddNote(children, id, str, parentId)
            }
          } else if (this.inputType === 'rename') {
            if (!str || str.length === 0) {
              alert('笔记名称不能为空哦')
            } else {
              this.confirmRenameNote(node, id, str)
            }
          }
        },
        // 处理 input 回车事件
        handleEnter () {
          let str = 'insert_' + this.contextInputId
          let insertDom = document.getElementById(str)
          insertDom.blur()
        },
        // 用户选择添加笔记
        addNoteBook (data) {
          // 如果没有data 则不增加
          if (!data) {
            return
          }
          // 把一个新的笔记本塞到数组中
          let catalogId = new Date().getTime()
          let newChild = {
            catalog_id: catalogId,
            label: '',
            children: []
          }
          if (!data.children) {
            this.$set(data, 'children', [])
          }
          // input框的那个节点的id
          this.contextInputId = catalogId
          // 显示input框的那个节点文本内容
          this.contextInputText = ''
          this.inputType = 'add'
          // 增加新增的节点
          data.children.push(newChild)
          // 顺便改变一下input样式
          this.$nextTick(() => {
            let str = 'insert_' + this.contextInputId
            let insertDom = document.getElementById(str)
            insertDom.click()
            insertDom.focus()
          })
        },
        // 用户选择重命名
        renameNoteBook () {
          // input框的那个节点的id
          this.contextInputId = this.contextSelectData.catalog_id
          // 显示input框的那个节点文本内容
          this.contextInputText = this.contextSelectData.label
          this.inputType = 'rename'
          // 顺便改变一下input样式
          this.$nextTick(() => {
            let str = 'insert_' + this.contextInputId
            let insertDom = document.getElementById(str)
            insertDom.click()
            insertDom.focus()
          })
        },
        // 用户选择删除笔记
        deleteNoteBook (data) {
          // 如果没有data 则不删除
          if (!data) {
            return
          }
          if (this.contextSelectData.children.length !== 0) {
            this.$message({
              message: '该笔记本下面还有很多东东，请先删除哦',
              type: 'warning'
            })
            return
          }
          if (this.contextSelectData.note_num !== 0) {
            this.$message({
              message: '该笔记本下面还有很多笔记，怎么狠心删除？',
              type: 'warning'
            })
            return
          }
          this.$store.dispatch('REMOVE_CATALOG', {catalogId: data.catalog_id})
        },
        // 确认增加子笔记
        confirmAddNote (children, id, str, parentId) {
          this.$store.dispatch('ADD_CATALOG', {
            catalogId: id,
            parentId,
            name: str
          })
          this.contextInputText = ''
          this.contextInputId = ''
          this.contextSelectData = ''
          this.contextSelectNode = ''
        },
        // 确认重命名笔记
        confirmRenameNote (node, id, str) {
          if (str) {
            this.$store.dispatch('RENAME_CATALOG', {
              newName: str,
              catalogId: id
            })
            this.$set(this.contextSelectData, 'label', str)
            this.contextInputText = ''
            this.contextInputId = ''
            this.contextSelectData = ''
            this.contextSelectNode = ''
          }
        },
        // 取消增加子笔记
        cancelAddNote (children, id) {
          for (let i = 0; i < children.length; i++) {
            if (children[i].catalog_id == id) {
              children.splice(i, 1)
            }
          }
        },
        // 过滤
        filterContextSelectData (arr, id) {
          if (!Array.isArray(arr)) {
            return {}
          }
          let result = ''
          for (let i = 0; i < arr.length; i++) {
            if (arr[i].key = id) {
              result = arr[i]
            }
          }
          return result
        },
        // 用户右键
        addContextBoard (e, node, data) {
          if (node.key == this.contextInputId) {
            return
          }
          this.contextSelectNode = node
          this.contextSelectData = data
          node.expand()
          this.$refs.ctxMenu.open(e, node)
        }
      }
    }
</script>

<style lang="less">
    @import "~@/less/index.less";
    .is-drop-inner > .el-tree-node__content{
        background-color: #488DF7!important;
        color: #fff!important;
    }

    .el-tree {
        background: transparent!important;
        cursor: pointer;
    }
    .el-tree-node__content:hover {
        background: transparent;
    }
    .el-tree-node:focus>.el-tree-node__content {
        background: transparent;
    }
    .custom-tree-node {
        position: relative;
        width: 100%;
        /* 下面是重命名 input框 */
        ._tree-node-no-label {
            display: block;
            width: 100%;
            font-size: 13px;
            background-color: transparent;
            color: white;
        }
        ._tree-node-label {
            width: 70px;
            display: inline-block;
            overflow: hidden;
            text-overflow:ellipsis;
            white-space: nowrap;
        }
    }
    ._tree-node-num {
        position: absolute;
        right: 10px;
        top: 50%;
        transform: translate(0, -50%);
        border-radius: 50%;
        font-size: 10px;
        width: 16px;
        height: 16px;
        text-align: center;
        line-height: 16px;
        color: white;
    }
    .el-tree-node__content {
        color: rgba(255,255,255,0.8)!important;
    }
    .is-current>.el-tree-node__content {
        background-color: #488DF7!important;
        color: white!important;
    }
    /*.el-tree-node__content:hover {*/
    /*background-color: transparent!important;*/
    /*}*/
    .is-current>.el-tree-node__expand-icon {
        color: white!important;
    }
    .el-tree-node__content {
        transition: all 0.3s;
    }

    .ctx-menu {
        padding: 0;
        border: 0;
        box-shadow: none;
        margin-top: -6px;
        background: transparent!important;
        .context-container {
            background: #F0EFEF;
            border: 1px solid #DDDDDD;
            box-shadow: 2px 2px 9px 0 rgba(0,0,0,0.50);
            border-radius: 4px;
            width: 160px;
            position: fixed;
            z-index: 9999;
            .context-item:hover {
                background-color: #488DF7;
                color: white!important;
            }
            .context-item:hover > .text {
                color: white!important;
            }
            .context-item {
                cursor: pointer;
                height: 24px;
                position: relative;
                border-radius: 4px;
                .icon {
                    position: absolute;
                    left: 10px;
                    top: 50%;
                    transform: translate(0, -50%);
                    width: 16px;
                    height: 16px;
                }
                .text {
                    font-size: 14px;
                    color: #3A3A3A;
                    letter-spacing: 0;
                    text-align: center;
                    transform: translate(0, -50%);
                    position: absolute;
                    top: 50%;
                    left: 36px;
                }
            }
        }
    }

    .category-title-container {
        width: 100%;
        height: 36px;
        position: relative;
        border-top: 1px solid rgba(45,45,45);
        box-sizing: border-box;
        overflow: hidden;
        transition: all 0.2s;
        .title-icon {
            opacity: 0.8;
            font-size: 16px;
            position: absolute;
            left: 12px;
            top: 50%;
            transform: translate(0, -50%);
        }
        .brain-icon {
            opacity: 0.8;
            font-size: 16px;
            position: absolute;
            left: 11px;
            top: 50%;
            transform: translate(0, -50%);
        }
        .todo-icon {
            opacity: 0.8;
            font-size: 16px;
            position: absolute;
            left: 11px;
            top: 50%;
            transform: translate(0, -50%);
        }
        .plus-icon {
            opacity: 0.8;
            font-size: 16px;
            position: absolute;
            right: 12px;
            top: 50%;
            transform: translate(0, -50%);
            cursor: pointer;
            color: white;
        }
        .title-text {
            cursor: pointer;
            position: absolute;
            left: 36px;
            top: 48%;
            transform: translate(0, -50%);
            font-size: 16px;
            margin: 0px;
            padding: 0px;
        }
        .badge {
            display: inline-block;
            background-color: #f56c6c;
            height: 18px;
            padding: 0 8px;
            border-radius: 10px;
            position: absolute;
            right: 10px;
            top: 50%;
            transform: translate(0, -50%);
            font-size: 12px;
            text-align: center;
            line-height: 18px;
            color: white;
        }
    }
    .category-container {
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
        }
        .notebook-container {
            width: 100%;
            max-height: 380px;
            overflow-y: scroll;
            border-bottom: 1px solid rgba(45,45,45);
            ._no_scroll_bar();
        }
    }

</style>
