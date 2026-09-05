from __future__ import annotations

from copy import deepcopy

import pytest

from scripts.gitops.validate_reusable_full_run import validate

HEAD = "5d2b33805bd3fb0195a23e50fb77464205bcd52d"
REPO = "linktrend/LiNKsites"


@pytest.fixture
def run_record() -> dict:
    return {
        "path": ".github/workflows/linktrend-integrator-merge.yml",
        "event": "pull_request",
        "conclusion": "success",
        "run_attempt": 1,
        "head_sha": HEAD,
        "pull_requests": [],
    }


@pytest.fixture
def source_pr_record() -> dict:
    repo = {"url": f"https://api.github.com/repos/{REPO}"}
    return {
        "number": 458,
        "state": "closed",
        "merged_at": "2026-09-05T09:56:00Z",
        "base": {"ref": "development", "repo": repo},
        "head": {"sha": HEAD, "repo": repo},
    }


def test_accepts_exact_merged_source_when_run_pr_array_is_empty(
    run_record: dict, source_pr_record: dict
) -> None:
    validate(run_record, source_pr_record, repo=REPO, head=HEAD, source_pr=458)


@pytest.mark.parametrize(
    ("target", "path", "value"),
    [
        ("run", ("head_sha",), "0" * 40),
        ("run", ("conclusion",), "failure"),
        ("pr", ("state",), "open"),
        ("pr", ("merged_at",), None),
        ("pr", ("base", "ref"), "main"),
        ("pr", ("head", "sha"), "0" * 40),
        ("pr", ("head", "repo", "url"), "https://api.github.com/repos/other/repo"),
    ],
)
def test_fails_closed_on_identity_mismatch(
    run_record: dict,
    source_pr_record: dict,
    target: str,
    path: tuple[str, ...],
    value: object,
) -> None:
    record = deepcopy(run_record if target == "run" else source_pr_record)
    cursor = record
    for key in path[:-1]:
        cursor = cursor[key]
    cursor[path[-1]] = value
    run = record if target == "run" else run_record
    pr = record if target == "pr" else source_pr_record
    with pytest.raises(ValueError):
        validate(run, pr, repo=REPO, head=HEAD, source_pr=458)
