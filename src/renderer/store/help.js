// import { getUniqueId } from '../util'

export const defaultFileState = {
    isSaved: true,
    pathname: '',
    filename: 'Untitled-1',
    markdown: '',
    isUtf8BomEncoded: false,
    lineEnding: 'lf', // lf or crlf
    adjustLineEndingOnSave: false, // convert editor buffer (LF) to CRLF when saving
    textDirection: 'ltr',
    history: {
        stack: [],
        index: -1
    },
    cursor: null,
    wordCount: {
        paragraph: 0,
        word: 0,
        character: 0,
        all: 0
    },
    searchMatches: {
        index: -1,
        matches: [],
        value: ''
    }
}

export const LINE_ENDING_REG = /(?:\r\n|\n)/g
export const LF_LINE_ENDING_REG = /(?:[^\r]\n)|(?:^\n$)/
export const CRLF_LINE_ENDING_REG = /\r\n/
export const isWindows = process.platform === 'win32'

export const convertLineEndings = (text, lineEnding) => {
    return text.replace(LINE_ENDING_REG, getLineEnding(lineEnding))
}

export const getLineEnding = lineEnding => {
    if (lineEnding === 'lf') {
        return '\n'
    } else if (lineEnding === 'crlf') {
        return '\r\n'
    }
    return getOsLineEndingName() === 'crlf' ? '\r\n' : '\n'
}

export const getOsLineEndingName = () => {
    const endOfLine = 'default'
    if (endOfLine === 'lf') {
        return 'lf'
    }
    return endOfLine === 'crlf' || isWindows ? 'crlf' : 'lf'
}

// export const getFileStateFromData = data => {
//     const fileState = JSON.parse(JSON.stringify(defaultFileState))
//     const {
//         markdown,
//         filename,
//         pathname,
//         isUtf8BomEncoded,
//         lineEnding,
//         adjustLineEndingOnSave,
//         textDirection
//     } = data
//     const id = getUniqueId()
//
//     assertLineEnding(adjustLineEndingOnSave, lineEnding)
//
//     return Object.assign(fileState, {
//         id,
//         markdown,
//         filename,
//         pathname,
//         isUtf8BomEncoded,
//         lineEnding,
//         adjustLineEndingOnSave,
//         textDirection
//     })
// }

// export const getBlankFileState = (tabs, lineEnding = 'lf', markdown = '') => {
//     const fileState = JSON.parse(JSON.stringify(defaultFileState))
//     let untitleId = Math.max(...tabs.map(f => {
//         if (f.pathname === '') {
//             return +f.filename.split('-')[1]
//         } else {
//             return 0
//         }
//     }), 0)
//
//     const id = getUniqueId()
//
//     return Object.assign(fileState, {
//         lineEnding,
//         adjustLineEndingOnSave: lineEnding.toLowerCase() === 'crlf',
//         id,
//         filename: `Untitled-${++untitleId}`,
//         markdown
//     })
// }

// export const getSingleFileState = ({ id = getUniqueId(), markdown, filename, pathname, options }) => {
//     const fileState = JSON.parse(JSON.stringify(defaultFileState))
//     const { isUtf8BomEncoded, lineEnding, adjustLineEndingOnSave } = options
//
//     assertLineEnding(adjustLineEndingOnSave, lineEnding)
//
//     return Object.assign(fileState, {
//         id,
//         markdown,
//         filename,
//         pathname,
//         isUtf8BomEncoded,
//         lineEnding,
//         adjustLineEndingOnSave
//     })
// }

const assertLineEnding = (adjustLineEndingOnSave, lineEnding) => {
    lineEnding = lineEnding.toLowerCase()
    if ((adjustLineEndingOnSave && lineEnding !== 'crlf') ||
        (!adjustLineEndingOnSave && lineEnding === 'crlf')) {
        console.error('Assertion failed: Line ending is "CRLF" but document is saved as "LF".')
    }
}
