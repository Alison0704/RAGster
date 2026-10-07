import { StreamLanguage, type StreamParser } from '@codemirror/language'
import { verilog as verilogMode } from '@codemirror/legacy-modes/mode/verilog'
import { typeKeywords, verilogKeywords } from './keywords'

const reserved = new Set(verilogKeywords)

/**
 * Wraps CodeMirror's Verilog stream mode to give tokens finer highlight classes.
 * The base mode tags system tasks and operators both as "meta", macros and `#`
 * delays both as "def", and also knows SystemVerilog keywords, which plain
 * Verilog doesn't reserve.
 */
const parser: StreamParser<unknown> = {
  ...verilogMode,
  name: 'verilog',
  token(stream, state) {
    const style = verilogMode.token(stream, state)
    const text = stream.current()

    switch (style) {
      case 'meta':
        return text.startsWith('$') ? 'variableName.standard' : 'operator'
      case 'def':
        if (text.startsWith('`')) return 'macroName'
        if (text.startsWith('#')) return 'number'
        return style
      case 'keyword':
        if (!reserved.has(text)) return 'variable'
        return typeKeywords.has(text) ? 'typeName' : 'keyword'
      default:
        return style
    }
  },
}

export const verilogLanguage = StreamLanguage.define(parser)
