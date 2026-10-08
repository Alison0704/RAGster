import re
from dataclasses import dataclass
from pathlib import Path

from .. import config


@dataclass(frozen=True)
class Passage:
    document: str        # path relative to the corpus, e.g. "labs/counter/solution.md"
    section: str         # heading the text came from, e.g. "Step 2: Write the sequential logic"
    text: str
    step: int | None = None  # instruction step this passage belongs to, if any


GENERAL_FOLDERS = ("concepts", "mistakes", "testbenches")

_HEADING = re.compile(r"^(#{1,6})\s+(.+?)\s*#*\s*$")
_FENCE = re.compile(r"^\s*(```|~~~)")
_STEP = re.compile(r"^Step\s+(\d+)", re.IGNORECASE)
_MODULE = re.compile(r"^\s*module\s+(\w+)")
_ENDMODULE = re.compile(r"^\s*endmodule\b")


def load_passages() -> list[Passage]:
    files = _source_files()
    signature = tuple((str(path), path.stat().st_mtime_ns) for path, _ in files)
    if signature != _cache["signature"]:
        _cache["passages"] = [p for path, name in files for p in _split_file(path, name)]
        _cache["signature"] = signature
    return _cache["passages"]


_cache: dict = {"signature": None, "passages": []}


# --- Finding the files -------------------------------------------------------------------------

def _source_files() -> list[tuple[Path, str]]:
    """(path on disk, name shown in Passage.document) for every file to index, in a stable order."""
    files: list[tuple[Path, str]] = []
    for folder in (f"labs/{config.LAB}", *GENERAL_FOLDERS):
        root = config.CORPUS_DIR / folder
        if root.is_dir():
            for path in sorted(root.rglob("*")):
                if path.is_file() and path.suffix in (".md", ".v"):
                    files.append((path, str(path.relative_to(config.CORPUS_DIR))))
    if config.INSTRUCTIONS_PATH.is_file():
        files.append((config.INSTRUCTIONS_PATH, "instructions.md"))
    return files


def _split_file(path: Path, name: str) -> list[Passage]:
    text = path.read_text(encoding="utf-8")
    if path.suffix == ".v":
        return split_verilog(text, name)
    return split_markdown(text, name)


# --- Markdown ----------------------------------------------------------------------------------

def split_markdown(text: str, document: str) -> list[Passage]:
    passages: list[Passage] = []
    title = ""                 # the "#" heading; names the text before the first "##"
    parent = ""                # current "##" heading
    parent_step: int | None = None
    section, step = "", None   # the section being collected
    body: list[str] = []
    in_code = False

    def flush():
        content = "\n".join(body).strip()
        if content:
            passages.append(Passage(document, section or title or document, content, step))
        body.clear()

    for line in text.splitlines():
        if _FENCE.match(line):
            in_code = not in_code
            body.append(line)
            continue
        heading = None if in_code else _HEADING.match(line)
        if heading is None or len(heading.group(1)) > 3:
            body.append(line)
            continue

        level, name = len(heading.group(1)), heading.group(2).strip()
        flush()
        own_step = _step_of(name)
        if level == 1:
            title, parent, parent_step = name, "", None
            section, step = name, None
        elif level == 2:
            parent, parent_step = name, own_step
            section, step = name, own_step
        else:
            section = f"{parent} › {name}" if parent else name
            step = own_step if own_step is not None else parent_step
    flush()
    return passages


def _step_of(heading: str) -> int | None:
    match = _STEP.match(heading)
    return int(match.group(1)) if match else None


# --- Verilog -----------------------------------------------------------------------------------

def split_verilog(text: str, document: str) -> list[Passage]:
    """One passage per module, from its `module` line to its `endmodule`."""
    passages: list[Passage] = []
    name, body = None, []
    for line in text.splitlines():
        if name is None:
            match = _MODULE.match(line)
            if match:
                name, body = match.group(1), [line]
            continue
        body.append(line)
        if _ENDMODULE.match(line):
            passages.append(Passage(document, f"module {name}", "\n".join(body).strip()))
            name, body = None, []
    return passages
