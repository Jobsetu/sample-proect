-- Complete User Management Schema for JobYatra
-- Run this in your Supabase SQL Editor to set up all user-related tables

-- 1. Create Users table (main user profile)
CREATE TABLE IF NOT EXISTS public."Users" (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    current_city TEXT,
    education_level TEXT,
    experience_level TEXT,
    linkedin_url TEXT,
    github_url TEXT,
    profile_picture_url TEXT,
    bio TEXT,
    is_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create user_skills table (many-to-many relationship for skills)
CREATE TABLE IF NOT EXISTS public.user_skills (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public."Users"(id) ON DELETE CASCADE,
    skill_name TEXT NOT NULL,
    skill_level TEXT DEFAULT 'intermediate' CHECK (skill_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
    years_experience INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, skill_name)
);

-- 3. Create user_preferences table (job preferences)
CREATE TABLE IF NOT EXISTS public.user_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public."Users"(id) ON DELETE CASCADE UNIQUE,
    job_function TEXT,
    job_type TEXT DEFAULT 'Full-time',
    location_preference TEXT,
    open_to_remote BOOLEAN DEFAULT true,
    work_authorization_required BOOLEAN DEFAULT false,
    salary_expectation_min INTEGER,
    salary_expectation_max INTEGER,
    preferred_company_size TEXT CHECK (preferred_company_size IN ('startup', 'small', 'medium', 'large', 'enterprise')),
    job_search_status TEXT DEFAULT 'active' CHECK (job_search_status IN ('active', 'passive', 'not_looking')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create user_resumes table (existing, but updated)
CREATE TABLE IF NOT EXISTS public.user_resumes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public."Users"(id) ON DELETE CASCADE,
    file_path TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size BIGINT,
    skills TEXT[] DEFAULT '{}',
    experience JSONB DEFAULT '[]',
    education JSONB DEFAULT '[]',
    summary TEXT,
    raw_text TEXT,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create user_cover_letters table
CREATE TABLE IF NOT EXISTS public.user_cover_letters (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public."Users"(id) ON DELETE CASCADE,
    job_id UUID, -- Reference to jobs table if applicable
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    file_path TEXT,
    file_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create user_applications table (track job applications)
CREATE TABLE IF NOT EXISTS public.user_applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public."Users"(id) ON DELETE CASCADE,
    job_id UUID, -- Reference to jobs table
    resume_id UUID REFERENCES public.user_resumes(id),
    cover_letter_id UUID REFERENCES public.user_cover_letters(id),
    application_status TEXT DEFAULT 'applied' CHECK (application_status IN ('applied', 'under_review', 'interview', 'rejected', 'accepted', 'withdrawn')),
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Create jobs table (if not exists)
CREATE TABLE IF NOT EXISTS public.jobs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    description TEXT,
    location TEXT,
    salary_range TEXT,
    job_type TEXT,
    experience_level TEXT,
    education_required TEXT,
    skills_required TEXT[],
    posted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    application_deadline TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Create usage_tracker table (for tracking API usage, etc.)
CREATE TABLE IF NOT EXISTS public.usage_tracker (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public."Users"(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL, -- 'resume_generate', 'cover_letter_generate', 'job_search', etc.
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON public."Users"(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public."Users"(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_skills_user_id ON public.user_skills(user_id);
CREATE INDEX IF NOT EXISTS idx_user_skills_skill_name ON public.user_skills(skill_name);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON public.user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_resumes_user_id ON public.user_resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_resumes_is_primary ON public.user_resumes(user_id, is_primary) WHERE is_primary = true;
CREATE INDEX IF NOT EXISTS idx_user_applications_user_id ON public.user_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_applications_job_id ON public.user_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_jobs_is_active ON public.jobs(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_jobs_posted_at ON public.jobs(posted_at DESC);
CREATE INDEX IF NOT EXISTS idx_usage_tracker_user_id ON public.usage_tracker(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_tracker_action_type ON public.usage_tracker(action_type);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public."Users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_cover_letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_tracker ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Users table
CREATE POLICY "Users can view their own profile" ON public."Users"
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public."Users"
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public."Users"
    FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for user_skills table
CREATE POLICY "Users can manage their own skills" ON public.user_skills
    FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for user_preferences table
CREATE POLICY "Users can manage their own preferences" ON public.user_preferences
    FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for user_resumes table
CREATE POLICY "Users can manage their own resumes" ON public.user_resumes
    FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for user_cover_letters table
CREATE POLICY "Users can manage their own cover letters" ON public.user_cover_letters
    FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for user_applications table
CREATE POLICY "Users can manage their own applications" ON public.user_applications
    FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for jobs table (public read access)
CREATE POLICY "Jobs are viewable by everyone" ON public.jobs
    FOR SELECT USING (is_active = true);

-- RLS Policies for usage_tracker table
CREATE POLICY "Users can manage their own usage tracker" ON public.usage_tracker
    FOR ALL USING (auth.uid() = user_id);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public."Users" TO anon, authenticated;
GRANT ALL ON public.user_skills TO anon, authenticated;
GRANT ALL ON public.user_preferences TO anon, authenticated;
GRANT ALL ON public.user_resumes TO anon, authenticated;
GRANT ALL ON public.user_cover_letters TO anon, authenticated;
GRANT ALL ON public.user_applications TO anon, authenticated;
GRANT ALL ON public.jobs TO anon, authenticated;
GRANT ALL ON public.usage_tracker TO anon, authenticated;

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON public."Users" 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at 
    BEFORE UPDATE ON public.user_preferences 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_resumes_updated_at 
    BEFORE UPDATE ON public.user_resumes 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_cover_letters_updated_at 
    BEFORE UPDATE ON public.user_cover_letters 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_applications_updated_at 
    BEFORE UPDATE ON public.user_applications 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at 
    BEFORE UPDATE ON public.jobs 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample jobs for testing
INSERT INTO public.jobs (title, company, description, location, salary_range, job_type, posted_at, tags, skills_required) VALUES
('Senior Software Engineer', 'TechCorp', 'We are looking for a senior software engineer to join our team and help build amazing products.', 'San Francisco, CA', '$120k - $180k', 'Full-time', CURRENT_DATE, ARRAY['React', 'Node.js', 'AWS', 'TypeScript'], ARRAY['React', 'Node.js', 'AWS', 'TypeScript', 'JavaScript']),
('Full Stack Developer', 'StartupXYZ', 'Join our fast-growing startup as a full stack developer and make an impact.', 'New York, NY', '$90k - $130k', 'Full-time', CURRENT_DATE, ARRAY['JavaScript', 'Python', 'Docker', 'PostgreSQL'], ARRAY['JavaScript', 'Python', 'Docker', 'PostgreSQL', 'React']),
('Frontend Developer', 'DesignStudio', 'We need a creative frontend developer to build amazing user interfaces.', 'Remote', '$80k - $120k', 'Full-time', CURRENT_DATE, ARRAY['React', 'Vue.js', 'CSS', 'Figma'], ARRAY['React', 'Vue.js', 'CSS', 'Figma', 'JavaScript']),
('Backend Engineer', 'DataFlow Inc', 'Build scalable backend systems and APIs for our data platform.', 'Seattle, WA', '$100k - $150k', 'Full-time', CURRENT_DATE, ARRAY['Python', 'Django', 'PostgreSQL', 'Redis'], ARRAY['Python', 'Django', 'PostgreSQL', 'Redis', 'API Development']),
('DevOps Engineer', 'CloudTech', 'Manage our cloud infrastructure and deployment pipelines.', 'Austin, TX', '$110k - $160k', 'Full-time', CURRENT_DATE, ARRAY['AWS', 'Docker', 'Kubernetes', 'Terraform'], ARRAY['AWS', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD']),
('Product Manager', 'InnovateCo', 'Lead product strategy and work with cross-functional teams.', 'Boston, MA', '$130k - $180k', 'Full-time', CURRENT_DATE, ARRAY['Product Management', 'Agile', 'Analytics', 'Strategy'], ARRAY['Product Management', 'Agile', 'Analytics', 'Strategy', 'Leadership'])
ON CONFLICT DO NOTHING;
