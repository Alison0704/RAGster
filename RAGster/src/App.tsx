import { useState } from 'react'
import Background from './components/Background/Background'
import ChatView from './components/ChatView/ChatView'
import { useChat } from './components/ChatView/useChat'
import CodeView from './components/CodeView/CodeView'
import HowToView from './components/HowToView/HowToView'
import InstructionsView from './components/InstructionsView/InstructionsView'
import { useHdlDocument } from './components/CodeView/hdl/useHdlDocument'
import { useCodeChecks } from './components/CodeView/useCodeChecks'
import { instructionSteps } from './content/instructions'
import PageFooter from './components/PageFooter/PageFooter'
import Panel from './components/Panel/Panel'
import TabBar, { type Tab } from './components/TabBar/TabBar'
import TopBar from './components/TopBar/TopBar'
import styles from './App.module.css'

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('howto')
  const { code, setCode, language, setLanguage } = useHdlDocument()
  // The instruction step the student says they're working on; later sent with chat questions.
  const [step, setStep] = useState(instructionSteps[0]?.number ?? null)
  const checks = useCodeChecks()
  const chat = useChat()

  return (
    <main className={styles.appShell}>
      <Background />

      <section className={styles.workspace}>
        <TopBar />
        <TabBar activeTab={activeTab} onChange={setActiveTab} />
        <Panel>
          {activeTab === 'howto' && <HowToView onNavigate={setActiveTab} />}
          {activeTab === 'instructions' && <InstructionsView />}
          {activeTab === 'code' && (
            <CodeView
              code={code}
              language={language}
              onCodeChange={setCode}
              onLanguageChange={setLanguage}
              checks={checks}
            />
          )}
          {activeTab === 'chat' && (
            <ChatView
              chat={chat}
              code={code}
              language={language}
              steps={instructionSteps}
              step={step}
              onStepChange={setStep}
            />
          )}
        </Panel>
        <PageFooter />
      </section>
    </main>
  )
}

export default App
