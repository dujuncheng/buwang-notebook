export const friendlyTime = (timeStamp) => {
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
  let month = (new Date(timeStamp * 1000).getMonth() + 1)
  let day = String(new Date(timeStamp * 1000).getDate())
  let str = `${month}月${day}日 ${hourText}:${minText}`
  return str
}
