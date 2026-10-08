from collections.abc import Iterator

import ollama

from .. import config
from ..retrieval.documents import Passage
from ..schemas import ChatRequest
from .llm import CutOff, ModelTimeout, complete, last_full_sentence, stream
from .prompts import RETRY_INSTRUCTION, SAFE_FALLBACK, SYSTEM_PROMPT, build_user_message, contains_code


def generate(request: ChatRequest, passages: list[Passage], mode: str) -> str:
    if not config.USE_LLM:
        return _placeholder(request, passages, mode)
    try:
        message = build_user_message(request, passages, mode)
        max_tokens = config.MAX_TOKENS[mode]
        reply = complete(SYSTEM_PROMPT, message, max_tokens)
        if mode == "hint" and contains_code(reply):
            return _retry_without_code(message, max_tokens)
        return reply
    except (ollama.ResponseError, ConnectionError, ModelTimeout) as error:
        return _error_message(error)


def generate_stream(request: ChatRequest, passages: list[Passage], mode: str) -> Iterator[dict]:
    """Yield {"type": "delta", "text": ...} pieces of the reply, or {"type": "replace", "text": ...}
    when what was already shown must be swapped for something else (code found, cut off, error)."""
    if not config.USE_LLM:
        yield {"type": "replace", "text": _placeholder(request, passages, mode)}
        return

    message = build_user_message(request, passages, mode)
    max_tokens = config.MAX_TOKENS[mode]
    shown = ""
    pieces = stream(SYSTEM_PROMPT, message, max_tokens)
    try:
        for piece in pieces:
            shown += piece
            if mode == "hint" and contains_code(shown):
                # Stop at once; closing the stream makes Ollama stop too. Replace what was shown.
                pieces.close()
                yield {"type": "replace", "text": _retry_without_code(message, max_tokens)}
                return
            yield {"type": "delta", "text": piece}
    except CutOff:
        yield {"type": "replace", "text": last_full_sentence(shown.strip())}
    except (ollama.ResponseError, ConnectionError, ModelTimeout) as error:
        yield {"type": "replace", "text": _error_message(error)}


def _retry_without_code(message: str, max_tokens: int) -> str:
    """One retry with an explicit reminder; if it still writes code, don't show it."""
    try:
        reply = complete(SYSTEM_PROMPT, f"{message}\n\n{RETRY_INSTRUCTION}", max_tokens)
    except (ollama.ResponseError, ConnectionError, ModelTimeout) as error:
        return _error_message(error)
    return SAFE_FALLBACK if contains_code(reply) else reply


def _error_message(error: Exception) -> str:
    if isinstance(error, ollama.ResponseError):
        if error.status_code == 404:
            return f"The model {config.MODEL} isn't installed in Ollama. Run: ollama pull {config.MODEL}"
        return f"Ollama returned an error ({error.status_code}): {error.error}"
    if isinstance(error, ModelTimeout):
        return (
            f"The model took longer than {config.TIMEOUT_SECONDS:.0f} seconds to answer. "
            "The computer may be low on memory; try again in a moment, or close other apps."
        )
    return f"I couldn't reach Ollama at {config.OLLAMA_HOST}. Is the Ollama app running?"


def _placeholder(request: ChatRequest, passages: list[Passage], mode: str) -> str:
    """What the chat shows when RAG_USE_LLM is "0"."""
    where = f"Step {request.step.number} ({request.step.title})" if request.step else "no step"
    return (
        f"[RAG scaffold] Got your question for {where}, with {len(request.code.splitlines())} lines of code. "
        f"Intent: {mode}. Retrieval found {len(passages)} passage(s). "
        "Set RAG_USE_LLM to \"1\" to generate hints."
    )
