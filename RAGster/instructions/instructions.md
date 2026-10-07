# Lab: Design a 4-bit Up/Down Counter in Verilog
**Goal:** Build, test, and verify a parameterized up/down counter with enable and load.

## Understand the counter

A counter is a register that changes value on each clock edge. This one counts up or down, can pause, and can be loaded with a chosen value.

Answer these before coding:
- What should the counter do when it counts up from its maximum value?
- What should it do when `load` and `en` are both high?
- Why do we use a clock edge instead of changing the value continuously?

## Step 1: Write the spec

| Item | Value |
|---|---|
| Width (`W`) | 4 (parameter) |
| Clock | single clock, rising edge |
| Reset | active-low, asynchronous, sets count to 0 |
| Priority | reset > load > enable |
| Direction | `up_down` = 1 counts up, 0 counts down |
| Overflow | wraps around (15 to 0, 0 to 15) |

## Step 2: Define the ports

Create `counter.v` and declare the module header with these signals:

| Signal | Direction | Purpose |
|---|---|---|
| `clk` | in | clock |
| `rst_n` | in | active-low reset |
| `en` | in | count enable |
| `up_down` | in | direction |
| `load` | in | load `din` into the counter |
| `din` | in | value to load |
| `count` | out | current value |

## Step 3: Write the sequential logic

Inside one `always @(posedge clk or negedge rst_n)` block, check the conditions in priority order:
1. If reset is active, set `count` to 0.
2. Else if `load` is high, set `count` to `din`.
3. Else if `en` is high, add 1 when counting up, subtract 1 when counting down.
4. Otherwise, hold the value.

*Check yourself:* Why do we use non-blocking assignments (`<=`) here?

## Step 4: Build the testbench skeleton

In the same file `counter.v`, add a second module `counter_tb`. It needs:
- A clock generator and a reset sequence.
- An instance of the counter.
- A waveform dump: `$dumpfile("dump.vcd"); $dumpvars(0, counter_tb);`

## Step 5: Add a reference model and a check task

- Write a **reference model**: a second register that follows the same rules as the counter, written separately in the testbench.
- Write a `check` task that counts errors and prints a message when a condition fails.
- Write a `run(n)` task that waits `n` clock cycles and compares `count` against the model each cycle.

## Step 6: Write the tests

| # | Test | Expected result |
|---|---|---|
| 1 | Reset | `count = 0` |
| 2 | `en = 0` for 3 cycles | value holds |
| 3 | Count up 5 cycles | `count = 5` |
| 4 | Count down 3 cycles | `count = 2` |
| 5 | Keep counting down 3 more cycles | wraps to 15 |
| 6 | Count up 1 cycle | wraps to 0 |
| 7 | `load = 1` with `en = 1` | `count = din` (load wins) |
| 8 | Pull `rst_n` low mid-count | `count = 0` immediately (async) |
| 9 | 1000 cycles of random inputs | model always matches |

End the testbench by printing `PASS` or `FAIL` with the error count, then call `$finish`.

## Step 7: Run and debug

```bash
vvp counter_sim
gtkwave dump.vcd
```

In the waveform, check that:
- `count` changes only on rising clock edges (except for reset).
- The count direction follows `up_down`.
- `load` overrides `en`.

## Step 8: Conclusion

Short answers to these questions:
  1. Why does the counter wrap around without extra code?
  2. What changes if reset is synchronous instead of asynchronous?
  3. How would you add a `max` output that goes high when `count` is 15?

---