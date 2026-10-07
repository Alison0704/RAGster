import type { ReactNode } from 'react'
import styles from './TabBar.module.css'

export type Tab = 'howto' | 'instructions' | 'code' | 'chat'

const tabs: { id: Tab; label: string; shortLabel: string; shortcut: string; icon: ReactNode }[] = [
  {
    id: 'howto',
    label: 'How to use',
    shortLabel: 'Help',
    shortcut: '00',
    icon: <span className={styles.tabIcon} aria-hidden="true">?</span>,
  },
  {
    id: 'instructions',
    label: 'Instructions',
    shortLabel: 'Tasks',
    shortcut: '01',
    icon: <span className={`${styles.tabIcon} ${styles.guideIcon}`} aria-hidden="true" />,
  },
  {
    id: 'code',
    label: 'Code workspace',
    shortLabel: 'Code',
    shortcut: '02',
    icon: <span className={styles.tabIcon} aria-hidden="true">&lt;/&gt;</span>,
  },
  {
    id: 'chat',
    label: 'Neural chat',
    shortLabel: 'Chat',
    shortcut: '03',
    icon: <span className={`${styles.tabIcon} ${styles.chatIcon}`} aria-hidden="true" />,
  },
]

type TabBarProps = {
  activeTab: Tab
  onChange: (tab: Tab) => void
}

function TabBar({ activeTab, onChange }: TabBarProps) {
  return (
    <nav className={styles.tabBar} aria-label="Workspace views">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={tab.id === activeTab ? `${styles.tab} ${styles.active}` : styles.tab}
          onClick={() => onChange(tab.id)}
          type="button"
          aria-pressed={tab.id === activeTab}
        >
          {tab.icon}
          <span className={styles.label}>{tab.label}</span>
          <span className={styles.shortLabel}>{tab.shortLabel}</span>
          <span className={styles.tabKey}>{tab.shortcut}</span>
        </button>
      ))}
    </nav>
  )
}

export default TabBar
