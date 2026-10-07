import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { EditorView } from '@codemirror/view'
import { tags } from '@lezer/highlight'

const accent = '#3dff83'
const activeLine = 'rgba(61, 255, 131, 0.035)'

const theme = EditorView.theme(
  {
    '&': {
      height: '100%',
      color: '#b9c4bc',
      backgroundColor: 'transparent',
      fontSize: 'clamp(11px, 1vw, 13px)',
    },
    '&.cm-focused': { outline: 'none' },
    '.cm-scroller': {
      fontFamily: 'var(--font-mono)',
      lineHeight: '25px',
    },
    '.cm-content': {
      padding: '22px 0',
      caretColor: accent,
    },
    '.cm-line': { padding: '0' },
    '.cm-cursor, .cm-dropCursor': { borderLeft: `2px solid ${accent}` },
    '&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, ::selection': {
      backgroundColor: 'rgba(61, 255, 131, 0.16)',
    },
    '.cm-activeLine': { backgroundColor: activeLine },
    '.cm-gutters': {
      backgroundColor: 'transparent',
      border: 'none',
      color: '#354239',
    },
    '.cm-lineNumbers .cm-gutterElement': {
      minWidth: '58px',
      padding: '0 20px 0 0',
      textAlign: 'right',
    },
    '.cm-activeLineGutter': {
      backgroundColor: activeLine,
      boxShadow: `inset 2px 0 ${accent}`,
      color: '#6c7e72',
    },
    '&.cm-focused .cm-matchingBracket': {
      backgroundColor: 'rgba(61, 255, 131, 0.12)',
      outline: '1px solid rgba(61, 255, 131, 0.35)',
    },
    '.cm-tooltip': {
      border: '1px solid #2c4433',
      backgroundColor: '#060b07',
      color: '#b9c4bc',
      boxShadow: '0 12px 40px rgba(0, 0, 0, 0.5)',
    },
    '.cm-tooltip-autocomplete > ul': {
      fontFamily: 'var(--font-mono)',
      fontSize: '12px',
      maxHeight: '15em',
    },
    '.cm-tooltip-autocomplete > ul > li': { padding: '2px 10px 2px 4px', lineHeight: '20px' },
    '.cm-tooltip-autocomplete > ul > li[aria-selected]': {
      backgroundColor: 'rgba(61, 255, 131, 0.12)',
      color: '#e4ece6',
    },
    '.cm-completionIcon': {
      width: '1.6em',
      paddingRight: '4px',
      color: accent,
      opacity: '0.7',
      fontSize: '10px',
      textAlign: 'center',
    },
    // The default icons are emoji, which clash with the design.
    '.cm-completionIcon-keyword:after': { content: '"kw"' },
    '.cm-completionIcon-type:after': { content: '"T"', color: '#6dc8ff' },
    '.cm-completionIcon-function:after': { content: '"$"', color: '#6dc8ff' },
    '.cm-completionIcon-constant:after': { content: '"`"', color: '#e3d27c' },
    '.cm-completionIcon-variable:after': { content: '"x"', color: '#b9c4bc' },
    '.cm-completionMatchedText': { textDecoration: 'none', color: accent },
    '.cm-completionDetail': { marginLeft: '12px', fontStyle: 'normal', color: '#526158' },
    '.cm-tooltip.cm-completionInfo': {
      maxWidth: '320px',
      padding: '8px 10px',
      fontFamily: 'var(--font-sans)',
      fontSize: '12px',
      lineHeight: '1.5',
      color: '#aab6ae',
    },
    '.cm-snippetField': { backgroundColor: 'rgba(61, 255, 131, 0.1)' },
    '@media (max-width: 760px)': {
      '&': { fontSize: '11px' },
      '.cm-lineNumbers .cm-gutterElement': { minWidth: '44px', paddingRight: '13px' },
    },
  },
  { dark: true },
)

const highlightStyle = HighlightStyle.define([
  { tag: [tags.keyword, tags.modifier, tags.controlKeyword, tags.moduleKeyword, tags.definitionKeyword], color: '#ba8cff' },
  { tag: [tags.string, tags.special(tags.string)], color: '#6ae899' },
  { tag: [tags.number, tags.bool, tags.null], color: '#e7a96b' },
  { tag: [tags.typeName, tags.className], color: '#6dc8ff' },
  { tag: tags.standard(tags.variableName), color: '#6dc8ff', fontStyle: 'italic' },
  { tag: tags.macroName, color: '#e3d27c' },
  { tag: tags.operator, color: '#8b9b90' },
  { tag: tags.comment, color: '#4a5a4f', fontStyle: 'italic' },
])

export const editorTheme = [theme, syntaxHighlighting(highlightStyle)]
