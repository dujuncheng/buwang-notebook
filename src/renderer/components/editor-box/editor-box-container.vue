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
                <el-rate v-model="reviewRate"></el-rate>
            </div>
        </el-tooltip>

        <!--  恢复原样 -->
        <i class="fas fa-compress-arrows-alt shrink-icon" v-if="scaleStatus === 1" @click="setScaleStatus(0)"></i>
        <!-- 放大状态 -->
        <i class="fas fa-expand-arrows-alt enlarge-icon" v-if="scaleStatus === 0" @click="setScaleStatus(1)"></i>


        <!-- 确定提醒的对话框 -->
        <el-dialog
                title="手下留情"
                :visible.sync="noReviewDialog"
                width="30%"
                :before-close="handleClose">
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
    import {mapState, mapGetters} from 'vuex'
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
        }),
        ...mapGetters(['currentNote'])
      },
      watch: {
        currentNote (value) {
          if (value && value.need_review !== undefined) {
            this.notifyStatus = value.need_review
          }
        }
      },
      methods: {
        // 设置缩放大小
        setScaleStatus (num) {
          if (num === undefined) {
            return
          }
          this.$store.commit('SET_SCALE_STATUS', {num})
        },
        // 设置提醒
        setNotify () {
          this.noReviewDialog = !this.noReviewDialog;
          // this.$message({
          //   message: '恭喜你，设置成功',
          //   type: 'success'
          // })
          // this.$notify({
          //   title: '恭喜你，设置成功',
          //   type: 'success',
          //   message: '这是一条不会自动关闭的消息',
          //   duration: 3000
          // })
        },
        // 确定取消复习
        confirmCancel () {
        },
        reviewThis () {

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
