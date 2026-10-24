create table if not exists public.push_notification_clicks (
  campaign_id uuid not null references public.push_notification_campaigns (id) on delete cascade,
  visitor_id uuid not null,
  country_code text,
  clicked_at timestamptz not null default now(),
  primary key (campaign_id, visitor_id)
);

create index if not exists push_notification_clicks_country_idx
  on public.push_notification_clicks (campaign_id, country_code);

alter table public.push_notification_clicks enable row level security;
revoke all on public.push_notification_clicks from public, anon, authenticated;
grant all on public.push_notification_clicks to service_role;

create or replace view public.push_notification_campaign_stats as
with event_counts as (
  select
    event.campaign_id,
    count(*) filter (where event.event_type = 'received')::integer as received_count,
    count(*) filter (where event.event_type = 'opened')::integer as opened_count
  from public.push_notification_events as event
  group by event.campaign_id
), click_counts as (
  select
    click.campaign_id,
    count(*)::integer as click_count
  from public.push_notification_clicks as click
  group by click.campaign_id
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
    as received_not_opened_count,
  coalesce(click_counts.click_count, 0) as click_count
from public.push_notification_campaigns as campaign
left join event_counts on event_counts.campaign_id = campaign.id
left join click_counts on click_counts.campaign_id = campaign.id;

create or replace view public.push_notification_country_stats as
with recipient_stats as (
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
    )::integer as opened_count,
    0::integer as click_count
  from public.push_notification_recipients as recipient
  group by recipient.campaign_id, recipient.country_code, recipient.country_name
), click_stats as (
  select
    click.campaign_id,
    coalesce(click.country_code, 'unknown') as country_code,
    coalesce(click.country_code, 'Unknown') as country_name,
    0::integer as tracked_device_count,
    0::integer as received_count,
    0::integer as opened_count,
    count(*)::integer as click_count
  from public.push_notification_clicks as click
  group by click.campaign_id, click.country_code
), all_stats as (
  select * from recipient_stats
  union all
  select * from click_stats
)
select
  campaign_id,
  country_code,
  country_name,
  sum(tracked_device_count)::integer as tracked_device_count,
  sum(received_count)::integer as received_count,
  sum(opened_count)::integer as opened_count,
  sum(click_count)::integer as click_count
from all_stats
group by campaign_id, country_code, country_name;

revoke all on public.push_notification_campaign_stats from public, anon, authenticated;
grant select on public.push_notification_campaign_stats to service_role;
revoke all on public.push_notification_country_stats from public, anon, authenticated;
grant select on public.push_notification_country_stats to service_role;

