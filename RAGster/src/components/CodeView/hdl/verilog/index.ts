import type { LanguageDefinition } from '../types'
import { compilerDirectives, systemTasks, typeKeywords, verilogKeywords } from './keywords'
import { verilogLanguage } from './language'
import { snippets } from './snippets'

export const verilog: LanguageDefinition = {
  label: 'Verilog',
  extension: 'v',
  language: verilogLanguage,
  keywords: verilogKeywords,
  typeKeywords,
  snippets,
  identifier: /[A-Za-z_][\w$]*/g,
  systemTasks,
  directives: compilerDirectives,
  macroDefinition: /`define\s+([A-Za-z_]\w*)/g,
}
