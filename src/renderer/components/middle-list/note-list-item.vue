<template>
    <div class="node-list-item-container">
        <div class="change-icon" v-show="showChangeIcon"></div>
        <div class="title">{{note.title || "未命名"}}</div>
        <div class="icon-container">
            <div class="left">
                <!--字符-->
                <i class="icon el-icon-time"></i>
                <span class="text">20字</span>
            </div>
            <div class="right">
                <!--复习次数-->
                <i class="icon el-icon-view"></i>
                <span class="text">{{note.review_num}}次</span>
            </div>
        </div>
        <div class="desc-container">
            {{note.content}}
        </div>
        <div class="bottom-line"></div>
    </div>
</template>

<script>
    import { mapState } from 'vuex'
    export default {
        props: ['note'],
        computed: {
            showChangeIcon () {
                return this.changeNote.indexOf(this.note.note_id) > -1
            },
            ...mapState({
                // 全局的被修改的note列表
                'changeNote': state => state.notebook.changeNote,
            }),
        }
    }
</script>

<style scoped lang="less">
    @import "~@/less/index.less";
    .node-list-item-container {
        position: relative;
    }
    .change-icon {
        background-color: #f56c6c;
        width: 6px;
        height: 6px;
        border-radius: 50%;
        position: absolute;
        right: 5px;
        top: 8px;
    }
    .bottom-line {
        width: 86%;
        position: absolute;
        bottom: -8px;
        right: 0px;
        border-bottom: 1px solid rgba(0,0,0,0.1);
    }
    .divide-line {
        width: 100%;
        height: 1px;
        border-bottom: 1px white dashed;
        font-size: 12px;
    }
    .title {
        font-size: 17px;
        margin-bottom: 4px;
        width: 237px;
        .no_more();
    }
    .icon-container {
        width: 100%;
        height: 18px;
        display: flex;
        font-size: 12px;
        padding: 4px 0px;
        .left{
            flex: 1;
            position: relative;
        }
        .right{
            flex: 1;
            position: relative;
        }
    }
    .desc-container {
        width: 100%;
        font-size: 12px;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 3;
        overflow: hidden;
        height: 32px;
    }
</style>
