-- Seed initial settings for integrations
INSERT INTO settings (key, value, category) VALUES 
  ('paypal_enabled', 'false', 'integrations'),
  ('stripe_enabled', 'false', 'integrations'),
  ('mailchimp_enabled', 'false', 'integrations'),
  ('zoom_enabled', 'false', 'integrations'),
  ('youtube_enabled', 'false', 'integrations'),
  ('facebook_enabled', 'false', 'integrations'),
  ('google_enabled', 'false', 'integrations'),
  ('slack_enabled', 'false', 'integrations'),
  ('website', '', 'general'),
  ('maxUploadSize', '10', 'system'),
  ('sessionTimeout', '30', 'system'),
  ('twoFactorRequired', 'false', 'security'),
  ('passwordExpiry', '90', 'security'),
  ('minPasswordLength', '8', 'security'),
  ('requireSpecialChars', 'true', 'security'),
  ('maxLoginAttempts', '5', 'security'),
  ('lockoutDuration', '15', 'security'),
  ('ipWhitelisting', 'false', 'security'),
  ('auditLogging', 'true', 'security'),
  ('encryptionEnabled', 'true', 'security'),
  ('sslRequired', 'true', 'security'),
  ('emailEnabled', 'true', 'notifications'),
  ('smsEnabled', 'false', 'notifications'),
  ('pushEnabled', 'true', 'notifications'),
  ('slackEnabled', 'false', 'notifications'),
  ('webhooksEnabled', 'false', 'notifications')
ON CONFLICT (key) DO NOTHING;

-- Seed sample audit logs
INSERT INTO audit_logs (event, user_email, ip_address, severity, details) VALUES 
  ('System Started', 'system@church.org', '127.0.0.1', 'low', 'Church management system initialized'),
  ('Admin Login', 'admin@church.org', '192.168.1.1', 'low', 'Administrator logged in successfully')
ON CONFLICT DO NOTHING;

-- Seed sample notifications
INSERT INTO notifications (type, message, status, recipient_email) VALUES 
  ('System', 'Church management system is now active', 'sent', 'admin@church.org'),
  ('Welcome', 'Welcome to the church management system', 'sent', 'admin@church.org')
ON CONFLICT DO NOTHING;
