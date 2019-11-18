import bus from '../../bus/index.js'

let SEPARATOR_ORDER = {
  type: 'separator'
}

let itemList = [
  {
    label: '创建时间 升序',
    id: '1'
  },
  {
    label: '创建时间 降序',
    id: '2'
  },
  {
    label: '修改时间 升序',
    id: '3'
  },
  {
    label: '修改时间 降序',
    id: '4'
  },
  {
    label: '复习时间 升序',
    id: '5'
  },
  {
    label: '复习时间 降序',
    id: '6'
  },
  {
    label: '复习次数 升序',
    id: '7'
  },
  {
    label: '复习次数 降序',
    id: '8'
  },
  {
    label: '重要性 升序',
    id: '9'
  },
  {
    label: '重要性 降序',
    id: '10'
  }
]

let itemFactory = (obj) => {
  return {
    label: obj.label,
    id: obj.id,
    type: 'checkbox',
    click: function () {
      bus.$emit('orderNoteItem', {
        id: obj.id
      })
    }
  }
}

let list = []
for (let i = 0; i < itemList.length; i++) {
  list.push(SEPARATOR_ORDER)
  list.push(itemFactory(itemList[i]))
}

export default list
