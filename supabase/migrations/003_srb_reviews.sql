-- Migration 003: Public client reviews managed from staff admin.

create table if not exists public.srb_reviews (
  id uuid primary key default gen_random_uuid(),
  reviewer_name text not null,
  reviewer_description text,
  rating integer not null check (rating between 1 and 5),
  review_text text not null,
  published boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists srb_reviews_published_order_idx
  on public.srb_reviews (published, display_order, created_at desc);

alter table public.srb_reviews enable row level security;

grant select on table public.srb_reviews to anon, authenticated, service_role;
grant insert, update, delete on table public.srb_reviews to service_role;

drop policy if exists srb_reviews_public_read on public.srb_reviews;
create policy srb_reviews_public_read
  on public.srb_reviews
  for select
  to anon, authenticated
  using (published = true);
