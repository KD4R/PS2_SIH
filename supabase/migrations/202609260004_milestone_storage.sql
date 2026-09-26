-- Create the milestone-evidence bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('milestone-evidence', 'milestone-evidence', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for milestone-evidence
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'milestone-evidence');

CREATE POLICY "Authenticated users can upload evidence" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'milestone-evidence' AND auth.role() = 'authenticated');
