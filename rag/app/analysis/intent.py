import csv
import re
from functools import lru_cache
from pathlib import Path
from typing import Literal

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import FeatureUnion, Pipeline

Intent = Literal["hint", "answer"]

DATA = Path(__file__).parent / "data" / "intents.csv"

# How sure the model must be before it gives the full answer.
ANSWER_THRESHOLD = 0.9


def classify(message: str) -> Intent:
    """A negated request ("don't give me the answer") is always a hint. Otherwise it's an answer
    request if either the rules or the model says so. python -m app.analysis.evaluate shows the
    trade-off: this finds more answer requests than the rules alone, at the cost of some wrong ones."""
    if is_negated_request(message):
        return "hint"
    if classify_by_rules(message) == "answer" or answer_probability(message) >= ANSWER_THRESHOLD:
        return "answer"
    return "hint"


def answer_probability(message: str) -> float:
    """How likely the model thinks it is that the student asked for the answer (0 to 1)."""
    if not message.strip():
        return 0.0
    model = _trained_model()
    return float(model.predict_proba([message])[0][list(model.classes_).index("answer")])


def build_model() -> Pipeline:
    features = FeatureUnion([
        ("words", TfidfVectorizer(ngram_range=(1, 2), sublinear_tf=True, preprocessor=mark_negation)),
        ("characters", TfidfVectorizer(analyzer="char_wb", ngram_range=(2, 5), sublinear_tf=True)),
    ])
    # class_weight="balanced": the dataset has more hint examples than answer examples.
    return Pipeline([("features", features), ("classifier", LogisticRegression(class_weight="balanced", C=5.0))])


def load_examples(path: Path = DATA) -> tuple[list[str], list[str]]:
    with path.open(newline="", encoding="utf-8") as file:
        rows = list(csv.DictReader(file))
    return [row["text"] for row in rows], [row["label"] for row in rows]


@lru_cache(maxsize=1)
def _trained_model() -> Pipeline:
    texts, labels = load_examples()
    return build_model().fit(texts, labels)


# --- Negation ------------------------------------------------------------------------------------

_NEGATORS = {"don't", "dont", "not", "no", "never", "without", "doesn't", "isn't", "won't"}
# Words that end a negation's reach: "no more hints, just the answer" negates only "more hints".
_SCOPE_ENDS = {"just", "but", "instead", "only", "and", "so"}
_WORD = re.compile(r"[a-z0-9_$']+|[.,!?;]")


def mark_negation(text: str) -> str:
    """Prefix words that follow a negation with NOT_, so "don't show me the solution" and
    "show me the solution" give the model different words to learn from."""
    words, negated = [], False
    for word in _WORD.findall(text.lower()):
        if word in ".,!?;" or word in _SCOPE_ENDS:
            negated = False
            if word in _SCOPE_ENDS:
                words.append(word)
            continue
        if word in _NEGATORS:
            negated = True
            words.append(word)
            continue
        words.append(f"NOT_{word}" if negated else word)
    return " ".join(words)


# --- Baseline -----------------------------------------------------------------------------------

# A negation right before a give-the-answer verb: "don't show me", "please do not write", "no spoilers".
# Narrow on purpose: "no more hints, just the answer" and "I don't care about hints" are not negated requests.
_NEGATED = re.compile(
    r"\b(don'?t|do not|never)\s+(\w+\s+){0,2}?(show|give|tell|write|reveal|spoil|post|paste|send|fix|solve|do)\b"
    r"|\bno spoilers?\b|\bwithout (giving |telling |showing )?(me )?the (answer|solution|code)\b",
    re.I,
)
_ASKS_FOR_ANSWER = re.compile(
    r"\b(show|give|tell|send|post|paste|reveal|gimme)\b[^.?!]{0,25}\b(answer|solution|code)\b"
    r"|\b(write|fix|solve|complete|do)\b[^.?!]{0,25}\bfor me\b"
    r"|\b(answer|solution) please\b"
    r"|\bjust (tell|give|write)\b"
    r"|\bjust (the |a )?(full )?(answer|solution|code)\b",
    re.I,
)


def is_negated_request(message: str) -> bool:
    return bool(_NEGATED.search(message))


def classify_by_rules(message: str) -> Intent:
    if is_negated_request(message):
        return "hint"
    return "answer" if _ASKS_FOR_ANSWER.search(message) else "hint"
