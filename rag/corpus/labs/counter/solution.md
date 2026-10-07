# Solution: 4-bit Up/Down Counter in Verilog

Everything goes in one file, `top.v`, holding both the `counter` module and the `counter_tb` testbench. Each step below shows the code to add. The complete file is [top.v](top.v), and it compiles and passes with Icarus Verilog.


## Understand the counter

- **Counting up from the maximum:** it wraps to 0. Fixed-width arithmetic does this for free.
- **`load` and `en` both high:** `load` wins, by the priority rule in the spec.
- **Why a clock edge:** the clock makes every change happen at a known instant, so the whole design stays predictable.

## Step 1: Write the spec and define the ports

```verilog
module counter #(
  parameter W = 4  // counter width
)(
  input              clk,
  input              rst_n,
  input              en,
  input              up_down,
  input              load,
  input      [W-1:0] din,
  output reg [W-1:0] count
);

// step 2

endmodule
```

``` 
Press the "Run lint" button to check for errors
```

## Step 2: Write the sequential logic

```verilog
always @(posedge clk or negedge rst_n) begin
  if (!rst_n)
    count <= 0;
  else if (load)
    count <= din;
  else if (en) begin
    if (up_down) count <= count + 1;   // wraps 15 -> 0
    else         count <= count - 1;   // wraps 0 -> 15
  end
end
```

*Answer:* non-blocking assignments make every register update at the end of the time step, so flip-flops behave like real hardware and there are no race conditions.

``` 
Press the "Run lint" button to check for errors
```

## Step 3: Build the testbench skeleton

```verilog
module counter_tb;
  localparam W = 4;

  reg          clk = 0, rst_n = 0;
  reg          en = 0, up_down = 1, load = 0;
  reg  [W-1:0] din = 0;
  wire [W-1:0] count;

  counter #(.W(W)) dut (
    .clk(clk), .rst_n(rst_n), .en(en),
    .up_down(up_down), .load(load),
    .din(din), .count(count)
  );

  always #5 clk = ~clk;

  initial begin
    $dumpfile("dump.vcd");
    $dumpvars(0, counter_tb);
    #200 $finish;
  end

    // Step 4 and 5
endmodule
```
``` 
Press the "Run lint" button to check for errors
```
``` 
Press the Simulation button, xQuartz should open up GTKWave for signal analysis.
```

## Step 4: Add a reference model and a check task
This is important for test 9 in Step 5

```verilog
  reg [W-1:0] model;
  integer errors = 0;

  always @(posedge clk or negedge rst_n) begin
    if (!rst_n)       model <= 0;
    else if (load)    model <= din;
    else if (en)      model <= up_down ? model + 1 : model - 1;
  end

  // Report one named test: PASS or FAIL
  task check(input cond, input [255:0] msg);
    if (cond)
      $display("[%0t] PASS: %0s", $time, msg);
    else begin
      errors = errors + 1;
      $display("[%0t] FAIL: %0s (count=%0d)", $time, msg, count);
    end
  endtask

  // Run n clock cycles, comparing against the model each cycle (prints only on a mismatch)
  task run(input integer n);
    integer j;
    begin
      for (j = 0; j < n; j = j + 1) begin
        @(negedge clk);
        if (count !== model) begin
          errors = errors + 1;
          $display("[%0t] FAIL: count != model (count=%0d, model=%0d)", $time, count, model);
        end
      end
    end
  endtask
  // Step 5
```

## Step 5: Write the tests

###  Step 5.1: Test 1: reset
```verilog
  integer i, t9_start;
  initial begin
  // Test 1: reset
    #22 rst_n = 1;
    @(negedge clk);
    check(count === 0, "T1: reset value");

    // the rest of the test
    $finish;
  end
```
###  Step 5.2: Test 2: hold when disabled
```verilog
//  Test 2: hold when disabled
    run(3);
    check(count === 0, "T2: holds when en=0");
```
###  Step 5.3: Test 3: count up
```verilog
// Test 3: count up
    en = 1; up_down = 1;
    run(5);
    check(count === 5, "T3: counted up to 5");
```
###  Step 5.4: Test 4: count down
```verilog
// Test 4: count down
    up_down = 0;
    run(3);
    check(count === 2, "T4: counted down to 2");
```
###  Step 5.5: Test 5: wrap down (0 -> 15)
```verilog
// Test 5: wrap down (0 -> 15)
    run(3);
    check(count === 15, "T5: wrapped to 15");
```

###  Step 5.6: Test 6: wrap up (15 -> 0)
```verilog
// Test 6: wrap up (15 -> 0)
    up_down = 1;
    run(1);
    check(count === 0, "T6: wrapped to 0");
```
###  Step 5.7: Test 7: load beats enable
```verilog
// Test 7: load beats enable
    din = 4'd9; load = 1;
    run(1);
    load = 0;
    check(count === 9, "T7: loaded 9");
```
###  Step 5.8: Test 8: reset mid-count
```verilog
// Test 8: reset mid-count
    run(2);
    @(negedge clk);
    rst_n = 0;
    #1 check(count === 0, "T8: async reset");
    @(negedge clk);
    rst_n = 1;
```
###  Step 5.8: Test 9: random inputs
```verilog
// Test 9: random inputs
    t9_start = errors;
    for (i = 0; i < 1000; i = i + 1) begin
      en = $random; up_down = $random;
      load = (($random & 7) == 0);
      din = $random;
      run(1);
    end
    check(errors == t9_start, "T9: random inputs match model");

    if (errors == 0) $display("PASS: all tests passed");
    else             $display("FAIL: %0d errors", errors);
   
```

## Step 6: Run simulation

After pressing the `Simulate` btton In GTKWave, add `clk`, `en`, `up_down`, `load`, `din`, and `count` from `counter_tb`.

## Conclusion

1. **Why it wraps:** `count` is only `W` bits wide, so `15 + 1` truncates to `0` and `0 - 1` becomes `15`.
2. **Synchronous reset:** remove `or negedge rst_n` from the sensitivity list. Reset then takes effect only at the next clock edge, and Test 8 must wait for a clock edge before checking `count`.
3. **A `max` output:**

   ```verilog
   output max;
   assign max = (count == {W{1'b1}});
   ```