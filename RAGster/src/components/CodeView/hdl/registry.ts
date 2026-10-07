import type { LanguageDefinition } from './types'
import { verilog } from './verilog'

/** Every language the code workspace supports. The language menu appears once there are two or more. */
export const languages = { verilog } satisfies Record<string, LanguageDefinition>

export type LanguageId = keyof typeof languages

export const languageIds = Object.keys(languages) as LanguageId[]

export const defaultLanguage: LanguageId = 'verilog'
