"""Compiles and simulates Verilog from the code workspace, and opens the waveform in GTKWave.

POST /api/sim/lint  {code}  -> compile only (iverilog)
POST /api/sim/run   {code}  -> compile, simulate (vvp), then open the .vcd in GTKWave on $DISPLAY
"""

import os
import shutil
import subprocess
import time
import uuid
from pathlib import Path

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

RUNS = Path(os.environ.get("RUNS_DIR", "/runs"))
TIMEOUT_S = 10
MAX_CODE_BYTES = 200_000
KEEP_RUNS_S = 60 * 60

app = FastAPI()
viewer: subprocess.Popen | None = None  # the GTKWave window currently open


class Code(BaseModel):
    code: str


def run(cmd: list[str], cwd: Path) -> tuple[int, str]:
    try:
        result = subprocess.run(
            cmd, cwd=cwd, stdin=subprocess.DEVNULL, capture_output=True, text=True, timeout=TIMEOUT_S
        )
        return result.returncode, result.stdout + result.stderr
    except subprocess.TimeoutExpired:
        return -1, f"Stopped after {TIMEOUT_S} s. Does your testbench call $finish?"


def prepare(code: str) -> Path:
    if len(code.encode()) > MAX_CODE_BYTES:
        raise HTTPException(413, "Code is too large.")
    # Remove runs older than an hour.
    for old in RUNS.glob("*"):
        if old.is_dir() and time.time() - old.stat().st_mtime > KEEP_RUNS_S:
            shutil.rmtree(old, ignore_errors=True)
    folder = RUNS / uuid.uuid4().hex
    folder.mkdir(parents=True)
    (folder / "design.v").write_text(code)
    return folder


def compile_design(folder: Path) -> tuple[bool, str]:
    code, log = run(["iverilog", "-g2005", "-Wall", "-o", "sim", "design.v"], folder)
    return code == 0, log


def open_waveform(vcd: Path) -> tuple[bool, str]:
    """Open the VCD in GTKWave on $DISPLAY (XQuartz), replacing any window already open."""
    global viewer
    if viewer and viewer.poll() is None:
        viewer.terminate()
    viewer = subprocess.Popen(
        ["gtkwave", vcd.name], cwd=vcd.parent, stdin=subprocess.DEVNULL,
        stdout=subprocess.DEVNULL, stderr=subprocess.PIPE, text=True,
    )
    # GTKWave exits within a moment if it can't reach the X server.
    time.sleep(1.5)
    if viewer.poll() is not None:
        error = (viewer.stderr.read() if viewer.stderr else "").strip().splitlines()
        return False, error[-1] if error else "GTKWave exited immediately."
    return True, ""


@app.post("/api/sim/lint")
def lint(body: Code):
    folder = prepare(body.code)
    ok, log = compile_design(folder)
    return {"ok": ok, "stage": "compile", "log": log}


@app.post("/api/sim/run")
def simulate(body: Code):
    folder = prepare(body.code)
    ok, log = compile_design(folder)
    if not ok:
        return {"ok": False, "stage": "compile", "log": log, "waveform": "none"}

    # -n: treat $stop like $finish so the simulator never waits for interactive input.
    code, out = run(["vvp", "-n", "sim"], folder)
    passed = code == 0 and "FAIL" not in out

    # $dumpfile can use any name, so open whichever .vcd the testbench wrote.
    vcds = sorted(folder.glob("*.vcd"), key=lambda p: p.stat().st_mtime)
    if not vcds:
        return {"ok": passed, "stage": "simulate", "log": out, "waveform": "none"}

    opened, error = open_waveform(vcds[-1])
    return {
        "ok": passed,
        "stage": "simulate",
        "log": out,
        "waveform": "opened" if opened else "failed",
        "waveformError": error,
    }
