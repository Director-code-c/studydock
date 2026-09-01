-- ============================================================================
-- StudyDock · 迁移 0004：文件系统第一版（metadata 表 + Storage bucket + RLS）
-- ----------------------------------------------------------------------------
-- 职责：
--   * public.files：文件元数据（二进制对象存 Supabase Storage）
--   * storage bucket: studydock-files（PRIVATE），内置 50MB 与 MIME 限制
--   * files 表 RLS：自己的行 + course/project 归属校验 + storage_path 自一致性
--   * storage.objects RLS：只能访问/上传/删除自己 path 前缀下的对象，
--     且 INSERT 额外做扩展名 allowlist（绕过 UI 直连 Storage 的数据库兜底）
-- 依赖：
--   * 必须在 0003_projects.sql 之后按编号顺序执行
--   * 依赖 Supabase Storage 内建 schema（storage.buckets / storage.objects）
--     及内建 helper：storage.foldername(name) / storage.extension(name)
-- 注意：
--   * 本迁移只执行一次；成功后不要重复运行
--   * 不对 storage 内建 schema 做 ALTER / 手工维护 storage.objects 行
--   * 第一版不开放 UPDATE（无 rename / overwrite / move）
--   * bucket 已存在时本迁移会明确失败而非静默 do nothing，
--     避免掩盖“bucket 已存在但配置错误”的情况
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Storage bucket：studydock-files（PRIVATE + 50MB + MIME allowlist）
-- ----------------------------------------------------------------------------
insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,       -- 50000000（字节）= 50 MB（十进制 MB：50 × 1000 × 1000）
  allowed_mime_types
)
values (
  'studydock-files',
  'studydock-files',
  false,
  50000000,      -- 50 MB（注意：最终应用层 finalize 校验必须使用相同字节数）
  array[
    'application/pdf',                                                      -- pdf
    'application/msword',                                                   -- doc
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', -- docx
    'application/vnd.ms-powerpoint',                                        -- ppt
    'application/vnd.openxmlformats-officedocument.presentationml.presentation', -- pptx
    'application/vnd.ms-excel',                                             -- xls
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',    -- xlsx
    'text/plain',        -- txt（浏览器常报 text/plain）
    'text/markdown',     -- md（部分浏览器）
    'text/plain'         -- md（浏览器也可能报 text/plain；数组重复项无副作用，成员判断等效）
  ]::text[]
);

-- Storage 内建 schema 不做任何 ALTER / 手工行维护。
-- Bucket 已存在（例如之前部分建过）时：insert 因主键冲突失败 → 需人工检查
-- 现有 bucket 配置（public/size/mime），不与错误配置共存。

-- ----------------------------------------------------------------------------
-- 2. files metadata 表
-- ----------------------------------------------------------------------------
create table public.files (
  id uuid primary key default gen_random_uuid(),
  -- 归属用户：删除用户时级联删除其文件元数据（对象仍由 Storage 侧策略隔离）
  user_id uuid not null
    references auth.users (id) on delete cascade,
  -- 可选关联课程 / 项目：at-most-one parent；删除课程/项目时置空，不删文件
  course_id uuid
    references public.courses (id) on delete set null,
  project_id uuid
    references public.projects (id) on delete set null,
  -- 用户可读名称（显示用；storage_path 使用安全路径，规避用户输入污染路径）
  original_name text not null,
  -- 对象路径：{user_id}/{file_id}/{safe_filename}，UNIQUE 防两条元数据指向同一对象
  storage_path text not null unique,
  -- 仅供展示的客户端 MIME，不作为授权依据
  mime_type text,
  -- 精确字节数
  size_bytes bigint not null,
  created_at timestamptz not null default now(),

  constraint files_original_name_check check (
    btrim(original_name) <> ''
    and char_length(original_name) <= 255
  ),
  constraint files_storage_path_check check (
    btrim(storage_path) <> ''
    and char_length(storage_path) <= 512
  ),
  constraint files_storage_path_shape_check check (
    array_length(string_to_array(storage_path, '/'), 1) = 3
    and split_part(storage_path, '/', 1) <> ''
    and split_part(storage_path, '/', 2) <> ''
    and split_part(storage_path, '/', 3) <> ''
  ),
  constraint files_mime_type_check check (
    mime_type is null
    or char_length(mime_type) <= 200
  ),
  constraint files_size_bytes_check check (size_bytes >= 0),
  -- 只允许一种 parent：course 或 project，不可同时关联
  constraint files_single_parent_check check (
    course_id is null or project_id is null
  )
);

-- 常用查询路径：按用户 + 创建时间倒序；以及 FK SET NULL 删除效率 / 按 parent 筛选
create index files_user_created_idx
  on public.files (user_id, created_at desc);
create index files_course_id_idx
  on public.files (course_id);
create index files_project_id_idx
  on public.files (project_id);

-- ----------------------------------------------------------------------------
-- 3. files 表行级安全
-- ----------------------------------------------------------------------------
alter table public.files enable row level security;

-- authenticated：只能读取自己的文件元数据
drop policy if exists "files_select_own" on public.files;
create policy "files_select_own"
on public.files for select
to authenticated
using (auth.uid() = user_id);

-- authenticated：只能插入自己的元数据；
--   course / project 必须属于自己；
--   storage_path 第一段 = auth.uid()（不能指向他人对象路径）
--   storage_path 第二段 = 本行 id（path 必须与本行 id 一致，防伪造元数据指向
--     {我}/{other-file-id}/... 的对象）
drop policy if exists "files_insert_own" on public.files;
create policy "files_insert_own"
on public.files for insert
to authenticated
with check (
  auth.uid() = user_id
  and (
    files.course_id is null
    or exists (
      select 1 from public.courses c
      where c.id = files.course_id
        and c.user_id = auth.uid()
    )
  )
  and (
    files.project_id is null
    or exists (
      select 1 from public.projects p
      where p.id = files.project_id
        and p.user_id = auth.uid()
    )
  )
  and split_part(files.storage_path, '/', 1) = auth.uid()::text
  and split_part(files.storage_path, '/', 2) = files.id::text
  and array_length(string_to_array(files.storage_path, '/'), 1) = 3
  and split_part(files.storage_path, '/', 3) <> ''
);

-- authenticated：只能删除自己的文件元数据
drop policy if exists "files_delete_own" on public.files;
create policy "files_delete_own"
on public.files for delete
to authenticated
using (auth.uid() = user_id);

-- 第一版元数据不可编辑（无 rename / 重关联），不开放 UPDATE

-- ----------------------------------------------------------------------------
-- 4. files 表级权限（最小化）
-- ----------------------------------------------------------------------------
revoke all on table public.files from anon;
revoke all on table public.files from authenticated;

grant select, insert, delete on table public.files to authenticated;

-- ----------------------------------------------------------------------------
-- 5. Storage objects RLS：bucket_id = 'studydock-files'
-- ----------------------------------------------------------------------------
-- 用户只能访问 path 第一段 = auth.uid() 的对象；不开放 UPDATE。

-- 读取：只能读取自己前缀路径的对象
drop policy if exists "files_select_own_objects" on storage.objects;
create policy "files_select_own_objects"
on storage.objects for select
to authenticated
using (
  bucket_id = 'studydock-files'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- 上传：只能上传到自己前缀路径，且扩展名必须属于学习文件 allowlist
-- （绕过 StudyDock UI 直接调用 Storage API 时的数据库兜底）
drop policy if exists "files_insert_own_objects" on storage.objects;
create policy "files_insert_own_objects"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'studydock-files'
  and array_length(storage.foldername(name), 1) = 2
  and (storage.foldername(name))[1] = auth.uid()::text
  and lower(storage.extension(name)) in (
    'pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx',
    'txt', 'md', 'png', 'jpg', 'jpeg', 'webp'
  )
);

-- 删除：只能删除自己前缀路径的对象
drop policy if exists "files_delete_own_objects" on storage.objects;
create policy "files_delete_own_objects"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'studydock-files'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- 不创建 UPDATE policy：第一版不支持 overwrite / rename / move