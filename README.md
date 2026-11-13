# SkyMart

A modern catalogue and stock-management foundation for SkyMart, based on the **SkyMart Technical Plan**. Built with Next.js App Router, React, TypeScript and a Drizzle schema for Neon PostgreSQL. This milestone is a **working browser-local prototype**, not a production store.

## Run locally

Requires Node.js 20.9 or newer; Node.js 22 LTS is recommended.

```powershell
cd C:\Users\SMT\Desktop\loopBound\SkyMart
npm install
npm run dev
```

Open http://localhost:3000. Staff workspace: http://localhost:3000/admin.

```powershell
npm test
npm run typecheck
npm run build
```

## Included in this milestone

- Responsive storefront, about page, contact page, and account integration placeholder.
- Searchable catalogue, descendant-category filtering, availability filter and price/name sorting.
- Product detail pages, specifications, LKR pricing and quote-only products.
- Original local SVG sample illustrations; no remote product-photo dependency.
- Product → category → nearest parent → placeholder image fallback. Inherited images are labelled illustrative.
- Staff overview with real demo-data counts, product creation/editing, publication state and featured products.
- Category creation/editing, arbitrary nesting, cycle prevention and default image URLs.
- Stock receipts, offline sales, returns, damage and signed count corrections. Every new change has a reference, operator and timestamp. No negative inventory.
- Enquiry form and staff inbox with New / In progress / Resolved states and separate marketing preferences.
- Browser-local persistence under `skymart-demo-v1`. Reloading the same browser retains your changes.
- Drizzle schema, generated initial migration and server-side Neon connection foundation.
- Netlify build configuration. No hosting or cloud resources have been created.

## Demo boundaries

All products, prices, stock, specifications and illustrations are sample data. The staff area is deliberately labelled a demo and has **no authentication**. It operates only on data in your own browser. Do not enter real personal information or rely on it for business inventory.

The UI does **not** use Neon yet. Each browser has its own data; simultaneous tabs can overwrite local changes. The domain logic tests duplicate IDs but browser storage is not a transactional database. Stock quantities start as sample opening balances; subsequent changes create movement history.

Sign-in, registration, password reset, uploads, email delivery and SMS delivery are not connected. The account page explains this without collecting passwords. Enquiries are saved locally and are not delivered. Images accept HTTPS URLs or local asset paths; object-storage uploads are a later integration.

Public catalogue and staff UI currently use one demo product per SKU. The database already separates products from SKUs to support future variations.

## Database foundation

`src/db/schema.ts` defines profiles, separate staff memberships, nested categories, products, SKUs, stock movements, enquiries and a notification outbox. Money is stored in minor units in the database. No card, payment or checkout implementation belongs to phase 1.

Create a **development branch** of the selected Neon project before applying migrations. Copy `.env.example` to `.env`, then supply a pooled application `DATABASE_URL` and a direct `DATABASE_URL_UNPOOLED` for migrations. Never commit credentials.

```powershell
npm run db:generate
npm run db:migrate
```

The migration has been generated locally; it has not been applied to a live database. `src/db/client.ts` is a connection factory, not a persistence adapter for the demo. Simply adding environment variables will not connect the UI.

## Next implementation milestone

1. Connect the selected Neon project/branch and apply the reviewed migration.
2. Integrate Neon Auth (or a confirmed MFA-capable alternative), email verification, password resets and customer account pages. Enforce roles in every server operation; never accept roles from the browser.
3. Replace the browser store with server queries and validated mutations. Filter unpublished records server-side. Use recursive SQL for categories, serialize category-tree changes and reject cycles in the same transaction.
4. Implement stock operations as database transactions: lock the SKU, check nonnegative resulting stock, insert the idempotency key and movement, and update its balance atomically. Restrict movement updates/deletes at database privilege level. No standalone stock setter.
5. Add image uploads to object storage and the full SKU image fallback.
6. Persist enquiries and outbox entries atomically; add rate limits, spam controls, message workers, retries, verified email sending and a selected SMS provider.
7. Confirm company contact details, approved product data, warranties and policies. Replace illustrations and sample content. Add real API/auth/concurrency tests and accessibility QA before production deployment.

See `docs/requirements.md` for scope and acceptance criteria.

## Documentation references

- [Next.js installation](https://nextjs.org/docs/app/getting-started/installation)
- [Drizzle with Neon](https://orm.drizzle.team/docs/get-started/neon-new)

Fonts use Google Fonts with local system fallbacks. Product illustrations are original SVG assets included in this repository.

Deployment instructions: [GitHub, Netlify and production services guide](docs/deployment-guide.md).
