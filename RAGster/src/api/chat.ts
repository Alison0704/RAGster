// Client for the RAG service in <repo>/rag. In development, Vite proxies /api/chat to it (see vite.config.ts).
// The request shape matches rag/app/schemas.py; the events match rag/app/pipeline.py (answer_stream).

export type ChatRequest = {
  message: string
  code: string
  language: string
  step: { number: number; title: string } | null
}

export type ChatEvent =
  | { type: 'meta'; mode: 'hint' | 'answer'; sources: { document: string; section: string }[] }
  | { type: 'delta'; text: string } // the next piece of the reply
  | { type: 'replace'; text: string } // swap everything shown so far (code found, cut off, or an error)
  | { type: 'done' }

export class ChatServiceError extends Error {
  constructor(message = "Couldn't reach the RAG service. Start it with: docker compose up -d rag") {
    super(message)
  }
}

/** Sends a question and calls onEvent for each event as the reply is written. */
export async function streamRag(request: ChatRequest, onEvent: (event: ChatEvent) => void): Promise<void> {
  let response: Response
  try {
    response = await fetch('/api/chat/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    })
  } catch {
    throw new ChatServiceError()
  }
  if (response.status === 422) throw new ChatServiceError('That message is too long to send.')
  if (!response.ok || !response.body) throw new ChatServiceError()

  // One JSON event per line; a network chunk can end mid-line, so keep the unfinished part.
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  for (;;) {
    let chunk: ReadableStreamReadResult<Uint8Array>
    try {
      chunk = await reader.read()
    } catch {
      throw new ChatServiceError('The connection to the RAG service dropped. Try asking again.')
    }
    buffer += decoder.decode(chunk.value, { stream: !chunk.done })
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''
    for (const line of lines) {
      if (line.trim()) onEvent(JSON.parse(line) as ChatEvent)
    }
    if (chunk.done) return
  }
}
