import styles from './EditorStatus.module.css'

export type CodeStatus = 'inactive' | 'good' | 'error'

const labels: Record<CodeStatus, string> = {
  inactive: 'Inactive',
  good: 'Good',
  error: 'Error',
}

type EditorStatusProps = {
  status: CodeStatus
}

function EditorStatus({ status }: EditorStatusProps) {
  return (
    <span className={`${styles.status} ${styles[status]}`} role="status">
      <span className={styles.dot} aria-hidden="true" />
      <span className={styles.caption}>Status</span>
      {labels[status]}
    </span>
  )
}

export default EditorStatus
