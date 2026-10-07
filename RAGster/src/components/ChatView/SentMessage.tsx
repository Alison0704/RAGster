import styles from './SentMessage.module.css'

type SentMessageProps = {
  text: string
  /** The instruction step the question was asked from. */
  context?: string
}

function SentMessage({ text, context }: SentMessageProps) {
  return (
    <div className={styles.message}>
      <span className={styles.author}>YOU</span>
      <div>
        <p className={styles.text}>{text}</p>
        {context && <p className={styles.context}>{context}</p>}
      </div>
    </div>
  )
}

export default SentMessage
