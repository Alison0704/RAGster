import type { ReactNode } from 'react'
import styles from './Panel.module.css'

type PanelProps = {
  children: ReactNode
}

function Panel({ children }: PanelProps) {
  return <div className={styles.panel}>{children}</div>
}

export default Panel
