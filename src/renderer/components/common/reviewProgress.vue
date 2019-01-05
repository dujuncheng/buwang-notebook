<template>
    <div class="treeprocess-container">
        <div class="progresss-bar-container">
            <div class="progresss-bar" :style="{'width': `${barWidth}%`}">
                <img class="water-wave" src="http://h0.hucdn.com/open/201847/52336843d3c54815_375x10.png" alt="">
            </div>
        </div>
        <div class="pop-area J_pop-area" v-if="showPop" :style="{'left': `${barWidth}%`}">
            <img class="pop1" src="http://h0.hucdn.com/open/201847/4ab16adaa9b39d47_9x8.png" alt="">
            <img class="pop2" src="http://h0.hucdn.com/open/201847/4ab16adaa9b39d47_9x8.png" alt="">
        </div>
    </div>
</template>

<script>
    export default {
        props: ['progress'],
        data () {
            return {
                popArr: []
            }
        },
        computed: {
            barWidth () {
                return (this.progress * 100)
            },
            showPop () {
                let res = false
                if (this.barWidth > 90) {
                    res = false
                } else {
                    res = true
                }
                return res
            }
        },
        methods: {}
    }
</script>

<style scoped lang="less">
    .treeprocess-container {
        width: 100%;
        height: 12px;
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        border-radius: 20px;
        border: 1px solid #C7C7C7;
        box-sizing: border-box;
        z-index: 9;
        overflow: hidden;
        line-height: 23px;
        .progresss-bar-container {
            position: absolute;
            left: 50%;
            height: 100%;
            transform: translate(-50%, 0);
            width: 98%;
            overflow: hidden;
            border-radius: 20px;
            display: inline-block;
            z-index: 10;
            .progresss-bar {
                transition: all 0.5s;
                height: 15px;
                background-color: #c7fcf5;
                position: absolute;
                left: 0px;
                transform: translate(0, -50%);
                top: 50%;
                border-radius: 20px;
                overflow: hidden;
                z-index: 10;
                .water-wave {
                    width: 500px!important;
                    max-width: 500px!important;
                    display: inline-block;
                    height: 15px;
                    position: absolute;
                    right: 0;
                    top: 20%;
                    animation: water-wave 40s infinite linear;
                    z-index: 10;
                }
            }
        }
        .pop-area {
            width: 23px;
            height: 23px;
            display: inline-block;
            position: relative;
            .pop1 {
                position: absolute;
                left: 0;
                top: 20%;
                width: 12px;
                height: 12px;
                animation: pop-scale 2s infinite 1s ease;
                z-index: -1;
            }
            .pop2 {
                position: absolute;
                left: 0;
                top: 50%;
                width: 8px;
                height: 8px;
                animation: pop-scale 2s infinite ease;
                z-index: -1;
            }
        }
    }


    @keyframes water-wave {
        0% {
            transform: translate(0,0);
        }
        100% {
            transform: translate(200px,0);
        }
    }
    @keyframes pop-scale {
        0% {
            transform: translate(-20px, 0) scale(1,1);
            opacity: 1;
        }
        100% {
            transform: translate(10px, 0) scale(1,1);
            opacity: 0;
        }
    }
</style>
