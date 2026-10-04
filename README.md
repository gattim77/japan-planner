# TABI — Japan Journey Planner

A working map-first Japan travel application. React 19, TypeScript, Next.js App Router APIs through Vinext, Tailwind 4, MapLibre GL, Drizzle and Cloudflare D1. This standalone edition runs on Cloudflare Workers and supports email/password and optional Google accounts with SQLite/D1 storage. It does **not** claim to be the entire production product described in the brief.

## Working features

- Real polygons for all 47 prefectures, hover, zoom, city/event markers, clustering, heatmap and schematic numbered itinerary routes.
- Manual dates and a dual-thumb slider spanning today through the same calendar date 12 months ahead (Japan time), month markers, bounded duration-preserving shifts and gained/lost event analysis.
- Nine itinerary scoring modes, three paces, realistic intercity service topology, per-stop explanations, hard locked-night / must-attend constraints and destination exclusions.
- Source-linked catalogue of 2,867 festival and ritual records across all 47 prefectures, with a searchable calendar and month, prefecture, region, collection, category and date-status filters. The original 147 highlights remain available separately. Historical listings are excluded from upcoming matches; multi-session programmes use individual published dates. Occurrences distinguish year-specific **announced** dates, **expected annual** dates and **seasonal** discovery periods. The curated transport network still supports 18 route destinations.
- Rail-pass economics for national 7/14/21-day passes and Kansai–Hiroshima, per-service eligibility, consecutive activation windows, uncovered tickets and online/agency price channels.
- Durable private saved trips, rename, duplicate, archive, delete, regeneration snapshots, restoration, explicit token sharing and revocation. Shared URLs are read-only and revocable.
- Durable festival priorities and notes; My Matsuri cards, calendar and map; visited status; search and light/dark UI.
- Server ownership checks, prepared SQL, bounded request validation, no browser storage for authoritative product data. Only theme is stored locally.

## Important scope limits

This is a functional first release, **not production-complete**. Email/password sign-in is configured. Google sign-in is implemented and becomes available when Google OAuth credentials are configured. Apple, email verification and automatic password recovery are not configured. There is no PostgreSQL deployment or Prisma schema. The festival catalogue is broad but not exhaustive; the transport network and attraction coverage remain limited; the UI explicitly identifies missing details. Full prefecture tourism profiles, attraction opening hours / pricing / photography restrictions, comprehensive seasonal datasets, all regional/private passes, pass stacking, end-to-end real-time timetable routing and live fare quotes remain to be integrated. Travel durations and fares are labelled curated planning estimates; no booking availability is implied. Route geometry joins stops schematically, not along tracks. Hotel changes are penalized, but the optimizer is a bounded beam-search heuristic, not a proof of global optimality. Saved city preferences are scoped to a trip, not a standalone cross-trip favourites library. Day/night service availability is not modelled; “Night Transport Allowed” permits no extra services yet.

## Cloudflare deployment

Use Node >=22.13 and npm. Run `npm ci`, `npm run db:migrate:local`, `npm run typecheck`, `npm test`, and `npm run build`.

The Worker is `japan-planner`, with a separate D1 database and custom domain `japan-planner.third-ai.com`. Cloudflare Workers Builds uses branch `main`, build command `npm run build` and deploy command `npm run deploy:built`. Database migrations run before publishing the built Worker; deployments preserve dashboard secrets. Preview URLs and workers.dev are disabled.

The application is **public**: visitors can browse festivals and generate itineraries without an account. Email registration and sign-in need no invitation. Saving trips and festival priorities requires an authenticated account; each account can only access its own saved records. Explicit read-only share links can be viewed without signing in. The former `PRIVATE_SITE`, `OWNER_EMAIL` and `SETUP_KEY` settings are no longer used.

For Google sign-in, create a Web application OAuth client in your existing Google Cloud project. Register the exact authorized redirect URI `https://japan-planner.third-ai.com/api/auth/google/callback`. Set `GOOGLE_CLIENT_ID` and the secret `GOOGLE_CLIENT_SECRET` in Cloudflare runtime variables. The Google button appears only when both are set; email sign-in remains available. Google requires an external production audience to allow ordinary visitors, not just test users. Request only `openid email profile`. Tokens are verified with Google's signing keys, issuer, audience, expiry and nonce. State is browser-bound, expires after ten minutes and is consumed once; code exchange uses PKCE. Google identities use their stable subject ID, not mutable email. Existing email accounts must authenticate with their password before connecting Google from My travel space, preventing unverified email account linking. Never commit OAuth secrets.

Sessions use hashed random tokens stored in D1 and HttpOnly, Secure, SameSite cookies. Caller-supplied ChatGPT identity headers are ignored. Passwords are salted PBKDF2 hashes, login failures trigger temporary lockout, and authentication mutations require same-origin requests. Session expiry is 30 days. No credentials are shipped in source. The separate Sites deployment and its saved data are untouched; migrating existing personal records requires an authenticated export and explicit ownership mapping.

For local testing, copy `.dev.vars.example` to `.dev.vars`, then build and start with `npm run start -- --port 8795`. Synthetic tests must target localhost, never production.

## Architecture and provenance

`lib/catalog.ts`: curated trusted source facts with URLs, authority via source domain and verification date. City summaries are editorial paraphrases; recommended nights and interests are editorial recommendations. `lib/source-adapters.ts`: replaceable reviewed structured import boundary. A confirmed occurrence requires year-specific source evidence. `lib/transport.ts`: source-linked service topology; fares/durations explicitly derived planning estimates; authoritative pass prices differentiated by channel. `lib/optimizer.ts`: deterministic bounded beam search over date-feasible stays and network shortest paths. `lib/server.ts`: validation, identity and shared SQL boundary. `app/api/`: typed request schemas, protected persistent operations and read-only share responses. `db/schema.ts`: source, prefecture, city, attraction, event, occurrence, transport, pass and user-owned tables. Trip snapshots store the complete reproducible optimization input and output as JSON.

User data is held in D1. Transient unsaved drafts are React state. Catalogue source records are version-controlled and bundled; these can be imported to their relational tables with `scripts/import-catalog.ts` without changing schema migrations. Future adapters should update source tables transactionally and materialize reviewed catalogue exports; no implicit scraping is enabled. The catalogue GET endpoint uses short HTTP caching; personal endpoints use no-store. No live weather forecast or bloom-probability model is included.

## Import reviewed catalogue

```sh
mkdir -p work
node --experimental-strip-types scripts/import-catalog.ts > work/catalog.sql
# Review the generated SQL. Then apply locally or through an authorized production
# data workflow; do not put seed datasets into Drizzle schema migrations.
npx wrangler d1 execute DB --local --config wrangler.json --persist-to .wrangler/state --file work/catalog.sql
```

## Validation

`node tests/catalogue.mjs`, `npx tsc --noEmit` and `npm run build`. Catalogue tests cover the rolling horizon, leap years, drag boundaries, recurrence rules, evidence status and all 47 prefectures. `tests/integration.py` targets a **local built Worker** with synthetic email accounts; it checks dates, nights, locks, must-attend conflicts, actual D1 trip persistence, ownership isolation, snapshots, restore, explicit sharing/revocation and saved festivals. Run the local Worker with `npm run start`, then `API_BASE=http://127.0.0.1:8795 python3 tests/integration.py`. Never aim this test at production. The browser WebMCP tool changes the current date window only and does not save or book anything.

## Sources and licensing

Festival research includes JAPAN 47 GO municipal tourism metadata: see [the audit and source index](docs/festival-research.md), including the joint prefectural/Tokyo tourism festival directory, JNTO and official local tourism/organizer programmes; individual record URLs are shown in the application. Boundary data: https://github.com/dataofjapan/land, derived from GSI Global Map Japan; preserve attribution and review original reuse terms before commercial distribution. Takayama editorial image is linked from the official tourism page, credited via that page; obtain redistribution permission or replace with licensed imagery before a commercial launch. MapLibre is BSD-3-Clause; its self-hosted worker and shared module are copied from the installed version to avoid blob-worker restrictions. Keep it updated with MapLibre package upgrades.

JR Group pricing verified October 1, 2026: https://japanrailpass.net/en/purchase/price/ and https://global.jr-central.co.jp/en/news/_pdf/2026/0001.pdf. JR West pass terms: https://www.westjr.co.jp/travel-information/en/tickets-passes/jrwest-rail-pass/kansai_hiroshima/ . Fare estimates must be replaced with licensed current routing/fare data before promising price accuracy.

## Festival planning and itinerary summary

Maximum Festivals now prioritizes distinct dated festival opportunities and searches stay lengths that line up with festival dates. Sourced venues within 25 km of a supported overnight city can appear as nearby opportunities; local transport and programme times still require checking. Duplicate Otsu source records count once. Approximate seasonal windows remain excluded. Start and finish cities are enforced, including round trips, and saved versions retain these preferences. The itinerary table gives arrival/check-out dates, nights, festival opportunities, onward services, estimated time/fare and operator links.

Festival names and suggested visit dates now appear directly in each destination row. Clicking a name opens an accessible information dialog with the festival dates, venue/address, local-access caveat, programme guidance, evidence status and source links. The table includes the total dated opportunity count. Generation and automatic recalculation share a request sequence and input check so an outdated response cannot replace the latest plan.

Browser regression: October 4–18, 2026, Tokyo start, Maximum Festivals, both automatic finish and Osaka finish, produced 9 dated opportunities through generation and regeneration. An older already-open published tab was found running a previous frontend; reload to load new deployments.

## February–March routing regression

The February 20–March 18, 2027 Tokyo round trip previously returned zero because all 19 dated matches were outside the original 10 overnight bases; the other 334 of 353 discovery matches had unverified seasonal dates. Added rail-connected Nara, Nagoya, Sendai, Hachinohe, Wakayama, Okayama, Kumamoto and Chiba. The exact Maximum Festivals / Balanced / Fastest round trip now returns at least 7 dated opportunities. Calendar and itinerary counts explicitly separate dated opportunities from seasonal matches, and indicate supported-city coverage. No seasonal boundaries are converted into festival dates. Rail topology follows operator sources; times/fares remain estimates.

## Stay allocation

Unlocked stays now use editorial planning ranges, independently of festival run length. Balanced Kyoto stays are 3–4 nights; Nara stays are 1–2, with Omizutori planned as one evening. Extra nights beyond a destination’s target incur diminishing value; Maximum Festivals uses sensible stays before transport tie-breaks. Explicit night locks override ranges. Very long trips or extensive exclusions can extend normal ranges with an explanation. The February 20–March 18, 2027 regression now gives Nara 1 night, Kyoto 4 nights and 8 dated opportunities. Ranges are travel-planning defaults, not authoritative destination limits.
