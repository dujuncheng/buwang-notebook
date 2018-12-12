<template>
  <div class="wrapper">
      <!-- 最左侧的contaienr-->
      <div class="side-bar-container">
        <side-bar></side-bar>
      </div>
      <!-- 中间的笔记列表container -->
      <div class="note-list-container">
        <node-list></node-list>
      </div>

      <!-- 最右侧的编辑器区域-->
      <div class="edit-container">
          <editor-container class="editor"></editor-container>
      </div>
  </div>
</template>

<script>
    import sideBar from './side-bar.vue'
    import nodeList from './node-list.vue'
    import editorContainer from './editor-container.vue'
    var Resizable = require('resizable')
    export default {
        components: {
            sideBar,
            nodeList,
            editorContainer
        },
        data () {
            return {

            }
        },
        mounted () {
            var el = document.querySelector('.side-bar-container')
            new Resizable(el, {
                draggable: false
            })
        }
    }
</script>

<style lang="less">

    .wrapper {
        width: 100%;
        height: 100%;
        background-color: aliceblue;
        display: flex;
    }
    .side-bar-container {
        width: 150px;
        max-width: 300px;
        min-width: 200px;
        height: 100%;
        background-color: #191B1C;
        color: #C8C9C9!important;
    }
    .note-list-container {
        flex-basis: 300px;
        height: 100%;
    }
    .edit-container {
        flex: 1;
        height: 100%;
        background-color: white;
        .editor {
            width: 90%;
            min-width: 600px;
            margin: 0 auto;
        }
    }
</style>
