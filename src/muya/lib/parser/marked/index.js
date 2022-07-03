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

/**
 * Muya custom functions
 */
 const transformTokens = (tokens) => {
  let token
  let retTokens = []
  while ((token = tokens.shift())) {
    let newToken
    switch (token.type) {
      case 'heading': {
        const lh = lheading(token)
        if (lh) {
          token = lh
        }
        else {
          token = {
            'type': token.type,
            'headingStyle': 'atx',
            'depth': token.depth,
            "text": token.text
          }
        }
        break
      }
      case 'hr': {
        const marker = token.raw.replace(/\n*$/, '')
        token = {
          'type': token.type,
          'marker': marker
        }
        break
      }
      case 'code': {
        token = {
          'type': token.type,
          'codeBlockStyle': token.codeBlockStyle === 'indented' ? token.codeBlockStyle : 'fenced',
          'lang': token.lang,
          'text': token.text
        }
        break
      }
    }
    retTokens.push(token)
  }
  return retTokens
}

const dropUnusedTokens = (tokens) => {
  let retTokens = []
  let token
  while ((token = tokens.shift())) {
    delete token.tokens
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

export {
  Renderer, Lexer, Parser, Slugger
}

export default marked
