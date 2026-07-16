-- KYC Submissions table
CREATE TABLE IF NOT EXISTS kyc_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  id_type TEXT NOT NULL,
  id_number TEXT NOT NULL,
  full_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  country TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, rejected
  verified_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- KYC ID Documents table
CREATE TABLE IF NOT EXISTS kyc_id_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  document_type TEXT NOT NULL, -- front, back
  verified BOOLEAN DEFAULT FALSE,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, document_type)
);

-- Add kyc_verified column to profiles if not exists
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS kyc_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS trust_score INT DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avg_rating DECIMAL(3,2) DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS violation_count INT DEFAULT 0;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_kyc_submissions_user_id ON kyc_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_kyc_submissions_status ON kyc_submissions(status);
CREATE INDEX IF NOT EXISTS idx_kyc_id_documents_user_id ON kyc_id_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_kyc_verified ON profiles(kyc_verified);
CREATE INDEX IF NOT EXISTS idx_profiles_trust_score ON profiles(trust_score);

-- RLS Policies for KYC Submissions
ALTER TABLE kyc_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own KYC submission" ON kyc_submissions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own KYC submission" ON kyc_submissions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can manage KYC" ON kyc_submissions
  FOR ALL USING (auth.role() = 'service_role');

-- RLS Policies for KYC ID Documents
ALTER TABLE kyc_id_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own documents" ON kyc_id_documents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can upload their own documents" ON kyc_id_documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can manage documents" ON kyc_id_documents
  FOR ALL USING (auth.role() = 'service_role');

-- Update trigger for kyc_submissions updated_at
CREATE OR REPLACE FUNCTION update_kyc_submissions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER kyc_submissions_update_timestamp
  BEFORE UPDATE ON kyc_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_kyc_submissions_updated_at();
