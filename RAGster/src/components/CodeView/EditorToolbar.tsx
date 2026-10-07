import type { InstructionStep } from '../../content/instructions'
import EditorStatus, { type CodeStatus } from './EditorStatus'
import { languageIds, languages, type LanguageId } from './hdl/registry'
import Select from './Select'
import styles from './EditorToolbar.module.css'

type EditorToolbarProps = {
  status: CodeStatus
  steps: InstructionStep[]
  step: number | null
  onStepChange: (step: number) => void
  language: LanguageId
  onLanguageChange: (language: LanguageId) => void
}

function EditorToolbar({ status, steps, step, onStepChange, language, onLanguageChange }: EditorToolbarProps) {
  return (
    <div className={styles.toolbar}>
      <div className={styles.group}>
        <EditorStatus status={status} />
        {steps.length > 0 && step !== null && (
          <Select
            className={styles.stepSelect}
            label="Instruction step you're coding for"
            value={String(step)}
            options={steps.map((s) => ({ value: String(s.number), label: `Step ${s.number} · ${s.title}` }))}
            onChange={(value) => onStepChange(Number(value))}
          />
        )}
      </div>
      <div className={styles.group}>
        {languageIds.length > 1 ? (
          <Select
            label="Language"
            value={language}
            options={languageIds.map((id) => ({ value: id, label: languages[id].label }))}
            onChange={onLanguageChange}
          />
        ) : (
          <span className={styles.meta}>{languages[language].label}</span>
        )}
        <button className={styles.runButton} type="button">
          <span className={styles.playIcon} aria-hidden="true" />
          Run lint
        </button>
      </div>
    </div>
  )
}

export default EditorToolbar
