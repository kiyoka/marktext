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

// list
const list = (tokenOfList) => {
  let retTokens = []
  if (tokenOfList.type !== 'list') {
    return null
  } else {
    const listTypeInfo = judgeListType(tokenOfList.raw)
    retTokens.push({
      type: 'list_start',
      ordered: tokenOfList.ordered,
      listType: tokenOfList.ordered ? 'order' : 'bullet',
      start: tokenOfList.start,
      orig: tokenOfList
    })
    let item
    while ((item = tokenOfList.items.shift())) {
      retTokens.push({
        listItemType: listTypeInfo.listItemType,
        bulletMarkerOrDelimiter: listTypeInfo.bulletMarkerOrDelimiter,
        type: tokenOfList.loose ? 'loose_item_start' : 'list_item_start'
      })
      if ((item.type === 'list_item') && (item.tokens.length > 0)) {
        const lst = transformTokens(item.tokens)
        lst.forEach((t) => {
          retTokens.push(t)
        })
      }
      retTokens.push({
        type: 'list_item_end'
      })
    }
    retTokens.push({
      type: 'list_end'
    })
  }
  return retTokens
}

const paragraph = (token) => {
  let retTokens = []
  retTokens.push({
    type: token.type,
    text: token.text.replace(/\n*$/, '')
  })
  if (token.tokens.length > 0) {
    const lst = transformTokens(token.tokens)
    lst.forEach((t) => {
      if (t.type === 'text' || t.type === 'em' || t.type === 'codespan' || t.type === 'link') {
      } else {
        retTokens.push(t)
      }
    })
  }
  return retTokens
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
      case 'escape': {
        break
      }
      case 'image': {
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
    delete token.raw
    delete token.orig
    retTokens.push(token)
  }
  return retTokens
}

export const muyaTransformTokens = (tokens) => {
  let retTokens = transformTokens(tokens)
  retTokens = dropUnusedTokens(retTokens)
  return retTokens
}

export {
  Renderer, Lexer, Parser, Slugger
}

export default marked
