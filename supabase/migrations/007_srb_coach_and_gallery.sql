-- Migration 007: Public coach bio and gallery. Staff writes go through the service role.
-- Public read is intentional: this is marketing content shown on the website.

create table if not exists public.srb_coach_profile (
  id text primary key default 'coach',
  name text not null default '',
  role_title text not null default '',
  bio text not null default '',
  photo_path text,
  photo_url text,
  updated_at timestamptz not null default now(),
  constraint srb_coach_profile_singleton check (id = 'coach')
);

insert into public.srb_coach_profile (id)
values ('coach')
on conflict (id) do nothing;

create table if not exists public.srb_gallery_images (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null,
  image_url text not null,
  caption text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists srb_gallery_images_created_idx
  on public.srb_gallery_images (created_at desc);

alter table public.srb_coach_profile enable row level security;
alter table public.srb_gallery_images enable row level security;

grant select on table public.srb_coach_profile to anon, authenticated, service_role;
grant insert, update, delete on table public.srb_coach_profile to service_role;

grant select on table public.srb_gallery_images to anon, authenticated, service_role;
grant insert, update, delete on table public.srb_gallery_images to service_role;

drop policy if exists srb_coach_profile_public_read on public.srb_coach_profile;
create policy srb_coach_profile_public_read
  on public.srb_coach_profile
  for select
  to anon, authenticated
  using (true);

drop policy if exists srb_gallery_images_public_read on public.srb_gallery_images;
create policy srb_gallery_images_public_read
  on public.srb_gallery_images
  for select
  to anon, authenticated
  using (true);

insert into storage.buckets (id, name, public)
values ('srb-media', 'srb-media', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists srb_media_public_read on storage.objects;
create policy srb_media_public_read
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'srb-media');
