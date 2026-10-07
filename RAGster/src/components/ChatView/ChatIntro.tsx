import styles from './ChatIntro.module.css'

function ChatIntro() {
  return (
    <div className={styles.intro}>
      <h1 className={styles.title}>How can I help you today?</h1>
      <p className={styles.description}>
        RAGster is a tool that allows you to interact with your own data using natural language. You can ask questions, get summaries, and more. To get started, simply type your message in the chat box below and hit "Transmit". Make sure to select the correct instruction step if applicable.
      </p>
    </div>
  )
}

export default ChatIntro
