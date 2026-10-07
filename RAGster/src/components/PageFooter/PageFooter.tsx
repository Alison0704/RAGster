import styles from './PageFooter.module.css'

function PageFooter() {
  return (
    <footer className={styles.pageFooter}>
      <span>RAGster Interface</span>
      <span className={styles.line} />
      <span className={styles.secondary}>Educational coding environment</span>
      <span>v0.0.1</span>
    </footer>
  )
}

export default PageFooter
