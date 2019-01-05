<template>
    <div class="editorBox-container">
        <i class="fas fa-blog blog-icon"
           :style="blogIconStyle"
        ></i>
        <i class="fas fa-link blog-link-icon"
           :style="linkIconStyle"
        ></i>
        <div class="divide-line"></div>
        <i class="far fa-bell bell-icon"
           :style="bellIconStyle"
        ></i>
        <div class="review-container">
            <el-rate v-model="reviewRate"></el-rate>
        </div>

        <!--  恢复原样 -->
        <i class="fas fa-compress-arrows-alt shrink-icon" v-if="scaleStatus === 1" @click="setScaleStatus(0)"></i>
        <!-- 放大状态 -->
        <i class="fas fa-expand-arrows-alt enlarge-icon" v-if="scaleStatus === 0" @click="setScaleStatus(1)"></i>
    </div>
</template>

<script>
    import {mapState} from 'vuex'
    export default {
        data () {
            return {
                // 是否发布为blog
                blogStatus: 1,
                // 是否开启提醒
                notifyStatus: 1,
                // 提醒的重要程度
                reviewRate: 0,
            }
        },
        computed: {
            blogIconStyle () {
                let style = ''
                switch (this.blogStatus) {
                case 0:
                    style = {
                        'color': '#666767'
                    }
                    break
                case 1:
                    style = {
                        'color': '#3F88F9'
                    }
                    break
                default:
                    style = {}
                }
                return style
            },
            linkIconStyle () {
                let style = ''
                switch (this.blogStatus) {
                case 0:
                    style = {
                        'color': '#666767'
                    }
                    break
                case 1:
                    style = {
                        'color': '#3F88F9'
                    }
                    break
                default:
                    style = {}
                }
                return style
            },
            bellIconStyle () {
                let style = ''
                switch (this.notifyStatus) {
                case 0:
                    style = {
                        'color': '#666767'
                    }
                    break
                case 1:
                    style = {
                        'color': '#F7BA2A'
                    }
                    break
                default:
                    style = {}
                }
                return style
            },
            ...mapState({
                'scaleStatus': state => state.notebook.scaleStatus
            })
        },
        methods: {
            setScaleStatus (num) {
                if (num === undefined) {
                    return
                }
                this.$store.commit('SET_SCALE_STATUS', {num})
            }
        }
    }
</script>

<style scoped lang="less">
    @import "~@/less/index.less";

    .editorBox-container {
        width: 100%;
        height: 100%;
        position: relative;
        .blog-icon {
            font-size: 18px;
            margin-left: 19px;
            line-height: 30px;
            cursor: pointer;
            transition: all 0.5s;
        }
        .blog-icon:hover {
            text-shadow : 0px 2px 4px rgba(0,0,0,0.2);
        }
        .blog-link-icon {
            font-size: 18px;
            margin-left: 14px;
            line-height: 30px;
            cursor: pointer;
            transition: all 0.5s;
        }
        .blog-link-icon:hover {
            text-shadow : 0px 2px 4px rgba(0,0,0,0.2);
        }
        .divide-line {
            width: 1px;
            height: 18px;
            background-color: #979797;
            display: inline-block;
            line-height: 30px;
            margin-left: 10px;
            position: relative;
            top: 50%;
            transform: translate(0, -63%);
        }
        .bell-icon {
            font-size: 18px;
            margin-left: 9px;
            line-height: 30px;
            cursor: pointer;
            transition: all 0.5s;
        }
        .bell-icon:hover {
            text-shadow : 0px 2px 4px rgba(0,0,0,0.2);
        }
        .review-container {
            display: inline-block;
            height: 30px;
            line-height: 9px;
            margin-left: 14px;
            position: relative;
            top: -4px;
        }
        .shrink-icon {
            font-size: 18px;
            position: absolute;
            right: 14px;
            top: 50%;
            transform: translate(0, -50%);
            line-height: 30px;
            cursor: pointer;
            transition: all 0.5s;
            color: #666767;
        }
        .shrink-icon:hover {
            text-shadow : 0px 2px 4px rgba(0,0,0,0.2);
        }
        .enlarge-icon {
            font-size: 18px;
            position: absolute;
            right: 14px;
            top: 50%;
            transform: translate(0, -50%);
            line-height: 30px;
            cursor: pointer;
            transition: all 0.5s;
            color: #666767;
        }
        .enlarge-icon:hover {
            text-shadow : 0px 2px 4px rgba(0,0,0,0.2);
        }
    }
</style>
