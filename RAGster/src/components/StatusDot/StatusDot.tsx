import styles from './StatusDot.module.css'

type StatusDotProps = {
  className?: string
}

function StatusDot({ className }: StatusDotProps) {
  return <span className={className ? `${styles.statusDot} ${className}` : styles.statusDot} aria-hidden="true" />
}

export default StatusDot
