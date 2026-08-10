-- migrate:up
-- W1-04 correction: remove inherited broad table privileges from the runtime
-- role. Working-content versions and promotion receipts are append-only from
-- the runtime's perspective; lifecycle transitions and receipt insertion are
-- the only legitimate mutations exposed by the W1-04 contract.

revoke delete on table lsites_sites.working_packages from svc_linksites_runtime;
revoke delete on table lsites_sites.working_content_versions from svc_linksites_runtime;
revoke update on table lsites_sites.working_content_promotion_receipts from svc_linksites_runtime;
revoke delete on table lsites_sites.working_content_promotion_receipts from svc_linksites_runtime;
