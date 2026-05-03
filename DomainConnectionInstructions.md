# Domain Connection & Infrastructure Summary: RoadGuardProgram

This document summarizes how the current project is hosted and connected to the domain `guardinglist.zvimarmmor.com`. Since you are planning to build another website under your domain, you can follow this same pattern.

## 1. Core Infrastructure Stack

The project uses a modern serverless stack that minimizes manual server management:

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router).
- **Hosting**: [Netlify](https://www.netlify.com/).
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL).
- **Deployment**: Automatic CI/CD via GitHub.

## 2. How the Domain is Connected

The connection to `guardinglist.zvimarmmor.com` is handled at the **infrastructure layer**, not within the code itself. Here is the step-by-step connection flow:

### A. Netlify Configuration

1. **Site Creation**: The GitHub repository was linked to a new site in the Netlify dashboard.
2. **Custom Domain**: In the Netlify settings (**Domain Management > Custom Domains**), the subdomain `guardinglist.zvimarmmor.com` was added.
3. **SSL/TLS**: Netlify automatically provisioned a **Let's Encrypt** SSL certificate once the DNS was verified, enabling HTTPS.

### B. DNS Setup (at your Registrar)

To point the subdomain to Netlify, a **CNAME record** was added to the DNS settings of `zvimarmmor.com`:

- **Type**: `CNAME`
- **Name/Host**: `guardinglist`
- **Value/Target**: `[your-site-name].netlify.app` (The internal Netlify URL).

## 3. How the Project Runs

The running process is automated through the `netlify.toml` file found in your root directory:

```toml
[build]
  command = "npm run build"  # Runs 'prisma generate && next build'
  publish = ".next"          # The directory Netlify serves

[build.environment]
  NODE_VERSION = "18"

[[plugins]]
  package = "@netlify/plugin-nextjs" # Essential for Next.js features on Netlify
```

### Build & Execution Flow:

1. **Push to GitHub**: Every time code is pushed, Netlify detects the change.
2. **Environment Variables**: Netlify injects the `DATABASE_URL` and `DIRECT_URL` (configured in the Netlify Dashboard) into the build environment.
3. **Build Command**: Netlify runs `npm run build`, which:
   - Generates the **Prisma Client** (to talk to Supabase).
   - Compiles the Next.js application.
4. **Serving**: Netlify serves the compiled `.next` directory. API routes are handled as serverless functions.

## 4. Key Takeaways for your New Website

If you want to replicate this for another subdomain (e.g., `newsite.zvimarmmor.com`):

1. **Create a new Repo**: Or use a monorepo structure.
2. **Connect to Netlify**: Create a new Netlify site for the new project.
3. **Add Custom Domain**: Add `newsite.zvimarmmor.com` in Netlify.
4. **Update DNS**: Add another `CNAME` record for `newsite` pointing to the new Netlify site URL.
5. **Environment Variables**: Ensure you copy necessary DB strings or API keys to the new Netlify site's settings.
