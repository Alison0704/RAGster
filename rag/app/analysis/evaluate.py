from sklearn.model_selection import StratifiedKFold

from .intent import ANSWER_THRESHOLD, build_model, classify_by_rules, is_negated_request, load_examples


def main() -> None:
    texts, labels = load_examples()
    probabilities = [0.0] * len(texts)

    for train, test in StratifiedKFold(n_splits=5, shuffle=True, random_state=0).split(texts, labels):
        model = build_model().fit([texts[i] for i in train], [labels[i] for i in train])
        answer_column = list(model.classes_).index("answer")
        for i, probability in zip(test, model.predict_proba([texts[i] for i in test])[:, answer_column]):
            probabilities[i] = probability

    def model_at(threshold: float) -> list[str]:
        return ["answer" if p >= threshold else "hint" for p in probabilities]

    rule_predictions = [classify_by_rules(text) for text in texts]
    model_predictions = model_at(ANSWER_THRESHOLD)
    # The service's classify(): a negated request is always a hint; otherwise rules OR model.
    hybrid_predictions = [
        "hint" if is_negated_request(text) else ("answer" if "answer" in (r, m) else "hint")
        for text, r, m in zip(texts, rule_predictions, model_predictions)
    ]

    print(f"{len(texts)} examples ({labels.count('answer')} answer, {labels.count('hint')} hint), "
          f"model threshold {ANSWER_THRESHOLD}\n")
    print(f"{'':8} {'accuracy':>9} {'answer precision':>17} {'answer recall':>14} {'wrong answers':>14}")
    results = (("rules", rule_predictions), ("model", model_predictions), ("hybrid", hybrid_predictions))
    for name, predictions in results:
        _report(name, labels, predictions)

    print("\nmodel alone at other thresholds:")
    for threshold in (0.5, 0.6, 0.7, 0.8, 0.9):
        _report(f"  {threshold}", labels, model_at(threshold))

    for name, predictions in results:
        mistakes = [(t, l, p) for t, l, p in zip(texts, labels, predictions) if l != p]
        print(f"\n{name} mistakes ({len(mistakes)}):")
        for text, label, predicted in mistakes:
            print(f"  {'GAVE ANSWER' if predicted == 'answer' else 'missed     '}  [{label:6}] {text}")


def _report(name: str, labels: list[str], predictions: list[str]) -> None:
    pairs = list(zip(labels, predictions))
    correct = sum(label == predicted for label, predicted in pairs)
    true_answer = sum(label == predicted == "answer" for label, predicted in pairs)
    said_answer = predictions.count("answer")
    wrong_answers = said_answer - true_answer
    precision = true_answer / said_answer if said_answer else 1.0
    recall = true_answer / labels.count("answer")
    print(f"{name:8} {correct / len(pairs):>9.0%} {precision:>17.0%} {recall:>14.0%} {wrong_answers:>14}")


if __name__ == "__main__":
    main()
