-- CampusTrack AI Supabase PostgreSQL Schema
-- Database Schema for Student Attendance, Subjects, Calendar, Leave/OD, Condonation

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Students Table
CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    department VARCHAR(100) NOT NULL,
    semester INTEGER NOT NULL,
    target_attendance_percentage NUMERIC(5, 2) DEFAULT 75.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Subjects Table
CREATE TABLE IF NOT EXISTS subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(20) NOT NULL,
    name VARCHAR(100) NOT NULL,
    faculty VARCHAR(100) NOT NULL,
    min_requirement NUMERIC(5, 2) DEFAULT 75.00,
    condonation_min NUMERIC(5, 2) DEFAULT 65.00,
    total_classes_scheduled INTEGER DEFAULT 45,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Student Subject Enrolments (held vs attended)
CREATE TABLE IF NOT EXISTS student_subject_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
    classes_held INTEGER NOT NULL DEFAULT 0,
    classes_attended INTEGER NOT NULL DEFAULT 0,
    remaining_classes_in_term INTEGER NOT NULL DEFAULT 15,
    UNIQUE(student_id, subject_id)
);

-- 4. Attendance Logs (detailed dates & time slots)
CREATE TABLE IF NOT EXISTS attendance_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
    class_date DATE NOT NULL,
    time_slot VARCHAR(50) NOT NULL, -- e.g., '09:00 AM - 10:00 AM', 'Monday 08:00 AM'
    day_of_week VARCHAR(20) NOT NULL, -- 'Monday', 'Tuesday', etc.
    status VARCHAR(20) NOT NULL CHECK (status IN ('PRESENT', 'ABSENT', 'ON_DUTY', 'LEAVE_SANCTIONED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Leave & On-Duty (OD) Requests Table
CREATE TABLE IF NOT EXISTS leave_od_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    request_type VARCHAR(20) NOT NULL CHECK (request_type IN ('LEAVE', 'ON_DUTY')),
    reason VARCHAR(255) NOT NULL,
    from_date DATE NOT NULL,
    to_date DATE NOT NULL,
    affected_subjects TEXT[] DEFAULT '{}',
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'PROOF_REQUIRED')),
    proof_submitted BOOLEAN DEFAULT FALSE,
    proof_deadline DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Academic Calendar & Term Details
CREATE TABLE IF NOT EXISTS academic_calendar (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_name VARCHAR(100) NOT NULL,
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('HOLIDAY', 'EXAM', 'STRIKE', 'SPECIAL_CLASS', 'TERM_END')),
    event_date DATE NOT NULL,
    is_working_day BOOLEAN DEFAULT FALSE
);

-- 7. Institute Condonation Policy Rules
CREATE TABLE IF NOT EXISTS condonation_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rule_name VARCHAR(100) NOT NULL,
    min_eligibility_pct NUMERIC(5,2) DEFAULT 65.00,
    max_threshold_pct NUMERIC(5,2) DEFAULT 74.99,
    required_documents TEXT[] NOT NULL,
    fee_per_subject NUMERIC(10,2) DEFAULT 500.00,
    description TEXT
);
