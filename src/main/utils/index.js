import fs from 'fs'
import path from 'path'
import fse from 'fs-extra'
import { app, Menu } from 'electron'
import { EXTENSIONS } from '../config'

const ID_PREFIX = 'mt-'
let id = 0

export const getUniqueId = () => {
  return `${ID_PREFIX}${id++}`
}

// creates a directory if it doesn't already exist.
export const ensureDir = dirPath => {
  try {
    fse.ensureDirSync(dirPath)
  } catch (e) {
    if (e.code !== 'EEXIST') {
      throw e
    }
  }
}

export const getRecommendTitle = markdown => {
  const tokens = markdown.match(/#{1,6} {1,}(.+)(?:\n|$)/g)
  if (!tokens) return ''
  let headers = tokens.map(t => {
    const matches = t.trim().match(/(#{1,6}) {1,}(.+)/)
    return {
      level: matches[1].length,
      content: matches[2].trim()
    }
  })

  return headers.sort((a, b) => a.level > b.level)[0].content
}

export const getPath = directory => {
  return app.getPath(directory)
}

export const getMenuItemById = menuId => {
  const menus = Menu.getApplicationMenu()
  return menus.getMenuItemById(menuId)
}

export const log = data => {
  if (typeof data !== 'string') data = (data.stack || data).toString()
  const LOG_DATA_PATH = path.join(getPath('userData'), 'error.log')
  const LOG_TIME = new Date().toLocaleString()
  ensureDir(getPath('userData'))
  fs.appendFileSync(LOG_DATA_PATH, `\n${LOG_TIME}\n${data}\n`)
}

// returns true if the filename matches one of the markdown extensions
export const hasMarkdownExtension = filename => {
  if (!filename || typeof filename !== 'string') return false
  return EXTENSIONS.some(ext => filename.endsWith(`.${ext}`))
}

export const hasSameKeys = (a, b) => {
  const aKeys = Object.keys(a).sort()
  const bKeys = Object.keys(b).sort()
  return JSON.stringify(aKeys) === JSON.stringify(bKeys)
}

export const isDirectory = dirPath => {
  try {
    return fs.existsSync(dirPath) && fs.lstatSync(dirPath).isDirectory()
  } catch (e) {
    // No permissions
    log(e)
    return false
  }
}

// returns true if the path is a file with read access.
export const isFile = filepath => {
  try {
    return fs.existsSync(filepath) && fs.lstatSync(filepath).isFile()
  } catch (e) {
    // No permissions
    log(e)
    return false
  }
}

// returns true if the file is a supported markdown file.
export const isMarkdownFile = filepath => {
  return isFile(filepath) && hasMarkdownExtension(filepath)
}

export const readJson = (filePath, printError) => {
  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    return JSON.parse(content)
  } catch (e) {
    if (printError) console.log(e)
    return null
  }
}
