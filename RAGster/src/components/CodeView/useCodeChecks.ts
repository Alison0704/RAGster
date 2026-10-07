import { useState } from 'react'
import { lintCode, SimServiceError, simulateCode } from '../../api/sim'
import type { CodeStatus } from './EditorStatus'

export type CheckKind = 'lint' | 'simulate'

export type CheckOutput = {
  kind: CheckKind
  tone: 'good' | 'error' | 'warning'
  title: string
  log: string
  note?: string
}

const waveformNotes = {
  opened: 'Waveform opened in GTKWave (XQuartz).',
  none: 'No waveform: add $dumpfile("dump.vcd") and $dumpvars to your testbench.',
}

/** Lint and simulation results for the code workspace. Lives in App so results survive tab switches. */
export function useCodeChecks() {
  const [status, setStatus] = useState<CodeStatus>('inactive')
  const [busy, setBusy] = useState<CheckKind | null>(null)
  const [output, setOutput] = useState<CheckOutput | null>(null)

  async function check(kind: CheckKind, code: string, task: () => Promise<CheckOutput>) {
    if (!code.trim()) {
      setOutput({ kind, tone: 'warning', title: 'Nothing to check yet', log: '', note: 'Write some Verilog first.' })
      return
    }
    setBusy(kind)
    try {
      const result = await task()
      setStatus(result.tone === 'good' ? 'good' : 'error')
      setOutput(result)
    } catch (error) {
      // The service being down says nothing about the code, so the status stays as it was.
      const message = error instanceof SimServiceError ? error.message : String(error)
      setOutput({ kind, tone: 'warning', title: 'Simulation service unavailable', log: '', note: message })
    } finally {
      setBusy(null)
    }
  }

  const lint = (code: string) =>
    check('lint', code, async () => {
      const result = await lintCode(code)
      return {
        kind: 'lint',
        tone: result.ok ? 'good' : 'error',
        title: result.ok ? 'Lint passed' : 'Lint found errors',
        log: result.log.trim() || 'No errors or warnings.',
      }
    })

  const simulate = (code: string) =>
    check('simulate', code, async () => {
      const result = await simulateCode(code)
      if (result.stage === 'compile') {
        return { kind: 'simulate', tone: 'error', title: "Simulation didn't start: compile errors", log: result.log.trim() }
      }
      return {
        kind: 'simulate',
        tone: result.ok ? 'good' : 'error',
        title: result.ok ? 'Simulation passed' : 'Simulation failed',
        log: result.log.trim() || '(no output)',
        note:
          result.waveform === 'failed'
            ? `Couldn't open GTKWave: ${result.waveformError}. Is XQuartz running and allowing connections? See sim/README.md.`
            : waveformNotes[result.waveform],
      }
    })

  /** The code changed since the last check, so its result no longer applies. */
  const markStale = () => setStatus('inactive')

  return { status, busy, output, lint, simulate, markStale, dismissOutput: () => setOutput(null) }
}

export type CodeChecks = ReturnType<typeof useCodeChecks>
