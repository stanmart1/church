CREATE TABLE IF NOT EXISTS giving (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('tithe', 'offering', 'missions', 'building_fund', 'special')),
  method VARCHAR(50) NOT NULL CHECK (method IN ('cash', 'check', 'online', 'card')),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_giving_member ON giving(member_id);
CREATE INDEX idx_giving_date ON giving(date DESC);
CREATE INDEX idx_giving_type ON giving(type);
