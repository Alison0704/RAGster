import styles from './ChatIntro.module.css'

function ChatIntro() {
  return (
    <div className={styles.intro}>
      <h1 className={styles.title}>How can I help you today?</h1>
      <p className={styles.description}>
        I can inspect your code, answer questions about it, and give you hints to help you solve problems.
      </p>
    </div>
  )
}

export default ChatIntro
