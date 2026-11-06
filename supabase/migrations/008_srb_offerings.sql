-- Staff-managed training packages and prices.
-- Checkout sends the current amount to Stripe. Existing subscriptions keep the price they started with.

create table if not exists public.srb_offerings (
  id text primary key,
  training_type text not null check (
    training_type in ('private', 'partner', 'adult-class', 'youth-class')
  ),
  kind text not null check (kind in ('single', 'package', 'subscription')),
  name text not null,
  sessions integer check (sessions is null or sessions > 0),
  price_cents integer not null check (price_cents >= 0),
  billing_interval text check (billing_interval is null or billing_interval = 'month'),
  cta text not null,
  description text not null,
  published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (kind = 'subscription' and sessions is null and billing_interval = 'month')
    or (kind = 'single' and sessions = 1 and billing_interval is null)
    or (kind = 'package' and sessions > 1 and billing_interval is null)
  )
);

create index if not exists srb_offerings_type_idx
  on public.srb_offerings (training_type, published, sort_order);

alter table public.srb_offerings enable row level security;

grant all on table public.srb_offerings to service_role;

insert into public.srb_offerings (
  id, training_type, kind, name, sessions, price_cents, billing_interval, cta, description, published, sort_order
)
values
  ('private-single', 'private', 'single', 'Single Session', 1, 5000, null, 'Book session', 'One 60-minute private training session.', true, 0),
  ('private-5', 'private', 'package', '5 Session Package', 5, 22500, null, 'Buy package', 'Five private sessions. Credits stay on your account.', true, 1),
  ('private-10', 'private', 'package', '10 Session Package', 10, 40000, null, 'Buy package', 'Ten private sessions. Credits stay on your account.', true, 2),
  ('private-20', 'private', 'package', '20 Session Package', 20, 70000, null, 'Buy package', 'Twenty private sessions. Credits stay on your account.', true, 3),
  ('private-unlimited', 'private', 'subscription', 'Monthly Unlimited PT', null, 80000, 'month', 'Join monthly', 'Recurring monthly unlimited 1-on-1 personal training. Manage or cancel in the Stripe customer portal.', true, 4),
  ('partner-single', 'partner', 'single', 'Single Session', 1, 7000, null, 'Book session', 'One 60-minute partner session. Price is the TOTAL for two participants.', true, 0),
  ('partner-5', 'partner', 'package', '5 Session Package', 5, 32500, null, 'Buy package', 'Five partner sessions. One credit covers both participants. Price is TOTAL.', true, 1),
  ('partner-10', 'partner', 'package', '10 Session Package', 10, 60000, null, 'Buy package', 'Ten partner sessions. One credit covers both participants. Price is TOTAL.', true, 2),
  ('class-adult-unlimited', 'adult-class', 'subscription', 'Unlimited Monthly', null, 0, 'month', 'Join monthly', 'Weekday adult classes, billed every month until you cancel in the Stripe customer portal.', true, 0),
  ('class-youth-unlimited', 'youth-class', 'subscription', 'Unlimited Monthly', null, 0, 'month', 'Join monthly', 'Weekday youth classes, billed every month until cancelled. Adult memberships cannot be used for youth class.', true, 0)
on conflict (id) do nothing;
