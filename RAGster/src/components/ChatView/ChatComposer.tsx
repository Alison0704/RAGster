import type { FormEvent } from 'react'
import styles from './ChatComposer.module.css'

type ChatComposerProps = {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
}

function ChatComposer({ value, onChange, onSubmit }: ChatComposerProps) {
  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    onSubmit()
  }

  return (
    <form className={styles.composer} onSubmit={handleSubmit}>
      <textarea
        className={styles.input}
        aria-label="Chat message"
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) onSubmit()
        }}
        placeholder="Ask about your code."
        value={value}
      />
      <div className={styles.footer}>
        <button className={styles.send} type="submit">
          Transmit
          <span className={styles.arrow} aria-hidden="true">↗</span>
        </button>
      </div>
    </form>
  )
}

export default ChatComposer
