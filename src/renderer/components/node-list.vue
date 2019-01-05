<template>
    <div class="node-list-container">
        <div class="title-container" v-if="false">
            <i class="sort-icon el-icon-sort"></i>
            <div class="title" v-if="false">笔记本</div>
            <i class="add-icon el-icon-plus"></i>
        </div>
        <div class="search-container" v-if="false">
            <input type="text" class="search-input" placeholder="查找笔记">
        </div>
        <div class="note-list-container" v-if="false">
            <div class="list">
                <div class="item"
                     v-for="n in 10"
                     :class="isSelected == n?'item-selected':''"
                >
                    <noteListItem></noteListItem>
                </div>
            </div>
        </div>
        <div class="review-list-container">
            <div class="list">
                <div class="item"
                     v-for="n in 10"
                     :class="isSelected == n?'item-selected':''"
                >
                    <reviewListItem></reviewListItem>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import noteListItem from './middle-list/note-list-item.vue';
    import reviewListItem from './middle-list/review-list-item.vue';
    export default {
        name: 'node-list',
        components: {
            noteListItem,
            reviewListItem
        },
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
    .note-list-container {
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
            }
        }
    }
    .review-list-container {
        width: 100%;
        height: 100%;
        overflow-y: scroll;
        overflow-x: hidden;
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
                padding-right: 12px;
                border-left: 6px solid transparent;
            }
        }
    }
}
</style>
