import { marked as upstreamMarked, Renderer, Lexer, Parser, Slugger } from 'marked'

function marked (src, opt = {}) {
  return upstreamMarked.parse(src, opt)
}

/*
** Muya custom functions
*/
export const muyaTransformTokens = (tokens) => {
  let token
  let retTokens = []
  while ((token = tokens.shift())) {
    let newToken
    switch (token.type) {
      case 'heading': {
        token.headingStyle = 'atx'
        break
      }
      default:
        break
    }
    delete token.tokens
    delete token.raw
    retTokens.push(token)
  }
  return retTokens
}

export {
  Renderer, Lexer, Parser, Slugger
}

export default marked
