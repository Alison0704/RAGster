import type { Builtin } from '../types'

const words = (list: string) => list.trim().split(/\s+/)

/** IEEE 1364-2005 reserved words. */
export const verilogKeywords = words(`
  always and assign automatic begin buf bufif0 bufif1 case casex casez cell cmos config deassign default
  defparam design disable edge else end endcase endconfig endfunction endgenerate endmodule endprimitive
  endspecify endtable endtask event for force forever fork function generate genvar highz0 highz1 if ifnone
  incdir include initial inout input instance integer join large liblist library localparam macromodule medium
  module nand negedge nmos nor noshowcancelled not notif0 notif1 or output parameter pmos posedge primitive
  pull0 pull1 pulldown pullup pulsestyle_ondetect pulsestyle_onevent rcmos real realtime reg release repeat
  rnmos rpmos rtran rtranif0 rtranif1 scalared showcancelled signed small specify specparam strong0 strong1
  supply0 supply1 table task time tran tranif0 tranif1 tri tri0 tri1 triand trior trireg unsigned use uwire
  vectored wait wand weak0 weak1 while wire wor xnor xor
`)

/** Keywords that name a data or net type; highlighted and completed as types. */
export const typeKeywords = new Set(words(`
  wire reg tri tri0 tri1 triand trior trireg wand wor uwire supply0 supply1 integer real realtime time event
  genvar signed unsigned
`))

export const systemTasks: Builtin[] = [
  { name: '$display', info: 'Print formatted text followed by a newline.' },
  { name: '$write', info: 'Print formatted text without a trailing newline.' },
  { name: '$strobe', info: 'Print formatted text at the end of the current time step.' },
  { name: '$monitor', info: 'Print whenever any argument changes value.' },
  { name: '$time', info: 'Current simulation time as a 64-bit integer.' },
  { name: '$realtime', info: 'Current simulation time as a real number.' },
  { name: '$finish', info: 'End the simulation.' },
  { name: '$stop', info: 'Suspend the simulation.' },
  { name: '$random', info: 'Signed 32-bit pseudo-random number.' },
  { name: '$signed', info: 'Reinterpret an expression as signed.' },
  { name: '$unsigned', info: 'Reinterpret an expression as unsigned.' },
  { name: '$clog2', info: 'Ceiling of log base 2 — handy for sizing address buses.' },
  { name: '$readmemh', info: 'Load a memory from a file of hex values.' },
  { name: '$readmemb', info: 'Load a memory from a file of binary values.' },
  { name: '$dumpfile', info: 'Name the VCD file to write (open it in GTKWave).' },
  { name: '$dumpvars', info: 'Choose which signals are recorded in the VCD file.' },
  { name: '$fopen', info: 'Open a file and return its descriptor.' },
  { name: '$fclose', info: 'Close a file descriptor.' },
  { name: '$fdisplay', info: 'Write a formatted line to a file.' },
  { name: '$fwrite', info: 'Write formatted text to a file without a newline.' },
]

export const compilerDirectives: Builtin[] = [
  { name: '`timescale', info: 'Set the time unit and precision, e.g. `timescale 1ns / 1ps.' },
  { name: '`define', info: 'Define a text macro.' },
  { name: '`undef', info: 'Remove a macro definition.' },
  { name: '`include', info: 'Insert the contents of another file.' },
  { name: '`ifdef', info: 'Compile the following code only if a macro is defined.' },
  { name: '`ifndef', info: 'Compile the following code only if a macro is not defined.' },
  { name: '`elsif', info: 'Else-if branch of a conditional compilation block.' },
  { name: '`else', info: 'Else branch of a conditional compilation block.' },
  { name: '`endif', info: 'End a conditional compilation block.' },
  { name: '`default_nettype', info: 'Set the net type for implicit declarations — use `none` to catch typos.' },
  { name: '`resetall', info: 'Reset all compiler directives to their defaults.' },
]
