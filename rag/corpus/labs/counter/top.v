// ---------------------------------------------------------------
// 4-bit up/down counter with enable and load /w testbench
// ---------------------------------------------------------------

// ===== Steps 2-5: the counter module =====
module counter #(
  parameter W = 4                 // Step 2: counter width
) (
  // Step 3: ports
  input              clk,
  input              rst_n,       // active-low asynchronous reset
  input              en,          // count enable
  input              up_down,     // 1 = count up, 0 = count down
  input              load,        // load din (highest priority after reset)
  input      [W-1:0] din,
  output reg [W-1:0] count
);

  // Step 4: sequential logic. 
  // Priority: reset > load > enable
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
endmodule

// ===== Steps 6-8: the testbench =====
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

  // Clock generator
  always #5 clk = ~clk;

  // Waveform dump
  initial begin
    $dumpfile("dump.vcd");
    $dumpvars(0, counter_tb);
  end

  // Reference model: what the counter should hold
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

  integer i, t9_start;

  initial begin
    // Test 1: reset
    #22 rst_n = 1;
    @(negedge clk);
    check(count === 0, "T1: reset value");

    // Test 2: hold when disabled
    run(3);
    check(count === 0, "T2: holds when en=0");

    // Test 3: count up
    en = 1; up_down = 1;
    run(5);
    check(count === 5, "T3: counted up to 5");

    // Test 4: count down
    up_down = 0;
    run(3);
    check(count === 2, "T4: counted down to 2");

    // Test 5: wrap down (0 -> 15)
    run(3);
    check(count === 15, "T5: wrapped to 15");

    // Test 6: wrap up (15 -> 0)
    up_down = 1;
    run(1);
    check(count === 0, "T6: wrapped to 0");

    // Test 7: load beats enable
    din = 4'd9; load = 1;
    run(1);
    load = 0;
    check(count === 9, "T7: loaded 9");

    // Test 8: reset mid-count
    run(2);
    @(negedge clk);
    rst_n = 0;
    #1 check(count === 0, "T8: async reset");
    @(negedge clk);
    rst_n = 1;

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
    $finish;
  end
endmodule
