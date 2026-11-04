
create type public.app_role as enum ('admin','user');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text, phone text, avatar_url text,
  created_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique (user_id, role)
);
grant select, insert, update, delete on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.user_roles where user_id = _user_id and role = _role) $$;

create policy "own roles readable" on public.user_roles for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "admins manage roles" on public.user_roles for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create policy "own profile read" on public.profiles for select to authenticated using (id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "own profile insert" on public.profiles for insert to authenticated with check (id = auth.uid());
create policy "own profile update" on public.profiles for update to authenticated using (id = auth.uid());

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'), new.raw_user_meta_data->>'avatar_url');
  insert into public.user_roles (user_id, role) values (new.id, 'user');
  if not exists (select 1 from public.user_roles where role = 'admin') then
    insert into public.user_roles (user_id, role) values (new.id, 'admin');
  end if;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create table public.agents (
  id uuid primary key default gen_random_uuid(),
  name text not null, title text not null default 'Real Estate Agent',
  email text, phone text, photo_url text, bio text,
  created_at timestamptz not null default now()
);
grant select on public.agents to anon, authenticated;
grant insert, update, delete on public.agents to authenticated;
grant all on public.agents to service_role;
alter table public.agents enable row level security;
create policy "agents public" on public.agents for select to anon, authenticated using (true);
create policy "agents admin" on public.agents for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.categories (
  slug text primary key, name text not null
);
grant select on public.categories to anon, authenticated;
grant insert, update, delete on public.categories to authenticated;
grant all on public.categories to service_role;
alter table public.categories enable row level security;
create policy "cat public" on public.categories for select to anon, authenticated using (true);
create policy "cat admin" on public.categories for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.properties (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  address text not null,
  city text not null,
  state text not null default '',
  price numeric not null,
  listing_type text not null default 'sale' check (listing_type in ('sale','rent')),
  category text not null default 'house',
  section text not null default 'standard' check (section in ('standard','land','development')),
  bedrooms int not null default 0,
  bathrooms numeric not null default 0,
  size_sqft int not null default 0,
  description text not null default '',
  images text[] not null default '{}',
  features text[] not null default '{}',
  status text not null default 'available' check (status in ('available','sold','rented','pending')),
  featured boolean not null default false,
  is_demo boolean not null default false,
  lat double precision, lng double precision,
  agent_id uuid references public.agents(id) on delete set null,
  created_at timestamptz not null default now()
);
grant select on public.properties to anon, authenticated;
grant insert, update, delete on public.properties to authenticated;
grant all on public.properties to service_role;
alter table public.properties enable row level security;
create policy "props public" on public.properties for select to anon, authenticated using (true);
create policy "props admin" on public.properties for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create or replace function public.validate_property_price() returns trigger language plpgsql set search_path = public as $$
begin
  if new.listing_type = 'sale' and new.price < 40000 then
    raise exception 'Sale prices must be at least $40,000';
  end if;
  if new.price <= 0 then raise exception 'Price must be positive'; end if;
  return new;
end $$;
create trigger property_price_check before insert or update on public.properties for each row execute function public.validate_property_price();

create table public.favorites (
  user_id uuid not null, property_id uuid not null references public.properties(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, property_id)
);
grant select, insert, delete on public.favorites to authenticated;
grant all on public.favorites to service_role;
alter table public.favorites enable row level security;
create policy "own favs" on public.favorites for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create table public.inquiries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid, property_id uuid references public.properties(id) on delete set null,
  kind text not null default 'contact' check (kind in ('contact','property')),
  name text not null, email text not null, phone text, message text not null,
  status text not null default 'new' check (status in ('new','in_progress','closed')),
  created_at timestamptz not null default now()
);
grant insert on public.inquiries to anon;
grant select, insert, update, delete on public.inquiries to authenticated;
grant all on public.inquiries to service_role;
alter table public.inquiries enable row level security;
create policy "anyone inquire" on public.inquiries for insert to anon, authenticated with check (user_id is null or user_id = auth.uid());
create policy "own inquiries" on public.inquiries for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "admin inquiries upd" on public.inquiries for update to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "admin inquiries del" on public.inquiries for delete to authenticated using (public.has_role(auth.uid(),'admin'));

create table public.viewings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid, property_id uuid not null references public.properties(id) on delete cascade,
  name text not null, email text not null, phone text,
  preferred_date date not null, preferred_time text not null, notes text,
  status text not null default 'requested' check (status in ('requested','confirmed','completed','cancelled')),
  created_at timestamptz not null default now()
);
grant insert on public.viewings to anon;
grant select, insert, update, delete on public.viewings to authenticated;
grant all on public.viewings to service_role;
alter table public.viewings enable row level security;
create policy "anyone book" on public.viewings for insert to anon, authenticated with check (user_id is null or user_id = auth.uid());
create policy "own viewings" on public.viewings for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "admin viewings upd" on public.viewings for update to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "admin viewings del" on public.viewings for delete to authenticated using (public.has_role(auth.uid(),'admin'));

create table public.submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  name text not null, email text not null, phone text,
  address text not null, city text not null,
  listing_type text not null default 'sale', category text not null default 'house',
  asking_price numeric not null, bedrooms int default 0, bathrooms numeric default 0, size_sqft int default 0,
  description text, images text[] not null default '{}',
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now()
);
grant insert on public.submissions to anon;
grant select, insert, update, delete on public.submissions to authenticated;
grant all on public.submissions to service_role;
alter table public.submissions enable row level security;
create policy "anyone submit" on public.submissions for insert to anon, authenticated with check (user_id is null or user_id = auth.uid());
create policy "own subs" on public.submissions for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "admin subs upd" on public.submissions for update to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "admin subs del" on public.submissions for delete to authenticated using (public.has_role(auth.uid(),'admin'));

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null, title text not null, body text not null default '',
  read boolean not null default false,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.notifications to authenticated;
grant all on public.notifications to service_role;
alter table public.notifications enable row level security;
create policy "own notifs read" on public.notifications for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "own notifs update" on public.notifications for update to authenticated using (user_id = auth.uid());
create policy "admin notifs insert" on public.notifications for insert to authenticated with check (public.has_role(auth.uid(),'admin'));
create policy "own notifs delete" on public.notifications for delete to authenticated using (user_id = auth.uid());

create or replace function public.notify_on_request() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.user_id is not null then
    insert into public.notifications (user_id, title, body) values (
      new.user_id,
      case tg_table_name when 'viewings' then 'Viewing request received' when 'submissions' then 'Property submission received' else 'Inquiry received' end,
      'Thank you! Our team has received your request and will contact you within one business day.'
    );
  end if;
  return new;
end $$;
create trigger inq_notify after insert on public.inquiries for each row execute function public.notify_on_request();
create trigger view_notify after insert on public.viewings for each row execute function public.notify_on_request();
create trigger sub_notify after insert on public.submissions for each row execute function public.notify_on_request();

create table public.site_settings (
  id int primary key default 1 check (id = 1),
  hero_headline text not null default 'FIND A PLACE TO CALL HOME.',
  hero_subtext text not null default 'Discover beautiful homes, valuable properties and exceptional real estate opportunities with Asset Houses Realty. Whether you are buying, selling, renting or investing, we make your property journey easier.',
  hero_image text not null default 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=2000&q=80',
  phone text not null default '+1 (555) 214-7800',
  email text not null default 'support@assethousesrealtly.online',
  whatsapp text not null default '15552147800',
  address text not null default '120 E State St, Suite 400, Rockford, IL 61104',
  hours text not null default 'Mon–Fri 9am–6pm · Sat 10am–4pm',
  updated_at timestamptz not null default now()
);
grant select on public.site_settings to anon, authenticated;
grant update on public.site_settings to authenticated;
grant all on public.site_settings to service_role;
alter table public.site_settings enable row level security;
create policy "settings public" on public.site_settings for select to anon, authenticated using (true);
create policy "settings admin" on public.site_settings for update to authenticated using (public.has_role(auth.uid(),'admin'));
insert into public.site_settings (id) values (1);

insert into public.categories (slug, name) values ('house','House'),('apartment','Apartment'),('condo','Condo'),('townhouse','Townhouse'),('land','Land'),('villa','Villa');

insert into public.agents (id, name, title, email, phone, photo_url, bio) values
('a0000000-0000-0000-0000-000000000001','Michael Carter','Principal Broker','support@assethousesrealtly.online','+1 (555) 214-7801','https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&q=80','Over 15 years helping families find homes across Rockford, Illinois. (Sample profile)'),
('a0000000-0000-0000-0000-000000000002','Sarah Mitchell','Senior Sales Agent','support@assethousesrealtly.online','+1 (555) 214-7802','https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&q=80','Specialist in suburban family homes and first-time buyers. (Sample profile)'),
('a0000000-0000-0000-0000-000000000003','David Reynolds','Land & Investment Advisor','support@assethousesrealtly.online','+1 (555) 214-7803','https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80','Guides investors through land, plots and new developments. (Sample profile)'),
('a0000000-0000-0000-0000-000000000004','Emily Johnson','Rentals Manager','support@assethousesrealtly.online','+1 (555) 214-7804','https://images.unsplash.com/photo-1580489944761-15a19d654956?w=600&q=80','Matches tenants with quality rental homes and apartments. (Sample profile)');

insert into public.properties (title,address,city,state,price,listing_type,category,section,bedrooms,bathrooms,size_sqft,description,images,features,status,featured,is_demo,lat,lng,agent_id) values
('Oakridge Family Residence','418 Oakridge Lane','Rockford','IL',485000,'sale','house','standard',4,3,2850,'A bright, spacious family home on a tree-lined street with an open kitchen, large backyard and two-car garage.','{https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1600&q=80,https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1600&q=80,https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1600&q=80}','{Two-car garage,Fenced backyard,Hardwood floors,Central A/C,Walk-in closets}','available',true,true,42.2711,-89.0940,'a0000000-0000-0000-0000-000000000002'),
('Willow Creek Cottage','92 Willow Creek Rd','Rockford','IL',68000,'sale','house','standard',2,1,980,'A charming starter cottage with a covered porch and updated bathroom — ideal for first-time buyers.','{https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1600&q=80,https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1600&q=80}','{Covered porch,Updated bathroom,Large lot}','available',false,true,42.2611,-89.0840,'a0000000-0000-0000-0000-000000000002'),
('Maple Grove Townhome','1507 Maple Grove Ct','Rockford','IL',139000,'sale','townhouse','standard',3,2.5,1650,'Low-maintenance townhome close to shopping and schools, with a private patio and attached garage.','{https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1600&q=80,https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1600&q=80}','{Attached garage,Private patio,Community pool}','available',true,true,42.2811,-89.0740,'a0000000-0000-0000-0000-000000000001'),
('Lakeview Estate','7 Lakeview Drive','Rockford','IL',265000,'sale','house','standard',4,3,3100,'Elegant home overlooking the lake with a chef''s kitchen, home office and covered outdoor living area.','{https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1600&q=80,https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1600&q=80}','{Lake views,Home office,Outdoor kitchen,Smart home}','pending',false,true,42.2911,-89.0640,'a0000000-0000-0000-0000-000000000001'),
('The Summit Modern Villa','22 Summit Ridge','Rockford','IL',1250000,'sale','villa','standard',5,5.5,5400,'Architect-designed modern villa with infinity pool, floor-to-ceiling glass and panoramic scenic views.','{https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1600&q=80,https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1600&q=80,https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1600&q=80}','{Infinity pool,Wine cellar,Home theater,Three-car garage,Smart home}','available',true,true,42.3011,-89.0540,'a0000000-0000-0000-0000-000000000001'),
('Downtown Loft Apartment','300 State St #12B','Rockford','IL',2100,'rent','apartment','standard',2,2,1100,'Stylish loft in the heart of downtown with city views, gym access and secure parking. Price per month.','{https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1600&q=80,https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1600&q=80}','{City views,Gym,Secure parking,Pet friendly}','available',true,true,42.2715,-89.0925,'a0000000-0000-0000-0000-000000000004'),
('Rockford Family Rental','55 Alpine Rd','Rockford','IL',2650,'rent','house','standard',3,2,1800,'Well-kept rental home with a big yard in a quiet neighborhood near top schools. Price per month.','{https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1600&q=80,https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1600&q=80}','{Large yard,Garage,Washer/dryer}','available',false,true,42.2750,-89.0400,'a0000000-0000-0000-0000-000000000004'),
('Riverside Condo','880 N Main St #4','Rockford','IL',1450,'rent','condo','standard',1,1,720,'Cozy riverside condo with balcony, updated kitchen and walking distance to the Rock River. Price per month.','{https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1600&q=80}','{Balcony,River access,Updated kitchen}','rented',false,true,42.2800,-89.0910,'a0000000-0000-0000-0000-000000000004'),
('Rockford 5-Acre Plot','Parcel 18 Perryville Rd','Rockford','IL',95000,'sale','land','land',0,0,217800,'Five gently rolling acres with mature trees, road frontage and electricity nearby — ready for your dream home.','{https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1600&q=80}','{Road frontage,Utilities nearby,Mature trees,No HOA}','available',true,true,42.2900,-88.9800,'a0000000-0000-0000-0000-000000000003'),
('Prairie Farmland 20 Acres','Route 20 Parcel','Rockford','IL',180000,'sale','land','land',0,0,871200,'Twenty acres of productive farmland with a well and fencing. Excellent investment or homestead opportunity.','{https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=1600&q=80}','{Water well,Fenced,Ag exemption}','available',false,true,42.2400,-89.1500,'a0000000-0000-0000-0000-000000000003'),
('Greenfield Commons – Phase 1','100 Greenfield Way','Rockford','IL',329000,'sale','house','development',3,2.5,2100,'Brand-new energy-efficient homes in a master-planned community with parks, trails and a clubhouse.','{https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&q=80,https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1600&q=80}','{New construction,Builder warranty,Energy efficient,Clubhouse,Trails}','available',true,true,42.2600,-89.0100,'a0000000-0000-0000-0000-000000000003'),
('Harbor Point Residences','40 Riverfront Way','Rockford','IL',215000,'sale','condo','development',2,2,1300,'Newly completed riverfront residences with resort-style amenities and water views.','{https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600&q=80}','{New construction,Water views,Pool,Fitness center}','available',false,true,42.2700,-89.0900,'a0000000-0000-0000-0000-000000000003');

create policy "media own upload" on storage.objects for insert to authenticated with check (bucket_id = 'media' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "media own read" on storage.objects for select to authenticated using (bucket_id = 'media' and ((storage.foldername(name))[1] = auth.uid()::text or public.has_role(auth.uid(),'admin')));
create policy "media admin all" on storage.objects for all to authenticated using (bucket_id = 'media' and public.has_role(auth.uid(),'admin')) with check (bucket_id = 'media' and public.has_role(auth.uid(),'admin'));
