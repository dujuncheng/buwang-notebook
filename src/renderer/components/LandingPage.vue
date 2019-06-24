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
          <!-- 当既没有笔记列表，也没有复习列表，出现的空白页面 -->
          <div class="empty-area" :style="emptyStyle"></div>
          <editor-container class="editor"></editor-container>
      </div>

      <!--to-do 代办清清单的功能-->
      <div class="todo-container" v-show="sideBarSelected === 2">
          <todoContainer></todoContainer>
      </div>

      <!-- 注册登录的浮层 -->
      <loginContainer v-show="showLogin" class="login-layer" @closeLogin="closeLogin"></loginContainer>
  </div>
</template>

<script>
    import {mapState} from 'vuex'
    import sideBar from './side-bar.vue'
    import nodeList from './node-list.vue'
    import editorContainer from './editor-container.vue'
    import todoContainer from './todo-container/todo-index.vue'
    import loginContainer from './login-container/login-container.vue'

    import bus from '../utils/eventBus.js'
    // import progressBar from './progressBar.vue'
    export default {
      components: {
        sideBar,
        nodeList,
        editorContainer,
        todoContainer,
        loginContainer
        // progressBar
      },
      data () {
        return {
          // 是否显示登录浮层
          showLogin: false
        }
      },
      computed: {
        emptyStyle () {
          if (
            this.notelist.length === 0 &&
                    this.reviewlist.length === 0
          ) {
            return {'visibility': 'visible'}
          } else {
            return {'visibility': 'hidden'}
          }
        },
        ...mapState({
          'scaleStatus': state => state.notebook.scaleStatus,
          'sideBarSelected': state => state.notebook.sideBarSelected,
          'notelist': state => state.notebook.notelist,
          'reviewlist': state => state.notebook.reviewlist
        })
      },
      methods: {
        // 请求待复习列表
        getReviewList () {
          this.$store.dispatch('GET_REVIEWLIST', {page: 0, page_size: 0, need_page: false})
        },
        // 关闭登录浮层
        closeLogin () {
          this.showLogin = false
          this.getReviewList()
        },
        // 打开登录浮层
        openLogin () {
          // 清空一下缓存中的笔记
          window.localStorage.setItem('_change_note', JSON.stringify({}))
          this.showLogin = true
        }
      },
      mounted () {
        bus.$on('login', this.openLogin)
        this.getReviewList()
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
        position: relative;
    }
    @media only screen and (max-width: 680px) {
        .side-bar-wrap {
            display: none;
        }
    }

    .middle-list-wrap {
        flex-basis: 300px;
        height: 100%;
        overflow: hidden;
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
        position: relative;
        ._no_scroll_bar();
        .empty-area {
            background-color: white;
            width: 100%;
            height: 100%;
            background-image: url("http://h0.hucdn.com/open/201902/ac34d7df185e9514_1741x1405.png");
            background-size: cover;
            background-position: center center;
            background-repeat: no-repeat;
            position: absolute;
            z-index: 100;
            left: 0;
            top: 0;
        }
    }

    .todo-container {
        flex: 1;
        height: 100%;
        background-color: white;
        overflow-y: scroll;
        ._no_scroll_bar();
    }


    .login-layer {
        width: 100%;
        height: 100%;
        background-color: white;
        position: absolute;
        left: 0;
        top: 0;
        z-index: 300;
    }
</style>
