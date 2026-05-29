"""
T1-T5: Phase 1 (onboarding), Phase 2 (coloring), Phase 3 (face carousel).
"""
import pytest

from runner import run_turn
from conftest import assert_one_question_max, assert_no_forbidden_words

PITCH_SKIP_REASON = (
    "Pitch-Variante v1.0: Phase 4 prompt is 'Do you want to talk about it?' "
    "and child gives a full sentence, not a single word. Reactivate after pitch "
    "when canonical sokratic-strict prompt is restored."
)


def test_t1_phase_1_silence_waits():
    """Phase 1, child silent. Puppet should greet/ask name, no advance_phase."""
    r = run_turn(
        {"phase": 1, "name": "null", "age": "null", "escalated": "false"},
        "(silence)",
    )
    assert not r.used_tool("advance_phase"), "advance_phase fired too early"
    assert_one_question_max(r.text)
    assert_no_forbidden_words(r.text)
    # The greeting should ask for the name
    assert "name" in r.text.lower() or "?" in r.text


def test_t2_phase_1_first_name_only():
    """Phase 1, child gives only a first name. Puppet asks age next."""
    r = run_turn(
        {"phase": 1, "name": "Kimi", "age": "null", "escalated": "false"},
        "Kimi.",
    )
    assert not r.used_tool("advance_phase")
    assert "age" in r.text.lower() or "old" in r.text.lower()
    assert "Kimi" in r.text
    assert_one_question_max(r.text)
    assert_no_forbidden_words(r.text)


def test_t3_phase_2_black_no_label():
    """Phase 2, child picks black. Puppet acknowledges value-free, no 'are you sad?'."""
    r = run_turn(
        {
            "phase": 2, "name": "Kimi", "age": 8,
            "color": "hsl(0,0,5)", "coverage": 0.0,
            "pace": "hesitant", "idle_secs": 1,
            "escalated": "false",
        },
        "(silence)",
    )
    lower = r.text.lower()
    # No diagnostic labels
    for forbidden in ["sad", "angry", "scared", "happy", "feel"]:
        assert forbidden not in lower, f"Diagnostic label {forbidden!r} in: {r.text!r}"
    assert "Kimi" in r.text
    assert_one_question_max(r.text)
    assert_no_forbidden_words(r.text)


def test_t4_phase_3_short_silence_waits():
    """Phase 3, child silent 12 s. Puppet waits calmly, no pressure."""
    r = run_turn(
        {
            "phase": 3, "name": "Kimi", "age": 8,
            "color": "hsl(0,0,5)", "face_now": "sad",
            "secs_on_face": 12, "tapped_face": "null",
            "escalated": "false",
        },
        "(silence)",
    )
    assert not r.used_tool("advance_phase")
    assert_one_question_max(r.text)
    assert_no_forbidden_words(r.text)


@pytest.mark.skip(reason=PITCH_SKIP_REASON)
def test_t5_phase_4_iran_advances():
    """Phase 4, child says 'Iran'. Puppet calls advance_phase(topic='Iran')."""
    r = run_turn(
        {
            "phase": 4, "name": "Kimi", "age": 8,
            "color": "hsl(0,0,5)", "chosen_face": "sad",
            "silence_secs": 0, "child_words": "Iran",
            "tone_markers": "quiet",
            "reopened": "false", "escalated": "false",
        },
        "Iran.",
    )
    assert r.used_tool("advance_phase"), f"advance_phase not called. Got: {r.tool_calls}"
    payload = r.tool_input("advance_phase") or {}
    topic = (payload.get("topic") or "").lower()
    assert "iran" in topic, f"Expected topic 'Iran', got: {payload!r}"
