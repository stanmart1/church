-- Add index for audit_logs user_email queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_email ON audit_logs(user_email);

-- Add composite indexes for giving queries
CREATE INDEX IF NOT EXISTS idx_giving_member_date ON giving(member_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_giving_member_type ON giving(member_id, type);
CREATE INDEX IF NOT EXISTS idx_giving_date_type ON giving(date DESC, type);

-- Add index for sermon searches
CREATE INDEX IF NOT EXISTS idx_sermons_title_search ON sermons USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_sermons_speaker_search ON sermons USING gin(to_tsvector('english', speaker));

-- Add index for token blacklist optimization
CREATE INDEX IF NOT EXISTS idx_token_blacklist_user_created ON token_blacklist(user_id, created_at DESC);

-- Add index for stream viewers queries
CREATE INDEX IF NOT EXISTS idx_stream_viewers_livestream_status ON stream_viewers(livestream_id, status);

-- Add index for chat messages queries
CREATE INDEX IF NOT EXISTS idx_chat_messages_livestream ON chat_messages(livestream_id, created_at DESC);

-- Add index for notifications queries
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_email, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status, created_at DESC);
