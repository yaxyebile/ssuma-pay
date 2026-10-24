create table if not exists public.push_notification_campaigns (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  click_url text,
  status text not null default 'sending'
    check (status in ('sending', 'accepted', 'failed', 'not_sent')),
  provider_message_id text,
  provider_response jsonb,
  tracked_device_count integer not null default 0 check (tracked_device_count >= 0),
  audience_snapshot_at timestamptz,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  accepted_at timestamptz
);

create index if not exists push_notification_campaigns_created_at_idx
  on public.push_notification_campaigns (created_at desc);

create table if not exists public.push_notification_devices (
  installation_id uuid primary key,
  country_code text,
  country_name text,
  subscribed_to_all boolean not null default false,
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists push_notification_devices_topic_seen_idx
  on public.push_notification_devices (subscribed_to_all, last_seen_at desc);

create table if not exists public.push_notification_recipients (
  campaign_id uuid not null references public.push_notification_campaigns (id) on delete cascade,
  installation_id uuid not null references public.push_notification_devices (installation_id) on delete cascade,
  country_code text,
  country_name text,
  snapshotted_at timestamptz not null default now(),
  primary key (campaign_id, installation_id)
);

create index if not exists push_notification_recipients_country_idx
  on public.push_notification_recipients (campaign_id, country_code);

create table if not exists public.push_notification_events (
  campaign_id uuid not null,
  installation_id uuid not null,
  event_type text not null check (event_type in ('received', 'opened')),
  country_code text,
  country_name text,
  occurred_at timestamptz not null default now(),
  primary key (campaign_id, installation_id, event_type),
  foreign key (campaign_id, installation_id)
    references public.push_notification_recipients (campaign_id, installation_id)
    on delete cascade
);

create index if not exists push_notification_events_campaign_type_idx
  on public.push_notification_events (campaign_id, event_type);

alter table public.push_notification_campaigns enable row level security;
alter table public.push_notification_devices enable row level security;
alter table public.push_notification_recipients enable row level security;
alter table public.push_notification_events enable row level security;

create or replace function public.is_push_notification_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles as profile
    where profile.id = auth.uid()
      and profile.role = 'admin'
  );
$$;

revoke all on function public.is_push_notification_admin() from public, anon;
grant execute on function public.is_push_notification_admin() to authenticated, service_role;

drop policy if exists push_notification_campaigns_admin_select
  on public.push_notification_campaigns;
create policy push_notification_campaigns_admin_select
  on public.push_notification_campaigns
  for select to authenticated
  using (public.is_push_notification_admin());

drop policy if exists push_notification_campaigns_admin_insert
  on public.push_notification_campaigns;
create policy push_notification_campaigns_admin_insert
  on public.push_notification_campaigns
  for insert to authenticated
  with check (public.is_push_notification_admin());

drop policy if exists push_notification_campaigns_admin_update
  on public.push_notification_campaigns;
create policy push_notification_campaigns_admin_update
  on public.push_notification_campaigns
  for update to authenticated
  using (public.is_push_notification_admin())
  with check (public.is_push_notification_admin());

revoke all on public.push_notification_campaigns from anon, authenticated;
grant select, insert, update on public.push_notification_campaigns to authenticated;
grant all on public.push_notification_campaigns to service_role;

revoke all on public.push_notification_devices from anon, authenticated;
grant all on public.push_notification_devices to service_role;
revoke all on public.push_notification_recipients from anon, authenticated;
grant all on public.push_notification_recipients to service_role;
revoke all on public.push_notification_events from anon, authenticated;
grant all on public.push_notification_events to service_role;

create or replace function public.snapshot_push_notification_recipients(p_campaign_id uuid)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_count integer;
begin
  insert into public.push_notification_recipients (
    campaign_id,
    installation_id,
    country_code,
    country_name
  )
  select
    p_campaign_id,
    device.installation_id,
    device.country_code,
    device.country_name
  from public.push_notification_devices as device
  where device.subscribed_to_all = true
    and device.last_seen_at >= now() - interval '30 days'
  on conflict (campaign_id, installation_id) do nothing;

  select count(*)::integer
  into v_count
  from public.push_notification_recipients as recipient
  where recipient.campaign_id = p_campaign_id;

  update public.push_notification_campaigns
  set tracked_device_count = v_count,
      audience_snapshot_at = now()
  where id = p_campaign_id;

  return v_count;
end;
$$;

revoke all on function public.snapshot_push_notification_recipients(uuid) from public, anon, authenticated;
grant execute on function public.snapshot_push_notification_recipients(uuid) to service_role;

create or replace view public.push_notification_campaign_stats as
with event_counts as (
  select
    event.campaign_id,
    count(*) filter (where event.event_type = 'received')::integer as received_count,
    count(*) filter (where event.event_type = 'opened')::integer as opened_count
  from public.push_notification_events as event
  group by event.campaign_id
)
select
  campaign.id,
  campaign.title,
  campaign.body,
  campaign.click_url,
  campaign.status,
  campaign.provider_message_id,
  campaign.provider_response,
  campaign.tracked_device_count,
  campaign.audience_snapshot_at,
  campaign.created_by,
  campaign.created_at,
  campaign.accepted_at,
  coalesce(event_counts.received_count, 0) as received_count,
  coalesce(event_counts.opened_count, 0) as opened_count,
  greatest(campaign.tracked_device_count - coalesce(event_counts.received_count, 0), 0)
    as not_yet_received_count,
  greatest(campaign.tracked_device_count - coalesce(event_counts.opened_count, 0), 0)
    as not_opened_count,
  greatest(coalesce(event_counts.received_count, 0) - coalesce(event_counts.opened_count, 0), 0)
    as received_not_opened_count
from public.push_notification_campaigns as campaign
left join event_counts on event_counts.campaign_id = campaign.id;

create or replace view public.push_notification_country_stats as
select
  recipient.campaign_id,
  coalesce(recipient.country_code, 'unknown') as country_code,
  coalesce(recipient.country_name, 'Unknown') as country_name,
  count(*)::integer as tracked_device_count,
  count(*) filter (
    where exists (
      select 1
      from public.push_notification_events as event
      where event.campaign_id = recipient.campaign_id
        and event.installation_id = recipient.installation_id
        and event.event_type = 'received'
    )
  )::integer as received_count,
  count(*) filter (
    where exists (
      select 1
      from public.push_notification_events as event
      where event.campaign_id = recipient.campaign_id
        and event.installation_id = recipient.installation_id
        and event.event_type = 'opened'
    )
  )::integer as opened_count
from public.push_notification_recipients as recipient
group by recipient.campaign_id, recipient.country_code, recipient.country_name;

revoke all on public.push_notification_campaign_stats from public, anon, authenticated;
grant select on public.push_notification_campaign_stats to service_role;
revoke all on public.push_notification_country_stats from public, anon, authenticated;
grant select on public.push_notification_country_stats to service_role;

