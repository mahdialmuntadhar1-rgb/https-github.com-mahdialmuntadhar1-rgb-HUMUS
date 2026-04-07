-- Post comments table (simple public comments)
-- Keeps comment flow lightweight and no-auth as requested

CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT comments_content_not_empty CHECK (char_length(trim(content)) > 0)
);

CREATE INDEX IF NOT EXISTS idx_comments_post_id_created_at ON comments(post_id, created_at DESC);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'comments' AND policyname = 'Comments are publicly readable'
  ) THEN
    CREATE POLICY "Comments are publicly readable"
      ON comments FOR SELECT
      USING (TRUE);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'comments' AND policyname = 'Comments are publicly insertable'
  ) THEN
    CREATE POLICY "Comments are publicly insertable"
      ON comments FOR INSERT
      WITH CHECK (char_length(trim(content)) > 0);
  END IF;
END
$$;

COMMENT ON TABLE comments IS 'Simple post comments table with public read/insert access.';
