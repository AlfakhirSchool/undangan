alter table wishes add column if not exists reply text;
alter table invitees add column if not exists sent boolean not null default false;
