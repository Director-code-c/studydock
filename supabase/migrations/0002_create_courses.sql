-- ============================================================================
-- StudyDock · 迁移 0002：创建个人课程表 public.courses
-- ----------------------------------------------------------------------------
-- 职责：
--   * 供已登录用户管理自己的课程（多账号各自隔离，同一用户可同名）
--   * 启用 RLS：authenticated 仅可访问 user_id = auth.uid() 的行
--   * 表级权限最小化：先 revoke anon/authenticated 的全部权限，再 grant 最小集
--   * updated_at 由触发器自动维护
-- 依赖：
--   * 依赖 Supabase Auth（auth.users, auth.uid()）
--   * 必须在 0001_create_profiles 之后按编号顺序执行
-- 注意：
--   * 本迁移只执行一次；成功后不要重复运行
--   * 不包含任何密码或密钥，不写入演示数据
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. courses 表
-- ----------------------------------------------------------------------------
create table public.courses (
  id uuid primary key default gen_random_uuid(),
  -- 所属用户：删除用户时级联删除其课程
  user_id uuid not null
    references auth.users (id) on delete cascade,
  name text not null,
  code text,
  description text,
  color text,
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- name：必填；去除首尾空格后不能为空；最长 120 字符
  constraint courses_name_check check (
    btrim(name) <> ''
    and char_length(name) <= 120
  ),

  -- code：允许 null；非 null 时去除首尾空格后不能为空；最长 40 字符
  constraint courses_code_check check (
    code is null
    or (
      btrim(code) <> ''
      and char_length(code) <= 40
    )
  ),

  -- description：允许 null；最长 2000 字符
  constraint courses_description_check check (
    description is null
    or char_length(description) <= 2000
  ),

  -- color：允许 null；仅允许 #RRGGBB 格式（如 #4F46E5）
  constraint courses_color_check check (
    color is null
    or color ~ '^#[0-9A-Fa-f]{6}$'
  )
);

-- 同一用户可拥有同名课程，不创建唯一约束（产品需求）

-- 按用户与更新时间的常用查询路径建索引
create index courses_user_updated_at_idx
  on public.courses (user_id, updated_at desc);

-- ----------------------------------------------------------------------------
-- 2. updated_at 自动维护
-- ----------------------------------------------------------------------------
-- 仅改写触发行的 updated_at，不访问其他表，无越权风险；
-- 固定空 search_path，函数内不依赖隐式解析。
create or replace function public.courses_set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- 仅允许被触发器调用，禁止任意角色直接执行
revoke all on function public.courses_set_updated_at() from public;

drop trigger if exists trg_courses_set_updated_at on public.courses;
create trigger trg_courses_set_updated_at
before update on public.courses
for each row execute function public.courses_set_updated_at();

-- ----------------------------------------------------------------------------
-- 3. 行级安全（RLS）
-- ----------------------------------------------------------------------------
-- 关键：RLS 是表访问的最后一道闸门，未匹配任何策略的请求一律拒绝。
-- anon 不授予任何策略，天然无权访问。
alter table public.courses enable row level security;

-- authenticated：只能读取自己的课程
drop policy if exists "courses_select_own" on public.courses;
create policy "courses_select_own"
on public.courses for select
to authenticated
using (public.courses.user_id = auth.uid());

-- authenticated：只能插入 user_id = auth.uid() 的课程
drop policy if exists "courses_insert_own" on public.courses;
create policy "courses_insert_own"
on public.courses for insert
to authenticated
with check (public.courses.user_id = auth.uid());

-- authenticated：只能更新自己的课程，且不能把 user_id 改为他人
-- using 限制可更新的行；with check 确保更新后仍属于自己
drop policy if exists "courses_update_own" on public.courses;
create policy "courses_update_own"
on public.courses for update
to authenticated
using (public.courses.user_id = auth.uid())
with check (public.courses.user_id = auth.uid());

-- authenticated：只能删除自己的课程
drop policy if exists "courses_delete_own" on public.courses;
create policy "courses_delete_own"
on public.courses for delete
to authenticated
using (public.courses.user_id = auth.uid());

-- ----------------------------------------------------------------------------
-- 4. 表级权限（最小化）
-- ----------------------------------------------------------------------------
-- 显式收回 Supabase 默认授予的 all，再按需授予：
--   anon          → 无任何权限
--   authenticated → 仅 select / insert / update / delete
revoke all on table public.courses from anon;
revoke all on table public.courses from authenticated;

grant select, insert, update, delete on table public.courses to authenticated;
