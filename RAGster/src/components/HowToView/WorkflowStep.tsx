import type { ReactNode } from 'react'
import type { Tab } from '../TabBar/TabBar'
import styles from './WorkflowStep.module.css'

export type Step = {
  title: string
  body: ReactNode
  action?: { tab: Tab; label: string }
  note?: string
}

type WorkflowStepProps = {
  index: number
  step: Step
  onNavigate: (tab: Tab) => void
}

function WorkflowStep({ index, step, onNavigate }: WorkflowStepProps) {
  return (
    <li className={styles.step}>
      <span className={styles.index}>{String(index).padStart(2, '0')}</span>
      <h2 className={styles.title}>{step.title}</h2>
      <p className={styles.body}>{step.body}</p>
      {step.note && <p className={styles.note}>{step.note}</p>}
      {step.action && (
        <button className={styles.action} type="button" onClick={() => onNavigate(step.action!.tab)}>
          {step.action.label}
          <span aria-hidden="true">→</span>
        </button>
      )}
    </li>
  )
}

export default WorkflowStep
