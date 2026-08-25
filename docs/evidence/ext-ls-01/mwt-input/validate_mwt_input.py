#!/usr/bin/env python3
"""Fail-closed static validation for EXT-LS-01 MWT input evidence."""

from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
HANDOFF = ROOT.parents[1] / "mwt-handoff"

CANDIDATE_COMMIT = "2ba3bd70244061985a3896e748fb75e92dfb6c69"
CANDIDATE_TREE = "606fcb986b8eb9af476aea369d94990357ff9681"
PROTECTED_COMMIT = "6169548ddbf6bff99a3eb8de3716e9fd3a843b11"
PROTECTED_TREE = "24e5b46566a45a58de3df243b45e7918d419cb2c"

FORBIDDEN_TRUE = (
    "accept",
    "protectedIntegrated",
    "protectedIntegration",
    "providerConformance",
    "productionProof",
    "consumerProof",
    "a1Accepted",
    "a1Acceptance",
    "approved",
    "dispatchable",
    "packetCompletion",
    "selectability",
    "mwt08Through11Authorized",
    "equalsBoundCandidate",
    "containsBoundCandidate",
    "bytesEmbedded",
    "locallyRehashed",
    "conformanceClaimed",
    "anyPassVerdict",
    "h09PathsModified",
    "editsArchitectureOrRegistry",
)

FALSE_REQUIRED = {
    "CANDIDATE-IDENTITY.json": ["claims.accept", "claims.protectedIntegrated"],
    "IMMUTABLE-RECEIPT-INPUT.json": [
        "packetCompletion",
        "prohibitedClaims.accept",
        "prohibitedClaims.protectedIntegration",
        "prohibitedClaims.providerConformance",
        "prohibitedClaims.productionProof",
        "prohibitedClaims.a1Acceptance",
        "prohibitedClaims.mwt08Through11Authorized",
    ],
    "MANIFEST-AMENDMENT-INPUT.json": ["approved", "dispatchable"],
}


def load(path: Path) -> dict:
    data = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(data, dict):
        raise SystemExit(f"{path.name}: expected object")
    return data


def walk(obj, prefix=""):
    if isinstance(obj, dict):
        for k, v in obj.items():
            key = f"{prefix}.{k}" if prefix else k
            yield key, v
            yield from walk(v, key)
    elif isinstance(obj, list):
        for i, v in enumerate(obj):
            key = f"{prefix}[{i}]"
            yield key, v
            yield from walk(v, key)


def get_path(data: dict, dotted: str):
    cur = data
    for part in dotted.split("."):
        cur = cur[part]
    return cur


def main() -> int:
    errors: list[str] = []
    identity = load(ROOT / "CANDIDATE-IDENTITY.json")
    receipt = load(ROOT / "IMMUTABLE-RECEIPT-INPUT.json")
    deps = load(ROOT / "DEPENDENCIES.json")
    amendment = load(ROOT / "MANIFEST-AMENDMENT-INPUT.json")
    handoff = load(HANDOFF / "HANDOFF.json")
    status = load(HANDOFF / "STATUS.json")

    cand = identity["boundCandidate"]
    if cand["commit"] != CANDIDATE_COMMIT:
        errors.append("candidate commit mismatch")
    if cand["tree"] != CANDIDATE_TREE:
        errors.append("candidate tree mismatch")
    prot = identity["protectedDevelopmentReadback"]
    if prot["commit"] != PROTECTED_COMMIT or prot["tree"] != PROTECTED_TREE:
        errors.append("protected development readback mismatch")
    if prot["equalsBoundCandidate"] is not False:
        errors.append("protected development must not equal candidate")

    cons = receipt["consumerIdentity"]
    if cons["commit"] != CANDIDATE_COMMIT or cons["tree"] != CANDIDATE_TREE:
        errors.append("receipt consumer identity mismatch")
    if receipt["status"] != "CANDIDATE_BOUND_INPUT_NOT_ACCEPTED":
        errors.append("receipt status must remain not accepted")
    if receipt["verdict"] != "NOT_ACCEPTED":
        errors.append("receipt verdict must remain NOT_ACCEPTED")
    if receipt["cellMatrix"]["suppliedCellCount"] != 0:
        errors.append("must not supply fabricated proof cells")
    if amendment["authorizedPackets"]:
        errors.append("amendment must authorize no packets")
    if amendment["amendmentStatus"] != "DRAFT_INPUT_NOT_APPROVED":
        errors.append("amendment must remain draft input")

    for dep in deps["dependencies"]:
        if dep.get("satisfied") is not False:
            errors.append(f"dependency {dep.get('id')} must be unsatisfied")

    named = {
        "CANDIDATE-IDENTITY.json": identity,
        "IMMUTABLE-RECEIPT-INPUT.json": receipt,
        "MANIFEST-AMENDMENT-INPUT.json": amendment,
        "DEPENDENCIES.json": deps,
        "HANDOFF.json": handoff,
        "STATUS.json": status,
    }
    for name, data in named.items():
        for key, value in walk(data):
            leaf = key.split(".")[-1].split("[")[0]
            if leaf in FORBIDDEN_TRUE and value is True:
                errors.append(f"{name}:{key} must not be true")
            if isinstance(value, str) and value in {"PASS", "ACCEPT", "ACCEPTED"}:
                errors.append(f"{name}:{key} must not claim {value}")
        for dotted in FALSE_REQUIRED.get(name, []):
            if get_path(data, dotted) is not False:
                errors.append(f"{name}:{dotted} must be false")

    if handoff["boundCandidate"]["commit"] != CANDIDATE_COMMIT:
        errors.append("handoff candidate commit mismatch")
    if status["consumerProofPresent"] is not False:
        errors.append("handoff status must not claim consumer proof")

    owned = {
        "docs/evidence/ext-ls-01/mwt-input/**",
        "docs/evidence/mwt-handoff/**",
    }
    for data in (receipt, handoff, status):
        scope = data.get("scope") or data.get("ownedPaths")
        if isinstance(scope, dict):
            paths = set(scope.get("ownedPaths") or [])
        elif isinstance(scope, list):
            paths = set(scope)
        else:
            continue
        if paths and not paths <= owned:
            errors.append(f"owned path drift: {sorted(paths - owned)}")

    if errors:
        print("FAIL")
        for err in errors:
            print(f"- {err}")
        return 1
    print("PASS")
    print(f"candidate={CANDIDATE_COMMIT}")
    print(f"tree={CANDIDATE_TREE}")
    print("protected_integrated=false")
    print("accept=false")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
