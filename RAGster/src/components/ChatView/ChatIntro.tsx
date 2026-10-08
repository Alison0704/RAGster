import styles from './ChatIntro.module.css'

function ChatIntro() {
  return (
    <div className={styles.intro}>
      <h1 className={styles.title}>How can I help you today?</h1>
      <p className={styles.description}>
        Ask about your code and RAGster replies with hints, not answers. Pick the step you're working on so the hints fit.
      </p>
    </div>
  )
}

export default ChatIntro
