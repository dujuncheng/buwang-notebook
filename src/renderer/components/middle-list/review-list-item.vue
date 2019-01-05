<template>
    <div class="node-list-item-container">
        <div class="title">{{name || '未命名'}}</div>
        <div class="icon-container">
            <div class="left">
                <!-- 预计复习时间-->
                <i class="fas fa-stopwatch"></i>
                <span class="text">20min</span>
            </div>
            <div class="middle">
                <!--复习次数-->
                <i class="fas fa-sync-alt"></i>
                <span class="text">2次</span>
            </div>
            <div class="right">
                <!--哪天复习-->
                <i class="far fa-calendar-check"></i>
                <span class="text">今天</span>
            </div>
        </div>
        <div class="desc-container">
            <div class="desc-text">遗忘程度</div>
            <div class="review-container">
                <reviewProgress :progress="0.5"></reviewProgress>
            </div>
        </div>
        <div class="bottom-line"></div>
    </div>
</template>

<script>
    import reviewProgress from '../common/reviewProgress.vue'
    export default {
        name: "note-list-item.vue",
        components: {
            reviewProgress
        }
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
        margin-top: 5px;
        width: 237px;
        .no_more();
    }
    .icon-container {
        width: 100%;
        height: 18px;
        display: flex;
        font-size: 12px;
        padding-top: 6px;
        .left{
            flex: 1;
            position: relative;
        }
        .middle{
            flex: 1;
            position: relative;
        }
        .right{
            flex: 1;
            position: relative;
        }
    }
    .desc-container {
        position: relative;
        width: 100%;
        font-size: 12px;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 3;
        overflow: hidden;
        height: 28px;
        display: flex;
        align-items: center;
        padding-right: 2px;
        .desc-text {
            width: 60px;
            text-align: left;
        }
        .review-container {
            position: relative;
            flex: 1;
        }
    }
</style>
