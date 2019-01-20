export const friendlyTime = (timeStamp) => {
  let daySecond = 24 * 60 * 60
  let nowSecond = Math.floor((new Date().getTime()) / 1000)
  let nowMonth = (new Date().getMonth()) + 1
  if (String(timeStamp).length === 13) {
    timeStamp = Math.floor(Number(timeStamp) / 1000)
  } else {
    timeStamp = Number(timeStamp)
  }

  // 确定好具体时间
  let hour = String(new Date(timeStamp * 1000).getHours())
  let hourText = hour.length === 1 ? `0${hour}` : `${hour}`
  let min = String(new Date(timeStamp * 1000).getMinutes())
  let minText = min.length === 1 ? `0${min}` : `${min}`

  // 在今天范围内
  if (timeStamp - nowSecond < daySecond) {
    let day = '今天'
    let str = `${day} ${hourText}:${minText}`
    return str
  }
  // 在明天的范围内
  if (timeStamp - nowSecond < daySecond * 2) {
    let day = '明天'
    let str = `${day} ${hourText}:${minText}`
    return str
  }
  // 在后天的范围内
  if (timeStamp - nowSecond < daySecond * 3) {
    let day = '后天'
    let str = `${day} ${hourText}:${minText}`
    return str
  }
  let month = (new Date(timeStamp * 1000).getMonth() + 1)
  if (nowMonth === month) {
    let day = String(new Date(timeStamp * 1000).getDate())
    let str = `${day}日 ${hourText}:${minText}`
    return str
  } else {
    let day = String(new Date(timeStamp * 1000).getDate())
    let str = `${month}月${day}日 ${hourText}:${minText}`
    return str
  }
}
