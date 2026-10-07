import CircuitMark from '../CircuitMark/CircuitMark'
import StatusDot from '../StatusDot/StatusDot'
import styles from './TopBar.module.css'

function TopBar() {
  return (
    <header className={styles.topBar}>
      <div className={styles.brand}>
        <CircuitMark />
        <div>
          <span className={styles.eyebrow}>RAG System model for Students learn Digital design</span>
          <p className={styles.brandName}>RAGster</p>
        </div>
      </div>
    </header>
  )
}

export default TopBar
