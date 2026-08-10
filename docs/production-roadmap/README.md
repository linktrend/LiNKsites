# LiNKsites Production Roadmap Packet Set

**Status:** Draft — pending Principal approval.

This directory contains the execution layer for [`../LINKSITES-PRODUCTION-READINESS-ROADMAP.md`](../LINKSITES-PRODUCTION-READINESS-ROADMAP.md).

## Read order

1. [`../LINKSITES-PRODUCTION-READINESS-ROADMAP.md`](../LINKSITES-PRODUCTION-READINESS-ROADMAP.md)
2. [`EXECUTION-PROTOCOL.md`](./EXECUTION-PROTOCOL.md)
3. [`WAVE-MANIFEST.yaml`](./WAVE-MANIFEST.yaml) and [`EXECUTION-STATE.yaml`](./EXECUTION-STATE.yaml)
4. [`WORK-PACKET-INDEX.md`](./WORK-PACKET-INDEX.md)
5. Only the current wave’s packet and its named dependencies
6. The audit packet after the integrated wave candidate exists

## Directory map

```text
production-roadmap/
├── EXECUTION-PROTOCOL.md
├── WAVE-MANIFEST.yaml
├── EXECUTION-STATE.yaml
├── STATUS-UPDATE-TEMPLATE.md
├── WORK-PACKET-INDEX.md
├── templates/  # Issue, Proof, Review, Integration, and higher-level gate records
├── wave-1/     # contracts and durable foundations
├── wave-2/     # complete vertical slice and release readiness
├── audit/      # independent Sol Medium audit contract
└── phase-2/    # separately authorized VPS deployment/pilot packet
```

## Execution rule

Packets are planning artifacts until the Principal approves them. After approval, the master orchestrator may dispatch ready Phase 1 packets in dependency order. The master must stop after Phase 1 completion and request separate authorization before any Phase 2 live operation.

Each packet is a **work pack** containing numbered requirements that become atomic Ledger Issues. Before coding, the assigned agent proposes an Issue manifest with one outcome, dependency set, path boundary, validation, and evidence gate per Issue; the Terra master approves that split. Work packs may run in parallel only where the index and their owned paths permit.

Use the artifacts under [`templates/`](./templates/) rather than inventing a completion format.
