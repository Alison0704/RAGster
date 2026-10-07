import type { CheckOutput } from './useCodeChecks'
import styles from './RunOutput.module.css'

type RunOutputProps = {
  output: CheckOutput
  onDismiss: () => void
}

function RunOutput({ output, onDismiss }: RunOutputProps) {
  return (
    <section className={`${styles.output} ${styles[output.tone]}`} aria-label="Check output" aria-live="polite">
      <header className={styles.header}>
        <span className={styles.kind}>{output.kind === 'lint' ? 'Lint' : 'Simulation'}</span>
        <span className={styles.title}>{output.title}</span>
        <button className={styles.dismiss} type="button" onClick={onDismiss} aria-label="Close output">×</button>
      </header>
      {output.log && <pre className={styles.log}>{output.log}</pre>}
      {output.note && <p className={styles.note}>{output.note}</p>}
    </section>
  )
}

export default RunOutput
