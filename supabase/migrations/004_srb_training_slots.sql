-- Migration 004: Per-training weekly start times for staff scheduling.

create table if not exists public.srb_training_slots (
  id uuid primary key default gen_random_uuid(),
  training_type text not null check (
    training_type in ('private', 'partner', 'adult-class', 'youth-class')
  ),
  weekday integer not null check (weekday between 0 and 6),
  start_time time not null,
  created_at timestamptz not null default now(),
  unique (training_type, weekday, start_time)
);

create index if not exists srb_training_slots_type_idx
  on public.srb_training_slots (training_type, weekday, start_time);

alter table public.srb_training_slots enable row level security;

grant all on table public.srb_training_slots to service_role;
