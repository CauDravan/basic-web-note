CREATE TABLE IF NOT EXISTS notes (
  _id varchar(24) PRIMARY KEY CHECK (_id ~ '^[0-9a-f]{24}$'),
  title text NOT NULL DEFAULT 'Untitled',
  content text NOT NULL DEFAULT '',
  parent_id varchar(24) REFERENCES notes (_id) ON DELETE SET NULL,
  pinned boolean NOT NULL DEFAULT false,
  trashed boolean NOT NULL DEFAULT false,
  icon text NOT NULL DEFAULT '📄',
  color text NOT NULL DEFAULT 'white',
  category text NOT NULL DEFAULT 'NOTE',
  tags text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (parent_id <> _id)
);

CREATE INDEX IF NOT EXISTS notes_updated_at_idx ON notes (updated_at DESC, _id);
CREATE INDEX IF NOT EXISTS notes_parent_id_idx ON notes (parent_id);
