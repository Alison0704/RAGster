import type { Language } from '@codemirror/language'

export type Builtin = { name: string; info: string }

/** Snippet syntax: ${name} is a tab stop with placeholder text, ${} is where the cursor ends up. */
export type Snippet = { label: string; detail: string; lines: string[] }

/** Everything the code workspace needs to support one language. See docs/adding-languages.md. */
export type LanguageDefinition = {
  /** Shown in the language menu. */
  label: string
  /** File extension, without the dot. */
  extension: string
  /** CodeMirror language: tokenizing for highlighting, indentation, comment syntax. */
  language: Language
  /** Reserved words, offered as completions. */
  keywords: readonly string[]
  /** Keywords that name a type; completed with a type icon. */
  typeKeywords: ReadonlySet<string>
  /** Block templates, offered alongside keywords. A snippet replaces a keyword with the same label. */
  snippets: readonly Snippet[]
  /** Matches identifiers, used to suggest names already in the document. Must have the `g` flag. */
  identifier: RegExp
  /** Offered after typing `$`. */
  systemTasks?: readonly Builtin[]
  /** Offered after typing a backtick. */
  directives?: readonly Builtin[]
  /** Finds user-defined macros (offered after a backtick). Needs the `g` flag and one capture group for the name. */
  macroDefinition?: RegExp
}
