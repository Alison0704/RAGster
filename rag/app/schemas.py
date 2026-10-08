#The contract between the Neural chat (RAGster/src/api/chat.ts) and this service.

from typing import Literal

from pydantic import BaseModel, Field


class Step(BaseModel):
    # The instruction step the student picked in the chat ("Working on").

    number: int
    title: str


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=4000)
    code: str = Field(default="", max_length=200_000)
    language: str = "verilog"
    step: Step | None = None


class Source(BaseModel):
    # A corpus passage the reply was grounded in. Shown to you while debugging; never the raw solution.

    document: str
    section: str


class ChatResponse(BaseModel):
    reply: str
    # "hint" unless the student explicitly asked for the answer (stage 4).
    mode: Literal["hint", "answer"]
    sources: list[Source] = []
