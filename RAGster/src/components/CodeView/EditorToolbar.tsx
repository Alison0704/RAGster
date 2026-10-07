import EditorStatus, { type CodeStatus } from './EditorStatus'
import { languageIds, languages, type LanguageId } from './hdl/registry'
import Select from '../Select/Select'
import type { CheckKind } from './useCodeChecks'
import styles from './EditorToolbar.module.css'

type EditorToolbarProps = {
  status: CodeStatus
  busy: CheckKind | null
  onLint: () => void
  onSimulate: () => void
  language: LanguageId
  onLanguageChange: (language: LanguageId) => void
}

function EditorToolbar({ status, busy, onLint, onSimulate, language, onLanguageChange }: EditorToolbarProps) {
  return (
    <div className={styles.toolbar}>
      <div className={styles.group}>
        <EditorStatus status={status} />
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
        <button className={styles.lintButton} type="button" onClick={onLint} disabled={busy !== null}>
          {busy === 'lint' ? 'Linting…' : 'Run lint'}
        </button>
        <button className={styles.runButton} type="button" onClick={onSimulate} disabled={busy !== null}>
          <span className={styles.playIcon} aria-hidden="true" />
          {busy === 'simulate' ? 'Simulating…' : 'Simulate'}
        </button>
      </div>
    </div>
  )
}

export default EditorToolbar
