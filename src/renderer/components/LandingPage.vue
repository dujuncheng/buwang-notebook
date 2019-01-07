<template>
  <div class="wrapper">
      <!-- 最左侧的contaienr-->
      <div v-show="scaleStatus === 0" class="side-bar-wrap">
          <side-bar></side-bar>
      </div>
      <!-- 中间的笔记列表container -->
      <div v-show="scaleStatus === 0 && sideBarSelected !== 2" class="middle-list-wrap">
          <node-list></node-list>
      </div>

      <!-- 最右侧的编辑器区域-->
      <div class="edit-container" v-show="sideBarSelected !== 2">
          <editor-container class="editor"></editor-container>
      </div>

      <div class="todo-container" v-show="sideBarSelected === 2">
          <todoContainer></todoContainer>
      </div>
  </div>
</template>

<script>
    import {mapState} from 'vuex'
    import sideBar from './side-bar.vue'
    import nodeList from './node-list.vue'
    import editorContainer from './editor-container.vue'
    import todoContainer from './todo-container/todo-index.vue'
    var Resizable = require('resizable')
    export default {
        components: {
            sideBar,
            nodeList,
            editorContainer,
            todoContainer
        },
        data () {
            return {

            }
        },
        computed: {
            ...mapState({
                'scaleStatus': state => state.notebook.scaleStatus,
                'sideBarSelected': state => state.notebook.sideBarSelected,
            })
        },
        mounted () {
            var el = document.querySelector('.side-bar-wrap')
            new Resizable(el, {
                draggable: false
            })
        }
    }
</script>

<style lang="less">
    @import "~@/less/index.less";

    .wrapper {
        width: 100%;
        height: 100%;
        background-color: aliceblue;
        display: flex;
    }
    .side-bar-wrap {
        width: 150px;
        max-width: 300px;
        min-width: 200px;
        height: 100%;
        background-color: #191B1C;
        color: #C8C9C9!important;
    }
    @media only screen and (max-width: 680px) {
        .side-bar-wrap {
            display: none;
        }
    }

    .middle-list-wrap {
        flex-basis: 300px;
        height: 100%;
    }

    @media only screen and (max-width: 1120px) {
        .middle-list-wrap {
            display: none;
        }
    }

    .edit-container {
        flex: 1;
        height: 100%;
        background-color: white;
        overflow-y: scroll;
        ._no_scroll_bar();
    }

    .todo-container {
        flex: 1;
        height: 100%;
        background-color: white;
        overflow-y: scroll;
        ._no_scroll_bar();
    }
</style>
