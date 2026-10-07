import { useState } from 'react'
import ChatComposer from './ChatComposer'
import ChatIntro from './ChatIntro'
import SentMessage from './SentMessage'
import styles from './ChatView.module.css'

function ChatView() {
  const [message, setMessage] = useState('')
  const [sentMessage, setSentMessage] = useState('')

  function sendMessage() {
    const cleanMessage = message.trim()
    if (!cleanMessage) return
    setSentMessage(cleanMessage)
    setMessage('')
  }

  return (
    <div className={styles.chatView}>
      <ChatIntro />
      {sentMessage && <SentMessage text={sentMessage} />}
      <ChatComposer value={message} onChange={setMessage} onSubmit={sendMessage} />
    </div>
  )
}

export default ChatView
