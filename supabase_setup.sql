-- Supabase Database Setup Script
-- Run this in your Supabase SQL Editor to fix 401 errors

-- Enable RLS on Users table
ALTER TABLE public."Users" ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to insert their own data
CREATE POLICY "Users can insert their own data" ON public."Users"
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Create policy to allow users to view their own data
CREATE POLICY "Users can view their own data" ON public."Users"
    FOR SELECT USING (auth.uid() = id);

-- Create policy to allow users to update their own data
CREATE POLICY "Users can update their own data" ON public."Users"
    FOR UPDATE USING (auth.uid() = id);

-- Enable RLS on other tables
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cover_letter ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_tracker ENABLE ROW LEVEL SECURITY;

-- Allow public read access to jobs (for job listings)
CREATE POLICY "Jobs are viewable by everyone" ON public.jobs
    FOR SELECT USING (true);

-- Allow users to manage their own resumes
CREATE POLICY "Users can manage their own resumes" ON public.resumes
    FOR ALL USING (auth.uid() = user_id);

-- Allow users to manage their own cover letters
CREATE POLICY "Users can manage their own cover letters" ON public.cover_letter
    FOR ALL USING (auth.uid() = user_id);

-- Allow users to manage their own usage tracker
CREATE POLICY "Users can manage their own usage tracker" ON public.usage_tracker
    FOR ALL USING (auth.uid() = user_id);

-- Insert some sample jobs for testing
INSERT INTO public.jobs (title, company, description, location, salary_range, job_type, posted_at, tags) VALUES
('Senior Software Engineer', 'TechCorp', 'We are looking for a senior software engineer to join our team and help build amazing products.', 'San Francisco, CA', '$120k - $180k', 'Full-time', CURRENT_DATE, ARRAY['React', 'Node.js', 'AWS', 'TypeScript']),
('Full Stack Developer', 'StartupXYZ', 'Join our fast-growing startup as a full stack developer and make an impact.', 'New York, NY', '$90k - $130k', 'Full-time', CURRENT_DATE, ARRAY['JavaScript', 'Python', 'Docker', 'PostgreSQL']),
('Frontend Developer', 'DesignStudio', 'We need a creative frontend developer to build amazing user interfaces.', 'Remote', '$80k - $120k', 'Full-time', CURRENT_DATE, ARRAY['React', 'Vue.js', 'CSS', 'Figma']),
('Backend Engineer', 'DataFlow Inc', 'Build scalable backend systems and APIs for our data platform.', 'Seattle, WA', '$100k - $150k', 'Full-time', CURRENT_DATE, ARRAY['Python', 'Django', 'PostgreSQL', 'Redis']),
('DevOps Engineer', 'CloudTech', 'Manage our cloud infrastructure and deployment pipelines.', 'Austin, TX', '$110k - $160k', 'Full-time', CURRENT_DATE, ARRAY['AWS', 'Docker', 'Kubernetes', 'Terraform']),
('Product Manager', 'InnovateCo', 'Lead product strategy and work with cross-functional teams.', 'Boston, MA', '$130k - $180k', 'Full-time', CURRENT_DATE, ARRAY['Product Management', 'Agile', 'Analytics', 'Strategy']);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public."Users" TO anon, authenticated;
GRANT ALL ON public.jobs TO anon, authenticated;
GRANT ALL ON public.resumes TO anon, authenticated;
GRANT ALL ON public.cover_letter TO anon, authenticated;
GRANT ALL ON public.usage_tracker TO anon, authenticated;
