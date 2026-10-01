create table if not exists photos (
  slot text primary key,
  urls text[] not null default '{}'
);

create table if not exists contributions (
  id serial primary key,
  name text not null,
  amount int,
  item text,
  note text,
  source text,
  done boolean not null default false,
  created_at timestamptz not null default now()
);
