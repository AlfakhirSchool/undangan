create table if not exists wishes (
  id serial primary key,
  name text not null,
  message text not null,
  created_at timestamptz not null default now()
);

create table if not exists rsvps (
  id serial primary key,
  name text not null,
  attend text not null,
  guests int not null default 1,
  created_at timestamptz not null default now()
);
