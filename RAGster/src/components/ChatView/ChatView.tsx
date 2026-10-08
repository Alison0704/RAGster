import { useEffect, useRef, useState } from 'react'
import type { InstructionStep } from '../../content/instructions'
import ChatComposer from './ChatComposer'
import ChatIntro from './ChatIntro'
import SentMessage from './SentMessage'
import TutorMessage from './TutorMessage'
import type { Chat } from './useChat'
import styles from './ChatView.module.css'

type ChatViewProps = {
  chat: Chat
  /** Sent with every question so the RAG model sees what the student is working on. */
  code: string
  language: string
  steps: InstructionStep[]
  step: number | null
  onStepChange: (step: number) => void
}

function ChatView({ chat, code, language, steps, step, onStepChange }: ChatViewProps) {
  const [message, setMessage] = useState('')
  const endRef = useRef<HTMLDivElement>(null)

  // Follow the reply as it's written.
  const lastText = chat.entries.at(-1)?.text
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' })
  }, [chat.entries.length, lastText])

  function sendMessage() {
    const cleanMessage = message.trim()
    if (!cleanMessage || chat.pending) return
    const current = steps.find((s) => s.number === step)
    chat.ask(
      { message: cleanMessage, code, language, step: current ? { number: current.number, title: current.title } : null },
      current && `Step ${current.number} · ${current.title}`,
    )
    setMessage('')
  }

  return (
    <div className={styles.chatView}>
      {chat.entries.length === 0 && <ChatIntro />}
      <div className={styles.conversation}>
        {chat.entries.map((entry) =>
          entry.role === 'student' ? (
            <SentMessage key={entry.id} text={entry.text} context={entry.context} />
          ) : (
            <TutorMessage
              key={entry.id}
              text={entry.text}
              mode={entry.mode}
              streaming={entry.streaming}
              failed={entry.failed}
            />
          ),
        )}
        <div ref={endRef} />
      </div>
      <ChatComposer
        value={message}
        onChange={setMessage}
        onSubmit={sendMessage}
        busy={chat.pending}
        steps={steps}
        step={step}
        onStepChange={onStepChange}
      />
    </div>
  )
}

export default ChatView
