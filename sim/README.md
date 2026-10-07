# Simulation service

Compiles and simulates the code from RAGster's Code workspace with Icarus Verilog, then opens the waveform in
GTKWave. GTKWave runs inside this Docker container and draws its window on the Mac through **XQuartz**.

### When Run lint is pressed
```
[What the container runs] iverilog -g2005 -Wall
```
Status shows Good or Error; compiler messages appear below the editor.

### When Simulate is pressed
```
[What the container runs] `iverilog`, then `vvp` 
```
 Testbench output (PASS/FAIL) appears below the editor, and GTKWave opens the `.vcd` in XQuartz.


Each run gets its own folder inside the container (`/runs/<id>/`), and the testbench's `$dumpfile` is written there.
`/runs` is in memory and is cleared when the container restarts; runs older than an hour are removed automatically.

## One-time setup (macOS only)

1. **Install XQuartz** from [xquartz.org](https://www.xquartz.org), then log out and back in.
2. **Allow connections from Docker.** Open XQuartz → *Settings* → *Security* and tick
   **Allow connections from network clients**. Quit and reopen XQuartz.
3. **Let local containers draw windows.** With XQuartz running, in Terminal:

   ```bash
   xhost +localhost
   ```

   This allows connections from this Mac only. It resets when XQuartz restarts, so run it again after a restart.

## Running it

```bash
# XQuartz must be running first
open -a XQuartz
xhost +localhost

# from the repo root
docker compose up -d sim

# in RAGster/
npm run dev
```

Vite forwards `/api/sim` to the container on port 8001 (see `RAGster/vite.config.ts`).
