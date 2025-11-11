-- Add new content fields for home, about, and contact pages
INSERT INTO content (key, value) VALUES 
  ('hero_title', 'Welcome to Bibleway Fellowship Tabernacle'),
  ('hero_subtitle', 'Join us in worship, fellowship, and service as we grow together in faith and love. Everyone is welcome in God''s house.'),
  ('about_text', 'We are honored that you are visiting our website. We are a non-denominational Bible believing church. Our mission is to spread the Gospel of Jesus Christ to all the world.'),
  ('leadership_text', 'Since 1984, hundreds of people have darkened our doors and met with Christ through the gospel. In this ever-changing world, we have an Anchor that still holds and always will – Jesus Christ, the same, yesterday, today and forever.'),
  ('scripture_text', '"But in the days of the voice of the seventh angel, when he shall begin to sound, the mystery of God should be finished, as he hath declared to His servants the prophets" - Revelation 10:7 King James Version'),
  ('history_text', 'Bibleway Fellowship Tabernacle is a church situated in the heartland of Lagos, on a parcel of land bordering the watery expanse of the Atlantic Ocean.'),
  ('address_line1', '5, Ali-Asekun Street,'),
  ('address_line2', 'Olojojo Bus Stop,'),
  ('address_line3', 'Oworonsoki,'),
  ('address_line4', 'Lagos, Nigeria.'),
  ('contact_email', 'biblewayft@gmail.com'),
  ('service_time1', 'Wednesdays @ 5:30pm'),
  ('service_time2', 'Sundays @ 8:30am')
ON CONFLICT (key) DO NOTHING;

-- Add description column to service_times table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'service_times' AND column_name = 'description'
  ) THEN
    ALTER TABLE service_times ADD COLUMN description TEXT;
  END IF;
END $$;
