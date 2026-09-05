#!/usr/bin/env python3
"""Validate a retained full-suite run against its exact merged source PR."""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path
from typing import Any

SHA_RE = re.compile(r"^[0-9a-f]{40}$")


def _read_object(path: Path) -> dict[str, Any]:
    value = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(value, dict):
        raise ValueError(f"expected JSON object: {path}")
    return value


def validate(
    run: dict[str, Any],
    source_pr_record: dict[str, Any],
    *,
    repo: str,
    head: str,
    source_pr: int,
) -> None:
    if not SHA_RE.fullmatch(head):
        raise ValueError("receipt_gate_head_invalid")
    if not (
        run.get("path") == ".github/workflows/linktrend-integrator-merge.yml"
        and run.get("event") == "pull_request"
        and run.get("conclusion") == "success"
        and type(run.get("run_attempt")) is int
        and run["run_attempt"] >= 1
        and run.get("head_sha") == head
    ):
        raise ValueError("receipt_gate_full_run_not_reusable")

    base = source_pr_record.get("base") or {}
    source_head = source_pr_record.get("head") or {}
    base_repo = base.get("repo") or {}
    head_repo = source_head.get("repo") or {}
    expected_url = f"https://api.github.com/repos/{repo}"
    if not (
        source_pr_record.get("number") == source_pr
        and source_pr_record.get("state") == "closed"
        and source_pr_record.get("merged_at")
        and base.get("ref") == "development"
        and base_repo.get("url") == expected_url
        and head_repo.get("url") == expected_url
        and source_head.get("sha") == head
    ):
        raise ValueError("receipt_gate_source_pr_not_reusable")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--run-json", type=Path, required=True)
    parser.add_argument("--source-pr-json", type=Path, required=True)
    parser.add_argument("--repo", required=True)
    parser.add_argument("--head", required=True)
    parser.add_argument("--source-pr", type=int, required=True)
    args = parser.parse_args()
    try:
        validate(
            _read_object(args.run_json),
            _read_object(args.source_pr_json),
            repo=args.repo,
            head=args.head,
            source_pr=args.source_pr,
        )
    except (OSError, json.JSONDecodeError, ValueError) as exc:
        print(str(exc))
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
