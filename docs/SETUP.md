# St. Rita's Boxing setup

Copy `.env.example` to `.env.local`. Use **this client's** credentials only.

## Supabase

1. Create a project (or apply the `srb_` migration on the shared Signal Works database).
2. Run migrations:
   - **SQL editor:** paste and run the files in `supabase/migrations/` in numeric order, through `007_srb_coach_and_gallery.sql`.
   - **CLI:** `DATABASE_URL=postgresql://... npm run db:migrate`  
     On shared production (`gezdzzqnylloaxcmuzvm`), also set `SRB_MIGRATE_CONFIRM=gezdzzqnylloaxcmuzvm`.
3. Disable public signup. Invite staff in Auth.
4. Grant access: `STAFF_EMAIL=owner@example.com npm run db:staff` (owner) or `STAFF_EMAIL=coach@example.com STAFF_ROLE=staff npm run db:staff`. Owners see payments and credits. Staff can use the portal without those.

Tables are prefixed `srb_` so they do not collide with other products.

## Stripe

1. Create a St. Rita's Stripe account.
2. Use **test** keys first (`sk_test_`, `whsec_`).
3. Webhook endpoint: `https://<domain>/api/stripe/webhook`
4. Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
5. Enable Apple Pay / Google Pay in the Stripe Checkout dashboard when ready.

Prices are **not** hardcoded as Stripe Price IDs. Checkout sends `price_data` from `src/lib/catalog.ts`. Paid status is set only after a verified webhook.

## Email

1. Verify `hiresignalworks.com` in Resend (SPF, DKIM, DMARC).
2. Set `RESEND_API_KEY`. Mail is sent from `info@hiresignalworks.com` as **Saint Ritas Boxing**.
3. Contact form and booking alerts go to `stritasboxing@gmail.com`. Reply-To on every email is that same address.
4. Staff sign-in does not send mail. The forgot-password link does, and that message goes to the staff member who asked for it.

Do not invent an owner address.

## Confirm before launch

- Address: SonShine Park, 310 Indianapolis Road, Mooresville, IN 46158
- Phone: (407) 844-2522
- Operating hours (currently sample / unpublished)
- Whether the $25 registration fee / new-client waiver is still active
- Facility photos in `public/images/facility/`
