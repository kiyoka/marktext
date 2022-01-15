// Key bindings for macOS.

export default new Map([
  // MarkText menu
  ['mt.hide', 'Command+H'],
  ['mt.hide-others', 'Command+Alt+H'],
  ['file.preferences', 'Command+,'], // located under MarkText menu in macOS only

  // File menu
  ['file.new-file', 'Command+N'],
  ['file.new-tab', 'Command+T'],
  ['file.open-file', 'Command+O'],
  ['file.open-folder', 'Command+Shift+O'],
  ['file.save', 'Command+S'],
  ['file.save-as', 'Command+Shift+S'],
  ['file.move-file', ''],
  ['file.rename-file', ''],
  ['file.print', ''],
  ['file.close-tab', 'Command+W'],
  ['file.close-window', 'Command+Shift+W'],
  ['file.quit', 'Command+Q'],

  // Edit menu
  ['edit.undo', 'Command+Z'],
  ['edit.redo', 'Command+Shift+Z'],
  ['edit.cut', 'Command+X'],
  ['edit.copy', 'Command+C'],
  ['edit.paste', 'Command+V'],
  ['edit.copy-as-markdown', 'Command+Shift+C'],
  ['edit.copy-as-html', ''],
  ['edit.paste-as-plaintext', 'Command+Shift+V'],
  ['edit.select-all', 'Command+A'],
  ['edit.duplicate', 'Command+Alt+D'],
  ['edit.create-paragraph', 'Shift+Command+N'],
  ['edit.delete-paragraph', 'Shift+Command+D'],
  ['edit.find', 'Command+F'],
  ['edit.find-next', 'Cmd+G'],
  ['edit.find-previous', 'Cmd+Shift+G'],
  ['edit.replace', 'Command+Alt+F'],
  ['edit.find-in-folder', 'Shift+Command+F'],
  ['edit.aidou', 'Command+/'],
  ['edit.screenshot', 'Command+Alt+A'], // macOS only

  // Paragraph menu
  ['paragraph.heading-1', 'Command+1'],
  ['paragraph.heading-2', 'Command+2'],
  ['paragraph.heading-3', 'Command+3'],
  ['paragraph.heading-4', 'Command+4'],
  ['paragraph.heading-5', 'Command+5'],
  ['paragraph.heading-6', 'Command+6'],
  ['paragraph.upgrade-heading', 'Command+='],
  ['paragraph.degrade-heading', 'Command+-'],
  ['paragraph.table', 'Command+Shift+T'],
  ['paragraph.code-fence', 'Command+Alt+C'],
  ['paragraph.quote-block', 'Command+Alt+Q'],
  ['paragraph.math-formula', 'Command+Alt+M'],
  ['paragraph.html-block', 'Command+Alt+J'],
  ['paragraph.order-list', 'Command+Alt+O'],
  ['paragraph.bullet-list', 'Command+Alt+U'],
  ['paragraph.task-list', 'Command+Alt+X'],
  ['paragraph.loose-list-item', 'Command+Alt+L'],
  ['paragraph.paragraph', 'Command+0'],
  ['paragraph.horizontal-line', 'Command+Alt+-'],
  ['paragraph.front-matter', 'Command+Alt+Y'],

  // Format menu
  ['format.strong', 'Command+B'],
  ['format.emphasis', 'Command+I'],
  ['format.underline', 'Command+U'],
  ['format.superscript', ''],
  ['format.subscript', ''],
  ['format.highlight', 'Shift+Command+H'],
  ['format.inline-code', 'Command+`'],
  ['format.inline-math', 'Shift+Command+M'],
  ['format.strike', 'Command+D'],
  ['format.hyperlink', 'Command+L'],
  ['format.image', 'Command+Shift+I'],
  ['format.clear-format', 'Shift+Command+R'],

  // Window menu
  ['window.minimize', 'Command+M'],
  ['window.toggle-always-on-top', ''],
  ['window.zoom-in', ''],
  ['window.zoom-out', ''],
  ['window.toggle-full-screen', 'Ctrl+Command+F'],

  // View menu
  ['view.command-palette', 'Command+Shift+P'],
  ['view.source-code-mode', 'Command+Alt+S'],
  ['view.typewriter-mode', 'Command+Alt+T'],
  ['view.focus-mode', 'Command+Shift+J'],
  ['view.toggle-sidebar', 'Command+J'],
  ['view.toggle-toc', 'Command+K'],
  ['view.toggle-tabbar', 'Command+Alt+B'],
  ['view.toggle-dev-tools', 'Command+Alt+I'],
  ['view.dev-reload', 'Command+Alt+R'],
  ['view.reload-images', 'Command+R'],

  // ======== Not included in application menu ========================
  ['tabs.cycle-forward', 'Ctrl+Tab'],
  ['tabs.cycle-backward', 'Ctrl+Shift+Tab'],
  ['tabs.switch-to-left', 'Command+PageUp'],
  ['tabs.switch-to-right', 'Command+PageDown'],
  ['tabs.switch-to-first', 'Ctrl+1'],
  ['tabs.switch-to-second', 'Ctrl+2'],
  ['tabs.switch-to-third', 'Ctrl+3'],
  ['tabs.switch-to-fourth', 'Ctrl+4'],
  ['tabs.switch-to-fifth', 'Ctrl+5'],
  ['tabs.switch-to-sixth', 'Ctrl+6'],
  ['tabs.switch-to-seventh', 'Ctrl+7'],
  ['tabs.switch-to-eighth', 'Ctrl+8'],
  ['tabs.switch-to-ninth', 'Ctrl+9'],
  ['tabs.switch-to-tenth', 'Ctrl+0'],
  ['file.quick-open', 'Command+P']
])
