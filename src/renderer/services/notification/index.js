import template from './index.html'
import './index.css'

const INON_HASH = {
  primary: 'icon-message',
  error: 'icon-error',
  warning: 'icon-warn',
  info: 'icon-info'
}

const notification = {
  name: 'notify',
  notify ({
    time = 10000,
    title = '',
    message = '',
    type = 'primary', // primary error warning info
    showConfirm = false
  }) {
    let rs
    let rj
    let timer = null

    const fragment = document.createElement('div')
    fragment.innerHTML = template
      .replace(/\{\{icon\}\}/, INON_HASH[type])
      .replace(/\{\{title\}\}/, title)
      .replace(/\{\{message\}\}/, message)

    const noticeContainer = fragment.querySelector('.mt-notification')
    const bgNotice = noticeContainer.querySelector('.notice-bg')
    const fluent = noticeContainer.querySelector('.fluent')
    const close = noticeContainer.querySelector('.close')
    const { offsetHeight } = noticeContainer
    let target = noticeContainer
    noticeContainer.classList.add(`mt-${type}`)

    if (showConfirm) {
      noticeContainer.classList.add(`mt-confirm`)
      target = noticeContainer.querySelector('.confirm')
    }

    bgNotice.style.backgroundColor = `var(--${type})`

    fluent.style.height = offsetHeight * 2 + 'px'
    fluent.style.width = offsetHeight * 2 + 'px'

    const setCloseTimer = () => {
      if (typeof time === 'number' && time > 0) {
        timer = setTimeout(() => {
          remove()
        }, time)
      }
    }

    const mousemoveHandler = event => {
      const { left, top } = noticeContainer.getBoundingClientRect()
      const x = event.pageX
      const y = event.pageY
      fluent.style.left = x - left + 'px'
      fluent.style.top = y - top + 'px'
      fluent.style.opacity = '1'
      fluent.style.height = noticeContainer.offsetHeight * 2 + 'px'
      fluent.style.width = noticeContainer.offsetHeight * 2 + 'px'

      if (timer) clearTimeout(timer)
    }

    const mouseleaveHandler = event => {
      fluent.style.opacity = '0'
      fluent.style.height = noticeContainer.offsetHeight * 4 + 'px'
      fluent.style.width = noticeContainer.offsetHeight * 4 + 'px'

      if (timer) clearTimeout(timer)
      setCloseTimer()
    }

    const clickHandler = event => {
      event.preventDefault()
      event.stopPropagation()
      remove()
      rs && rs()
    }

    const closeHandler = event => {
      event.preventDefault()
      event.stopPropagation()
      remove()
      rj && rj()
    }

    const rePositionNotices = () => {
      const notices = document.querySelectorAll('.mt-notification')
      let i
      let hx = 0
      let len = notices.length
      for (i = 0; i < len; i++) {
        notices[i].style.transform = `translate(0, -${hx}px)`
        notices[i].style.zIndex = 10000 - i
        hx += notices[i].offsetHeight + 10
      }
    }

    const remove = () => {
      fluent.style.filter = 'blur(10px)'
      fluent.style.opacity = '0'
      fluent.style.height = noticeContainer.offsetHeight * 5 + 'px'
      fluent.style.width = noticeContainer.offsetHeight * 5 + 'px'

      noticeContainer.style.opacity = '0'
      noticeContainer.style.right = '-400px'

      setTimeout(() => {
        noticeContainer.removeEventListener('mousemove', mousemoveHandler)
        noticeContainer.removeEventListener('mouseleave', mouseleaveHandler)
        target.removeEventListener('click', clickHandler)
        close.removeEventListener('click', closeHandler)
        noticeContainer.remove()
        rePositionNotices()
      }, 100)
    }

    noticeContainer.addEventListener('mousemove', mousemoveHandler)
    noticeContainer.addEventListener('mouseleave', mouseleaveHandler)
    target.addEventListener('click', clickHandler)
    close.addEventListener('click', closeHandler)

    setTimeout(() => {
      bgNotice.style.width = noticeContainer.offsetWidth * 3.5 + 'px'
      bgNotice.style.height = noticeContainer.offsetWidth * 3.5 + 'px'
      rePositionNotices()
    }, 50)

    setCloseTimer()

    document.body.prepend(noticeContainer, document.body.firstChild)

    return new Promise((resolve, reject) => {
      rs = resolve
      rj = reject
    })
  }
}

export default notification
