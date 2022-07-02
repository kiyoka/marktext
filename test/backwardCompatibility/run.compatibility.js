import fs from 'fs'
import path from 'path'
import { Lexer as oldLexer } from '../../oldsrc/muya/lib/parser/marked'
import { Lexer as newLexer, muyaTransformTokens } from '../../src/muya/lib/parser/marked'

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

  const tokensByOld     = new oldLexer(options).lex(markdownStr)
  const tokensByNewTemp = new newLexer(options).lex(markdownStr)
  const tokensByNew = muyaTransformTokens(tokensByNewTemp)

  const basePath = 'test/backwardCompatibility/tokentree'
  const strOld = JSON.stringify(tokensByOld,null,' ')
  fs.writeFileSync(path.resolve(basePath,name + ".old.json"),strOld)
  const strNew = JSON.stringify(tokensByNew,null,' ')
  fs.writeFileSync(path.resolve(basePath,name + ".new.json"),strNew)
}

// save results
saveTokentrees('common.BasicTextFormatting',    loadMarkdownContent('common/BasicTextFormatting.md'))
saveTokentrees('common.Blockquotes',            loadMarkdownContent('common/Blockquotes.md'))
saveTokentrees('common.CodeBlocks',             loadMarkdownContent('common/CodeBlocks.md'))
saveTokentrees('common.Escapes',                loadMarkdownContent('common/Escapes.md'))
saveTokentrees('common.Headings',               loadMarkdownContent('common/Headings.md'))
saveTokentrees('common.Images',                 loadMarkdownContent('common/Images.md'))
saveTokentrees('common.Links',                  loadMarkdownContent('common/Links.md'))
saveTokentrees('common.Lists',                  loadMarkdownContent('common/Lists.md'))
saveTokentrees('gfm.BasicTextFormatting',       loadMarkdownContent('gfm/BasicTextFormatting.md'))
saveTokentrees('gfm.Lists',                     loadMarkdownContent('gfm/Lists.md'))
saveTokentrees('gfm.Tables',                    loadMarkdownContent('gfm/Tables.md'))
