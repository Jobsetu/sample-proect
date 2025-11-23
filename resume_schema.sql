-- Resume Management Schema for JobYatra

-- Create user_resumes table to store resume data
CREATE TABLE IF NOT EXISTS user_resumes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    file_path TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size INTEGER,
    skills TEXT[] DEFAULT '{}',
    experience JSONB DEFAULT '[]',
    education JSONB DEFAULT '[]',
    summary TEXT,
    raw_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_resumes_user_id ON user_resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_resumes_created_at ON user_resumes(created_at DESC);

-- Create storage bucket for resumes
INSERT INTO storage.buckets (id, name, public) 
VALUES ('resumes', 'resumes', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS (Row Level Security) policies
ALTER TABLE user_resumes ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own resumes
CREATE POLICY "Users can view their own resumes" ON user_resumes
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own resumes" ON user_resumes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own resumes" ON user_resumes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own resumes" ON user_resumes
    FOR DELETE USING (auth.uid() = user_id);

-- Storage policies for resume files
CREATE POLICY "Users can upload their own resumes" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'resumes' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can view their own resumes" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'resumes' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete their own resumes" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'resumes' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_user_resumes_updated_at 
    BEFORE UPDATE ON user_resumes 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
