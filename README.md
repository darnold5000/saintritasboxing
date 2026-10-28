# St. Rita's Boxing

Premium boxing gym website for **St. Rita's Boxing** at SonShine Park, Mooresville, Indiana. Built-in training reservations and Stripe Checkout.

This is an independent client repository. Do not copy credentials or branding from DAWG, Noochie Varner, or other clients.

## Visual identity

- Background `#0B0A0F` / `#17121F`
- Purple `#6516A4`
- Gold `#F3B72F`
- Official hornet logo: `public/images/brand/hornet-logo.jpg`

## Demo vs live

The site is demo-ready without secrets. Booking UI, pricing, and admin screens work with sample availability.

Live reservations and payments need St. Rita's own:

1. Supabase project (apply `supabase/migrations/001_srb_foundation.sql`)
2. Stripe account (test mode first) + webhook to `/api/stripe/webhook`
3. Resend domain + `OWNER_EMAIL`
4. Staff user: create in Supabase Auth, then `STAFF_EMAIL=you@example.com npm run db:staff`

See [docs/SETUP.md](docs/SETUP.md).

## Scripts

```bash
npm install
npm run dev
npm run test
npm run typecheck
npm run lint
npm run build
STAFF_EMAIL=you@example.com npm run db:staff
```

Prices live in `src/lib/catalog.ts`. Availability defaults live in `src/lib/availability.ts` until the owner confirms hours.

## SEO

This repo is opted in for indexing (local boxing-training searches). Admin, login, and account routes stay `noindex`.
