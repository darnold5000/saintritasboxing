-- Migration 006: Optional start and end dates on training classes.

alter table public.srb_training_slots
  add column if not exists starts_on date,
  add column if not exists ends_on date;

alter table public.srb_training_slots
  drop constraint if exists srb_training_slots_date_range_check;

alter table public.srb_training_slots
  add constraint srb_training_slots_date_range_check
  check (starts_on is null or ends_on is null or ends_on >= starts_on);
