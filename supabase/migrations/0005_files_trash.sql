-- ============================================================================
-- StudyDock · 迁移 0005：文件回收站（Trash v1）
-- ----------------------------------------------------------------------------
-- 职责：
--   * public.files 增加 deleted_at 状态列：IS NULL = active，IS NOT NULL = trash
--   * 回收站只做 metadata 状态变更，Storage 对象不动
--   * 列级 UPDATE 权限（仅 deleted_at）+ own-row UPDATE RLS policy
--   * 回收站查询专用 partial index
-- 依赖：
--   * 必须按编号顺序在 0004_files.sql 之后执行
-- 注意：
--   * 本迁移只执行一次；成功后不要重复运行（重复 alter add column 会失败）
--   * 不修改 0004、不重建 bucket、不动 Storage RLS、不移动/改写任何对象路径
--   * 无 DEFAULT / 无 status / 无 is_deleted / 无 trash 表 / 无 deleted_by / 无 purge_at
--     存量行 deleted_at = NULL，天然为 active，无需回填
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. metadata 状态列
-- ----------------------------------------------------------------------------
alter table public.files
  add column deleted_at timestamptz;

-- ----------------------------------------------------------------------------
-- 2. UPDATE 权限：只允许更新 deleted_at，不开放其他列
-- ----------------------------------------------------------------------------
-- 防御性确保不存在表级 UPDATE 权限（0004 只授了 select/insert/delete）
revoke update on table public.files from anon;
revoke update on table public.files from authenticated;

-- 列级授权：仅 deleted_at 可被 authenticated 更新
grant update (deleted_at) on table public.files to authenticated;

-- anon 不授予任何权限（含列级）

-- ----------------------------------------------------------------------------
-- 3. UPDATE RLS：只能改自己的行
-- ----------------------------------------------------------------------------
-- USING 决定哪些行可被 UPDATE；WITH CHECK 校验更新后行仍属于自己，双保险。
drop policy if exists "files_update_own_trash_state" on public.files;
create policy "files_update_own_trash_state"
on public.files for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- 4. 回收站查询索引：Trash 列表按 (user_id, deleted_at desc) 排序
--    active 列表继续使用现有 files_user_created_idx，不加 active partial index
-- ----------------------------------------------------------------------------
create index files_user_trashed_idx
  on public.files (user_id, deleted_at desc)
  where deleted_at is not null;