# Payload Blank Template

This template comes configured with the bare minimum to get started on anything you need.

## Quick start

This template is configured to use PostgreSQL (Supabase) for database storage and supports cloud S3 object storage for media.

## Quick Start - local setup

To spin up this template locally, follow these steps:

### Clone

After you click the `Deploy` button above, you'll want to have standalone copy of this repo on your machine. If you've already cloned this repo, skip to [Development](#development).

### Development

1. First [clone the repo](#clone) if you have not done so already
2. **Configure Database Connection:**
   - Create a `.env` file in the project root
   - Add your Supabase PostgreSQL connection string:
     ```env
     DATABASE_URI="postgresql://[user]:[password]@[host]:[port]/[database]?sslmode=require"
     PAYLOAD_SECRET="your-secure-secret-key"
     PAYLOAD_PUBLIC_SERVER_URL="http://localhost:3000"
     ```
   - Get your Supabase connection string from: **Supabase Dashboard → Project Settings → Database → Connection Pooling**
   - Use the **connection pooling string** (port 6543) for better performance

3. `pnpm install && pnpm dev` to install dependencies and start the dev server
4. open `http://localhost:3000` to open the app in your browser

That's it! Changes made in `./src` will be reflected in your app. Follow the on-screen instructions to login and create your first admin user. Then check out [Production](#production) once you're ready to build and serve your app, and [Deployment](#deployment) when you're ready to go live.

#### Docker (Optional)

If you prefer to use Docker with a **local PostgreSQL instance** instead of external Supabase, follow these steps:

1. In `docker-compose.yml`, uncomment the `DATABASE_URI` override in the payload service:
   ```yaml
   environment:
     DATABASE_URI: postgresql://payload:payload@postgres:5432/payload
   ```
2. Run `docker-compose up` to start both the app and local PostgreSQL
3. The local PostgreSQL will be available at `localhost:5432`

**Note:** By default, the app connects to your external Supabase database using the `DATABASE_URI` from your `.env` file.

## How it works

The Payload config is tailored specifically to the needs of most websites. It is pre-configured in the following ways:

### Collections

See the [Collections](https://payloadcms.com/docs/configuration/collections) docs for details on how to extend this functionality.

- #### Users (Authentication)

  Users are auth-enabled collections that have access to the admin panel.

  For additional help, see the official [Auth Example](https://github.com/payloadcms/payload/tree/main/examples/auth) or the [Authentication](https://payloadcms.com/docs/authentication/overview#authentication-overview) docs.

- #### Media

  This is the uploads enabled collection. It features pre-configured sizes, focal point and manual resizing to help you manage your pictures.

### Docker

Alternatively, you can use [Docker](https://www.docker.com) to spin up this template locally. To do so, follow these steps:

1. Create your `.env` file with Supabase credentials (see [Development](#development) steps above)
2. Run `docker-compose up` to start the application
3. Open `http://localhost:3000/admin` and create your first admin user

**Database Options:**
- **Default:** Connects to external Supabase using `DATABASE_URI` from `.env`
- **Local PostgreSQL:** Uncomment the `DATABASE_URI` override in `docker-compose.yml` to use the included PostgreSQL container

That's it! The Docker instance will help you get up and running quickly while also standardizing the development environment across your teams.

## Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URI` | Yes | PostgreSQL connection string from Supabase | `postgresql://user:pass@host:6543/db?sslmode=require` |
| `PAYLOAD_SECRET` | Yes | Secret key for encryption (min 32 chars) | `your-secret-key-here` |
| `PAYLOAD_PUBLIC_SERVER_URL` | Yes | Public URL of your CMS | `http://localhost:3000` |
| `NODE_OPTIONS` | No | Node.js runtime options | `--no-deprecation` |

## Troubleshooting

### Database Connection Issues

**Error: "DATABASE_URI environment variable is required"**
- Make sure you have created a `.env` file in the project root
- Verify it contains the `DATABASE_URI` variable

**Error: "DATABASE_URI must be a PostgreSQL connection string"**
- Your connection string must start with `postgresql://`
- Check that you're using the Supabase connection string, not MongoDB

**Connection timeout or SSL errors:**
- Ensure your Supabase project is active
- Use the connection pooling string (port 6543) from Supabase dashboard
- Verify `?sslmode=require` is included in the connection string

**Tables not created:**
- The app uses `push: true` to auto-create tables on first run
- Check Supabase dashboard → Table Editor to verify tables were created
- Check application logs for migration errors

## Operator Guide

For step-by-step repository handling and GitHub workflow instructions, use:
- `docs/REPO_OPERATOR_SOP.md`

## Questions

If you have any issues or questions, reach out to us on [Discord](https://discord.com/invite/payload) or start a [GitHub discussion](https://github.com/payloadcms/payload/discussions).
