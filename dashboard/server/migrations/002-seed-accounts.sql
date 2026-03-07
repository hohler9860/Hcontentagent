-- Seed accounts across 4 tiers
-- Core: own accounts
INSERT OR IGNORE INTO accounts (handle, platform, tier, display_name, style_notes, why_tracking) VALUES
  ('dialed.by.h', 'instagram', 'core', 'Dialed by H', 'Luxury watch concierge, grey market sourcing', 'Own account — track performance'),
  ('bostonwatchclub', 'instagram', 'core', 'Boston Watch Club', 'Watch community, events, meetups', 'Own account — community hub'),
  ('thewealthedition', 'instagram', 'core', 'The Wealth Edition', 'Lifestyle x watches x wealth', 'Own account — lifestyle brand');

-- Primary: top competitors to watch closely
INSERT OR IGNORE INTO accounts (handle, platform, tier, display_name, style_notes, why_tracking) VALUES
  ('dula.mov', 'instagram', 'primary', 'Dula', 'Ultra-short captions, green screen, opinion-driven hot takes, fast pacing', 'Format inspiration — punchy curiosity-gap style'),
  ('ciaociaochau', 'instagram', 'primary', 'Ciao Ciao Chau', 'Meme-y captions, educational depth, nerdy enthusiasm, original audio', 'Audience overlap — similar collector demographic'),
  ('teddiebaldassarre', 'instagram', 'primary', 'Teddy Baldassare', 'Polished long-form, review format, luxury lifestyle', 'Production quality benchmark');

-- Ecosystem: broader watch content creators
INSERT OR IGNORE INTO accounts (handle, platform, tier, display_name, style_notes, why_tracking) VALUES
  ('hodinkee', 'instagram', 'ecosystem', 'Hodinkee', 'Editorial watch journalism, premium brand partnerships', 'Industry standard — editorial tone reference'),
  ('watchfinder', 'instagram', 'ecosystem', 'Watchfinder & Co.', 'Cinematic product videos, comparison format', 'Video production benchmark'),
  ('fratellowatches', 'instagram', 'ecosystem', 'Fratello Watches', 'Enthusiast community, Speedy Tuesday, editorial', 'Community engagement patterns'),
  ('superwatchman', 'instagram', 'ecosystem', 'Superwatchman', 'Collection showcases, dealer perspective', 'Dealer content strategy'),
  ('watchesbysjx', 'instagram', 'ecosystem', 'SJX Watches', 'Independent journalism, auction coverage', 'High-end market intelligence'),
  ('jenileeluxury', 'instagram', 'ecosystem', 'Jeni Lee', 'Female perspective, luxury lifestyle, storytelling', 'Audience diversification — female collectors'),
  ('theurbangentry', 'instagram', 'ecosystem', 'The Urban Gentry', 'Long-form YouTube, watch culture commentary', 'Deep-dive format reference'),
  ('romannsharf', 'instagram', 'ecosystem', 'Roman Sharf', 'Dealer transparency, market pricing, business advice', 'Grey market pricing transparency'),
  ('crownandcaliber', 'instagram', 'ecosystem', 'Crown & Caliber', 'Pre-owned marketplace, buyer education', 'Marketplace content strategy'),
  ('thetimepiece_', 'instagram', 'ecosystem', 'The Timepiece', 'Wrist shots, quick takes, collector community', 'Community engagement style');

-- Default settings
INSERT OR IGNORE INTO settings (key, value) VALUES
  ('scrape_interval_core', '7200'),
  ('scrape_interval_primary', '14400'),
  ('scrape_interval_ecosystem', '21600'),
  ('scrape_interval_discovered', '43200'),
  ('scoring_weight_er', '0.30'),
  ('scoring_weight_volume', '0.20'),
  ('scoring_weight_velocity', '0.25'),
  ('scoring_weight_crossplatform', '0.10'),
  ('scoring_weight_comment_ratio', '0.15'),
  ('winner_threshold_er_multiplier', '3.0'),
  ('winner_threshold_virality', '75'),
  ('winner_threshold_views_multiplier', '5.0'),
  ('winner_threshold_comment_ratio_multiplier', '2.0'),
  ('winner_threshold_top_percentile', '0.05'),
  ('hashtags', '["watches","luxurywatches","watchcollector","greymarket","rolex","omega","patekphilippe","audemarspiguet","watchesofinstagram","horology"]');
