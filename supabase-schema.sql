-- SIMPAS DATABASE SCHEMA (Pancasila Salatiga)
-- Salin dan jalankan script ini di SQL Editor Supabase Anda.

-- 1. Tabel Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
    id TEXT PRIMARY KEY,
    nama TEXT NOT NULL,
    email TEXT,
    hp TEXT,
    role TEXT CHECK (role IN ('Ustadz', 'Admin')),
    profile_picture_url TEXT,
    password TEXT,
    username TEXT,
    telpon TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabel Subjects (Mata Pelajaran/Kitab)
CREATE TABLE IF NOT EXISTS public.subjects (
    id TEXT PRIMARY KEY,
    kode TEXT NOT NULL,
    nama TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tabel Classes (Kelas)
CREATE TABLE IF NOT EXISTS public.classes (
    id TEXT PRIMARY KEY,
    nama TEXT NOT NULL,
    tingkat TEXT NOT NULL,
    tahun_ajaran TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Tabel Students (Santri)
CREATE TABLE IF NOT EXISTS public.students (
    id TEXT PRIMARY KEY,
    nis TEXT NOT NULL,
    nama TEXT NOT NULL,
    gender TEXT CHECK (gender IN ('Laki-laki', 'Perempuan')),
    tempat_lahir TEXT,
    tanggal_lahir TEXT,
    alamat TEXT,
    hp_ortu TEXT,
    kelas_id TEXT REFERENCES public.classes(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Tabel Grades (Nilai)
CREATE TABLE IF NOT EXISTS public.grades (
    id TEXT PRIMARY KEY,
    student_id TEXT REFERENCES public.students(id) ON DELETE CASCADE,
    subject_id TEXT REFERENCES public.subjects(id) ON DELETE CASCADE,
    kelas_id TEXT REFERENCES public.classes(id) ON DELETE CASCADE,
    tamrin_score NUMERIC NOT NULL DEFAULT 0,
    semester_score NUMERIC NOT NULL DEFAULT 0,
    final_score NUMERIC NOT NULL DEFAULT 0,
    predikat TEXT CHECK (predikat IN ('A', 'B', 'C', 'D', 'E')),
    created_by TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
    date_input TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Tabel Attendance (Presensi)
CREATE TABLE IF NOT EXISTS public.attendance (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('Ustadz', 'Santri')),
    person_id TEXT NOT NULL,
    person_name TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('Hadir', 'Izin', 'Sakit', 'Alfa')),
    notes TEXT,
    kelas_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Tabel Syllabus Targets
CREATE TABLE IF NOT EXISTS public.syllabus_targets (
    id TEXT PRIMARY KEY,
    subject_id TEXT REFERENCES public.subjects(id) ON DELETE CASCADE,
    class_id TEXT REFERENCES public.classes(id) ON DELETE CASCADE,
    target_materi TEXT NOT NULL,
    ustadz_id TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Tabel Teaching Journals
CREATE TABLE IF NOT EXISTS public.teaching_journals (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    ustadz_id TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
    subject_id TEXT REFERENCES public.subjects(id) ON DELETE CASCADE,
    class_id TEXT REFERENCES public.classes(id) ON DELETE CASCADE,
    materi_diajarkan TEXT NOT NULL,
    kehadiran_summary TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. Tabel Nadhoman Setorans (Setoran Hafalan)
CREATE TABLE IF NOT EXISTS public.nadhoman_setorans (
    id TEXT PRIMARY KEY,
    student_id TEXT REFERENCES public.students(id) ON DELETE CASCADE,
    kelas_id TEXT REFERENCES public.classes(id) ON DELETE CASCADE,
    bait_awal INTEGER NOT NULL,
    bait_akhir INTEGER NOT NULL,
    date TEXT NOT NULL,
    ustadz_id TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Aktifkan Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.syllabus_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teaching_journals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nadhoman_setorans ENABLE ROW LEVEL SECURITY;

-- Buat policy sederhana agar Anon & Authenticated dapat membaca/menulis (Mempermudah integrasi SIMPAS)
CREATE POLICY "Allow all actions for everyone" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all actions for everyone" ON public.subjects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all actions for everyone" ON public.classes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all actions for everyone" ON public.students FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all actions for everyone" ON public.grades FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all actions for everyone" ON public.attendance FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all actions for everyone" ON public.syllabus_targets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all actions for everyone" ON public.teaching_journals FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all actions for everyone" ON public.nadhoman_setorans FOR ALL USING (true) WITH CHECK (true);
