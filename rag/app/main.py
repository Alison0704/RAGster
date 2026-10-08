# RAG service for the Neural chat.

# POST /api/chat          {message, code, language, step}  ->  {reply, mode, sources}
# POST /api/chat/stream   same request  ->  newline-delimited JSON events (see pipeline.answer_stream)
# GET  /api/chat/health


import json
import threading
from contextlib import asynccontextmanager

import httpx
import ollama
from fastapi import FastAPI
from fastapi.responses import StreamingResponse

from . import config
from .generation.llm import get_client, warm_up
from .generation.prompts import SYSTEM_PROMPT
from .pipeline import answer, answer_stream
from .schemas import ChatRequest, ChatResponse

@asynccontextmanager
async def lifespan(app: FastAPI):
    if config.USE_LLM:
        # In the background, so the service accepts requests (and health checks) while the model loads.
        threading.Thread(target=warm_up, args=(SYSTEM_PROMPT,), daemon=True).start()
    yield


app = FastAPI(title="RAGster RAG service", lifespan=lifespan)


@app.post("/api/chat", response_model=ChatResponse)
def chat(request: ChatRequest) -> ChatResponse:
    return answer(request)


@app.post("/api/chat/stream")
def chat_stream(request: ChatRequest) -> StreamingResponse:
    lines = (json.dumps(event) + "\n" for event in answer_stream(request))
    return StreamingResponse(lines, media_type="application/x-ndjson")


@app.get("/api/chat/health")
def health():
    try:
        installed = {m.model for m in get_client().list().models}
        ollama_status = {"reachable": True, "model_installed": config.MODEL in installed}
    except (ConnectionError, ollama.ResponseError, httpx.TimeoutException):
        ollama_status = {"reachable": False, "model_installed": False}
    return {
        "ok": True,
        "lab": config.LAB,
        "corpus": config.CORPUS_DIR.exists(),
        "instructions": config.INSTRUCTIONS_PATH.exists(),
        "llm": config.USE_LLM,
        "model": config.MODEL,
        "ollama": ollama_status,
    }
