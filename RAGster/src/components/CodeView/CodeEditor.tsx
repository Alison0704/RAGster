import { useEffect, useRef } from 'react'
import { autocompletion, closeBrackets, closeBracketsKeymap, completionKeymap } from '@codemirror/autocomplete'
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands'
import { bracketMatching, indentOnInput, indentUnit } from '@codemirror/language'
import { Compartment, EditorState } from '@codemirror/state'
import {
  drawSelection,
  EditorView,
  highlightActiveLine,
  highlightActiveLineGutter,
  keymap,
  lineNumbers,
} from '@codemirror/view'
import { editorTheme } from './editorTheme'
import { completionsFor } from './hdl/completions'
import { languages, type LanguageId } from './hdl/registry'
import styles from './CodeEditor.module.css'

export type CursorPosition = { line: number; col: number }

type CodeEditorProps = {
  value: string
  language: LanguageId
  onChange: (value: string) => void
  onCursorChange?: (cursor: CursorPosition) => void
}

function languageExtensions(id: LanguageId) {
  const definition = languages[id]
  return [definition.language, autocompletion({ override: [completionsFor(definition)] })]
}

function CodeEditor({ value, language, onChange, onCursorChange }: CodeEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)
  const languageCompartment = useRef(new Compartment())
  const initialRef = useRef({ value, language })
  const callbacksRef = useRef({ onChange, onCursorChange })

  useEffect(() => {
    callbacksRef.current = { onChange, onCursorChange }
  })

  useEffect(() => {
    const view = new EditorView({
      parent: containerRef.current!,
      state: EditorState.create({
        doc: initialRef.current.value,
        extensions: [
          lineNumbers({ formatNumber: (n) => String(n).padStart(2, '0') }),
          highlightActiveLine(),
          highlightActiveLineGutter(),
          history(),
          drawSelection(),
          indentOnInput(),
          bracketMatching(),
          closeBrackets(),
          indentUnit.of('  '),
          EditorState.tabSize.of(2),
          keymap.of([...closeBracketsKeymap, ...completionKeymap, ...defaultKeymap, ...historyKeymap, indentWithTab]),
          languageCompartment.current.of(languageExtensions(initialRef.current.language)),
          editorTheme,
          EditorView.contentAttributes.of({ 'aria-label': 'Code editor' }),
          EditorView.updateListener.of((update) => {
            if (update.docChanged) callbacksRef.current.onChange(update.state.doc.toString())
            if (update.docChanged || update.selectionSet) {
              const head = update.state.selection.main.head
              const line = update.state.doc.lineAt(head)
              callbacksRef.current.onCursorChange?.({ line: line.number, col: head - line.from + 1 })
            }
          }),
        ],
      }),
    })
    viewRef.current = view

    return () => {
      view.destroy()
      viewRef.current = null
    }
  }, [])

  useEffect(() => {
    viewRef.current?.dispatch({ effects: languageCompartment.current.reconfigure(languageExtensions(language)) })
  }, [language])

  // Apply changes made outside the editor, e.g. loading previously saved code.
  useEffect(() => {
    const view = viewRef.current
    if (view && view.state.doc.toString() !== value) {
      view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: value } })
    }
  }, [value])

  return <div className={styles.codeArea} ref={containerRef} />
}

export default CodeEditor
