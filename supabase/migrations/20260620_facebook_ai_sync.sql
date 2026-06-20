-- Facebook AI sync columns for sos_posts
alter table public.sos_posts
  add column if not exists facebook_post_id text,
  add column if not exists facebook_url text,
  add column if not exists source text default 'manual',
  add column if not exists ai_imported boolean default false;

create unique index if not exists sos_posts_facebook_post_id_key
  on public.sos_posts (facebook_post_id)
  where facebook_post_id is not null;

comment on column public.sos_posts.facebook_post_id is 'Facebook Graph API post id for deduplication';
comment on column public.sos_posts.source is 'manual | facebook';
comment on column public.sos_posts.ai_imported is 'Imported automatically by AI from Facebook';
