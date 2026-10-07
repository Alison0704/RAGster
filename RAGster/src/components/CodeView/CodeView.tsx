import CodeEditor from './CodeEditor'
import EditorToolbar from './EditorToolbar'
import type { LanguageId } from './hdl/registry'
import RunOutput from './RunOutput'
import type { CodeChecks } from './useCodeChecks'
import styles from './CodeView.module.css'

type CodeViewProps = {
  code: string
  language: LanguageId
  onCodeChange: (code: string) => void
  onLanguageChange: (language: LanguageId) => void
  checks: CodeChecks
}

function CodeView({ code, language, onCodeChange, onLanguageChange, checks }: CodeViewProps) {
  function handleCodeChange(next: string) {
    onCodeChange(next)
    checks.markStale()
  }

  return (
    <div className={styles.codeView}>
      <EditorToolbar
        status={checks.status}
        busy={checks.busy}
        onLint={() => checks.lint(code)}
        onSimulate={() => checks.simulate(code)}
        language={language}
        onLanguageChange={onLanguageChange}
      />
      <div className={styles.editorBody}>
        <CodeEditor value={code} language={language} onChange={handleCodeChange} />
      </div>
      {checks.output && <RunOutput output={checks.output} onDismiss={checks.dismissOutput} />}
    </div>
  )
}

export default CodeView
