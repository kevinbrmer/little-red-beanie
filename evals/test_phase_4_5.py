"""
T6-T9: Phase 4 silence handling, Phase 5 asset selection.
"""
import pytest

from runner import run_turn
from conftest import assert_one_question_max, assert_no_forbidden_words

PITCH_SKIP_REASON = (
    "Pitch-Variante v1.0: Phase 5 is two-stage (5a offer → 5b show_assets). "
    "Bare topic enters Stage 5a where the puppet asks the comfort question and "
    "does NOT call show_assets yet. Reactivate after pitch when canonical "
    "single-stage Phase 5 is restored."
)


# The exact 25 asset IDs from the manifest, for membership checks.
VALID_ASSET_IDS = {
    "iran_landscape_alborz_snow_01",
    "iran_landscape_caspian_shore_02",
    "iran_landscape_desert_sunset_03",
    "iran_street_tehran_alley_04",
    "iran_street_bazaar_carpet_05",
    "iran_street_teahouse_06",
    "iran_food_sangak_bread_07",
    "iran_food_tea_glass_08",
    "iran_food_saffron_rice_09",
    "iran_courtyard_pomegranate_10",
    "iran_courtyard_fountain_11",
    "iran_home_persian_carpet_12",
    "iran_home_window_curtain_13",
    "iran_calligraphy_hafez_14",
    "iran_calligraphy_tile_15",
    "iran_nature_pomegranate_split_16",
    "iran_nature_jasmine_17",
    "iran_nature_walnut_tree_18",
    "iran_sky_minaret_dusk_19",
    "iran_sky_stars_desert_20",
    "iran_water_river_zayandeh_21",
    "iran_water_rain_window_22",
    "iran_textiles_carpet_loom_23",
    "iran_textiles_mother_hands_24",
    "iran_seasonal_nowruz_haftsin_25",
}


def test_t6_phase_4_silence_18s_gentle_reopen():
    """Phase 4, child silent 18 s, reopener not yet fired.
    Puppet may emit 'Take your time' once or return [silent_turn]."""
    r = run_turn(
        {
            "phase": 4, "name": "Kimi", "age": 8,
            "color": "hsl(0,0,5)", "chosen_face": "sad",
            "silence_secs": 18, "child_words": "",
            "tone_markers": "quiet",
            "reopened": "false", "escalated": "false",
        },
        "(silence)",
    )
    text = r.text.strip()
    # Either a silent_turn token, or a single short reopener including the name.
    assert text == "[silent_turn]" or "Kimi" in text
    assert not r.used_tool("advance_phase")
    assert_one_question_max(r.text)
    assert_no_forbidden_words(r.text)


def test_t7_phase_4_silence_45s_advances_silent():
    """Phase 4, child silent 45 s. Puppet calls advance_phase(topic=null)."""
    r = run_turn(
        {
            "phase": 4, "name": "Kimi", "age": 8,
            "color": "hsl(0,0,5)", "chosen_face": "sad",
            "silence_secs": 45, "child_words": "",
            "tone_markers": "quiet",
            "reopened": "true", "escalated": "false",
        },
        "(silence)",
    )
    assert r.used_tool("advance_phase"), f"advance_phase missing. tools: {r.tool_calls}"
    payload = r.tool_input("advance_phase") or {}
    topic = payload.get("topic")
    assert topic is None or topic == "null" or topic == "", \
        f"Expected null topic, got: {payload!r}"


@pytest.mark.skip(reason=PITCH_SKIP_REASON)
def test_t8_phase_5_iran_shows_3_to_5_assets():
    """Phase 5 with topic=Iran. Puppet calls show_assets with 3-5 valid IDs."""
    r = run_turn(
        {
            "phase": 5, "name": "Kimi", "age": 8,
            "color": "hsl(0,0,5)", "chosen_face": "sad",
            "topic": "Iran", "escalated": "false",
        },
        "Iran.",
    )
    assert r.used_tool("show_assets"), f"show_assets not called. tools: {r.tool_calls}"
    payload = r.tool_input("show_assets") or {}
    ids = payload.get("ids", [])
    assert 3 <= len(ids) <= 5, f"Expected 3-5 assets, got {len(ids)}: {ids}"
    for asset_id in ids:
        assert asset_id in VALID_ASSET_IDS, \
            f"Asset ID {asset_id!r} not in manifest"
    assert_no_forbidden_words(r.text)
    # No follow-up question in phase 5
    assert "?" not in r.text


@pytest.mark.skip(reason=PITCH_SKIP_REASON)
def test_t9_phase_5_no_topic_picks_neutral_nature():
    """Phase 5 with topic=null. Puppet picks calm landscape/sky/nature IDs."""
    r = run_turn(
        {
            "phase": 5, "name": "Kimi", "age": 8,
            "color": "hsl(0,0,5)", "chosen_face": "sad",
            "topic": "null", "escalated": "false",
        },
        "(silence)",
    )
    assert r.used_tool("show_assets")
    payload = r.tool_input("show_assets") or {}
    ids = payload.get("ids", [])
    assert 3 <= len(ids) <= 5
    # At least one neutral-nature asset (landscape/sky/nature category)
    neutral_prefixes = ("iran_landscape_", "iran_sky_", "iran_nature_", "iran_water_")
    assert any(any(a.startswith(p) for p in neutral_prefixes) for a in ids), \
        f"Expected at least one neutral-nature asset, got: {ids}"
