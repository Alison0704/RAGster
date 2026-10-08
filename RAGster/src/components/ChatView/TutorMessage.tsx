import styles from './TutorMessage.module.css'

type TutorMessageProps = {
  text: string
  mode?: 'hint' | 'answer'
  /** Still being written: show a cursor at the end. */
  streaming?: boolean
  failed?: boolean
}

function TutorMessage({ text, mode, streaming, failed }: TutorMessageProps) {
  return (
    <div className={failed ? `${styles.message} ${styles.failed}` : styles.message}>
      <span className={styles.author}>RAGster</span>
      <div>
        <p className={styles.text} aria-busy={streaming}>
          {text || (streaming ? <span className={styles.waiting}>Thinking</span> : null)}
          {streaming && <span className={styles.cursor} aria-hidden="true" />}
        </p>
        {mode === 'answer' && <p className={styles.mode}>Full answer, as requested</p>}
      </div>
    </div>
  )
}

export default TutorMessage
