-- Accounts: tracked competitor/own accounts
CREATE TABLE IF NOT EXISTS accounts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  handle TEXT UNIQUE NOT NULL,
  platform TEXT NOT NULL DEFAULT 'instagram',
  tier TEXT NOT NULL DEFAULT 'ecosystem',
  display_name TEXT,
  bio TEXT,
  followers INTEGER DEFAULT 0,
  avatar_url TEXT,
  style_notes TEXT,
  why_tracking TEXT,
  active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Posts: scraped content from tracked accounts
CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  external_id TEXT UNIQUE,
  account_id INTEGER REFERENCES accounts(id),
  platform TEXT NOT NULL,
  type TEXT DEFAULT 'Video',
  caption TEXT,
  timestamp TEXT,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  plays INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  saves INTEGER DEFAULT 0,
  display_url TEXT,
  url TEXT,
  is_pinned INTEGER DEFAULT 0,
  engagement_rate REAL,
  virality_score REAL,
  is_winner INTEGER DEFAULT 0,
  content_pillar TEXT,
  hook_type TEXT,
  format_tags TEXT,
  transcript TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Metric snapshots: periodic account-level metrics
CREATE TABLE IF NOT EXISTS metric_snapshots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  account_id INTEGER REFERENCES accounts(id),
  followers INTEGER,
  avg_likes REAL,
  avg_comments REAL,
  avg_views REAL,
  avg_er REAL,
  snapshot_date TEXT DEFAULT (date('now')),
  created_at TEXT DEFAULT (datetime('now'))
);

-- Scrape runs: log of scraping activity
CREATE TABLE IF NOT EXISTS scrape_runs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tier TEXT,
  type TEXT DEFAULT 'profile',
  accounts_scraped INTEGER DEFAULT 0,
  posts_found INTEGER DEFAULT 0,
  new_posts INTEGER DEFAULT 0,
  winners_found INTEGER DEFAULT 0,
  errors TEXT,
  status TEXT DEFAULT 'pending',
  started_at TEXT DEFAULT (datetime('now')),
  completed_at TEXT
);

-- Winners log: detected winning posts
CREATE TABLE IF NOT EXISTS winners_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  post_id INTEGER REFERENCES posts(id),
  account_id INTEGER REFERENCES accounts(id),
  trigger_reason TEXT,
  virality_score REAL,
  detected_at TEXT DEFAULT (datetime('now'))
);

-- Scripts: generated/remixed scripts
CREATE TABLE IF NOT EXISTS scripts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  platform TEXT,
  status TEXT DEFAULT 'draft',
  source TEXT,
  source_post_id INTEGER REFERENCES posts(id),
  body TEXT,
  word_count INTEGER,
  duration_estimate INTEGER,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Pipeline items: kanban board state
CREATE TABLE IF NOT EXISTS pipeline_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  platform TEXT,
  status TEXT DEFAULT 'ideas',
  date TEXT,
  source TEXT,
  notes TEXT,
  script TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Weekly targets
CREATE TABLE IF NOT EXISTS weekly_targets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  week_start TEXT NOT NULL,
  posts_target INTEGER DEFAULT 7,
  scripts_target INTEGER DEFAULT 5,
  outreach_target INTEGER DEFAULT 15,
  posts_actual INTEGER DEFAULT 0,
  scripts_actual INTEGER DEFAULT 0,
  outreach_actual INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Settings: key-value store for app config
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_posts_account ON posts(account_id);
CREATE INDEX IF NOT EXISTS idx_posts_timestamp ON posts(timestamp);
CREATE INDEX IF NOT EXISTS idx_posts_virality ON posts(virality_score);
CREATE INDEX IF NOT EXISTS idx_posts_winner ON posts(is_winner);
CREATE INDEX IF NOT EXISTS idx_accounts_tier ON accounts(tier);
CREATE INDEX IF NOT EXISTS idx_winners_detected ON winners_log(detected_at);
