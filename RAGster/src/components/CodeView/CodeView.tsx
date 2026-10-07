import { useState } from 'react'
import type { InstructionStep } from '../../content/instructions'
import CodeEditor from './CodeEditor'
import type { CodeStatus } from './EditorStatus'
import EditorToolbar from './EditorToolbar'
import type { LanguageId } from './hdl/registry'
import styles from './CodeView.module.css'

type CodeViewProps = {
  steps: InstructionStep[]
  step: number | null
  onStepChange: (step: number) => void
  code: string
  language: LanguageId
  onCodeChange: (code: string) => void
  onLanguageChange: (language: LanguageId) => void
}

function CodeView({ steps, step, onStepChange, code, language, onCodeChange, onLanguageChange }: CodeViewProps) {
  // Inactive until something checks the code; Run lint will set Good or Error once it's wired up.
  const [status] = useState<CodeStatus>('inactive')

  return (
    <div className={styles.codeView}>
      <EditorToolbar
        status={status}
        steps={steps}
        step={step}
        onStepChange={onStepChange}
        language={language}
        onLanguageChange={onLanguageChange}
      />
      <div className={styles.editorBody}>
        <CodeEditor value={code} language={language} onChange={onCodeChange} />
      </div>
    </div>
  )
}

export default CodeView
