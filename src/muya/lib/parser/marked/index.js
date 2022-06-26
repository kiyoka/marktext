import { marked as upstreamMarked, Renderer, Lexer, Parser, Slugger } from 'marked'

/**
 * Marked
 */

function marked (src, opt = {}) {
  return upstreamMarked.parse(src, opt)
}

export {
  Renderer, Lexer, Parser, Slugger
}

export default marked
