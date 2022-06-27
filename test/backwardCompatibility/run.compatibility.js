import fs from 'fs'
import path from 'path'
import { Lexer as oldLexer } from '../../oldsrc/muya/lib/parser/marked'
import { Lexer as newLexer } from '../../src/muya/lib/parser/marked'

const loadMarkdownContent = pathname => {
  // Load file and ensure LF line endings.
  return fs.readFileSync(path.resolve('test/unit/data', pathname), 'utf-8').replace(/(?:\r\n|\n)/g, '\n')
}


// save tokentree as json file.
const saveTokentrees = function(name,markdownStr) {
  const options = {
    disableInline: true,
    footnote: false,
    isGitlabCompatibilityEnabled: false,
    superSubScript: false
  }

  const tokensByOld = new oldLexer(options).lex(markdownStr)
  const tokensByNew = new newLexer(options).lex(markdownStr)

  const basePath = 'test/backwardCompatibility/tokentree'
  const strOld = JSON.stringify(tokensByOld,null,' ')
  fs.writeFileSync(path.resolve(basePath,name + ".old.json"),strOld)
  const strNew = JSON.stringify(tokensByNew,null,' ')
  fs.writeFileSync(path.resolve(basePath,name + ".new.json"),strNew)
}

// loading
export const BasicTextFormattingTemplate = () => {
  return loadMarkdownContent('common/BasicTextFormatting.md')
}
export const HeadingsTemplate = () => {
  return loadMarkdownContent('common/Headings.md')
}

// save results
saveTokentrees('basictextformatting',BasicTextFormattingTemplate())
saveTokentrees('headings',HeadingsTemplate())
