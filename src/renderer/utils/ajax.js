import axios from 'axios'
import bus from '../utils/eventBus.js'

// const url = 'http://118.24.193.194/notebook'
const url = 'http://127.0.0.1:85/notebook'

const ajax = async (type, method, params = {}) => {
  if (!method) {
    return false
  }

  let result = (await axios({
    method: type,
    url: `${url}?method=${method}`,
    data: params,
    withCredentials: true
  })).data

  if (!result.success && Number(result.err_code) === 2) {
    bus.$emit('login')
    return result
  }

  return result
}

export default ajax
