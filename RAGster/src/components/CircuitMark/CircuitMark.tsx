import styles from './CircuitMark.module.css'

function CircuitMark() {
  return (
    <div className={styles.circuitMark} aria-hidden="true">
      <img src="/favicon.svg" alt="" />
    </div>
  )
}

export default CircuitMark
