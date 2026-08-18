# CMS local validation

Run the CMS build and tests against a disposable local Supabase database with:

```sh
pnpm --filter @linksites/cms run test:local
```

The wrapper copies `supabase/config.toml` into a temporary directory, assigns
the temporary project id `cms-local-validation`, starts only the local database
services, and injects these values for the duration of the command:

```text
DATABASE_URI=ltfx.db.uri.postgresql.cf6453a9f9.v1
PAYLOAD_SECRET=ltfx.auto.payload_secret.f144857be2c9.v1
PAYLOAD_PUBLIC_SERVER_URL=http://127.0.0.1:3000
```

Payload creates its CMS tables in this disposable database through its normal
development migration/push behavior. The wrapper stops the local Supabase
project and removes its temporary directory on exit. It does not link, log in,
push, or contact a hosted Supabase project, and no `.env` file or credential is
created or committed.

For root-level commands that do not use the wrapper, start the disposable local
database first and inject the same values explicitly, for example:

```sh
DATABASE_URI=ltfx.db.uri.postgresql.cf6453a9f9.v1 \
PAYLOAD_SECRET=ltfx.auto.payload_secret.07f405759549.v1 \
PAYLOAD_PUBLIC_SERVER_URL=http://127.0.0.1:3000 \
pnpm build
```

Local build, integration, and browser-test results prove only that the checked
out source runs against this disposable local database. They do not prove live
Supabase connectivity, production credentials, deployment, hosted networking,
backups, observability, or production readiness. Production continues to
require separately injected deployment-managed `DATABASE_URI` and
`PAYLOAD_SECRET` values.
