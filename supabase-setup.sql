create table if not exists public.band_votes (
  voter text primary key check (voter in ('철우','예인','영웅','아린','규빈')),
  first_winners int[] not null,
  revival_pick int not null,
  eliminated_pick int not null,
  final_five int[] not null,
  updated_at timestamptz not null default now()
);

alter table public.band_votes enable row level security;

create policy "public read band votes"
on public.band_votes for select
to anon
using (true);

create policy "public insert band votes"
on public.band_votes for insert
to anon
with check (true);

create policy "public update band votes"
on public.band_votes for update
to anon
using (true)
with check (true);

create policy "public delete band votes"
on public.band_votes for delete
to anon
using (true);
