import { useState } from 'react'
import type { InstructionStep } from '../../content/instructions'
import ChatComposer from './ChatComposer'
import ChatIntro from './ChatIntro'
import SentMessage from './SentMessage'
import styles from './ChatView.module.css'

type ChatViewProps = {
  /** The steps in the instructions, and the one the student is working on — context for the RAG model. */
  steps: InstructionStep[]
  step: number | null
  onStepChange: (step: number) => void
}

type Sent = { text: string; step: InstructionStep | undefined }

function ChatView({ steps, step, onStepChange }: ChatViewProps) {
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState<Sent | null>(null)

  function sendMessage() {
    const cleanMessage = message.trim()
    if (!cleanMessage) return
    setSent({ text: cleanMessage, step: steps.find((s) => s.number === step) })
    setMessage('')
  }

  return (
    <div className={styles.chatView}>
      <ChatIntro />
      {sent && (
        <SentMessage text={sent.text} context={sent.step && `Step ${sent.step.number} · ${sent.step.title}`} />
      )}
      <ChatComposer
        value={message}
        onChange={setMessage}
        onSubmit={sendMessage}
        steps={steps}
        step={step}
        onStepChange={onStepChange}
      />
    </div>
  )
}

export default ChatView
