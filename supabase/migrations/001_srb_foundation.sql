-- Migration 001: St. Rita's Boxing booking, payments, and staff foundation.

create table if not exists public.srb_staff_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  role text not null default 'staff' check (role in ('owner', 'admin', 'staff')),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.srb_customers (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null unique,
  phone text,
  partner_name text,
  is_minor boolean not null default false,
  guardian_name text,
  guardian_email text,
  guardian_phone text,
  notes text,
  stripe_customer_id text,
  created_at timestamptz not null default now()
);

create table if not exists public.srb_purchases (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.srb_customers (id) on delete cascade,
  offering_id text not null,
  training_type text not null,
  name text not null,
  kind text not null,
  sessions_total integer not null default 0,
  sessions_remaining integer not null default 0,
  amount_cents integer not null,
  status text not null default 'pending',
  stripe_checkout_id text,
  stripe_customer_id text,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.srb_subscriptions (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.srb_customers (id) on delete cascade,
  offering_id text not null,
  stripe_subscription_id text not null unique,
  stripe_customer_id text,
  status text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.srb_bookings (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.srb_customers (id) on delete cascade,
  offering_id text not null,
  training_type text not null,
  offering_name text not null,
  session_date date,
  start_time time,
  duration_minutes integer not null default 60,
  location text,
  partner_name text,
  notes text,
  status text not null default 'held',
  payment_status text not null default 'unpaid',
  purchase_id uuid references public.srb_purchases (id) on delete set null,
  stripe_checkout_id text,
  amount_cents integer not null default 0,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create unique index if not exists srb_bookings_slot_uidx
  on public.srb_bookings (session_date, start_time)
  where status in ('held', 'confirmed') and session_date is not null and start_time is not null;

create table if not exists public.srb_availability_rules (
  weekday integer primary key check (weekday between 0 and 6),
  enabled boolean not null default true,
  start_time time not null,
  end_time time not null
);

create table if not exists public.srb_blocked_dates (
  blocked_date date primary key
);

create table if not exists public.srb_extra_slots (
  id uuid primary key default gen_random_uuid(),
  slot_date date not null,
  start_time time not null,
  unique (slot_date, start_time)
);

create table if not exists public.srb_stripe_events (
  event_id text primary key,
  event_type text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.srb_access_tokens (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  token_hash text not null unique,
  purpose text not null,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.srb_contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  message text not null,
  created_at timestamptz not null default now()
);

insert into public.srb_availability_rules (weekday, enabled, start_time, end_time)
values
  (0, false, '09:00', '12:00'),
  (1, true, '06:00', '20:00'),
  (2, true, '06:00', '20:00'),
  (3, true, '06:00', '20:00'),
  (4, true, '06:00', '20:00'),
  (5, true, '06:00', '20:00'),
  (6, true, '06:00', '20:00')
on conflict (weekday) do nothing;

alter table public.srb_staff_profiles enable row level security;
alter table public.srb_customers enable row level security;
alter table public.srb_purchases enable row level security;
alter table public.srb_subscriptions enable row level security;
alter table public.srb_bookings enable row level security;
alter table public.srb_availability_rules enable row level security;
alter table public.srb_blocked_dates enable row level security;
alter table public.srb_extra_slots enable row level security;
alter table public.srb_stripe_events enable row level security;
alter table public.srb_access_tokens enable row level security;
alter table public.srb_contact_messages enable row level security;

grant select on table public.srb_staff_profiles to authenticated, service_role;
grant all on table public.srb_staff_profiles to service_role;
grant all on table public.srb_customers to service_role;
grant all on table public.srb_purchases to service_role;
grant all on table public.srb_subscriptions to service_role;
grant all on table public.srb_bookings to service_role;
grant all on table public.srb_availability_rules to service_role;
grant all on table public.srb_blocked_dates to service_role;
grant all on table public.srb_extra_slots to service_role;
grant all on table public.srb_stripe_events to service_role;
grant all on table public.srb_access_tokens to service_role;
grant all on table public.srb_contact_messages to service_role;

create policy srb_staff_profiles_self_select
  on public.srb_staff_profiles
  for select
  to authenticated
  using (user_id = auth.uid() and active = true);
