-- Fix storage permissions for images and videos buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('images', 'images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public)
VALUES ('videos', 'videos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

CREATE POLICY "Public upload images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'images');

CREATE POLICY "Public read images" ON storage.objects
FOR SELECT USING (bucket_id = 'images');

CREATE POLICY "Public upload videos" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'videos');

CREATE POLICY "Public read videos" ON storage.objects
FOR SELECT USING (bucket_id = 'videos');

CREATE POLICY "Public update images" ON storage.objects
FOR UPDATE USING (bucket_id = 'images');

CREATE POLICY "Public update videos" ON storage.objects
FOR UPDATE USING (bucket_id = 'videos');
