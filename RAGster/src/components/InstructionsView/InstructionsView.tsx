import { instructions } from '../../content/instructions'
import MarkdownContent from './MarkdownContent'
import styles from './InstructionsView.module.css'

function InstructionsView() {
  if (!instructions) {
    return (
      <div className={styles.empty}>
        <span className={styles.kicker}>Instructions</span>
        <h1 className={styles.emptyTitle}>No instructions yet</h1>
        <p className={styles.emptyText}>Your instructor hasn't posted anything here yet. Check back later.</p>
        <p className={styles.hint}>
          Instructors: write the instructions in <code>instructions/instructions.md</code>
        </p>
      </div>
    )
  }

  return (
    <article className={styles.page}>
      <MarkdownContent source={instructions} />
    </article>
  )
}

export default InstructionsView
