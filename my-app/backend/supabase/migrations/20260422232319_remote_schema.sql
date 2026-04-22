-- This file previously contained a full `db pull` / remote schema snapshot. On a database
-- that was already created by earlier migrations, `CREATE TABLE IF NOT EXISTS` skipped
-- recreating tables, but the following `ALTER TABLE ... ADD PRIMARY KEY` / UNIQUE / FK
-- statements still ran, causing:
--   ERROR: multiple primary keys for table "bookmarks" are not allowed
-- and the same for other objects.
--
-- Keep this migration as a no-op so the version history stays valid. Add new SQL in new
-- timestamped files in this folder, then run `supabase db push` from my-app/backend.
SELECT 1;
