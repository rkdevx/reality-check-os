import spacy

nlp = spacy.load("en_core_web_sm")

def heuristic_nlp_score(text):
    doc = nlp(text.lower())
    penalty = 0
    boost = 0
    reasons = []

    # 1. Clickbait detection (Expanded list)
    clickbait_words = ["secret", "won't believe", "instantly", "shocking", "miracle", "unbelievable", "exposed", "must see", "life-changing", "amazing"]
    for word in clickbait_words:
        if word in text.lower():
            penalty += 0.2
            reasons.append(f"Clickbait word detected: '{word}'")

    # 2. Emotional tone (adjective count)
    adjectives = [token for token in doc if token.pos_ == "ADJ"]
    if len(adjectives) > 4:
        penalty += 0.1
        reasons.append("Excessive emotional adjectives used")

    # 3. Numerical facts (only boost if sentence has both number & factual indicator)
    if any(token.like_num for token in doc) and any(token.text in ["report", "study", "data", "survey"] for token in doc):
        boost += 0.1
        reasons.append("Contains numerical fact with factual context")

    # 4. Passive voice detection
    if any(token.dep_ == "auxpass" for token in doc):
        penalty += 0.05
        reasons.append("Passive voice usage")

    # 5. Length heuristic
    word_count = len(text.split())
    if word_count < 5:
        penalty += 0.1
        reasons.append("Text too short to be reliable")
    elif word_count > 50:
        penalty += 0.05
        reasons.append("Text unusually long")

    # Final score
    final_score = max(0.0, min(1.0, 0.5 + boost - penalty))
    return round(final_score, 3), reasons
