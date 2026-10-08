import { useRef, useState } from 'react'
import { ChatServiceError, streamRag, type ChatRequest } from '../../api/chat'

export type ChatEntry =
  | { id: number; role: 'student'; text: string; context?: string }
  | { id: number; role: 'tutor'; text: string; mode?: 'hint' | 'answer'; streaming?: boolean; failed?: boolean }

type TutorEntry = Extract<ChatEntry, { role: 'tutor' }>

/** The Neural chat conversation. Lives in App so it survives tab switches. */
export function useChat() {
  const [entries, setEntries] = useState<ChatEntry[]>([])
  const [pending, setPending] = useState(false)
  const nextId = useRef(0)

  async function ask(request: ChatRequest, context?: string) {
    const studentId = nextId.current++
    const replyId = nextId.current++
    setEntries((current) => [
      ...current,
      { id: studentId, role: 'student', text: request.message, context },
      { id: replyId, role: 'tutor', text: '', streaming: true },
    ])
    setPending(true)

    const updateReply = (change: (entry: TutorEntry) => Partial<TutorEntry>) =>
      setEntries((current) =>
        current.map((entry) => (entry.id === replyId && entry.role === 'tutor' ? { ...entry, ...change(entry) } : entry)),
      )

    try {
      await streamRag(request, (event) => {
        if (event.type === 'meta') updateReply(() => ({ mode: event.mode }))
        else if (event.type === 'delta') updateReply((entry) => ({ text: entry.text + event.text }))
        else if (event.type === 'replace') updateReply(() => ({ text: event.text }))
      })
      updateReply((entry) => ({ streaming: false, text: entry.text.trim() }))
    } catch (error) {
      const text = error instanceof ChatServiceError ? error.message : String(error)
      updateReply(() => ({ text, streaming: false, failed: true }))
    } finally {
      setPending(false)
    }
  }

  return { entries, pending, ask }
}

export type Chat = ReturnType<typeof useChat>
