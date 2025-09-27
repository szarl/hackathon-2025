-- First, create the 'flowers' bucket as PRIVATE (not public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('flowers', 'flowers', false)
ON CONFLICT (id) DO UPDATE SET public = false;

-- Enable RLS on the storage.objects table (should already be enabled)
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can upload to their own folder" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for flowers bucket" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own files" ON storage.objects;

-- Policy 1: Allow authenticated users to upload files to their own folder
CREATE POLICY "Users can upload to their own folder" ON storage.objects
FOR INSERT 
TO authenticated
WITH CHECK (
  bucket_id = 'flowers' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 2: Allow public read access to all files in the flowers bucket
CREATE POLICY "Public read access for flowers bucket" ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'flowers');

-- Policy 3: Allow users to delete their own files
CREATE POLICY "Users can delete their own files" ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'flowers' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 4: Allow users to update their own files  
CREATE POLICY "Users can update their own files" ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'flowers' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);