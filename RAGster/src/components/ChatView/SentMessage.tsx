import styles from './SentMessage.module.css'

type SentMessageProps = {
  text: string
}

function SentMessage({ text }: SentMessageProps) {
  return (
    <div className={styles.message}>
      <span className={styles.author}>YOU</span>
      <p className={styles.text}>{text}</p>
    </div>
  )
}

export default SentMessage
