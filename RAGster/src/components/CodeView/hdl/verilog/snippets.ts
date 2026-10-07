import type { Snippet } from '../types'

export const snippets: Snippet[] = [
  {
    label: 'module',
    detail: 'module … endmodule',
    lines: ['module ${name} (', '\tinput  ${clk},', '\toutput ${out}', ');', '\t${}', 'endmodule'],
  },
  {
    label: 'always',
    detail: 'always @(posedge clk)',
    lines: ['always @(posedge ${clk}) begin', '\t${}', 'end'],
  },
  {
    label: 'always @*',
    detail: 'combinational block',
    lines: ['always @(*) begin', '\t${}', 'end'],
  },
  {
    label: 'initial',
    detail: 'initial begin … end',
    lines: ['initial begin', '\t${}', 'end'],
  },
  {
    label: 'begin',
    detail: 'begin … end',
    lines: ['begin', '\t${}', 'end'],
  },
  {
    label: 'if',
    detail: 'if (…) begin … end',
    lines: ['if (${condition}) begin', '\t${}', 'end'],
  },
  {
    label: 'case',
    detail: 'case … endcase',
    lines: ['case (${expr})', '\t${value}: ${}', '\tdefault: ;', 'endcase'],
  },
  {
    label: 'for',
    detail: 'for loop',
    lines: ['for (${i} = 0; ${i} < ${N}; ${i} = ${i} + 1) begin', '\t${}', 'end'],
  },
  {
    label: 'generate',
    detail: 'generate for … endgenerate',
    lines: ['genvar ${g};', 'generate', '\tfor (${g} = 0; ${g} < ${N}; ${g} = ${g} + 1) begin : ${gen_block}', '\t\t${}', '\tend', 'endgenerate'],
  },
  {
    label: 'function',
    detail: 'function … endfunction',
    lines: ['function ${type} ${name};', '\tinput ${args};', '\t${}', 'endfunction'],
  },
  {
    label: 'task',
    detail: 'task … endtask',
    lines: ['task ${name};', '\tinput ${args};', '\t${}', 'endtask'],
  },
  {
    label: 'testbench',
    detail: 'testbench with VCD dump for GTKWave',
    lines: [
      '`timescale 1ns / 1ps',
      '',
      'module ${dut}_tb;',
      '\treg clk = 0;',
      '\talways #5 clk = ~clk;',
      '',
      '\tinitial begin',
      '\t\t$dumpfile("${dut}_tb.vcd");',
      '\t\t$dumpvars(0, ${dut}_tb);',
      '\t\t${}',
      '\t\t#100 $finish;',
      '\tend',
      'endmodule',
    ],
  },
]
