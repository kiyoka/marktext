import { shell, Menu } from 'electron'
import fs from 'fs'
import path from 'path'
import log from 'electron-log'
import isAccelerator from 'electron-is-accelerator'
import electronLocalshortcut from '@hfelix/electron-localshortcut'
import { isFile2 } from 'common/filesystem'
import { isLinux, isOsx } from '../config'
import { getKeyboardLanguage, getVirtualLetters } from '../keyboard'
import keybindingsDarwin from './keybindingsDarwin'
import keybindingsLinux from './keybindingsLinux'
import keybindingsWindows from './keybindingsWindows'

// Problematic key bindings:
//   Aidou: Ctrl+/ -> dead key
//   Inline Code: Ctrl+` -> dead key
//   Upgrade Heading: Ctrl+= -> points to Ctrl+Plus which is ok; Ctrl+Plus is broken

class Keybindings {
  /**
   * @param {string} userDataPath The user data path.
   */
  constructor (userDataPath) {
    this.configPath = path.join(userDataPath, 'keybindings.json')

    this.keys = this._getOsKeyMap()

    // Fix non-US keyboards
    this.mnemonics = new Map()
    this._fixLayout()

    // Load user-defined keybindings
    this._loadLocalKeybindings()
  }

  getAccelerator (id) {
    const name = this.keys.get(id)
    if (!name) {
      return ''
    }
    return name
  }

  registerKeyHandlers (win, acceleratorMap) {
    for (const item of acceleratorMap) {
      let { accelerator } = item

      // Fix broken shortcuts because of dead keys or non-US keyboard problems. We bind the
      // shortcut to another accelerator because of key mapping issues. E.g: 'Alt+/' is not
      // available on a German keyboard, because you have to press 'Shift+7' to produce '/'.
      // In this case we can remap the accelerator to 'Alt+7' or 'Ctrl+Shift+7'.
      const acceleratorFix = this.mnemonics.get(accelerator)
      if (acceleratorFix) {
        accelerator = acceleratorFix
      }

      // Regisiter shortcuts on the BrowserWindow instead of using Chromium's native menu.
      // This makes it possible to receive key down events before Chromium/Electron and we
      // can handle reserved Chromium shortcuts. Afterwards prevent the default action of
      // the event so the native menu is not triggered.
      electronLocalshortcut.register(win, accelerator, () => {
        if (global.MARKTEXT_DEBUG && process.env.MARKTEXT_DEBUG_KEYBOARD) {
          console.log(`You pressed ${accelerator}`)
        }
        callMenuCallback(item, win)
        return true // prevent default action
      })
    }
  }

  openConfigInFileManager () {
    const { configPath } = this
    if (!isFile2(configPath)) {
      fs.writeFileSync(configPath, '{\n\n\n}\n', 'utf-8')
    }
    shell.openPath(configPath)
      .catch(err => console.error(err))
  }

  // --- private --------------------------------

  _getOsKeyMap () {
    if (isOsx) {
      return keybindingsDarwin
    } else if (isLinux) {
      return keybindingsLinux
    }
    return keybindingsWindows
  }

  _fixLayout () {
    // Fix wrong virtual key mapping on non-QWERTY layouts
    electronLocalshortcut.updateVirtualKeys(getVirtualLetters())

    // Fix broken shortcuts and dead keys
    const lang = getKeyboardLanguage()
    switch (lang) {
      // Fix aidou and inline code
      case 'ch':
      case 'de':
      case 'dk':
      case 'fi':
      case 'no':
      case 'se':
        this._fixInlineCode()

        if (!isOsx) {
          this._fixAidou()
        }
        break

      // Fix aidou only
      case 'es':
      case 'fr':
      case 'hr':
      case 'it':
      case 'pl':
      case 'pt':
        if (!isOsx) {
          this._fixAidou()
        }
        break

      // Custom layouts
      case 'bg':
        if (!isOsx) {
          this.mnemonics.set('CmdOrCtrl+/', 'CmdOrCtrl+8')
          this._fixInlineCode()
        }
        break
    }
  }

  _fixAidou () {
    this.mnemonics.set('CmdOrCtrl+/', 'CmdOrCtrl+7')
  }

  // Fix dead backquote key on layouts like German
  _fixInlineCode () {
    if (isOsx) {
      this.keys.set('format.inline-code', 'Cmd+Shift+B')
    } else {
      this.keys.set('format.inline-code', 'Ctrl+Alt+B')
    }
  }

  _loadLocalKeybindings () {
    if (global.MARKTEXT_SAFE_MODE || !isFile2(this.configPath)) {
      console.log('Ignoring key bindings because safe mode is enabled.')
      return
    }

    let json
    try {
      json = JSON.parse(fs.readFileSync(this.configPath, 'utf8'))
    } catch (_) {
      json = null
    }
    if (!json || typeof json !== 'object') {
      log.warn('Invalid keybindings.json configuration.')
      return
    }

    // keybindings.json example:
    // {
    //   "file.save": "CmdOrCtrl+S",
    //   "file.save-as": "CmdOrCtrl+Shift+S"
    // }

    const userAccelerators = new Map()
    for (const key in json) {
      if (this.keys.has(key)) {
        const value = json[key]
        if (typeof value === 'string') {
          if (value.length === 0) {
            // Unset key
            userAccelerators.set(key, '')
          } else if (isAccelerator(value)) {
            userAccelerators.set(key, value)
          }
        }
      }
    }

    // Check for duplicate user shortcuts
    for (const [keyA, valueA] of userAccelerators) {
      for (const [keyB, valueB] of userAccelerators) {
        if (valueA !== '' && keyA !== keyB && this._isEqualAccelerator(valueA, valueB)) {
          const err = `Invalid keybindings.json configuration: Duplicate value for "${keyA}" and "${keyB}"!`
          console.log(err)
          log.error(err)
          return
        }
      }
    }

    if (userAccelerators.size === 0) {
      return
    }

    // Deep clone shortcuts
    const accelerators = new Map(this.keys)

    // Check for duplicate shortcuts
    for (const [userKey, userValue] of userAccelerators) {
      for (const [key, value] of accelerators) {
        if (this._isEqualAccelerator(value, userValue)) {
          // Unset default key
          accelerators.set(key, '')

          // A accelerator should only exist once in the default map.
          break
        }
      }
      accelerators.set(userKey, userValue)
    }

    // Update key bindings
    this.keys = accelerators
  }

  _isEqualAccelerator (a, b) {
    a = a.toLowerCase().replace('cmdorctrl', 'ctrl').replace('command', 'ctrl')
    b = b.toLowerCase().replace('cmdorctrl', 'ctrl').replace('command', 'ctrl')
    const i1 = a.indexOf('+')
    const i2 = b.indexOf('+')
    if (i1 === -1 && i2 === -1) {
      return a === b
    } else if (i1 === -1 || i2 === -1) {
      return false
    }

    const keysA = a.split('+')
    const keysB = b.split('+')
    if (keysA.length !== keysB.length) {
      return false
    }

    const intersection = new Set([...keysA, ...keysB])
    return intersection.size === keysB.length
  }
}

export const parseMenu = menuTemplate => {
  const { submenu, accelerator, click, id, visible } = menuTemplate
  const items = []
  if (Array.isArray(menuTemplate)) {
    for (const item of menuTemplate) {
      const subitems = parseMenu(item)
      if (subitems) items.push(...subitems)
    }
  } else if (submenu) {
    const subitems = parseMenu(submenu)
    if (subitems) items.push(...subitems)
  } else if ((visible === undefined || visible) && accelerator && click) {
    items.push({
      accelerator,
      click,
      id // may be null
    })
  }
  return items.length === 0 ? null : items
}

const callMenuCallback = (menuInfo, win) => {
  const { click, id } = menuInfo
  if (click) {
    let menuItem = null
    if (id) {
      const menus = Menu.getApplicationMenu()
      menuItem = menus.getMenuItemById(id)
    }

    // Allow all shortcuts/menus without id and only enabled menus with id (GH#980).
    if (!menuItem || menuItem.enabled !== false) {
      click(menuItem, win)
    }
  } else {
    console.error('ERROR: callback function is not defined.')
  }
}

export default Keybindings
