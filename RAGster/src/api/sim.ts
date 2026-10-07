// Client for the simulation service in <repo>/sim (Icarus Verilog + GTKWave in Docker).
// In development, Vite proxies /api/sim to it (see vite.config.ts).

export type LintResponse = { ok: boolean; stage: 'compile'; log: string }

export type SimulateResponse = {
  ok: boolean
  stage: 'compile' | 'simulate'
  log: string
  /** Whether the testbench wrote a .vcd and GTKWave opened it in XQuartz. */
  waveform: 'opened' | 'failed' | 'none'
  waveformError?: string
}

export class SimServiceError extends Error {
  constructor(message = "Couldn't reach the simulation service. Start it with: docker compose up sim") {
    super(message)
  }
}

async function post<T>(path: string, code: string): Promise<T> {
  let response: Response
  try {
    response = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    })
  } catch {
    throw new SimServiceError()
  }
  if (response.status === 413) throw new SimServiceError('The code is too large to check.')
  if (!response.ok) throw new SimServiceError()
  return response.json() as Promise<T>
}

export const lintCode = (code: string) => post<LintResponse>('/api/sim/lint', code)

export const simulateCode = (code: string) => post<SimulateResponse>('/api/sim/run', code)
