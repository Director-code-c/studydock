-- ============================================================================
-- StudyDock · 迁移 0003：创建项目表 public.projects
-- ----------------------------------------------------------------------------
-- 职责：
--   * 供已登录用户管理自己的项目（可关联自己的课程，也可独立存在）
--   * 启用 RLS：authenticated 仅可访问 user_id = auth.uid() 的行
--   * course_id 非空时必须是当前用户自己的课程（INSERT/UPDATE policy 子查询兜底）
--   * updated_at 由触发器自动维护
-- 依赖：
--   * 依赖 Supabase Auth（auth.users, auth.uid()）
--   * 必须在 0002_create_courses 之后按编号顺序执行
-- 注意：
--   * 本迁移只执行一次；成功后不要重复运行
--   * 不包含任何密码或密钥，不写入演示数据
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. projects 表
-- ----------------------------------------------------------------------------
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  -- 所属用户：删除用户时级联删除其项目
  user_id uuid not null
    references auth.users (id) on delete cascade,
  -- 可选关联课程：删除课程时置空，不级联删除项目
  course_id uuid
    references public.courses (id) on delete set null,
  name text not null,
  description text,
  -- 第一版三态 workflow，默认待开始
  status text not null default 'todo',
  -- 仅需“某日截止”，使用 date 避免时区问题
  due_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- name：必填；去除首尾空格后不能为空；最长 120 字符
  constraint projects_name_check check (
    btrim(name) <> ''
    and char_length(name) <= 120
  ),

  -- description：允许 null；最长 2000 字符
  constraint projects_description_check check (
    description is null
    or char_length(description) <= 2000
  ),

  -- status：仅允许三态
  constraint projects_status_check check (
    status in ('todo', 'in_progress', 'completed')
  )
);

-- 同一用户可拥有同名项目，不创建唯一约束（产品需求）

-- 常用查询路径：按用户 + 最近更新排序（与 courses 一致）
create index projects_user_updated_at_idx
  on public.projects (user_id, updated_at desc);

-- course_id 外键 ON DELETE SET NULL 的删除效率 + 按课程筛选
create index projects_course_id_idx
  on public.projects (course_id);

-- ----------------------------------------------------------------------------
-- 2. updated_at 自动维护
-- ----------------------------------------------------------------------------
-- 与 profiles/courses 保持同一模式：每表独立函数，仅改写触发行，
-- 不访问其他表；固定空 search_path。
create or replace function public.projects_set_updated_at()
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
revoke all on function public.projects_set_updated_at() from public;

drop trigger if exists trg_projects_set_updated_at on public.projects;
create trigger trg_projects_set_updated_at
before update on public.projects
for each row execute function public.projects_set_updated_at();

-- ----------------------------------------------------------------------------
-- 3. 行级安全（RLS）
-- ----------------------------------------------------------------------------
alter table public.projects enable row level security;

-- authenticated：只能读取自己的项目
drop policy if exists "projects_select_own" on public.projects;
create policy "projects_select_own"
on public.projects for select
to authenticated
using (auth.uid() = user_id);

-- authenticated：只能插入 user_id = auth.uid() 的项目，
-- 且 course_id 非空时必须指向当前用户自己的课程（数据库兜底，防跨用户关联）
drop policy if exists "projects_insert_own" on public.projects;
create policy "projects_insert_own"
on public.projects for insert
to authenticated
with check (
  auth.uid() = user_id
  and (
    projects.course_id is null
    or exists (
      select 1
      from public.courses c
      where c.id = projects.course_id
        and c.user_id = auth.uid()
    )
  )
);

-- authenticated：只能更新自己的项目，且更新后仍属于自己、
-- 关联课程仍必须是自己的课程
drop policy if exists "projects_update_own" on public.projects;
create policy "projects_update_own"
on public.projects for update
to authenticated
using (auth.uid() = user_id)
with check (
  auth.uid() = user_id
  and (
    projects.course_id is null
    or exists (
      select 1
      from public.courses c
      where c.id = projects.course_id
        and c.user_id = auth.uid()
    )
  )
);

-- authenticated：只能删除自己的项目
drop policy if exists "projects_delete_own" on public.projects;
create policy "projects_delete_own"
on public.projects for delete
to authenticated
using (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- 4. 表级权限（最小化）
-- ----------------------------------------------------------------------------
-- 显式收回 Supabase 默认授予的 all，再按需授予：
--   anon          → 无任何权限
--   authenticated → 仅 select / insert / update / delete
revoke all on table public.projects from anon;
revoke all on table public.projects from authenticated;

grant select, insert, update, delete on table public.projects to authenticated;
