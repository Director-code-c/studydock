-- ============================================================================
-- StudyDock · 迁移 0001：创建用户资料表 public.profiles
-- ----------------------------------------------------------------------------
-- 职责：
--   * 为每个 auth.users 用户维护一行个人资料（由注册 trigger 自动创建）
--   * 开启 RLS：authenticated 只能访问自己的资料行，anon 完全无权
--   * 表级权限最小化：authenticated 仅 select/insert/update，不授予 delete
--   * 所有 SECURITY DEFINER 函数固定空 search_path，杜绝 search_path 注入
-- 注意：
--   * 本迁移只执行一次；成功执行后不要重复运行
--   * 不包含任何密码或密钥
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. profiles 表
-- ----------------------------------------------------------------------------
-- 外键引用 auth.users：用户删除时级联删除其资料行
create table public.profiles (
  id uuid primary key
    references auth.users (id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- display_name：允许 null；去除首尾空格后不能为空；最长 80 字符
  constraint profiles_display_name_check check (
    display_name is null
    or (
      btrim(display_name) <> ''
      and char_length(display_name) <= 80
    )
  ),

  -- avatar_url：允许 null；最长 2048 字符（常见 URL 上限）
  constraint profiles_avatar_url_check check (
    avatar_url is null or char_length(avatar_url) <= 2048
  )
);

-- ----------------------------------------------------------------------------
-- 2. updated_at 自动维护
-- ----------------------------------------------------------------------------
-- SECURITY INVOKER 已足够：函数只改写触发行的 updated_at，不访问其他表，
-- 无任何越权风险，因此不提升权限（最小权限原则）。
create or replace function public.profiles_set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- 只允许被触发器调用，禁止任意角色直接执行
revoke all on function public.profiles_set_updated_at() from public;

drop trigger if exists trg_profiles_set_updated_at on public.profiles;
create trigger trg_profiles_set_updated_at
before update on public.profiles
for each row execute function public.profiles_set_updated_at();

-- ----------------------------------------------------------------------------
-- 3. 新用户注册后自动创建 profile
-- ----------------------------------------------------------------------------
-- SECURITY DEFINER：以函数所有者（postgres）身份写入 profiles，绕过 RLS，
-- 避免 auth 触发上下文因行级安全而无法插入。
-- 安全要点：search_path 固定为空串，函数内所有对象显式限定 schema。
create or replace function public.profiles_handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_display_name text;
begin
  -- 优先使用注册元数据中的 display_name
  v_display_name := nullif(
    btrim(coalesce(new.raw_user_meta_data ->> 'display_name', '')),
    ''
  );

  -- 元数据缺失时回退到邮箱 @ 前缀，同样先清理空白
  if v_display_name is null then
    v_display_name := btrim(split_part(coalesce(new.email, ''), '@', 1));
  end if;

  -- 截断到 80 字符以内以满足表约束；空值归一为 null 存储
  v_display_name := left(v_display_name, 80);
  v_display_name := nullif(v_display_name, '');

  insert into public.profiles (id, display_name)
  values (new.id, v_display_name)
  on conflict (id) do nothing;

  return new;
end;
$$;

-- SECURITY DEFINER 函数仅允许被触发器调用，拒绝任意角色直接执行
revoke all on function public.profiles_handle_new_user() from public;

drop trigger if exists trg_profiles_on_auth_user_created on auth.users;
create trigger trg_profiles_on_auth_user_created
after insert on auth.users
for each row execute function public.profiles_handle_new_user();

-- ----------------------------------------------------------------------------
-- 4. 行级安全（RLS）
-- ----------------------------------------------------------------------------
-- 关键：RLS 是表访问的最后一道闸门，未匹配任何策略的请求一律拒绝。
alter table public.profiles enable row level security;

-- authenticated：只能读取自己的资料行
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles for select
to authenticated
using (auth.uid() = id);

-- authenticated：允许直接插入自己的资料行（正常流程由注册 trigger 创建，
-- 此策略作为兜底，且强制 id = auth.uid()）
drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles for insert
to authenticated
with check (auth.uid() = id);

-- authenticated：只能更新自己的资料行，且更新后该行仍属于自己
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

-- 有意不创建 delete 策略：当前阶段不允许通过 Data API 删除资料行

-- ----------------------------------------------------------------------------
-- 5. 表级权限（最小化）
-- ----------------------------------------------------------------------------
-- 显式收回 Supabase 默认授予的 all，再按需授予：
--   anon            → 无任何权限
--   authenticated   → 仅 select / insert / update（无 delete）
revoke all on table public.profiles from anon;
revoke all on table public.profiles from authenticated;

grant select, insert, update on table public.profiles to authenticated;
