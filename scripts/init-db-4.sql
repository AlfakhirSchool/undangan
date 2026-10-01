create table if not exists budget_items (
  id serial primary key,
  name text not null,
  cost int,
  bought boolean not null default false,
  note text,
  created_at timestamptz not null default now()
);
