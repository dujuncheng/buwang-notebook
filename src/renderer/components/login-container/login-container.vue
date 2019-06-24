<template>
    <div>
        <div class="login-container">
            <img class="logo" src="http://h0.hucdn.com/open201925/473bbf39e159be0a_623x527.png" alt="">
            <p class="title">不忘笔记</p>
            <p class="desc">大脑用来思考，记忆交给这儿</p>
            <input type="email" v-model="email" placeholder="邮箱" class="email-input">
            <input type="password" v-model="password" placeholder="密码" class="password-input">
            <input type="password" v-show="state === 'register'" v-model="rePassword" placeholder="确认密码" class="password-input">

            <div class="btn"
                 :class="[btnActive ? 'active-btn' : 'inactive-btn']"
                 v-show="state === 'login'"
                 @click="loginClick"
            >登录</div>
            <div class="btn"
                 :class="[btnActive ? 'active-btn' : 'inactive-btn']"
                 v-show="state === 'register'"
                 @click="registerClick"
            >注册</div>

            <div class="change-btn"
                 v-show="state === 'login'"
                 @click="changeState('register')"
            >我没有账号，去注册</div>
            <div class="change-btn"
                 v-show="state === 'register'"
                 @click="changeState('login')"
            >我已经有账号，去登录</div>
        </div>
    </div>
</template>


<script>
    import ajax from '../../utils/ajax.js'

    export default {
      data () {
        return {
          // 'register' || 'login'
          state: 'login',
          email: '',
          password: '',
          rePassword: ''
        }
      },
      computed: {
        btnActive () {
          let result = false
          if (this.email && String(this.email).length > 0 &&
            this.password && String(this.password).length > 0) {
            result = true
          }
          return result
        }
      },
      props: {},
      methods: {
        // 点击了【登录接口】
        async loginClick () {
          if (this.btnActive === false) {
            return false
          }

          let passwordOk = this.checkPassword()
          let emailOk = this.checkEmail()

          if (!passwordOk || !emailOk) {
            return false
          }

          let params = {
            email: this.email,
            password: this.password
          }
          let result = await ajax('post', 'login', params)

          // 错误1：用户还没有注册
          if (!result.success && Number(result.err_code) === 1) {
            this.$message({
              message: '您的账号还没有注册，请注册哦',
              type: 'info'
            })

            this.state = 'register'
            this.password = ''
            this.rePassword = ''
            return false
          }

          // 错误2：其他报错
          if (!result.success) {
            this.$message({
              message: result.message,
              type: 'error'
            })
            return false
          }

          this.$message({
            message: result.message || '登录成功咯',
            type: 'success'
          })
          // 登录成功
          this.$emit('closeLogin')
        },
        // 点击了【注册按钮】
        async registerClick () {
          if (this.btnActive === false) {
            return false
          }
          let passwordOk = this.checkPassword()
          let emailOk = this.checkEmail()

          if (!passwordOk || !emailOk) {
            return false
          }

          let params = {
            email: this.email,
            password: this.password
          }

          let result = await ajax('post', 'register', params)
          // 错误2：其他报错
          if (!result.success) {
            this.$message({
              message: result.message,
              type: 'error'
            })
            return false
          }

          this.$message({
            message: '注册成功咯~',
            type: 'success'
          })

          this.$emit('closeLogin')
        },
        changeState (state) {
          this.state = state
        },
        // 校验邮箱
        checkEmail () {
          // 是否输入了密码
          if (!this.email) {
            this.$message({
              message: '请输入邮箱哦~',
              type: 'error'
            })
            return false
          }

          let re = /^\w+@[a-z0-9]+\.[a-z]+$/i

          if (!re.test(this.email)) {
            this.$message({
              message: '邮箱格式不正确，请检查哦~',
              type: 'error'
            })
            return false
          } else {
            return true
          }
        },
        /**
         * 校验密码
         * @returns {boolean}
         */
        checkPassword () {
          // 是否输入了密码
          if (!this.password) {
            this.$message({
              message: '请输入密码哦~',
              type: 'error'
            })
            return false
          }

          // 密码长度
          if (String(this.password).length < 6 || String(this.password).length > 32) {
            this.$message({
              message: '密码长度应该在6~32位之间~',
              type: 'error'
            })
            return false
          }

          // 密码格式
          var reg = new RegExp(/^(?![^a-zA-Z]+$)(?!\D+$)/)
          if (!reg.test(this.password)) {
            this.$message({
              message: '密码必须包含至少一位数字和一位字母哦',
              type: 'error'
            })
            return false
          }

          // 对比两次输入密码
          if (this.state === 'register' && this.password !== this.rePassword) {
            this.$message({
              message: '两次密码不一样',
              type: 'error'
            })
            return false
          }

          return true
        }
      }
    }
</script>



<style scoped lang="less">
    .login-container {
        width: 319px;
        height: 421px;
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        .logo {
            width: 107px;
            height: 90px;
            display: block;
            margin: 0 auto;
        }
        .title {
            font-family: PingFangSC-Medium;
            font-size: 32px;
            color: #161616;
            letter-spacing: 0;
            margin-top: 8px;
            width: 100%;
            text-align: center;
        }
        .desc {
            font-family: PingFangSC-Light;
            font-size: 17px;
            color: #A7A7A7;
            letter-spacing: 0;
            margin-top: 2px;
            width: 100%;
            text-align: center;
        }
        .email-input {
            display: block;
            width: 319px;
            height: 44px;
            margin: 22px auto;
            margin-bottom: 0;
            font-size: 19px;
            padding: 14px;
            box-sizing: border-box;
            font-size: 19px;
            border-radius: 5px;
            border: 1px solid #F0F1F1;
            line-height: 44px;
        }
        .password-input {
            display: block;
            width: 319px;
            height: 44px;
            margin: 16px auto;
            margin-bottom: 0;
            padding: 14px;
            box-sizing: border-box;
            font-size: 19px;
            border-radius: 5px;
            border: 1px solid #F0F1F1;
            line-height: 44px;
        }
        .email-input:focus {
            border: 1px solid #4D93FC;
        }
        .password-input:focus {
            border: 1px solid #4D93FC;
        }
        .btn {
            display: block;
            width: 319px;
            height: 44px;
            margin: 18px auto;
            border-radius: 5px;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            font-weight: bolder;
        }
        .active-btn {
            background-color: #257CFF;
        }
        .inactive-btn {
            background-color: #A1A7AF;
        }
        .change-btn {
            font-family: PingFangSC-Light;
            font-size: 13px;
            color: #257CFF;
            letter-spacing: 0;
            margin: 15px auto;
            margin-bottom: 0;
            text-align: center;
            width: 100%;
        }
    }
</style>
