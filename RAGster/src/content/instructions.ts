const files = import.meta.glob<string>('/instructions/instructions.md', { query: '?raw', import: 'default', eager: true })

const content = Object.values(files)[0] ?? ''

export const instructions: string | null = content.trim() ? content : null

export type InstructionStep = { number: number; title: string }

export const instructionSteps: InstructionStep[] = [...content.matchAll(/^##\s+Step\s+(\d+)\s*[:.–—-]\s*(.+?)\s*$/gim)].map(
  ([, number, title]) => ({ number: Number(number), title }),
)
