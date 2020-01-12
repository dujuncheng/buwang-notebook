import selection from '../selection'
import { PARAGRAPH_TYPES, DEFAULT_TURNDOWN_CONFIG } from '../config'
import ExportMarkdown from '../utils/exportMarkdown'

// get header level
//  eg: h1 => 1
//      h2 => 2
const getCurrentLevel = type => {
  if (/\d/.test(type)) {
    return Number(/\d/.exec(type)[0])
  } else {
    return 0
  }
}

const paragraphCtrl = ContentState => {
  ContentState.prototype.selectionChange = function (cursor) {
    const { start, end } = cursor || selection.getCursorRange()
    if (!start || !end) {
      // TODO: Throw an exception and try to fix this later (GH#848).
      throw new Error('selectionChange: expected cursor but cursor is null.')
    }
    const cursorCoords = selection.getCursorCoords()
    const startBlock = this.getBlock(start.key)
    const endBlock = this.getBlock(end.key)
    const startParents = this.getParents(startBlock)
    const endParents = this.getParents(endBlock)
    const affiliation = startParents
      .filter(p => endParents.includes(p))
      .filter(p => PARAGRAPH_TYPES.includes(p.type))

    start.type = startBlock.type
    start.block = startBlock
    end.type = endBlock.type
    end.block = endBlock

    return {
      start,
      end,
      affiliation,
      cursorCoords
    }
  }

  ContentState.prototype.getCommonParent = function () {
    const { start, end, affiliation } = this.selectionChange()
    const parent = affiliation.length ? affiliation[0] : null
    const startBlock = this.getBlock(start.key)
    const endBlock = this.getBlock(end.key)
    const startParentKeys = this.getParents(startBlock).map(b => b.key)
    const endParentKeys = this.getParents(endBlock).map(b => b.key)
    const children = parent ? parent.children : this.blocks
    let startIndex
    let endIndex
    for (const child of children) {
      if (startParentKeys.includes(child.key)) {
        startIndex = children.indexOf(child)
      }
      if (endParentKeys.includes(child.key)) {
        endIndex = children.indexOf(child)
      }
    }
    return { parent, startIndex, endIndex }
  }

  ContentState.prototype.handleFrontMatter = function () {
    const firstBlock = this.blocks[0]
    if (firstBlock.type === 'pre' && firstBlock.functionType === 'frontmatter') return

    const { frontmatterType } = this.muya.options
    let lang
    let style
    switch (frontmatterType) {
      case '+':
        lang = 'toml'
        style = '+'
        break
      case ';':
        lang = 'json'
        style = ';'
        break
      case '{':
        lang = 'json'
        style = '{'
        break
      default:
        lang = 'yaml'
        style = '-'
        break
    }

    const frontMatter = this.createBlock('pre', {
      functionType: 'frontmatter',
      lang,
      style
    })
    const codeBlock = this.createBlock('code', {
      lang
    })
    const emptyCodeContent = this.createBlock('span', {
      functionType: 'codeContent',
      lang
    })

    this.appendChild(codeBlock, emptyCodeContent)
    this.appendChild(frontMatter, codeBlock)
    this.insertBefore(frontMatter, firstBlock)
    const { key } = emptyCodeContent
    const offset = 0
    this.cursor = {
      start: { key, offset },
      end: { key, offset }
    }
  }

  // TODO: New created nestled list items missing "listType" key and value.

  ContentState.prototype.handleListMenu = function (paraType, insertMode) {
    const { start, end, affiliation } = this.selectionChange(this.cursor)
    const { orderListDelimiter, bulletListMarker, preferLooseListItem } = this.muya.options
    const [blockType, listType] = paraType.split('-')
    const isListed = affiliation.slice(0, 3).filter(b => /ul|ol/.test(b.type))

    if (isListed.length && !insertMode) {
      const listBlock = isListed[0]
      if (listType === listBlock.listType) {
        const listItems = listBlock.children
        listItems.forEach(listItem => {
          listItem.children.forEach(itemParagraph => {
            if (itemParagraph.type !== 'input') {
              this.insertBefore(itemParagraph, listBlock)
            }
          })
        })
        this.removeBlock(listBlock)
        return
      }
      // if the old list block is task list, remove checkbox
      if (listBlock.listType === 'task') {
        const listItems = listBlock.children
        listItems.forEach(item => {
          const inputBlock = item.children[0]
          inputBlock && this.removeBlock(inputBlock)
        })
      }
      const oldListType = listBlock.listType
      listBlock.type = blockType
      listBlock.listType = listType
      listBlock.children.forEach(b => (b.listItemType = listType))

      if (listType === 'order') {
        listBlock.start = listBlock.start || 1
        listBlock.children.forEach(b => (b.bulletMarkerOrDelimiter = orderListDelimiter))
      }
      if (
        (listType === 'bullet' && oldListType === 'order') ||
        (listType === 'task' && oldListType === 'order')
      ) {
        delete listBlock.start
        listBlock.children.forEach(b => (b.bulletMarkerOrDelimiter = bulletListMarker))
      }

      // if the new block is task list, add checkbox
      if (listType === 'task') {
        const listItems = listBlock.children
        listItems.forEach(item => {
          const checkbox = this.createBlock('input')
          checkbox.checked = false
          this.insertBefore(checkbox, item.children[0])
        })
      }
    } else {
      if (start.key === end.key || (start.block.parent && start.block.parent === end.block.parent)) {
        const block = this.getBlock(start.key)
        const paragraph = this.getBlock(block.parent)
        if (listType === 'task') {
          // 1. first update the block to bullet list
          const listItemParagraph = this.updateList(paragraph, 'bullet', undefined, block)
          // 2. second update bullet list to task list
          setTimeout(() => {
            this.updateTaskListItem(listItemParagraph, listType)
            this.partialRender()
            this.muya.dispatchSelectionChange()
            this.muya.dispatchSelectionFormats()
            this.muya.dispatchChange()
          })
          return false
        } else {
          this.updateList(paragraph, listType, undefined, block)
        }
      } else {
        const { parent, startIndex, endIndex } = this.getCommonParent()
        const children = parent ? parent.children : this.blocks
        const referBlock = children[endIndex]
        const listWrapper = this.createBlock(listType === 'order' ? 'ol' : 'ul')
        listWrapper.listType = listType
        if (listType === 'order') listWrapper.start = 1

        children.slice(startIndex, endIndex + 1).forEach(child => {
          if (child !== referBlock) {
            this.removeBlock(child, children)
          } else {
            this.insertAfter(listWrapper, child)
            this.removeBlock(child, children)
          }
          const listItem = this.createBlock('li')
          listItem.listItemType = listType
          listItem.isLooseListItem = preferLooseListItem
          this.appendChild(listWrapper, listItem)
          if (listType === 'task') {
            const checkbox = this.createBlock('input')
            checkbox.checked = false
            this.appendChild(listItem, checkbox)
          }
          this.appendChild(listItem, child)
        })
      }
    }

    return true
  }

  ContentState.prototype.handleLooseListItem = function () {
    const { affiliation } = this.selectionChange(this.cursor)
    let listContainer = []
    if (affiliation.length >= 1 && /ul|ol/.test(affiliation[0].type)) {
      listContainer = affiliation[0].children
    } else if (affiliation.length >= 3 && affiliation[1].type === 'li') {
      listContainer = affiliation[2].children
    }
    if (listContainer.length > 0) {
      for (const block of listContainer) {
        block.isLooseListItem = !block.isLooseListItem
      }
      this.partialRender()
    }
  }

  ContentState.prototype.handleCodeBlockMenu = function () {
    const { start, end, affiliation } = this.selectionChange(this.cursor)
    const startBlock = this.getBlock(start.key)
    const endBlock = this.getBlock(end.key)
    const startParents = this.getParents(startBlock)
    const endParents = this.getParents(endBlock)
    const hasFencedCodeBlockParent = () => {
      return [...startParents, ...endParents].some(b => b.type === 'pre' && /code/.test(b.functionType))
    }
    // change fenced code block to p paragraph
    if (affiliation.length && affiliation[0].type === 'pre' && /code/.test(affiliation[0].functionType)) {
      const codeBlock = affiliation[0]
      const codeContent = codeBlock.children[1].children[0].text
      const states = this.markdownToState(codeContent)

      for (const state of states) {
        this.insertBefore(state, codeBlock)
      }

      this.removeBlock(codeBlock)

      const cursorBlock = this.firstInDescendant(states[0])
      const { key, text } = cursorBlock
      const offset = text.length
      this.cursor = {
        start: { key, offset },
        end: { key, offset }
      }
    } else {
      if (start.key === end.key) {
        if (startBlock.type === 'span') {
          const anchorBlock = this.getParent(startBlock)
          const lang = ''
          const preBlock = this.createBlock('pre', {
            functionType: 'fencecode',
            lang
          })

          const codeBlock = this.createBlock('code', {
            lang
          })

          const inputBlock = this.createBlock('span', {
            functionType: 'languageInput'
          })

          const codeContent = this.createBlock('span', {
            text: startBlock.text,
            lang,
            functionType: 'codeContent'
          })

          this.appendChild(codeBlock, codeContent)
          this.appendChild(preBlock, inputBlock)
          this.appendChild(preBlock, codeBlock)
          this.insertBefore(preBlock, anchorBlock)

          this.removeBlock(anchorBlock)

          const { key } = inputBlock
          const offset = 0

          this.cursor = {
            start: { key, offset },
            end: { key, offset }
          }
        } else {
          this.cursor = {
            start: this.cursor.start,
            end: this.cursor.end
          }
        }
      } else if (!hasFencedCodeBlockParent()) {
        const { parent, startIndex, endIndex } = this.getCommonParent()
        const children = parent ? parent.children : this.blocks
        const referBlock = children[endIndex]
        const lang = ''
        const preBlock = this.createBlock('pre', {
          functionType: 'fencecode',
          lang
        })
        const codeBlock = this.createBlock('code', {
          lang
        })

        const listIndentation = this.listIndentation
        const markdown = new ExportMarkdown(children.slice(startIndex, endIndex + 1), listIndentation).generate()
        const codeContent = this.createBlock('span', {
          text: markdown,
          lang,
          functionType: 'codeContent'
        })
        const inputBlock = this.createBlock('span', {
          functionType: 'languageInput'
        })
        this.appendChild(codeBlock, codeContent)
        this.appendChild(preBlock, inputBlock)
        this.appendChild(preBlock, codeBlock)
        this.insertAfter(preBlock, referBlock)
        let i
        const removeCache = []
        for (i = startIndex; i <= endIndex; i++) {
          const child = children[i]
          removeCache.push(child)
        }
        removeCache.forEach(b => this.removeBlock(b))
        const key = inputBlock.key
        const offset = 0
        this.cursor = {
          start: { key, offset },
          end: { key, offset }
        }
      }
    }
  }

  ContentState.prototype.handleQuoteMenu = function (insertMode) {
    const { start, end, affiliation } = this.selectionChange(this.cursor)
    let startBlock = this.getBlock(start.key)
    const isBlockQuote = affiliation.slice(0, 2).filter(b => /blockquote/.test(b.type))
    // change blockquote to paragraph
    if (isBlockQuote.length && !insertMode) {
      const quoteBlock = isBlockQuote[0]
      const children = quoteBlock.children
      for (const child of children) {
        this.insertBefore(child, quoteBlock)
      }
      this.removeBlock(quoteBlock)
    // change paragraph to blockquote
    } else {
      if (start.key === end.key) {
        if (startBlock.type === 'span') {
          startBlock = this.getParent(startBlock)
        }
        const quoteBlock = this.createBlock('blockquote')
        this.insertAfter(quoteBlock, startBlock)
        this.removeBlock(startBlock)
        this.appendChild(quoteBlock, startBlock)
      } else {
        const { parent, startIndex, endIndex } = this.getCommonParent()
        const children = parent ? parent.children : this.blocks
        const referBlock = children[endIndex]
        const quoteBlock = this.createBlock('blockquote')

        children.slice(startIndex, endIndex + 1).forEach(child => {
          if (child !== referBlock) {
            this.removeBlock(child, children)
          } else {
            this.insertAfter(quoteBlock, child)
            this.removeBlock(child, children)
          }
          this.appendChild(quoteBlock, child)
        })
      }
    }
  }

  ContentState.prototype.insertContainerBlock = function (functionType, block) {
    const anchor = this.getAnchor(block)
    if (!anchor) {
      console.error('Can not find the anchor paragraph to insert paragraph')
      return
    }

    const value = anchor.type === 'p'
      ? anchor.children.map(child => child.text).join('\n').trim()
      : ''

    const containerBlock = this.createContainerBlock(functionType, value)
    this.insertAfter(containerBlock, anchor)
    if (anchor.type === 'p') {
      this.removeBlock(anchor)
    }

    const cursorBlock = containerBlock.children[0].children[0].children[0]
    const { key } = cursorBlock
    const offset = 0
    this.cursor = {
      start: { key, offset },
      end: { key, offset }
    }
  }

  ContentState.prototype.showTablePicker = function () {
    const { eventCenter } = this.muya
    const reference = this.getPositionReference()

    const handler = (rows, columns) => {
      this.createTable({ rows: rows + 1, columns: columns + 1 })
    }
    eventCenter.dispatch('muya-table-picker', { row: -1, column: -1 }, reference, handler.bind(this))
  }

  ContentState.prototype.insertHtmlBlock = function (block) {
    if (block.type === 'span') {
      block = this.getParent(block)
    }
    const preBlock = this.initHtmlBlock(block)
    const cursorBlock = this.firstInDescendant(preBlock)
    const { key, text } = cursorBlock
    const match = /^[^\n]+\n[^\n]*/.exec(text)
    const offset = match && match[0] ? match[0].length : 0

    this.cursor = {
      start: { key, offset },
      end: { key, offset }
    }
  }

  ContentState.prototype.updateParagraph = function (paraType, insertMode = false) {
    const { start, end } = this.cursor
    const block = this.getBlock(start.key)
    const { text, type } = block
    let needDispatchChange = true

    // Only allow valid transformations.
    if (!this.isAllowedTransformation(block, paraType, start.key !== end.key)) {
      return
    }

    // Convert back to paragraph.
    if (paraType === 'reset-to-paragraph') {
      const blockType = this.getTypeFromBlock(block)
      if (!blockType) {
        return
      }

      if (blockType === 'table') {
        return
      } else if (/heading|hr/.test(blockType)) {
        paraType = 'paragraph'
      } else {
        paraType = blockType
      }
    }

    switch (paraType) {
      case 'front-matter': {
        this.handleFrontMatter()
        break
      }
      case 'ul-bullet':
      case 'ul-task':
      case 'ol-order': {
        needDispatchChange = this.handleListMenu(paraType, insertMode)
        break
      }
      case 'loose-list-item': {
        this.handleLooseListItem()
        break
      }
      case 'pre': {
        this.handleCodeBlockMenu()
        break
      }
      case 'blockquote': {
        this.handleQuoteMenu(insertMode)
        break
      }
      case 'mathblock': {
        this.insertContainerBlock('multiplemath', block)
        break
      }
      case 'table': {
        this.showTablePicker()
        break
      }
      case 'html': {
        this.insertHtmlBlock(block)
        break
      }
      case 'flowchart':
      case 'sequence':
      case 'mermaid':
      case 'vega-lite':
        this.insertContainerBlock(paraType, block)
        break
      case 'heading 1':
      case 'heading 2':
      case 'heading 3':
      case 'heading 4':
      case 'heading 5':
      case 'heading 6':
      case 'upgrade heading':
      case 'degrade heading':
      case 'paragraph': {
        if (start.key !== end.key) {
          return
        }

        const headingStyle = DEFAULT_TURNDOWN_CONFIG.headingStyle
        const parent = this.getParent(block)
        // \u00A0 is &nbsp;
        const [, hash, partText] = /(^ {0,3}#*[ \u00A0]*)([\s\S]*)/.exec(text)
        let newLevel = 0 // 1, 2, 3, 4, 5, 6
        let newType = 'p'
        let key

        if (/\d/.test(paraType)) {
          newLevel = Number(paraType.split(/\s/)[1])
          newType = `h${newLevel}`
        } else if (paraType === 'upgrade heading' || paraType === 'degrade heading') {
          const currentLevel = getCurrentLevel(parent.type)
          newLevel = currentLevel
          if (paraType === 'upgrade heading' && currentLevel !== 1) {
            if (currentLevel === 0) newLevel = 6
            else newLevel = currentLevel - 1
          } else if (paraType === 'degrade heading' && currentLevel !== 0) {
            if (currentLevel === 6) newLevel = 0
            else newLevel = currentLevel + 1
          }
          newType = newLevel === 0 ? 'p' : `h${newLevel}`
        }

        const startOffset = newLevel > 0
          ? start.offset + newLevel - hash.length + 1
          : start.offset - hash.length // no need to add `1`, because we didn't add `String.fromCharCode(160)` to text paragraph
        const endOffset = newLevel > 0
          ? end.offset + newLevel - hash.length + 1
          : end.offset - hash.length
        let newText = newLevel > 0
          ? '#'.repeat(newLevel) + `${String.fromCharCode(160)}${partText}` // &nbsp; code: 160
          : partText

        // Remove <hr> content when converting to paragraph.
        if (type === 'span' && block.functionType === 'thematicBreakLine') {
          newText = ''
        }

        // No change
        if (newType === 'p' && parent.type === newType) {
          return
        }
        // No change
        if (newType !== 'p' && parent.type === newType && parent.headingStyle === headingStyle) {
          return
        }

        if (newType !== 'p') {
          const header = this.createBlock(newType, {
            headingStyle
          })
          const headerContent = this.createBlock('span', {
            text: headingStyle === 'atx' ? newText.replace(/\n/g, ' ') : newText,
            functionType: headingStyle === 'atx' ? 'atxLine' : 'paragraphContent'
          })
          this.appendChild(header, headerContent)
          key = headerContent.key

          this.insertBefore(header, parent)
          this.removeBlock(parent)
        } else {
          const pBlock = this.createBlockP(newText)
          key = pBlock.children[0].key
          this.insertAfter(pBlock, parent)
          this.removeBlock(parent)
        }

        this.cursor = {
          start: { key, offset: startOffset },
          end: { key, offset: endOffset }
        }
        break
      }
      case 'hr': {
        const pBlock = this.createBlockP()
        const archor = block.type === 'span' ? this.getParent(block) : block
        const hrBlock = this.createBlock('hr')
        const thematicContent = this.createBlock('span', {
          functionType: 'thematicBreakLine',
          text: '---'
        })
        this.appendChild(hrBlock, thematicContent)
        this.insertAfter(hrBlock, archor)
        this.insertAfter(pBlock, hrBlock)
        if (!text) {
          if (block.type === 'span' && this.isOnlyChild(block)) {
            this.removeBlock(archor)
          } else {
            this.removeBlock(block)
          }
        }
        const { key } = pBlock.children[0]
        const offset = 0
        this.cursor = {
          start: { key, offset },
          end: { key, offset }
        }
        break
      }
    }
    if (paraType === 'front-matter' || paraType === 'pre') {
      this.render()
    } else {
      this.partialRender()
    }

    if (needDispatchChange) {
      this.muya.dispatchSelectionChange()
      this.muya.dispatchSelectionFormats()
      this.muya.dispatchChange()
    }
  }

  ContentState.prototype.insertParagraph = function (location, text = '', outMost = false) {
    const { start, end } = this.cursor
    // if cursor is not in one line or paragraph, can not insert paragraph
    if (start.key !== end.key) return
    const block = this.getBlock(start.key)
    let anchor = null
    if (outMost) {
      anchor = this.findOutMostBlock(block)
    } else {
      anchor = this.getAnchor(block)
    }

    // You can not insert paragraph before frontmatter
    if (!anchor || anchor && anchor.functionType === 'frontmatter' && location === 'before') {
      return
    }

    const newBlock = this.createBlockP(text)
    if (location === 'before') {
      this.insertBefore(newBlock, anchor)
    } else {
      this.insertAfter(newBlock, anchor)
    }
    const { key } = newBlock.children[0]
    const offset = text.length
    this.cursor = {
      start: { key, offset },
      end: { key, offset }
    }
    this.partialRender()
    this.muya.eventCenter.dispatch('stateChange')
  }

  ContentState.prototype.getPreBlock = function (block) {
    const { children } = block
    if (!children || !children.length) return null
    for (const child of children) {
      if (child.type === 'pre') {
        return child
      } else {
        return this.getPreBlock(child)
      }
    }
    return null
  }

  // make a dulication of the current block
  ContentState.prototype.duplicate = function () {
    const { start, end } = this.cursor
    const startOutmostBlock = this.findOutMostBlock(this.getBlock(start.key))
    const endOutmostBlock = this.findOutMostBlock(this.getBlock(end.key))
    if (startOutmostBlock !== endOutmostBlock) {
      // if the cursor is not in one paragraph, just return
      return
    }
    // if copied block has pre block: html, multiplemath, vega-light, mermaid, flowchart, sequence...
    const copiedBlock = this.copyBlock(startOutmostBlock)
    this.insertAfter(copiedBlock, startOutmostBlock)

    const cursorBlock = this.firstInDescendant(copiedBlock)
    // set cursor at the end of the first descendant of the duplicated block.
    const { key, text } = cursorBlock
    const offset = text.length
    this.cursor = {
      start: { key, offset },
      end: { key, offset }
    }
    this.partialRender()
    return this.muya.eventCenter.dispatch('stateChange')
  }

  // delete current paragraph
  ContentState.prototype.deleteParagraph = function (blockKey) {
    let startOutmostBlock
    if (blockKey) {
      const block = this.getBlock(blockKey)
      const firstEditableBlock = this.firstInDescendant(block)
      startOutmostBlock = this.getAnchor(firstEditableBlock)
    } else {
      const { start, end } = this.cursor
      startOutmostBlock = this.findOutMostBlock(this.getBlock(start.key))
      const endOutmostBlock = this.findOutMostBlock(this.getBlock(end.key))
      if (startOutmostBlock !== endOutmostBlock) {
        // if the cursor is not in one paragraph, just return
        return
      }
    }

    const preBlock = this.getBlock(startOutmostBlock.preSibling)
    const nextBlock = this.getBlock(startOutmostBlock.nextSibling)
    let cursorBlock = null
    if (nextBlock) {
      cursorBlock = this.firstInDescendant(nextBlock)
    } else if (preBlock) {
      cursorBlock = this.lastInDescendant(preBlock)
    } else {
      const newBlock = this.createBlockP()
      this.insertAfter(newBlock, startOutmostBlock)
      cursorBlock = this.firstInDescendant(newBlock)
    }
    this.removeBlock(startOutmostBlock)
    const { key, text } = cursorBlock
    const offset = text.length
    this.cursor = {
      start: { key, offset },
      end: { key, offset }
    }
    this.partialRender()
    return this.muya.eventCenter.dispatch('stateChange')
  }

  ContentState.prototype.isSelectAll = function () {
    const firstTextBlock = this.getFirstBlock()
    const lastTextBlock = this.getLastBlock()
    const { start, end } = this.cursor

    return firstTextBlock.key === start.key &&
      start.offset === 0 &&
      lastTextBlock.key === end.key &&
      end.offset === lastTextBlock.text.length &&
      !this.muya.keyboard.isComposed
  }

  ContentState.prototype.selectAllContent = function () {
    const firstTextBlock = this.getFirstBlock()
    const lastTextBlock = this.getLastBlock()
    this.cursor = {
      start: {
        key: firstTextBlock.key,
        offset: 0
      },
      end: {
        key: lastTextBlock.key,
        offset: lastTextBlock.text.length
      }
    }

    return this.render()
  }

  ContentState.prototype.selectAll = function () {
    const mayBeCell = this.isSingleCellSelected()
    const mayBeTable = this.isWholeTableSelected()

    if (mayBeTable) {
      this.selectedTableCells = null
      return this.selectAllContent()
    }

    // Select whole table if already select one cell.
    if (mayBeCell) {
      const table = this.closest(mayBeCell, 'table')

      if (table) {
        return this.selectTable(table)
      }
    }
    const { start, end } = this.cursor
    const startBlock = this.getBlock(start.key)
    const endBlock = this.getBlock(end.key)
    // handle selectAll in table.
    if (startBlock.functionType === 'cellContent' && endBlock.functionType === 'cellContent') {
      if (start.key === end.key) {
        const table = this.closest(startBlock, 'table')
        const cellBlock = this.closest(startBlock, /th|td/)

        this.selectedTableCells = {
          tableId: table.key,
          row: 1,
          column: 1,
          cells: [{
            key: cellBlock.key,
            top: true,
            right: true,
            bottom: true,
            left: true
          }]
        }

        this.singleRender(table, false)
        return this.muya.eventCenter.dispatch('muya-format-picker', { reference: null })
      } else {
        const startTable = this.closest(startBlock, 'table')
        const endTable = this.closest(endBlock, 'table')
        // Check whether both blocks are in the same table.
        if (!startTable || !endTable) {
          console.error('No table found or invalid type.')
          return
        } else if (startTable.key !== endTable.key) {
          // Select entire document
          return
        }
        return this.selectTable(startTable)
      }
    }
    // Handler selectAll in code block. only select all the code block conent.
    // `code block` here is Math, HTML, BLOCK CODE, Mermaid, vega-lite, flowchart, front-matter etc...
    if (startBlock.type === 'span' && startBlock.functionType === 'codeContent') {
      const { key } = startBlock
      this.cursor = {
        start: {
          key,
          offset: 0
        },
        end: {
          key,
          offset: startBlock.text.length
        }
      }

      return this.partialRender()
    }
    // Handler language input, only select language info only...
    if (startBlock.type === 'span' && startBlock.functionType === 'languageInput') {
      this.cursor = {
        start: {
          key: startBlock.key,
          offset: 0
        },
        end: {
          key: startBlock.key,
          offset: startBlock.text.length
        }
      }
      return this.partialRender()
    }

    return this.selectAllContent()
  }

  // Test whether the paragraph transformation is valid.
  ContentState.prototype.isAllowedTransformation = function (block, toType, isMultilineSelection) {
    const fromType = this.getTypeFromBlock(block)
    if (toType === 'front-matter') {
      // Front matter block is added at the beginning.
      return true
    } else if (!fromType) {
      return false
    } else if (isMultilineSelection && /heading|table/.test(toType)) {
      return false
    } else if (fromType === toType || toType === 'reset-to-paragraph') {
      // Convert back to paragraph.
      return true
    }

    switch (fromType) {
      case 'ul-bullet':
      case 'ul-task':
      case 'ol-order':
      case 'blockquote':
      case 'paragraph': {
        // Only allow line and table with an empty paragraph.
        if (/hr|table/.test(toType) && block.text) {
          return false
        }
        return true
      }
      case 'heading 1':
      case 'heading 2':
      case 'heading 3':
      case 'heading 4':
      case 'heading 5':
      case 'heading 6':
        return /paragraph|heading/.test(toType)
      default:
        // Tables and all code blocks are not allowed.
        return false
    }
  }

  // Translate block type into internal name.
  ContentState.prototype.getTypeFromBlock = function (block) {
    const { type } = block

    let internalType = ''
    const headingMatch = type.match(/^h([1-6]{1})$/)
    if (headingMatch && headingMatch[1]) {
      internalType = `heading ${headingMatch[1]}`
    }

    switch (type) {
      case 'span': {
        if (block.functionType === 'atxLine') {
          internalType = 'heading 1' // loose match
        } else if (block.functionType === 'languageInput') {
          internalType = 'pre'
        } else if (block.functionType === 'codeContent') {
          if (block.lang === 'markup') {
            internalType = 'html'
          } else if (block.lang === 'latex') {
            internalType = 'mathblock'
          }

          // We cannot easy distinguish between diagram and code blocks.
          const rootBlock = this.getAnchor(block)
          if (rootBlock && rootBlock.functionType !== 'fencecode') {
            // Block seems to be a diagram block.
            internalType = rootBlock.functionType
          } else {
            internalType = 'pre'
          }
        } else if (block.functionType === 'cellContent') {
          internalType = 'table'
        } else if (block.functionType === 'thematicBreakLine') {
          internalType = 'hr'
        }

        // List and quote content is also a problem because it's shown as paragraph.
        const { affiliation } = this.selectionChange(this.cursor)
        const listTypes = affiliation
          .slice(0, 3) // the third entry should be the ul/ol
          .filter(b => /ul|ol/.test(b.type))
          .map(b => b.listType)

        // Prefer list or blockquote over paragraph.
        if (listTypes && listTypes.length === 1) {
          const listType = listTypes[0]
          if (listType === 'bullet') {
            internalType = 'ul-bullet'
          } else if (listType === 'task') {
            internalType = 'ul-task'
          } if (listType === 'order') {
            internalType = 'ol-order'
          }
        } else if (affiliation.length === 2 && affiliation[1].type === 'blockquote') {
          internalType = 'blockquote'
        } else if (block.functionType === 'paragraphContent') {
          internalType = 'paragraph'
        }
        break
      }
      case 'div': {
        // Preview for math formulas or diagramms.
        return ''
      }
      case 'figure': {
        if (block.functionType === 'multiplemath') {
          internalType = 'mathblock'
        } else {
          internalType = block.functionType
        }
        break
      }
      case 'pre': {
        if (block.functionType === 'multiplemath') {
          internalType = 'mathblock'
        } else if (block.functionType === 'fencecode' || block.functionType === 'indentcode') {
          internalType = 'pre'
        } else if (block.functionType === 'frontmatter') {
          internalType = 'front-matter'
        } else {
          internalType = block.functionType
        }
        break
      }
      case 'ul': {
        if (block.listType === 'task') {
          internalType = 'ul-task'
        } else {
          internalType = 'ul-bullet'
        }
        break
      }
      case 'ol': {
        internalType = 'ol-order'
        break
      }
      case 'li': {
        if (block.listItemType === 'order') {
          internalType = 'ol-order'
        } else if (block.listItemType === 'bullet') {
          internalType = 'ul-bullet'
        } else if (block.listItemType === 'task') {
          internalType = 'ul-task'
        }
        break
      }
      case 'table':
      case 'th':
      case 'td': {
        internalType = 'table'
        break
      }
    }
    return internalType
  }
}

export default paragraphCtrl
