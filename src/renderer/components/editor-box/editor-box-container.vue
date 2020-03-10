<template>
    <div class="editorBox-container">
        <el-tooltip class="item" effect="dark" content="公开为blog" placement="bottom-start">
            <i class="fas fa-blog blog-icon"
               :style="blogIconStyle"
            ></i>
        </el-tooltip>
        <el-tooltip class="item" effect="dark" content="进入blog" placement="bottom">
            <i class="fas fa-link blog-link-icon"
               :style="linkIconStyle"
            ></i>
        </el-tooltip>
        <div class="divide-line"></div>
        <!-- 设置复习的按钮 -->
        <el-tooltip class="item" effect="dark" content="设置复习提醒" placement="bottom">
            <i class="far fa-bell bell-icon"
               :style="bellIconStyle"
               @click="setNotify"
            ></i>
        </el-tooltip>
        <!-- 星星，根据是否复习来显示/隐藏 -->
        <el-tooltip v-show="notifyStatus === 1" class="item" effect="dark" content="星星越多，提醒越勤" placement="bottom">
            <div class="review-container">
                <el-rate v-model="reviewRate" @change="handleStarChange"></el-rate>
            </div>
        </el-tooltip>
        <!-- 是否当场复习一次  -->
        <el-tooltip class="item" effect="dark" content="复习这个笔记吧" placement="bottom">
            <i class="fas fa-brain brain-icon"
               :style="brainStyle"
               @click="setReviewed"
            ></i>
        </el-tooltip>


        <!--  恢复原样 -->
        <i class="fas fa-compress-arrows-alt shrink-icon" v-if="scaleStatus === 1" @click="setScaleStatus(0)"></i>
        <!-- 放大状态 -->
        <i class="fas fa-expand-arrows-alt enlarge-icon" v-if="scaleStatus === 0" @click="setScaleStatus(1)"></i>


        <!-- 确定提醒的对话框 -->
        <el-dialog
                title="手下留情"
                :visible.sync="noReviewDialog"
                width="30%" center>
            <span>你确定要取消的复习通知吗？</span>
            <span>取消后，再次开启复习通知将会从头开始哦~</span>
            <span slot="footer" class="dialog-footer">
            <el-button @click="noReviewDialog = false">取 消</el-button>
            <el-button type="primary" @click="confirmCancel">确 定</el-button>
          </span>
        </el-dialog>

    </div>
</template>

<script>
    import Swal from 'sweetalert2'
    import ajax from '../../utils/ajax.js'

    import {mapState, mapGetters} from 'vuex'
    import {friendlyTime} from '../../utils/friendTime'

    const errorMessage = (message) => {
      this.$message({
        message: message || '报错了',
        type: 'error'
      })
    }

    const successMessage = (message) => {
      Swal({
        type: 'success',
        title: message || '操作成功',
        toast: true,
        position: 'top',
        showConfirmButton: false,
        timer: 3000
      })
    }
    export default {
      data () {
        return {
          // 是否发布为blog
          blogStatus: 1,
          // 是否开启提醒
          notifyStatus: 1,
          // 提醒的重要程度
          reviewRate: 3,
          // 是否显示 确认取消的dialog
          noReviewDialog: false,
        }
      },
      computed: {
        // 能否现在点击 复习此 blog
        // 能：必须同时满足的条件 需要复习 + 复习时间已经超时
        canReview () {
          if (this.currentNote &&
            Number(this.currentNote.need_review) === 1 &&
            this.currentNote.notify_time < Date.now() / 1000) {
            return 1
          } else {
            return 0
          }
        },
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
        brainStyle () {
          let style = ''
          switch (this.canReview) {
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
          'scaleStatus': state => state.notebook.scaleStatus,
          'notelist': state => state.notebook.notelist
        }),
        ...mapGetters(['currentNote'])
      },
      watch: {
        // 如果当前笔记发生了改变 notifyStatus 和 reviewRate 值会发改变
        currentNote (value) {
          if (value && value.need_review !== undefined) {
            this.notifyStatus = value.need_review
            this.reviewRate = value.frequency
          }
        }
      },
      methods: {
        // 处理星星的数目发生了变化
        handleStarChange (value) {
          if (!value) {
            return
          }
          let frequency = value
          this.setFrequency({frequency})
        },

        // 设置缩放大小
        setScaleStatus (num) {
          if (num === undefined) {
            return
          }
          this.$store.commit('SET_SCALE_STATUS', {num})
        },
        // 设置提醒
        async setNotify () {
          // 从【复习】-> 【不复习】
          if (this.notifyStatus === 1) {
            this.noReviewDialog = true
            return
          }
          let type = 1
          this.setReview({type})
        },
        // 设置已经复习
        setReviewed () {
          if (this.canReview === 1) {
            this.postReviewed()
          }
        },
        // 确定 取消复习
        confirmCancel () {
          // 先把弹窗关上吧
          this.noReviewDialog = false
          let type = 0
          this.setReview({type})
        },
        // 设置复习状态，从 不复习 -》 复习 的异步接口
        async setReview ({type}) {
          let noteId = this.currentNote.note_id
          let params = {
            note_id: noteId,
            type
          }
          try {
            let result = await ajax('post', 'set_review', params)
            // 不成功的时候，弹出错误提示
            if (!result || !result.success) {
              errorMessage(result.success)
              return
            }
            // 如果是【未复习】-> 【复习】
            if (type === 1) {
              // 闹钟的状态修改
              this.notifyStatus = 1
              // 星星的状态修改
              this.reviewRate = 3

              // 成功了, 更新本地的数据
              this.$store.commit('UPDATE_NOTE_LIST', {
                noteId,
                frequency: 3,
                needReview: 1
              })
            } else {
              // 闹钟的状态修改
              this.notifyStatus = 0
              // 星星的状态修改
              this.reviewRate = 0

              // 成功了, 更新本地的数据
              this.$store.commit('UPDATE_NOTE_LIST', {
                noteId,
                frequency: 0,
                needReview: 0
              })
            }
          } catch (e) {
            errorMessage(e.message)
          }
        },
        // 设置frequency的接口
        async setFrequency ({frequency}) {
          let noteId = this.currentNote.note_id
          let params = {
            note_id: noteId,
            frequency
          }
          try {
            let result = await ajax('post', 'set_frequency', params)

            // 不成功的时候，弹出错误提示
            if (!result || !result.success) {
              errorMessage(result.message)
              return
            }
            // 成功了, 更新本地的数据
            this.$store.commit('UPDATE_NOTE_LIST', {
              noteId,
              frequency
            })
          } catch (e) {
            errorMessage(e.message)
          }
        },
        // 当场设置 已经复习
        async postReviewed () {
          let noteId = this.currentNote.note_id
          let reviewNum = this.currentNote.review_num
          let params = {
            note_id: noteId
          }
          try {
            let result = await ajax('post', 'review_this', params)

            // 不成功的时候，弹出错误提示
            if (!result || !result.success) {
              errorMessage(result.message)
              return
            }

            let data = result.data
            // 成功了, 更新本地的数据
            this.$store.commit('UPDATE_NOTE_LIST', {
              noteId,
              notifyTime: data.next_notify_time,
              reviewNum: reviewNum + 1
            })
            successMessage(`复习成功，下次复习时间为${friendlyTime(data.next_notify_time)}`)
          } catch (e) {
            errorMessage(e.message)
          }
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
        .brain-icon {
            font-size: 18px;
            margin-left: 9px;
            line-height: 30px;
            cursor: pointer;
            transition: all 0.5s;
        }
        .brain-icon:hover {
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
