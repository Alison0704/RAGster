import { useState } from 'react'
import { defaultLanguage, type LanguageId } from './registry'

/** The code workspace's document. Starts empty; lives above the tabs so edits survive switching views. */
export function useHdlDocument(initialLanguage: LanguageId = defaultLanguage) {
  const [language, setLanguage] = useState(initialLanguage)
  const [code, setCode] = useState('')

  return { code, setCode, language, setLanguage }
}
