# Settings, read from environment variables (set in docker-compose.yml).

import os
from pathlib import Path

# Knowledge base: <repo>/rag/corpus, mounted read-only.
CORPUS_DIR = Path(os.environ.get("CORPUS_DIR", "/corpus"))

# The lab instructions students see: <repo>/RAGster/instructions/instructions.md, mounted read-only.
INSTRUCTIONS_PATH = Path(os.environ.get("INSTRUCTIONS_PATH", "/instructions/instructions.md"))

# Which lab folder in the corpus the current instructions belong to.
LAB = os.environ.get("RAG_LAB", "counter")

# Ollama runs natively on the Mac; containers reach it through host.docker.internal.
OLLAMA_HOST = os.environ.get("OLLAMA_HOST", "http://host.docker.internal:11434")

# Stage 3: set RAG_USE_LLM=1 to generate hints with the model below.
USE_LLM = os.environ.get("RAG_USE_LLM") == "1"
MODEL = os.environ.get("RAG_MODEL", "qwen2.5-coder:3b")

# Tokens the model can see at once: system prompt + passages + student code + question.
# Ollama's default is much smaller and silently drops the start of longer prompts.
CONTEXT_TOKENS = int(os.environ.get("RAG_CONTEXT_TOKENS", "8192"))

# How long to wait for a reply. Generous because the model may have to load into memory first.
TIMEOUT_SECONDS = float(os.environ.get("RAG_TIMEOUT_SECONDS", "120"))

# Longest reply, in tokens. Hints should be 2-4 sentences; answers may include code.
MAX_TOKENS = {"hint": 400, "answer": 1200}

# Set a number to make replies repeatable (same question -> same reply), e.g. for evaluation runs.
SEED = int(os.environ["RAG_SEED"]) if os.environ.get("RAG_SEED") else None

# Stage 5: embedding model for vector search.
EMBED_MODEL = os.environ.get("RAG_EMBED_MODEL", "nomic-embed-text")
