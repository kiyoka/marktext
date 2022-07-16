import { marked as upstreamMarked, Renderer, Lexer, Parser, Slugger } from 'marked'
import { block } from './blockRules'

function marked (src, opt = {}) {
  return upstreamMarked.parse(src, opt)
}

// lheading
const lheading = (token) => {
  const src = token.raw
  const cap = block.lheading.exec(src)
  if (cap) {
    const chops = cap[0].trim().split(/\n/)
    const marker = chops[chops.length - 1]
    return {
      type: 'heading',
      headingStyle: 'setext',
      depth: cap[2].charAt(0) === '=' ? 1 : 2,
      text: cap[1],
      marker
    }
  }
  return null
}

const judgeListType = (src) => {
  const cap = block.bullet.exec(src)
  if (cap) {
    if (cap[1]) {
      return ({
        listItemType: 'bullet',
        bulletMarkerOrDelimiter: cap[1]
      })
    }
    if (cap[2]) {
      return ({
        listItemType: 'order',
        bulletMarkerOrDelimiter: cap[2]
      })
    }
  }
  return ({
    listItemType: 'unknown',
    bulletMarkerOrDelimiter: ''
  })
}

const groupingList = (items) => {
  let lastTask = 'none'
  let retGroups = []
  let group = {
    task: 'none',
    items: []
  }
  let item
  while ((item = items.shift())) {
    const currentTask = item.task ? 'task' : 'bullet'
    if (group.task === 'none') {
      group.task = currentTask
      group.items.push(item)
    } else if (currentTask === lastTask) {
      group.items.push(item)
    } else if (group.items.length > 0) {
      retGroups.push(group)
      group = {
        task: 'none',
        items: []
      }
      group.task = currentTask
      group.items.push(item)
    }
    lastTask = currentTask
  }
  if (group.items.length > 0) {
    retGroups.push(group)
  }
  return retGroups
}

// list
const list = (tokenOfList) => {
  let retTokens = []
  if (tokenOfList.type !== 'list') {
    return null
  } else {
    const listTypeInfo = judgeListType(tokenOfList.raw)
    const groups = groupingList(tokenOfList.items)
    groups.forEach((group) => {
      retTokens.push({
        type: 'list_start',
        ordered: tokenOfList.ordered,
        listType: tokenOfList.ordered ? 'order' : group.task,
        start: tokenOfList.start,
        orig: tokenOfList
      })
      let item
      while ((item = group.items.shift())) {
        retTokens.push({
          checked: item.checked,
          listItemType: tokenOfList.ordered ? 'order' : group.task,
          bulletMarkerOrDelimiter: listTypeInfo.bulletMarkerOrDelimiter,
          type: tokenOfList.loose ? 'loose_item_start' : 'list_item_start'
        })
        if ((item.type === 'list_item') && (item.tokens.length > 0)) {
          const lst = transformTokens(item.tokens)
          lst.forEach((t) => {
            retTokens.push(t)
          })
        } else {
          retTokens.push({
            type: 'text',
            text: ''
          })
        }
        retTokens.push({
          type: 'list_item_end'
        })
      }
      retTokens.push({
        type: 'list_end'
      })
    })
  }
  return retTokens
}

const paragraph = (token) => {
  let retTokens = []
  let linkTokens = []
  retTokens.push({
    type: token.type,
    text: token.text.replace(/\n*$/, '')
  })
  if (token.tokens.length > 0) {
    const lst = transformTokens(token.tokens)
    lst.forEach((t) => {
      if (t.type === 'link') {
        linkTokens.push(t)
      }
    })
    lst.forEach((t) => {
      if (!(t.type === 'text' || t.type === 'em' || t.type === 'codespan' || t.type === 'link' || t.type === 'html')) {
        retTokens.push(t)
      }
    })
  }

  // convert RefLinks to paragraph
  if (linkTokens.length > 0) {
    let textArray = []
    linkTokens.forEach((t) => {
      const reflink1 = /(\[[a-zA-Z0-9 ]+\])(\[[0-9]+\])/
      const cap1 = reflink1.exec(t.raw)
      if (cap1) {
        textArray.push(cap1[2] + ': ' + t.href)
      } else {
        const reflink2 = /(\[[a-zA-Z0-9 ]+\])(\[\])/
        const cap2 = reflink2.exec(t.raw)
        if (cap2) {
          textArray.push(cap2[1] + ': ' + t.href)
        }
      }
    })
    if (textArray.length > 0) {
      retTokens.push({
        type: 'paragraph',
        text: textArray.join('\n')
      })
    }
  }
  return retTokens
}

const table = (token) => {
  let header = []
  token.header.forEach((h) => {
    header.push(h.text)
  })
  let cells = []
  token.rows.forEach((columns) => {
    let lines = []
    columns.forEach((cell) => {
      lines.push(cell.text)
    })
    cells.push(lines)
  })
  return ({
    type: 'table',
    header: header,
    align: token.align,
    cells: cells
  })
}

/**
 * Muya custom functions
 */
const transformTokens = (tokens) => {
  let token
  let retTokens = []
  while ((token = tokens.shift())) {
    switch (token.type) {
      case 'heading': {
        const lh = lheading(token)
        if (lh) {
          token = lh
        } else {
          token = {
            type: token.type,
            headingStyle: 'atx',
            depth: token.depth,
            text: token.text
          }
        }
        retTokens.push(token)
        break
      }
      case 'hr': {
        const marker = token.raw.replace(/\n*$/, '')
        token = {
          type: token.type,
          marker: marker
        }
        retTokens.push(token)
        break
      }
      case 'code': {
        token = {
          type: token.type,
          codeBlockStyle: token.codeBlockStyle === 'indented' ? token.codeBlockStyle : 'fenced',
          lang: token.lang,
          text: token.text
        }
        retTokens.push(token)
        break
      }
      case 'blockquote': {
        retTokens.push({
          type: 'blockquote_start'
        })
        const listTokens = transformTokens(token.tokens)
        listTokens.forEach((t) => {
          retTokens.push(t)
        })
        retTokens.push({
          type: 'blockquote_end'
        })
        break
      }
      case 'list': {
        const listTokens = list(token)
        listTokens.forEach((t) => {
          retTokens.push(t)
        })
        break
      }
      case 'paragraph': {
        const listTokens = paragraph(token)
        listTokens.forEach((t) => {
          retTokens.push(t)
        })
        break
      }
      case 'footnote' : {
        retTokens.push({
          type: 'footnote_start',
          identifier: token.identifier
        })
        retTokens.push({
          type: 'paragraph',
          text: token.text
        })
        retTokens.push({
          type: 'footnote_end'
        })
        break
      }
      case 'table': {
        retTokens.push(table(token))
        break
      }
      case 'escape': {
        break
      }
      case 'image': {
        break
      }
      case 'del': {
        break
      }
      case 'strong': {
        break
      }
      case 'br': {
        break
      }
      default: {
        retTokens.push(token)
        break
      }
    }
  }
  return retTokens
}

const dropUnusedTokens = (tokens) => {
  let retTokens = []
  let token
  while ((token = tokens.shift())) {
    delete token.tokens
    delete token.orig
    delete token.raw
    retTokens.push(token)
  }
  return retTokens
}

export const muyaTransformTokens = (tokens) => {
  let retTokens = transformTokens(tokens)
  retTokens = dropUnusedTokens(retTokens)
  return retTokens
}

export const footnoteBlock = (src, tokens) => {
  const cap = block.footnote.exec(src)
  if (cap) {
    /* eslint-disable no-useless-escape */
    // Remove the footnote identifer prefix. eg: `[^identifier]: `.
    src = cap[0].replace(/^\[\^[^\^\[\]\s]+?(?<!\\)\]:\s*/gm, '')
    // Remove the four whitespace before each block of footnote.
    src = src.replace(/\n {4}(?=[^\s])/g, '\n')
    // Trim \n
    src = src.replace(/[\n]+$/, '')
    /* eslint-enable no-useless-escape */
    const token = {
      type: 'footnote',
      raw: cap[0],
      identifier: cap[1],
      text: src
    }
    return token
  }
  return null
}

export {
  Renderer, Lexer, Parser, Slugger
}

export default marked
