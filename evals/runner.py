"""
Eval-Harness: dispatches one turn against Opus 4.7 with the system prompt
loaded and the per-turn context block injected as the user message.

Returns a structured result with the text response + any tool_use blocks.
"""
from __future__ import annotations

import os
from dataclasses import dataclass, field
from pathlib import Path

import anthropic
from dotenv import load_dotenv

load_dotenv()

PROMPT_PATH = Path(__file__).resolve().parents[1] / "prompts" / "system-prompt-v1.md"
MODEL = "claude-opus-4-7"

# Tool definitions match the spec §6.
TOOLS: list[dict] = [
    {
        "name": "advance_phase",
        "description": (
            "Propose moving to the next phase. Optional topic is the verbatim child-word, "
            "used only in Phase 4 -> 5. The app decides whether to execute. "
            "Do not call in Phase 5 — it is terminal; the app ends the session."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "topic": {
                    "type": ["string", "null"],
                    "description": "Verbatim child-word for Phase 4 -> 5, or null.",
                }
            },
            "required": [],
        },
    },
    {
        "name": "show_assets",
        "description": (
            "Show 3-5 images from the Iran asset pool on the puppet's screen. "
            "Required in Phase 5."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "ids": {
                    "type": "array",
                    "items": {"type": "string"},
                    "minItems": 3,
                    "maxItems": 5,
                    "description": "Asset IDs from <iran_assets>.",
                }
            },
            "required": ["ids"],
        },
    },
    {
        "name": "mark_escalation",
        "description": (
            "Trigger Co-Regulation Mode. Persists for the rest of the session. "
            "Use on trauma markers, panic, prolonged silence with stress signals, "
            "or violence/loss hints."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "reason": {
                    "type": "string",
                    "description": "Short English phrase describing the trigger.",
                }
            },
            "required": ["reason"],
        },
    },
]


@dataclass
class TurnResult:
    text: str
    tool_calls: list[dict] = field(default_factory=list)
    stop_reason: str | None = None
    raw_content: list = field(default_factory=list)

    def used_tool(self, name: str) -> bool:
        return any(t["name"] == name for t in self.tool_calls)

    def tool_input(self, name: str) -> dict | None:
        for t in self.tool_calls:
            if t["name"] == name:
                return t["input"]
        return None


def load_prompt() -> str:
    return PROMPT_PATH.read_text(encoding="utf-8")


def build_user_message(ctx: dict, speech: str) -> str:
    """Render the per-turn context block + speech as one user message."""
    ctx_line = "[CTX " + " ".join(f"{k}={v}" for k, v in ctx.items()) + "]"
    user_line = f"[USER] {speech}"
    return f"{ctx_line}\n{user_line}"


def run_turn(ctx: dict, speech: str, *, prior_messages: list[dict] | None = None) -> TurnResult:
    """
    Drive one turn against Opus 4.7.

    Args:
        ctx: dict of context keys per the spec (phase, name, age, ...).
        speech: transcribed child speech or "(silence)".
        prior_messages: optional list of prior {role, content} messages for multi-turn scenarios.

    Returns:
        TurnResult with text + tool_calls.
    """
    client = anthropic.Anthropic()
    system_prompt = load_prompt()

    messages = list(prior_messages or [])
    messages.append({"role": "user", "content": build_user_message(ctx, speech)})

    response = client.messages.create(
        model=MODEL,
        max_tokens=512,
        system=[
            {
                "type": "text",
                "text": system_prompt,
                "cache_control": {"type": "ephemeral"},
            }
        ],
        tools=TOOLS,
        messages=messages,
    )

    text_parts: list[str] = []
    tool_calls: list[dict] = []
    for block in response.content:
        if block.type == "text":
            text_parts.append(block.text)
        elif block.type == "tool_use":
            tool_calls.append({"name": block.name, "input": block.input, "id": block.id})

    return TurnResult(
        text="".join(text_parts),
        tool_calls=tool_calls,
        stop_reason=response.stop_reason,
        raw_content=response.content,
    )


if __name__ == "__main__":
    # Manual smoke test
    if not os.environ.get("ANTHROPIC_API_KEY"):
        raise SystemExit("ANTHROPIC_API_KEY not set. Copy .env.example to .env and fill in.")
    result = run_turn({"phase": 1, "name": "null", "age": "null"}, "(silence)")
    print("TEXT:", result.text)
    print("TOOLS:", result.tool_calls)
    print("STOP:", result.stop_reason)
