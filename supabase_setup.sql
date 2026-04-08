-- Create homestays table
create table homestays (
  id bigint primary key generated always as identity,
  name text not null,
  description text,
  price numeric not null,
  rooms int4 default 1,
  distance numeric,
  amenities text[],
  images text[],
  votes int4 default 0,
  created_at timestamptz default now()
);

-- Create comments table
create table comments (
  id bigint primary key generated always as identity,
  homestay_id bigint references homestays(id) on delete cascade,
  name text not null,
  text text not null,
  date timestamptz default now(),
  created_at timestamptz default now()
);

-- Enable Row Level Security (RLS) - FOR SIMPLE SETUP, WE ALLOW ALL
alter table homestays enable row level security;
alter table comments enable row level security;

-- Create policies (Allow everyone to read and write for this simple demo)
create policy "Allow public read on homestays" on homestays for select using (true);
create policy "Allow public insert on homestays" on homestays for insert with check (true);
create policy "Allow public update on homestays" on homestays for update using (true);
create policy "Allow public delete on homestays" on homestays for delete using (true);

create policy "Allow public read on comments" on comments for select using (true);
create policy "Allow public insert on comments" on comments for insert with check (true);

