<template>
    <div class="node-list-item-container">
        <div class="change-icon" v-show="showChangeIcon"></div>
        <div class="title">{{review.title || '未命名'}}</div>
        <div class="icon-container">
            <div class="left">
                <!-- 预计复习时间-->
                <i class="fas fa-stopwatch"></i>
                <span class="text">{{needTime}}</span>
            </div>
            <div class="middle">
                <!--复习次数-->
                <i class="fas fa-sync-alt"></i>
                <span class="text">{{review.review_num}}次</span>
            </div>
            <div class="right">
                <!--哪天复习-->
                <i class="far fa-calendar-check"></i>
                <span class="text">{{review.notify_time | getFriendTime}}</span>
            </div>
        </div>
        <div class="desc-container">
            <div class="desc-text">遗忘程度</div>
            <div class="review-container">
                <div class="warn-container" v-if="showWarn">
                    <i class="fas fa-exclamation warn-icon"></i>
                </div>
                <reviewProgress v-if="!showWarn" :progress="reviewPercent"></reviewProgress>
            </div>
        </div>
        <div class="bottom-line"></div>
    </div>
</template>

<script>
    import {friendlyTime} from '../../utils/friendTime'
    import {mapState} from 'vuex'
    import reviewProgress from '../common/reviewProgress.vue'

    const getLastReviewTime = (reviewNum, frequency, nextReviewTime) => {
      if (!frequency) {
        frequency = 3
      }
      let factor = 1
      switch (frequency) {
        case 1:
          factor = 2
          break
        case 2:
          factor = 1.5
          break
        case 3:
          factor = 1
          break
        case 4:
          factor = 0.85
          break
        case 5:
          factor = 0.7
          break
      }
      let range = 0
      if (reviewNum === 0) {
        range = 30 * 60 * factor
      } else if (reviewNum === 1) {
        range = 12 * 60 * 60 * factor
      } else if (reviewNum === 2) {
        range = 24 * 60 * 60 * factor
      } else if (reviewNum === 3) {
        range = 2 * 24 * 60 * 60 * factor
      } else if (reviewNum === 4) {
        range = 4 * 24 * 60 * 60 * factor
      } else if (reviewNum === 5) {
        range = 7 * 24 * 60 * 60 * factor
      } else if (reviewNum === 6) {
        range = 15 * 24 * 60 * 60 * factor
      } else if (reviewNum === 7) {
        range = 30 * 24 * 60 * 60 * factor
      } else if (reviewNum === 8) {
        range = 50 * 24 * 60 * 60 * factor
      } else if (reviewNum === 8) {
        range = 80 * 24 * 60 * 60 * factor
      } else if (reviewNum === 9) {
        range = 140 * 24 * 60 * 60 * factor
      } else if (reviewNum === 10) {
        range = 200 * 24 * 60 * 60 * factor
      } else if (reviewNum === 10) {
        range = 300 * 24 * 60 * 60 * factor
      } else if (reviewNum === 10) {
        range = 400 * 24 * 60 * 60 * factor
      } else {
        range = 400 * 24 * 60 * 60 * factor
      }
      let lastReviewTime = nextReviewTime - range
      return lastReviewTime
    }

    export default {
      components: {
        reviewProgress
      },
      props: ['review'],
      computed: {
        needTime () {
          let minute = (String(this.review.content).length / 500).toFixed(0)
          return minute
        },
        reviewPercent () {
          let lastReviewTime = getLastReviewTime(this.review.review_num, this.review.frequency, this.review.notify_time)
          let nextReviewTime = this.review.notify_time
          let now = Math.round((new Date()).getTime() / 1000)
          let range = nextReviewTime - lastReviewTime
          let diff = now - lastReviewTime
          if (diff <= range) {
            return Number((diff / range).toFixed(2))
          } else {
            return 1
          }
        },
        showChangeIcon () {
          return this.changeNote.indexOf(this.review.note_id) > -1
        },
        showWarn () {
          let now = ((new Date()).getTime() / 1000)
          let result = false
          if (Number(this.review.notify_time) < now) {
            result = true
          } else {
            result = false
          }
          return result
        },
        ...mapState({
          // 全局的被修改的note列表
          'changeNote': state => state.notebook.changeNote
        })
      },
      filters: {
        getFriendTime (value) {
          return friendlyTime(value)
        }
      }
    }
</script>

<style scoped lang="less">
    @import "~@/less/index.less";
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
            text-align: left;
        }
        .right{
            flex: 1.5;
            position: relative;
            text-align: right;
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
        margin-top: 4px;
        .desc-text {
            width: 60px;
            text-align: left;
        }
        .review-container {
            position: relative;
            flex: 1;
            .warn-container {
                width: 20px;
                height: 20px;
                position: absolute;
                left: 50%;
                top: 52%;
                transform: translate(-50%, -50%);
                border-radius: 20px;
                box-sizing: border-box;
                z-index: 9;
                overflow: hidden;
                background-color: #f56c6c;
                display: flex;
                align-items: center;
                justify-content: center;
                .warn-icon {
                    color: white;
                    font-size: 13px;
                    position: relative;
                    left: 0.5px;
                }
            }
        }
    }
</style>
