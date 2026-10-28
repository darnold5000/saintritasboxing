-- Migration 002: Staff credit adjustments audit log.

create table if not exists public.srb_credit_adjustments (
  id uuid primary key default gen_random_uuid(),
  purchase_id uuid references public.srb_purchases (id) on delete set null,
  customer_id uuid not null references public.srb_customers (id) on delete cascade,
  delta integer not null,
  sessions_remaining_after integer not null,
  reason text not null,
  staff_user_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists srb_credit_adjustments_customer_id_idx
  on public.srb_credit_adjustments (customer_id);

alter table public.srb_credit_adjustments enable row level security;

grant all on table public.srb_credit_adjustments to service_role;
