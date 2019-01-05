<template>
    <div class="node-list-item-container">
        <div class="title">这里是标题</div>
        <div class="icon-container">
            <div class="left">
                <!--字符-->
                <i class="icon el-icon-time"></i>
                <span class="text">20字</span>
            </div>
            <div class="right">
                <!--复习次数-->
                <i class="icon el-icon-view"></i>
                <span class="text">2次</span>
            </div>
        </div>
        <div class="desc-container">
            这里是前面的内容内容内容内容这里是前面的内容内容内容内容这里是前面的内容内容内容内容这里是前面的内容内容内容内容 这里是前面的内容内容内容内容这里是前面的内容内容内容内容
        </div>
        <div class="bottom-line"></div>
    </div>
</template>

<script>
    export default {
        name: "note-list-item.vue"
    }
</script>

<style scoped lang="less">
    @import "~@/less/index.less";
    .bottom-line {
        width: 86%;
        position: absolute;
        bottom: 0px;
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
