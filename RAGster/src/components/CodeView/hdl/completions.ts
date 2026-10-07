import { snippetCompletion, type Completion, type CompletionSource } from '@codemirror/autocomplete'
import { syntaxTree } from '@codemirror/language'
import type { Builtin, LanguageDefinition } from './types'

const builtinOptions = (builtins: readonly Builtin[] = [], type: string): Completion[] =>
  builtins.map((builtin) => ({ label: builtin.name, info: builtin.info, type }))

/** Builds the autocomplete source for a language from its definition. */
export function completionsFor(definition: LanguageDefinition): CompletionSource {
  const keywordSet = new Set(definition.keywords)
  const snippetLabels = new Set(definition.snippets.map((snippet) => snippet.label))

  const words: Completion[] = [
    ...definition.snippets.map((snippet) =>
      snippetCompletion(snippet.lines.join('\n'), {
        label: snippet.label,
        detail: snippet.detail,
        type: 'keyword',
        boost: 1,
      }),
    ),
    ...definition.keywords
      .filter((keyword) => !snippetLabels.has(keyword))
      .map((keyword) => ({ label: keyword, type: definition.typeKeywords.has(keyword) ? 'type' : 'keyword' })),
  ]
  const systemTasks = builtinOptions(definition.systemTasks, 'function')
  const directives = builtinOptions(definition.directives, 'constant')

  /** Identifiers already used in the document (signals, modules, parameters…). */
  function documentIdentifiers(text: string, typed: string): Completion[] {
    const counts = new Map<string, number>()
    for (const [word] of text.matchAll(definition.identifier)) {
      if (!keywordSet.has(word)) counts.set(word, (counts.get(word) ?? 0) + 1)
    }
    return [...counts]
      .filter(([word, count]) => word !== typed || count > 1)
      .map(([word]) => ({ label: word, type: 'variable', boost: -1 }))
  }

  function documentMacros(text: string): Completion[] {
    if (!definition.macroDefinition) return []
    return [...text.matchAll(definition.macroDefinition)].map(([, name]) => ({
      label: '`' + name,
      type: 'constant',
      detail: 'macro',
    }))
  }

  return (context) => {
    const node = syntaxTree(context.state).resolveInner(context.pos, -1)
    if (/comment|string/.test(node.name)) return null

    const word = context.matchBefore(/[`$]?[\w$]*/)
    if (!word || (word.from === word.to && !context.explicit)) return null

    const text = context.state.doc.toString()
    switch (word.text[0]) {
      case '$':
        return systemTasks.length ? { from: word.from, options: systemTasks, validFor: /^\$[\w$]*$/ } : null
      case '`': {
        const options = [...directives, ...documentMacros(text)]
        return options.length ? { from: word.from, options, validFor: /^`\w*$/ } : null
      }
      default:
        return {
          from: word.from,
          options: [...words, ...documentIdentifiers(text, word.text)],
          validFor: /^[\w$]*$/,
        }
    }
  }
}
