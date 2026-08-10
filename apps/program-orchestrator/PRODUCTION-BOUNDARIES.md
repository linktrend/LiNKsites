# Program orchestrator production boundary

Production composition uses the configured Postgres adapter, migration-owned
runtime/lifecycle tables, authenticated Payload REST, and the configured
web-master service. It does not create schema or use local files for durable
state, completion delivery, or readiness.

The W2-05 commercial outcome contract is authenticated by
`LiNKautoworkGateway` and exposed to the host through
`ProgramRuntime.acceptCommercialOutcome`. This lane does not invent a CRM,
payment, or HTTP webhook implementation. Until a host binds that method to an
authenticated service ingress, commercial outcome intake remains fail-closed;
the remaining adapter boundary is the host HTTP transport and its W2-05
signed `GatewayRequest` mapping.
