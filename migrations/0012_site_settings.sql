CREATE TABLE IF NOT EXISTS site_settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT ''
);
INSERT OR IGNORE INTO site_settings (key, value) VALUES ('store_name', '용산전자상가점');
INSERT OR IGNORE INTO site_settings (key, value) VALUES ('copyright', '© 2025 LG Electronics Inc. All rights reserved.');
