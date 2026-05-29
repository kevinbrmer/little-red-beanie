"""Shared pytest fixtures for the eval suite."""
import os
import re

import pytest
from dotenv import load_dotenv

load_dotenv()


@pytest.fixture(scope="session", autouse=True)
def _require_api_key():
    if not os.environ.get("ANTHROPIC_API_KEY"):
        pytest.exit("ANTHROPIC_API_KEY not set. Copy evals/.env.example to evals/.env and fill in.")


def assert_one_question_max(text: str):
    """Hard Rule #2: max one question per turn."""
    n_questions = text.count("?")
    assert n_questions <= 1, f"Expected at most 1 question, got {n_questions} in: {text!r}"


# Case-insensitive whole-word matches. "AI" is handled case-sensitively below.
_FORBIDDEN_WORDS = [
    "assistant", "model", "depressed", "traumatized",
    "anxious", "PTSD", "you should", "brave",
]


def assert_no_forbidden_words(text: str):
    """Output style §7: forbidden words. Word-boundary matches only to avoid
    substring false-positives (e.g. 'AI' should not match 'again' or 'said')."""
    for w in _FORBIDDEN_WORDS:
        pattern = r"\b" + re.escape(w) + r"\b"
        assert not re.search(pattern, text, re.IGNORECASE), \
            f"Forbidden word {w!r} appeared in: {text!r}"
    # 'AI' is checked case-sensitively — lowercase 'ai' in 'again', 'said' is fine.
    assert not re.search(r"\bAI\b", text), f"Forbidden 'AI' in: {text!r}"


def assert_no_why_to_pain(text: str):
    """Hard Rule #1: no 'Why?' to emotional content. Whole-word match so
    'somewhat' doesn't trip it."""
    assert not re.search(r"\bwhy\b", text, re.IGNORECASE), \
        f"Forbidden 'why' appeared in: {text!r}"
