-- Sample Seed Data for CampusTrack AI

-- Insert Demo Student
INSERT INTO students (id, student_id, name, department, semester, target_attendance_percentage)
VALUES 
('d1111111-1111-1111-1111-111111111111', 'CS2026-089', 'Rahul Sharma', 'Computer Science & Engineering', 6, 75.00),
('d2222222-2222-2222-2222-222222222222', 'CS2026-104', 'Priya Patel', 'Information Technology', 6, 75.00)
ON CONFLICT (student_id) DO NOTHING;

-- Insert Subjects
INSERT INTO subjects (id, code, name, faculty, min_requirement, condonation_min, total_classes_scheduled)
VALUES
('s1111111-1111-1111-1111-111111111111', 'CS601', 'Data Structures & Algorithms', 'Dr. Aris Thorne', 75.00, 65.00, 40),
('s2222222-2222-2222-2222-222222222222', 'CS602', 'Operating Systems', 'Prof. Meera Nair', 75.00, 65.00, 36),
('s3333333-3333-3333-3333-333333333333', 'CS603', 'Database Management Systems', 'Dr. Rajesh Kumar', 75.00, 65.00, 38),
('s4444444-4444-4444-4444-444444444444', 'CS604', 'Computer Networks', 'Prof. Vikram Seth', 75.00, 65.00, 35),
('s5555555-5555-5555-5555-555555555555', 'CS605', 'Machine Learning Essentials', 'Dr. Sunita Rao', 75.00, 65.00, 32)
ON CONFLICT DO NOTHING;

-- Insert Stats for Rahul Sharma
-- CS601: 32/38 (84.21% - SAFE)
-- CS602: 19/28 (67.86% - CRITICAL)
-- CS603: 23/31 (74.19% - WARNING)
-- CS604: 25/30 (83.33% - SAFE)
-- CS605: 16/22 (72.73% - WARNING)
INSERT INTO student_subject_stats (student_id, subject_id, classes_held, classes_attended, remaining_classes_in_term)
VALUES
('d1111111-1111-1111-1111-111111111111', 's1111111-1111-1111-1111-111111111111', 38, 32, 12),
('d1111111-1111-1111-1111-111111111111', 's2222222-2222-2222-2222-222222222222', 28, 19, 10),
('d1111111-1111-1111-1111-111111111111', 's3333333-3333-3333-3333-333333333333', 31, 23, 14),
('d1111111-1111-1111-1111-111111111111', 's4444444-4444-4444-4444-444444444444', 30, 25, 10),
('d1111111-1111-1111-1111-111111111111', 's5555555-5555-5555-5555-555555555555', 22, 16, 12)
ON CONFLICT DO NOTHING;

-- Insert Condonation Rules
INSERT INTO condonation_rules (rule_name, min_eligibility_pct, max_threshold_pct, required_documents, fee_per_subject, description)
VALUES
('Medical Ground Condonation', 65.00, 74.99, ARRAY['Medical Certificate from Registered Practitioner', 'Hospital Admission/Discharge Slip', 'Parent Leave Intimation Letter'], 500.00, 'Eligible for students missing classes due to documented medical emergencies.'),
('On-Duty / Hackathon / Sports Condonation', 65.00, 74.99, ARRAY['Event Participation Certificate', 'Faculty Mentor / HOD Recommendation Letter', 'OD Form Signed by Principal'], 0.00, 'Applicable for students representing the institute in technical hackathons, sports, or conferences.')
ON CONFLICT DO NOTHING;
