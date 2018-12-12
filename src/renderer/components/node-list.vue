<template>
    <div class="node-list-container">
        <div class="title-container">
            <i class="sort-icon el-icon-sort"></i>
            <div class="title">笔记本</div>
            <i class="add-icon el-icon-plus"></i>
        </div>
        <div class="search-container">
            <input type="text" class="search-input" placeholder="查找笔记">
        </div>
        <div class="list-container">
            <div class="list">
                <div class="item"
                     v-for="n in 10"
                     :class="isSelected == n?'item-selected':''"
                >
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
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'node-list',
        data () {
            return {
                isSelected: 2
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
    .title-container {
        width: 100%;
        height: 36px;
        border-bottom: 1px solid rgba(0,0,0,0.1);
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
    .list-container {
        width: 100%;
        height: calc(100vh - 66px);
        overflow-y: scroll;
        overflow-x: hidden;
        .list {
            padding-bottom: 30px;
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
            }
        }
    }
}
</style>
