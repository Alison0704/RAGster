// The Instructions tab shows exactly one file: <project>/instructions/instructions.md.
// Editing it is the only way to change the tab. A missing or empty file shows the empty state.
const files = import.meta.glob<string>('/instructions/instructions.md', { query: '?raw', import: 'default', eager: true })

const content = Object.values(files)[0] ?? ''

export const instructions: string | null = content.trim() ? content : null
