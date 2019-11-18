/* eslint-disable */
const CryptoJS                  = require('crypto-js');

let base64EncodeChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
let base64DecodeChars = new Array(-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1, 63,
  52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, -1, -1, -1, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14,
  15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1, -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
  41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1);


let upload = ''

const base64encode = function (str) {
  let out, i, len;
  let c1, c2, c3;
  len = str.length;
  i = 0;
  out = '';
  while (i < len) {
    c1 = str.charCodeAt(i++) & 0xff;
    if (i == len) {
      out += base64EncodeChars.charAt(c1 >> 2);
      out += base64EncodeChars.charAt((c1 & 0x3) << 4);
      out += '==';
      break;
    }
    c2 = str.charCodeAt(i++);
    if (i == len) {
      out += base64EncodeChars.charAt(c1 >> 2);
      out += base64EncodeChars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
      out += base64EncodeChars.charAt((c2 & 0xF) << 2);
      out += '=';
      break;
    }
    c3 = str.charCodeAt(i++);
    out += base64EncodeChars.charAt(c1 >> 2);
    out += base64EncodeChars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
    out += base64EncodeChars.charAt(((c2 & 0xF) << 2) | ((c3 & 0xC0) >> 6));
    out += base64EncodeChars.charAt(c3 & 0x3F);
  }
  return out;
}

const safe64 = function (base64) {
  base64 = base64.replace(/\+/g, '-');
  base64 = base64.replace(/\//g, '_');
  return base64;
};
const utf16to8 = (str) => {
  let out;
  let i;
  let len;
  let cd;
  out = '';
  len = str.length;
  for (i = 0; i < len; i++) {
    cd = str.charCodeAt(i);
    if ((cd >= 0x0001) && (cd <= 0x007F)) {
      out += str.charAt(i);
    } else if (cd > 0x07FF) {
      out += String.fromCharCode(0xE0 | ((cd >> 12) & 0x0F));
      out += String.fromCharCode(0x80 | ((cd >> 6) & 0x3F));
      out += String.fromCharCode(0x80 | ((cd >> 0) & 0x3F));
    } else {
      out += String.fromCharCode(0xC0 | ((cd >> 6) & 0x1F));
      out += String.fromCharCode(0x80 | ((cd >> 0) & 0x3F));
    }
  }
  return out;
}

const dataURLToBlob = (dataURL) => {
  var BASE64_MARKER = ';base64,';

  if (dataURL.indexOf(BASE64_MARKER) == -1) {
    var parts = dataURL.split(',');
    var contentType = parts[0].split(':')[1];
    var raw = decodeURIComponent(parts[1]);

    return new Blob([raw], {type: contentType});
  }

  var parts = dataURL.split(BASE64_MARKER);
  var contentType = parts[0].split(':')[1];
  var raw = window.atob(parts[1]);
  var rawLength = raw.length;

  var uInt8Array = new Uint8Array(rawLength);

  for (var i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i);
  }
  let res = new Blob([uInt8Array], {type: contentType});
  return res;
}

class UploadImgQiNiu {
  constructor({accessKey, secretKey, scope, deadline, file}) {
    if (String(deadline).length > 10) {
      deadline = String(deadline);
      deadline = Number(deadline.slice(0, 10));
    }

    this.accessKey = accessKey;
    this.secretKey = secretKey;
    this.scope = scope;
    this.putPolicy = {
      scope,
      deadline,
    };
    this.token = '';
    this.formData = '';
    // 通过reader 读取出来的内容
    this.fileContent = '';
    // 文件file[0]
    // this.file = file;
    // 图片的旋转角度
    this.orientation = '';
    this.width = '';
    this.height = '';
    this.tempUrl = '';
    this.fakeImage = '';
    this.correctTempUrl = ''
    this.correctImage = ''
  }
  async init () {
    if (!this.file) {
      throw new Error('file 不存在');
    }
    this.tempUrl = this.getTempUrl(this.file);
    let info = await this.getImgInfo(this.tempUrl);
    this.width = info.width;
    this.height = info.height;

    this.fileContent = await this.getFileContent(this.file);


    if (!this.fileContent) {
      throw new Error('fileContent 不存在');
    }

    this.orientation = await this.getOrientation(this.fileContent);

    let correctInfo =  await this.getCorrectOrientation(this.orientation, this.width, this.height);
    this.correctImage = correctInfo.resizedImage;
    this.correctTempUrl = correctInfo.dataUrl;

    return {
      correctImage: this.correctImage,
      correctTempUrl: this.correctTempUrl,
    }
  }
  async getImgInfo(url) {
    return new Promise((resolve, reject) => {
      let image = new Image();
      image.onload = () => {
        let info = {
          width: image.width,
          height: image.height,
        }
        this.fakeImage = image;
        resolve(info);
      }
      image.src = url;
    })
  }
  genUpToken(deadline) {
    let putPolicy = JSON.stringify({
      scope: this.scope,
      deadline
    });

    // SETP 3
    let encoded = base64encode(utf16to8(putPolicy));

    // SETP 4
    let hash = CryptoJS.HmacSHA1(encoded, this.secretKey);
    let encodedSigned = hash.toString(CryptoJS.enc.Base64);

    // SETP 5
    let uploadToken = `${this.accessKey}:${safe64(encodedSigned)}:${encoded}`;
    return uploadToken;
  }
  genAjaxPromise() {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      // 进度监听
      xhr.addEventListener('progress', (e) => {
      }, false);
      // 错误监听
      xhr.addEventListener('error', (e) => {
        console.log('上传失败');
        console.log(e)
        reject(e);
      }, false);
      xhr.onreadystatechange =  () => {
        if (xhr.readyState === 4 && xhr.responseText) {
          const result = JSON.parse(xhr.responseText);
          if (xhr.status === 200) {
            // 上传成功
            if (result.key && result.hash) {
              resolve(`http://cdn.dujuncheng.com/${result.key}`);
            }
          } else {
            // 上传失败
            reject()
          }
        }

      };
      xhr.open('POST', 'http://up-z2.qiniu.com', true);
      xhr.send(this.formData);
    })
  }
  upload(file) {
    let deadline = Math.round(new Date().getTime() / 1000) + 3600
    this.token = this.genUpToken(deadline);
    if (!this.token) {
      throw new Error("token生成失败");
    }
    this.formData = this.genFormData(file);
    if (!this.formData) {
      throw new Error("formData生成失败");
    }

    return this.genAjaxPromise();
  }
  genFormData(file) {
    const formData = new FormData();
    // 自定义formData中的内容
    // type
    formData.append('type', file.type);
    // size
    formData.append('size', file.size || 'image/jpeg');
    // name
    formData.append('name', file.name);
    // lastModifiedDate
    formData.append('lastModifiedDate', file.lastModifiedDate);
    // append 文件
    formData.append('file', file);
    formData.append('token', this.token);
    return formData;
  }
  getTempUrl(file) {
    if (window.URL.createObjectURL && typeof window.URL.createObjectURL === 'function') {
      let tempUrl = window.URL.createObjectURL(file);
      return tempUrl;
    }
  }
  // ios 拍张会出现90度旋转的问题
  getCorrectOrientation(orientation, width, height) {
    return new Promise((resolve, reject) => {
      let canvas = document.createElement('canvas');
      let cxt = canvas.getContext('2d');

      if (4 < orientation && orientation < 9) {
        canvas.width = height;
        canvas.height = width;
      } else {
        canvas.width = width;
        canvas.height = height;
      }
      switch (orientation) {
        case 2: cxt.transform(-1, 0, 0, 1, width, 0); break;
        case 3: cxt.transform(-1, 0, 0, -1, width, height); break;
        case 4: cxt.transform(1, 0, 0, -1, 0, height); break;
        case 5: cxt.transform(0, 1, 1, 0, 0, 0); break;
        case 6: cxt.transform(0, 1, -1, 0, height, 0); break;
        case 7: cxt.transform(0, -1, -1, 0, height, width); break;
        case 8: cxt.transform(0, -1, 1, 0, 0, width); break;
        default: break;
      }

      cxt.drawImage(this.fakeImage, 0, 0);

      let dataUrl = canvas.toDataURL('image/jpeg');
      let resizedImage = dataURLToBlob(dataUrl);
      if (resizedImage) {
        resolve({dataUrl, resizedImage});
      } else {
        reject();
      }
    });
  }
  // 获取文件内容
  getFileContent(file) {
    return new Promise((resolve, reject) => {
      let reader = new FileReader();
      reader.onload = function (e) {
        let res = e.target.result;
        if (res) {
          resolve(res);
        } else {
          reject();
        }
      };
      reader.readAsArrayBuffer(file);
    })
  }
  // 获取图片的方向
  getOrientation(fileContent) {
    return new Promise((resolve, reject) => {
      let view = new DataView(fileContent);
      if (view.getUint16(0, false) != 0xFFD8) {
        resolve(-2);
      }
      let length = view.byteLength;
      let offset = 2;
      while (offset < length) {
        if (view.getUint16(offset + 2, false) <= 8) {
          resolve(-1);
        }
        let marker = view.getUint16(offset, false);
        offset += 2;
        if (marker == 0xFFE1) {
          if (view.getUint32(offset += 2, false) != 0x45786966) {
            resolve(-1);
          }

          let little = view.getUint16(offset += 6, false) == 0x4949;
          offset += view.getUint32(offset + 4, little);
          let tags = view.getUint16(offset, little);
          offset += 2;
          for (let i = 0; i < tags; i++) {
            if (view.getUint16(offset + (i * 12), little) == 0x0112) {
              resolve(view.getUint16(offset + (i * 12) + 8, little));
            }
          }
        } else if ((marker & 0xFF00) != 0xFF00) {
          break;
        } else {
          offset += view.getUint16(offset, false);
        }
      }
      resolve(-1);
    })
  }
}

if (!upload) {
  upload = new UploadImgQiNiu({
    accessKey: '2JLtpeuDgEl7abkPiG_MJDGnaeDQpLKZefJRg9I5',
    secretKey: 'jgmTc2ACvWJDwQc0ihXZQoLGBBcJOU0ANl8GAQAK',
    scope: 'dujuncheng1234',
  });
}

export default upload;
