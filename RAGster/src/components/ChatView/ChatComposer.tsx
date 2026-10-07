import type { FormEvent } from 'react'
import type { InstructionStep } from '../../content/instructions'
import Select from '../Select/Select'
import styles from './ChatComposer.module.css'

type ChatComposerProps = {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  steps: InstructionStep[]
  step: number | null
  onStepChange: (step: number) => void
}

function ChatComposer({ value, onChange, onSubmit, steps, step, onStepChange }: ChatComposerProps) {
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
        placeholder="Make sure you have selected the correct step above before sending your message."
        value={value}
      />
      <div className={styles.footer}>
        {steps.length > 0 && step !== null && (
          <label className={styles.context}>
            <span>Working on</span>
            <Select
              className={styles.stepSelect}
              label="Instruction step you're working on"
              value={String(step)}
              options={steps.map((s) => ({ value: String(s.number), label: `Step ${s.number} · ${s.title}` }))}
              onChange={(next) => onStepChange(Number(next))}
            />
          </label>
        )}
        <button className={styles.send} type="submit">
          Transmit
          <span className={styles.arrow} aria-hidden="true">↗</span>
        </button>
      </div>
    </form>
  )
}

export default ChatComposer
