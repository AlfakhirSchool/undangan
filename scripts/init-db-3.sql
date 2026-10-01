create table if not exists invitees (
  id serial primary key,
  name text not null,
  type text not null default 'digital' check (type in ('digital', 'fisik')),
  category text not null default 'Umum',
  created_at timestamptz not null default now()
);
