# בדיקת צל"ם — Combat Equipment Check

A web application for tracking and verifying combat equipment assignments in military units. Soldiers verify their assigned gear through a mobile-friendly interface, and commanders monitor verification status in real-time through an admin dashboard.

**Live:** [checkingTzelem.zvimarmor.com](https://checkingTzelem.zvimarmor.com)

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router, Turbopack) |
| **Language** | TypeScript |
| **Database** | PostgreSQL via [Supabase](https://supabase.com/) |
| **ORM** | [Prisma 7](https://www.prisma.io/) with `@prisma/adapter-pg` driver adapter |
| **Hosting** | [Netlify](https://netlify.com/) (serverless functions for API routes) |
| **Styling** | Vanilla CSS (custom design system, dark tactical theme, RTL) |

## Architecture

```
src/
├── app/
│   ├── page.tsx              # Soldier-facing verification flow
│   ├── admin/page.tsx        # Admin dashboard (tabbed: Status, Inventory, Add, Manage)
│   ├── api/
│   │   ├── teams/            # GET teams list
│   │   ├── soldiers/         # GET soldiers by team
│   │   ├── equipment/        # GET equipment by soldier
│   │   ├── verify/           # POST soldier self-verification
│   │   └── admin/
│   │       ├── login/        # POST admin authentication
│   │       ├── status/       # GET tri-state verification dashboard data
│   │       ├── summary/      # GET aggregate equipment counts
│   │       ├── inventory/    # GET drilldown by equipment type
│   │       │   └── verify/   # POST admin manual verification
│   │       ├── soldiers/     # CRUD soldiers
│   │       │   └── [id]/
│   │       │       └── equipment/  # CRUD equipment per soldier
│   │       └── equipment-types/    # GET distinct types
│   └── globals.css           # Full design system
├── components/               # React client components
├── lib/
│   ├── db.ts                 # Prisma client (pg pool adapter)
│   ├── utils.ts              # Date formatting, Hebrew locale
│   └── equipment-types.ts    # Standardized equipment list (Hebrew)
└── generated/prisma/         # Auto-generated Prisma client
```

## Features

### Soldier View (`/`)
- Select team → select soldier → verify equipment checklist
- **Partial verification** — soldiers can submit even if not all items are checked (with confirmation dialog)
- Hebrew RTL interface, mobile-optimized

### Admin Dashboard (`/admin`)
- **📊 סטטוס (Status):** Tri-state verification tracking (✅ Full / ⚠️ Partial / ❌ None) per soldier, grouped by team. Aggregate equipment summary with team filtering.
- **📦 מלאי (Inventory):** Grid of all equipment types with verified/total counts. Click to drill down into individual units — view serial numbers, assigned soldiers, and manually verify items.
- **➕ הוסף חייל (Add Soldier):** Onboard soldiers with equipment assignments. Autocomplete from standardized equipment list.
- **⚙️ ניהול (Manage):** Search, filter, edit, and delete soldiers and their equipment.

### Security
- Admin routes protected by `admin_auth` cookie (validated against `ADMIN_PASSWORD` env var)
- No personal identification numbers stored — soldiers identified by name + team only

---

## Prerequisites

### 1. Supabase Project

1. Create a free project at [supabase.com](https://supabase.com/)
2. Go to **Settings → Database** and copy:
   - **Connection string (Transaction/Session pooler)** — this is your `DATABASE_URL`
   - **Direct connection string** — this is your `DIRECT_URL` (used for migrations)
3. The database schema is managed by Prisma — tables are created automatically via `npx prisma db push`

### 2. Node.js

- Node.js **v22+** recommended
- npm v10+

### 3. Domain Connection

See [`DomainConnectionInstructions.md`](./DomainConnectionInstructions.md) for details on connecting a custom domain through Netlify.

---

## Environment Variables

Create a `.env` file in the project root (see `.env.example`):

```env
# Database (Supabase PostgreSQL)
DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-[region].pooler.supabase.com:6543/postgres"
DIRECT_URL="postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres"

# Admin Dashboard
ADMIN_PASSWORD="your-admin-password"

# Verification frequency in hours (24 = daily)
VERIFICATION_INTERVAL_HOURS=24
```

> **Important:** On Netlify, set these same variables in **Site Settings → Environment Variables**. The `DATABASE_URL` must use the **Supavisor pooler** connection string (port `6543`), not the direct connection.

---

## Getting Started

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Push schema to database (creates tables)
npx prisma db push

# (Optional) Seed from Excel file
npx ts-node prisma/seed.ts

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deployment (Netlify)

The project auto-deploys on push to `main`. The `netlify.toml` configures the build:

```toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "22"
```

Ensure all environment variables are set in Netlify's dashboard before deploying.

---

## Standardized Equipment List

The application uses a fixed Hebrew equipment list defined in [`src/lib/equipment-types.ts`](./src/lib/equipment-types.ts):

נועה, מיקרון, פק, ליאור, משקפת, שח"מ, שח"ע, עדי, טרמיס, מצפן, עמית, מכפל עמית, מטל, לייזר נגב, קליפאון, מאג, נגב 5, נגב 7, m4, m5, m16, קלע, מטול, נשק צלף, כוונת m4, רימון רסס, מטול נפיץ, מטול תאורה, אולר, טיל לאו, טיל מטאדור

To modify, edit the `EQUIPMENT_TYPES` array in that file and redeploy.

---

## Database Schema

| Table | Purpose |
|---|---|
| `Team` | Unit/squad groupings |
| `Soldier` | Personnel (name + team) |
| `Equipment` | Assigned gear (type + serial number + soldier FK) |
| `Verification` | Daily verification logs (JSON items array with per-item verified state) |
| `AppConfig` | Key-value settings (e.g. verification interval) |

Schema is defined in [`prisma/schema.prisma`](./prisma/schema.prisma) and managed via Prisma.
