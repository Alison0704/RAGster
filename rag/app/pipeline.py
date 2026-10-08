# The RAG pipeline: analyse the question, retrieve passages, generate a reply.
# Each stage lives in its own package; see rag/README.md for the order to build them in.

from collections.abc import Iterator

from .analysis.intent import classify
from .generation.generate import generate, generate_stream
from .retrieval.documents import Passage
from .retrieval.search import search
from .schemas import ChatRequest, ChatResponse, Source


def answer(request: ChatRequest) -> ChatResponse:
    mode, passages = _prepare(request)
    return ChatResponse(reply=generate(request, passages, mode), mode=mode, sources=_sources(passages))


def answer_stream(request: ChatRequest) -> Iterator[dict]:
    """Events for POST /api/chat/stream: one "meta", then "delta"/"replace" events, then "done"."""
    mode, passages = _prepare(request)
    yield {"type": "meta", "mode": mode, "sources": [s.model_dump() for s in _sources(passages)]}
    yield from generate_stream(request, passages, mode)
    yield {"type": "done"}


def _prepare(request: ChatRequest) -> tuple[str, list[Passage]]:
    # Stage 4 - hint, or did the student explicitly ask for the answer?
    mode = classify(request.message)
    # Stage 2 - the passages most relevant to this question and step.
    passages = search(request.message, step=request.step, k=4)
    return mode, passages


def _sources(passages: list[Passage]) -> list[Source]:
    return [Source(document=p.document, section=p.section) for p in passages]
