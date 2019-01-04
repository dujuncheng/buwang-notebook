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
    </div>
</template>

<script>
    export default {
        data () {
            return {
                blogStatus: 1,
                notifyStatus: 0
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
                        'color': '#3F88F9'
                    }
                    break
                default:
                    style = {}
                }
                return style
            }
        }
    }
</script>

<style scoped lang="less">
    @import "~@/less/index.less";

    .editorBox-container {
        width: 100%;
        height: 100%;
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
    }
</style>
