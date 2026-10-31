-- Migration 005: Class length and public/hidden flag on training times.

alter table public.srb_training_slots
  add column if not exists duration_minutes integer not null default 60,
  add column if not exists published boolean not null default true;

alter table public.srb_training_slots
  drop constraint if exists srb_training_slots_duration_check;

alter table public.srb_training_slots
  add constraint srb_training_slots_duration_check
  check (duration_minutes between 15 and 480);
