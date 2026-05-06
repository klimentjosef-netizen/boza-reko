-- Create storage bucket for project photos
INSERT INTO storage.buckets (id, name, public) VALUES ('project-photos', 'project-photos', true);

-- Allow authenticated users to upload
CREATE POLICY "auth_upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'project-photos' AND auth.role() = 'authenticated');

-- Allow public read
CREATE POLICY "public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'project-photos');

-- Allow owners to delete
CREATE POLICY "auth_delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'project-photos' AND auth.role() = 'authenticated');
