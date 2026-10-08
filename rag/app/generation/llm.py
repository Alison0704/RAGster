import logging
from collections.abc import Iterator

import httpx
import ollama

from .. import config

log = logging.getLogger(__name__)

# Low temperature keeps hints focused; raise it if replies feel repetitive.
TEMPERATURE = 0.3

# Keep the model loaded between questions so replies after the first are fast.
KEEP_ALIVE = "15m"

# Connecting to Ollama should be instant; a reply can take a while if the model has to load first.
TIMEOUT = httpx.Timeout(config.TIMEOUT_SECONDS, connect=5.0)


class ModelTimeout(Exception):
    """The model didn't answer within config.TIMEOUT_SECONDS."""


_client: ollama.Client | None = None


def get_client() -> ollama.Client:
    global _client
    if _client is None:
        _client = ollama.Client(host=config.OLLAMA_HOST, timeout=TIMEOUT)
    return _client


def _request(system: str, user_message: str, max_tokens: int) -> dict:
    options = {
        "num_ctx": config.CONTEXT_TOKENS,
        "num_predict": max_tokens,
        "temperature": TEMPERATURE,
    }
    if config.SEED is not None:
        options["seed"] = config.SEED  # same question + same seed -> same reply (useful for evaluation)
    return {
        "model": config.MODEL,
        "messages": [
            {"role": "system", "content": system},
            {"role": "user", "content": user_message},
        ],
        "options": options,
        "keep_alive": KEEP_ALIVE,
    }


def complete(system: str, user_message: str, max_tokens: int) -> str:
    try:
        response = get_client().chat(**_request(system, user_message, max_tokens))
    except httpx.TimeoutException as error:
        raise ModelTimeout from error

    reply = response.message.content.strip()
    if response.done_reason == "length":
        # Cut off by max_tokens: end at the last complete sentence rather than mid-word.
        log.info("reply hit max_tokens=%d", max_tokens)
        reply = last_full_sentence(reply)
    return reply


def stream(system: str, user_message: str, max_tokens: int) -> Iterator[str]:
    """Yield the reply in pieces. Raises CutOff at the end if max_tokens stopped it early.

    Closing the iterator early (e.g. when the reply turns out to contain code) closes the connection,
    which makes Ollama stop generating.
    """
    try:
        for chunk in get_client().chat(**_request(system, user_message, max_tokens), stream=True):
            if chunk.message.content:
                yield chunk.message.content
            if chunk.done and chunk.done_reason == "length":
                log.info("streamed reply hit max_tokens=%d", max_tokens)
                raise CutOff
    except httpx.TimeoutException as error:
        raise ModelTimeout from error


class CutOff(Exception):
    """A streamed reply was stopped by max_tokens; the caller should trim it with last_full_sentence()."""


def warm_up(system: str) -> None:
    """Load the model and process the system prompt once, so the first real question starts fast.

    Uses the same settings as real questions: Ollama reloads the model if the context size changes.
    """
    try:
        get_client().chat(**_request(system, "Ready?", max_tokens=1))
        log.info("model %s loaded", config.MODEL)
    except (ConnectionError, ollama.ResponseError, httpx.TimeoutException) as error:
        # Not fatal: the first question will load it, or report the problem to the student.
        log.warning("could not preload %s: %s", config.MODEL, error)


def last_full_sentence(text: str) -> str:
    end = max(text.rfind(mark) for mark in ".?!")
    return text[: end + 1] if end > 0 else text
