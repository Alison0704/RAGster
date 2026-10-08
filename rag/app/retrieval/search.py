import math
import re
from collections import Counter

from ..schemas import Step
from .documents import Passage, load_passages

# How much picking a step counts, relative to the best keyword match (1.0).
# 0.5: an on-step passage with a fair match beats an off-step one with a slightly better match,
# but a strong off-step match still wins.
STEP_BONUS = 0.5

# BM25's usual settings: K1 limits how much repeating a word helps, B how much long passages are penalised.
K1, B = 1.5, 0.75

TITLE_WEIGHT = 2

# Words that say nothing about which passage is relevant.
STOPWORDS = frozenset("""
    a an and are as at be but by can could do does did for from get got had has have how i if in into is
    it its me my no not of on or so than that the then there these this to too was we were what when
    where which while who why will with would you your should just like want need help please
""".split())

# Identifiers stay whole ($display, `timescale, rst_n, 4'd9); underscores also split them into parts.
_TOKEN = re.compile(r"[$`]?[a-z0-9_]+(?:'[a-z0-9_]+)?")


def tokenize(text: str) -> list[str]:
    tokens = []
    for token in _TOKEN.findall(text.lower()):
        if token in STOPWORDS:
            continue
        tokens.append(token)
        if "_" in token:
            # rst_n -> also "rst"; parts of one letter say too little to keep.
            tokens.extend(part for part in token.strip("$`").split("_") if len(part) > 1 and part not in STOPWORDS)
    return tokens


def search(query: str, step: Step | None = None, k: int = 4) -> list[Passage]:
    passages = load_passages()
    if not passages:
        return []

    keyword = _bm25(tokenize(query), passages)
    best = max(keyword) or 1.0

    scored = []
    for passage, score in zip(passages, keyword):
        on_step = step is not None and passage.step == step.number
        total = score / best + (STEP_BONUS if on_step else 0.0)
        if total > 0:
            scored.append((total, passage))

    # sorted() is stable, so ties keep corpus order (lab files first, then the instructions).
    scored.sort(key=lambda item: item[0], reverse=True)
    return [passage for _, passage in scored[:k]]


def _bm25(query: list[str], passages: list[Passage]) -> list[float]:
    documents = [tokenize(p.section) * TITLE_WEIGHT + tokenize(p.text) for p in passages]
    average_length = sum(map(len, documents)) / len(documents) or 1.0
    containing = Counter(term for document in documents for term in set(document))

    scores = []
    for document in documents:
        counts = Counter(document)
        length_factor = K1 * (1 - B + B * len(document) / average_length)
        score = 0.0
        for term in set(query):
            frequency = counts[term]
            if frequency:
                rarity = math.log(1 + (len(documents) - containing[term] + 0.5) / (containing[term] + 0.5))
                score += rarity * frequency * (K1 + 1) / (frequency + length_factor)
        scores.append(score)
    return scores
