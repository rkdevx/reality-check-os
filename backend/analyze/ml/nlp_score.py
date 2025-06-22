import spacy

nlp = spacy.load("en_core_web_sm")

import spacy

nlp = spacy.load("en_core_web_sm")

def heuristic_nlp_score(text):
    doc = nlp(text.lower())
    penalty = 0
    boost = 0
    reasons = []

    # Clickbait word detection
    clickbait_words = ["secret", "won't believe", "instantly", "shocking", "miracle"]
    for word in clickbait_words:
        if word in text.lower():
            penalty += 0.2
            reasons.append(f"Clickbait word detected: '{word}'")

    # Adjectives = emotional tone
    adjectives = [token for token in doc if token.pos_ == "ADJ"]
    if len(adjectives) > 3:
        penalty += 0.1
        reasons.append("Too many adjectives (emotional framing)")

    # Numbers = factuality
    if any(token.like_num for token in doc):
        boost += 0.1
        reasons.append("Contains numerical fact")

    # Passive voice = weak statement
    if any(token.dep_ == "auxpass" for token in doc):
        penalty += 0.05
        reasons.append("Passive voice usage")

    final_score = max(0.0, min(1.0, 0.5 + boost - penalty))
    return round(final_score, 3), reasons
