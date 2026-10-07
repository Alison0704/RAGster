import type { Tab } from '../TabBar/TabBar'
import WorkflowStep, { type Step } from './WorkflowStep'
import styles from './HowToView.module.css'

const steps: Step[] = [
  {
    title: 'Read the instructions',
    body: (
      <>
        Start in the <strong>Instructions</strong> tab. It holds the assignment your instructor wrote — what to
        build, the requirements it has to meet, and what to hand in.
      </>
    ),
    action: { tab: 'instructions', label: 'Open instructions' },
  },
  {
    title: 'Write your design',
    body: (
      <>
        Write your <strong>Verilog</strong> in the Code workspace — suggestions appear as you type. Type{' '}
        <code>$</code> for system tasks like <code>$display</code>, or{' '}
        <code>`</code> for directives like <code>`timescale</code>. Snippets such as <code>module</code>,{' '}
        <code>always</code> and <code>case</code> fill in the structure — press Tab to jump between the blanks.
      </>
    ),
    action: { tab: 'code', label: 'Open code workspace' },
  },
  {
    title: 'Ask for a hint',
    body: (
      <>
        In Neural chat, describe what you're stuck on. RAGster answers with hints and guiding questions, not
        finished code. If you really need the full solution, ask for it directly.
      </>
    ),
    action: { tab: 'chat', label: 'Open neural chat' },
  },
  {
    title: 'Simulate and inspect waveforms',
    body: (
      <>
        Type <code>testbench</code> in the editor for a testbench that writes a <code>.vcd</code> file, then open
        that file in GTKWave to watch your signals change over time.
      </>
    ),
    note: 'Running simulations from RAGster is coming soon.',
  },
]

type HowToViewProps = {
  onNavigate: (tab: Tab) => void
}

function HowToView({ onNavigate }: HowToViewProps) {
  return (
    <div className={styles.howToView}>
      <div className={styles.main}>
        <div className={styles.intro}>
          <span className={styles.kicker}>Start here</span>
          <h1 className={styles.title}>How to use RAGster</h1>
          <p className={styles.description}>
            RAGster is a study partner for digital design. It won't hand you the answer — it points you toward it,
            so the understanding is yours. Work through these steps in order.
          </p>
        </div>

        <ol className={styles.steps}>
          {steps.map((step, index) => (
            <WorkflowStep key={step.title} index={index + 1} step={step} onNavigate={onNavigate} />
          ))}
        </ol>
      </div>
    </div>
  )
}

export default HowToView
