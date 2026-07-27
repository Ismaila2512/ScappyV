-- ==============================================================================
-- VIT CAMPUS RESOLVE DB SETUP
-- Run this in the Supabase SQL Editor to set up the database
-- ==============================================================================

-- 0. Cleanup existing tables if re-running
DROP TABLE IF EXISTS issues CASCADE;
DROP TABLE IF EXISTS buildings CASCADE;

-- 1. Create a table for University Buildings
CREATE TABLE buildings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL, -- e.g., 'Academic', 'Hostel', 'Admin', 'Recreational'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Note: In a real system, you'd insert all VIT buildings. Let's add some mock ones for testing.
INSERT INTO buildings (name, type) VALUES 
('SJT', 'Academic'), 
('TT', 'Academic'), 
('PRP', 'Academic'), 
('Main Building', 'Admin'),
('Q Block', 'Hostel'),
('L Block', 'Hostel')
ON CONFLICT (name) DO NOTHING;

-- 2. Create the Issues table
DROP TYPE IF EXISTS priority_level CASCADE;
CREATE TYPE priority_level AS ENUM ('Low', 'Medium', 'High', 'Critical');

DROP TYPE IF EXISTS issue_status CASCADE;
CREATE TYPE issue_status AS ENUM ('Pending', 'In Progress', 'Resolved');

CREATE TABLE issues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES auth.users(id), -- Nullable if you want fully anonymous complaints without auth
    building_id UUID REFERENCES buildings(id) NOT NULL,
    category TEXT NOT NULL, -- classroom, washroom, faculty cabin, face id, etc.
    room_number TEXT,
    gender TEXT, -- For washrooms (Boys/Girls)
    description TEXT NOT NULL,
    image_url TEXT, -- Link to uploaded problem image
    resolved_image_url TEXT, -- Link to uploaded resolution image
    
    -- AI Generated Columns
    ai_assigned_department TEXT, -- CDC, Maintenance, IT, Plumbing
    ai_priority priority_level DEFAULT 'Medium',
    
    status issue_status DEFAULT 'Pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- 3. Row Level Security (RLS)
ALTER TABLE buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read buildings
CREATE POLICY "Buildings are publicly viewable" 
ON buildings FOR SELECT USING (true);

-- Allow authenticated users to insert issues
CREATE POLICY "Authenticated users can create issues" 
ON issues FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow users to view their own issues
CREATE POLICY "Users can view own issues" 
ON issues FOR SELECT USING (auth.uid() = student_id);

-- Depending on your admin setup, you could create an Admin Role, but for now we'll allow all reads for simplicity during dev.
CREATE POLICY "Anyone can view all issues for dashboards" 
ON issues FOR SELECT USING (true);

-- Allow server to update issues (mark as resolved)
CREATE POLICY "Anyone can update issues" 
ON issues FOR UPDATE USING (true);

-- Create a storage bucket for issue images
insert into storage.buckets (id, name, public) values ('issue-images', 'issue-images', true) ON CONFLICT DO NOTHING;

create policy "Images are publicly accessible."
  on storage.objects for select
  using ( bucket_id = 'issue-images' );

create policy "Anyone can upload an image."
  on storage.objects for insert
  with check ( bucket_id = 'issue-images' );
