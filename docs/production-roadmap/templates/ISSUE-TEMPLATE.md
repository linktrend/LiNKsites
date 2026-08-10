# Atomic Issue Template

```yaml
schema_version: 1
issue_id: <WP-ID>-I<NN>
title: <single outcome>
status: draft
parent_program: linksites-production-readiness
parent_module: <module-id>
parent_phase: <phase-id>
work_packet: <WP-ID>
depends_on: []
executor:
  type: model_agent | automation | script | tool | oss_adapter | api_mcp
  identity: <approved executor>
  version: <exact version or route>
objective: <one observable outcome>
scope:
  allowed_paths: []
  forbidden_paths: []
  external_actions: none | <exact approved boundary>
inputs: []
expected_outputs: []
acceptance_criteria: []
proof_requirements: []
review_requirements: []
integration_requirements: []
validation_commands: []
failure_classes: []
max_ordinary_repairs: 3
read_first: []
read_forbidden: []
blocking_questions: []
```

The Issue becomes `ready` only after every dependency is integrated and every blocking question/entry gate is resolved. It becomes `done` only after Proof, independent Review pass, and Integration.

