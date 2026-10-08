import re

from ..retrieval.documents import Passage
from ..schemas import ChatRequest

SYSTEM_PROMPT = """\
You are RAGster, a tutor for students learning digital design in Verilog. The student is working \
through a lab, one step at a time. Your job is to help them find the answer themselves.

Rules:
1. Give hints, not answers. Point to where the problem is (a line, a signal or a concept) and why it \
matters, then let the student make the change. Do not write corrected code or a full solution.
2. You may quote one line of the student's own code, with its line number, to show where to look.
3. The Reference section is private material for you. Use it to understand what the student should \
end up with. Never copy code from it, and never mention that it exists.
4. If the Mode says the student asked for the answer, you may give the full answer for their current \
step, with a short explanation of why it works.
5. Keep replies short: 2 to 4 sentences. When it helps, end with one question that makes the student think.
6. If the question is not about the lab, Verilog or digital design, say in one sentence that you can \
only help with the lab.

Example:
Student code, line 10: `input clk`
Question: "Why do I get a syntax error on line 11?"
Good reply: "Verilog often reports a mistake one line after it happens, so look at the end of line 10. \
How are the ports in a list separated from each other?"
Bad reply: "Add a comma: `input clk,`" (this gives the fix away)
"""

_MODE = {
    "hint": "hint - give a hint, not the answer.",
    "answer": "answer - the student explicitly asked for the answer. You may give it for their current step.",
}


# Repeated at the end of every message: small models follow the most recent instructions best.
_REMINDER = {
    "hint": "Reply in 2 to 4 plain sentences with no code, and don't mention the Reference. "
            "If the question isn't about the lab, Verilog or digital design, say you can only help with the lab.",
    "answer": "You may include code for the current step. Keep the explanation short.",
}

_CODE_BLOCK = re.compile(r"^\s*(```|~~~).*?^\s*\1[^\n]*$", re.MULTILINE | re.DOTALL)


def build_user_message(request: ChatRequest, passages: list[Passage], mode: str) -> str:
    sections = []

    if request.step:
        sections.append(f"## Lab step\nStep {request.step.number}: {request.step.title}")

    references = [(p.section, _reference_text(p, mode)) for p in passages]
    references = [(section, text) for section, text in references if text]
    if references:
        body = "\n\n".join(f"### {section}\n{text}" for section, text in references)
        sections.append(f"## Reference (private, do not quote)\n{body}")

    if request.code.strip():
        sections.append(f"## Student's code ({request.language}), with line numbers\n{_numbered(request.code)}")
    else:
        sections.append("## Student's code\n(The editor is empty.)")

    mode = mode if mode in _MODE else "hint"
    sections.append(f"## Mode\n{_MODE[mode]}")
    sections.append(f"## Question\n{request.message}")
    sections.append(_REMINDER[mode])
    return "\n\n".join(sections)


def _reference_text(passage: Passage, mode: str) -> str:
    """What the model may see of a passage. In hint mode: the explanation, never the code."""
    if mode == "answer":
        return passage.text
    if passage.document.endswith(".v"):
        return ""
    return _CODE_BLOCK.sub("(code omitted)", passage.text).strip()


# Fenced blocks, or lines that read like Verilog statements.
_CODE_IN_REPLY = re.compile(
    r"```|^\s*(always|assign|module|endmodule|initial|reg|wire|input|output)\b|<=[^\n]*;",
    re.MULTILINE,
)


def contains_code(reply: str) -> bool:
    return bool(_CODE_IN_REPLY.search(reply))


RETRY_INSTRUCTION = (
    "Your previous reply contained code. Reply again with a hint only: 2 to 4 plain sentences, "
    "no code, no corrected lines."
)

SAFE_FALLBACK = (
    "I can only give hints here, not code. Tell me what you expect this part to do and what happens "
    "instead, and I'll point you to where to look."
)


def _numbered(code: str) -> str:
    lines = code.rstrip("\n").splitlines()
    width = len(str(len(lines)))
    return "\n".join(f"{number:>{width}} | {line}" for number, line in enumerate(lines, start=1))
