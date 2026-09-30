# Student Opportunity AI — Supabase Database Schema

This schema defines PostgreSQL tables, constraints, relationships, indexes, and Row Level Security (RLS) policies for Supabase.

---

## 1. SQL DDL Migration Script

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================================
-- 1. USERS TABLE
-- ========================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    display_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================================
-- 2. STUDENT PROFILES TABLE
-- ========================================================
CREATE TABLE IF NOT EXISTS student_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    display_name TEXT,
    university TEXT,
    education_level TEXT DEFAULT 'Undergraduate', -- Undergraduate, Graduate, High School, Bootcamp
    major TEXT,
    graduation_year INT,
    skills JSONB DEFAULT '[]'::jsonb,             -- Array of skill strings
    interests JSONB DEFAULT '[]'::jsonb,          -- Array of interest categories
    career_goals TEXT,
    preferred_location TEXT,
    remote_preference TEXT DEFAULT 'flexible',    -- remote, onsite, flexible
    theme_preference TEXT DEFAULT 'light',
    notification_preferences JSONB DEFAULT '{"email": true, "deadlines": true}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================================
-- 3. OPPORTUNITIES TABLE
-- ========================================================
CREATE TABLE IF NOT EXISTS opportunities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    organization TEXT NOT NULL,
    category TEXT NOT NULL,                       -- scholarship, internship, hackathon, fellowship, research, competition
    description TEXT,
    source_url TEXT,
    application_url TEXT,
    deadline TIMESTAMPTZ,
    location TEXT DEFAULT 'Global / Remote',
    is_remote BOOLEAN DEFAULT FALSE,
    requirements JSONB DEFAULT '[]'::jsonb,       -- Array of eligibility strings
    skills_required JSONB DEFAULT '[]'::jsonb,    -- Array of skill strings
    funding_compensation TEXT,                    -- e.g. "$5,000 stipend", "Prizes: $10,000"
    source_type TEXT DEFAULT 'curated',           -- curated, captured, manual, sample
    freshness_date TIMESTAMPTZ DEFAULT NOW(),
    extraction_status TEXT DEFAULT 'verified',    -- verified, raw, review_needed
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================================
-- 4. USER_OPPORTUNITIES (TRACKER) TABLE
-- ========================================================
CREATE TABLE IF NOT EXISTS user_opportunities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'saved',         -- saved, planned, applied, shortlisted, interview, offered, rejected, completed, archived
    notes TEXT,
    checklist JSONB DEFAULT '[]'::jsonb,          -- [{ id, item, completed: bool }]
    reminders JSONB DEFAULT '[]'::jsonb,          -- Array of ISO date strings
    applied_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, opportunity_id)
);

-- ========================================================
-- 5. FEEDBACK / AI INTERACTIONS TABLE (OPTIONAL AUDIT)
-- ========================================================
CREATE TABLE IF NOT EXISTS ai_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    opportunity_id UUID REFERENCES opportunities(id) ON DELETE SET NULL,
    interaction_type TEXT NOT NULL,               -- summarize, eligibility, checklist, chat
    request_data JSONB,
    response_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================================
-- INDEXES FOR FAST QUERYING & FILTERING
-- ========================================================
CREATE INDEX IF NOT EXISTS idx_opportunities_category ON opportunities(category);
CREATE INDEX IF NOT EXISTS idx_opportunities_deadline ON opportunities(deadline);
CREATE INDEX IF NOT EXISTS idx_opportunities_remote ON opportunities(is_remote);
CREATE INDEX IF NOT EXISTS idx_user_opportunities_user ON user_opportunities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_opportunities_status ON user_opportunities(user_id, status);

-- ========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================================
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_interactions ENABLE ROW LEVEL SECURITY;

-- Opportunities are publicly viewable
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Opportunities are readable by everyone" ON opportunities
    FOR SELECT USING (true);

-- Student profiles are private to their user
CREATE POLICY "Users can view and edit own profile" ON student_profiles
    FOR ALL USING (auth.uid() = user_id);

-- User tracked opportunities are private
CREATE POLICY "Users manage own tracked opportunities" ON user_opportunities
    FOR ALL USING (auth.uid() = user_id);
```
