-- AThoughtfulHermit free-tier engagement schema

create extension if not exists pgcrypto;

create table if not exists public.subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  status text not null default 'pending'
    check (status in ('pending', 'active', 'unsubscribed')),
  confirm_token text not null unique default encode(gen_random_bytes(24), 'hex'),
  unsubscribe_token text not null unique default encode(gen_random_bytes(24), 'hex'),
  created_at timestamptz not null default now(),
  confirmed_at timestamptz
);

create table if not exists public.weekly_editions (
  id uuid primary key default gen_random_uuid(),
  chronicle_id text not null,
  week_of date not null unique,
  subject text not null,
  email_html text not null,
  created_at timestamptz not null default now(),
  sent_at timestamptz
);

create table if not exists public.reactions (
  id uuid primary key default gen_random_uuid(),
  chronicle_id text not null,
  visitor_key text not null,
  vote text not null check (vote in ('like', 'dislike')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (chronicle_id, visitor_key)
);

create table if not exists public.send_rate_limits (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  sent_at timestamptz not null default now()
);

create index if not exists reactions_chronicle_id_idx on public.reactions (chronicle_id);
create index if not exists send_rate_limits_email_sent_at_idx on public.send_rate_limits (email, sent_at desc);
create index if not exists subscribers_status_idx on public.subscribers (status);

create or replace view public.reaction_counts as
select
  chronicle_id,
  count(*) filter (where vote = 'like')::int as likes,
  count(*) filter (where vote = 'dislike')::int as dislikes
from public.reactions
group by chronicle_id;

alter table public.subscribers enable row level security;
alter table public.weekly_editions enable row level security;
alter table public.reactions enable row level security;
alter table public.send_rate_limits enable row level security;

-- Public may read aggregate counts via the view (grant select).
-- All writes go through Edge Functions using the service role.

revoke all on public.subscribers from anon, authenticated;
revoke all on public.weekly_editions from anon, authenticated;
revoke all on public.reactions from anon, authenticated;
revoke all on public.send_rate_limits from anon, authenticated;

grant select on public.reaction_counts to anon, authenticated;
