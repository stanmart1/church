CREATE TABLE IF NOT EXISTS sermon_series (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  sermon_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sermons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  speaker VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  duration VARCHAR(50),
  description TEXT,
  series_id UUID REFERENCES sermon_series(id) ON DELETE SET NULL,
  audio_url TEXT,
  video_url TEXT,
  thumbnail_url TEXT,
  plays INTEGER DEFAULT 0,
  tags TEXT[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sermons_date ON sermons(date DESC);
CREATE INDEX idx_sermons_speaker ON sermons(speaker);
CREATE INDEX idx_sermons_series ON sermons(series_id);
