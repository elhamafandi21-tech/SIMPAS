import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Configuration keys for localStorage override
const URL_KEY = 'simpas_supabase_url';
const ANON_KEY = 'simpas_supabase_anon_key';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

// Get the active configuration (from localStorage or environment variables)
export function getSupabaseConfig(): SupabaseConfig {
  const localUrl = localStorage.getItem(URL_KEY) || '';
  const localAnonKey = localStorage.getItem(ANON_KEY) || '';

  return {
    url: localUrl || (import.meta.env.VITE_SUPABASE_URL as string) || '',
    anonKey: localAnonKey || (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || ''
  };
}

// Save custom credentials from UI
export function saveSupabaseConfig(url: string, anonKey: string): void {
  localStorage.setItem(URL_KEY, url.trim());
  localStorage.setItem(ANON_KEY, anonKey.trim());
}

// Clear custom credentials
export function clearSupabaseConfig(): void {
  localStorage.removeItem(URL_KEY);
  localStorage.removeItem(ANON_KEY);
}

let supabaseInstance: SupabaseClient | null = null;

// Lazy initialization of Supabase client to prevent crashing on startup
export function getSupabaseClient(): SupabaseClient | null {
  const config = getSupabaseConfig();
  if (!config.url || !config.anonKey) {
    return null;
  }

  try {
    if (!supabaseInstance) {
      supabaseInstance = createClient(config.url, config.anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true
        }
      });
    }
    return supabaseInstance;
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error);
    return null;
  }
}

// SQL schema generator helper
export const SUPABASE_SQL_SCHEMA = `-- SIMPAS DATABASE SCHEMA (Pancasila Salatiga)
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
    tahun_ajaran TEXT NOT NULL,
    wali_kelas_id TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
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

-- Aktifkan Row Level Security (RLS) namun perbolehkan akses publik/anonim agar mudah untuk demo, atau set aturan sesuai kebutuhan Anda.
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
DROP POLICY IF EXISTS "Allow all actions for everyone" ON public.profiles;
CREATE POLICY "Allow all actions for everyone" ON public.profiles FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all actions for everyone" ON public.subjects;
CREATE POLICY "Allow all actions for everyone" ON public.subjects FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all actions for everyone" ON public.classes;
CREATE POLICY "Allow all actions for everyone" ON public.classes FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all actions for everyone" ON public.students;
CREATE POLICY "Allow all actions for everyone" ON public.students FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all actions for everyone" ON public.grades;
CREATE POLICY "Allow all actions for everyone" ON public.grades FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all actions for everyone" ON public.attendance;
CREATE POLICY "Allow all actions for everyone" ON public.attendance FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all actions for everyone" ON public.syllabus_targets;
CREATE POLICY "Allow all actions for everyone" ON public.syllabus_targets FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all actions for everyone" ON public.teaching_journals;
CREATE POLICY "Allow all actions for everyone" ON public.teaching_journals FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all actions for everyone" ON public.nadhoman_setorans;
CREATE POLICY "Allow all actions for everyone" ON public.nadhoman_setorans FOR ALL USING (true) WITH CHECK (true);
`;

// Helper: Deduplicate array of objects by id
function deduplicateById<T extends { id: any }>(arr: T[]): T[] {
  const map = new Map<string, T>();
  for (const item of arr) {
    if (item && item.id !== undefined && item.id !== null) {
      map.set(String(item.id), item);
    }
  }
  return Array.from(map.values());
}

// Helper: Push all local data tables to Supabase
export async function pushLocalToSupabase(dbInstance: any): Promise<{ success: boolean; message: string; counts?: any }> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, message: 'Supabase client is not configured.' };
  }

  try {
    const results = {
      profiles: 0,
      subjects: 0,
      classes: 0,
      students: 0,
      grades: 0,
      attendance: 0,
      syllabus_targets: 0,
      teaching_journals: 0,
      nadhoman_setorans: 0
    };

    // 1. Profiles
    if (dbInstance.profiles.length > 0) {
      const uniqueProfiles = deduplicateById(dbInstance.profiles);
      const formattedProfiles = uniqueProfiles.map((p: any) => ({
        id: p.id,
        nama: p.nama,
        email: p.email || null,
        hp: p.hp || null,
        role: p.role,
        profile_picture_url: p.profile_picture_url || null,
        password: p.password || null,
        username: p.username || null,
        telpon: p.telpon || null
      }));
      const { error } = await client.from('profiles').upsert(formattedProfiles);
      if (error) throw new Error(`Profiles Sync Failed: ${error.message}`);
      results.profiles = uniqueProfiles.length;
    }

    // 2. Subjects
    if (dbInstance.subjects.length > 0) {
      const uniqueSubjects = deduplicateById(dbInstance.subjects);
      const { error } = await client.from('subjects').upsert(uniqueSubjects);
      if (error) throw new Error(`Subjects Sync Failed: ${error.message}`);
      results.subjects = uniqueSubjects.length;
    }

    // 3. Classes
    if (dbInstance.classes.length > 0) {
      const uniqueClasses = deduplicateById(dbInstance.classes);
      const formattedClasses = uniqueClasses.map((c: any) => ({
        id: c.id,
        nama: c.nama,
        tahun_ajaran: c.tahun_ajaran,
        wali_kelas_id: c.wali_kelas_id || null
      }));
      const { error } = await client.from('classes').upsert(formattedClasses);
      if (error) throw new Error(`Classes Sync Failed: ${error.message}`);
      results.classes = uniqueClasses.length;
    }

    // 4. Students
    if (dbInstance.students.length > 0) {
      const uniqueStudents = deduplicateById(dbInstance.students);
      const { error } = await client.from('students').upsert(uniqueStudents);
      if (error) throw new Error(`Students Sync Failed: ${error.message}`);
      results.students = uniqueStudents.length;
    }

    // 5. Grades
    if (dbInstance.grades.length > 0) {
      const uniqueGrades = deduplicateById(dbInstance.grades);
      const { error } = await client.from('grades').upsert(uniqueGrades);
      if (error) throw new Error(`Grades Sync Failed: ${error.message}`);
      results.grades = uniqueGrades.length;
    }

    // 6. Attendance
    if (dbInstance.attendance.length > 0) {
      const uniqueAttendance = deduplicateById(dbInstance.attendance);
      const { error } = await client.from('attendance').upsert(uniqueAttendance);
      if (error) throw new Error(`Attendance Sync Failed: ${error.message}`);
      results.attendance = uniqueAttendance.length;
    }

    // 7. Syllabus Targets
    if (dbInstance.syllabusTargets.length > 0) {
      const uniqueTargets = deduplicateById(dbInstance.syllabusTargets);
      const formattedTargets = uniqueTargets.map((t: any) => ({
        id: t.id,
        subject_id: t.subject_id,
        class_id: t.class_id,
        target_materi: t.target_materi,
        ustadz_id: t.ustadz_id
      }));
      const { error } = await client.from('syllabus_targets').upsert(formattedTargets);
      if (error) throw new Error(`Syllabus Targets Sync Failed: ${error.message}`);
      results.syllabus_targets = uniqueTargets.length;
    }

    // 8. Teaching Journals
    if (dbInstance.teachingJournals.length > 0) {
      const uniqueJournals = deduplicateById(dbInstance.teachingJournals);
      const formattedJournals = uniqueJournals.map((j: any) => ({
        id: j.id,
        date: j.date,
        ustadz_id: j.ustadz_id,
        subject_id: j.subject_id,
        class_id: j.class_id,
        materi_diajarkan: j.materi_diajarkan,
        kehadiran_summary: j.kehadiran_summary,
        notes: j.notes
      }));
      const { error } = await client.from('teaching_journals').upsert(formattedJournals);
      if (error) throw new Error(`Teaching Journals Sync Failed: ${error.message}`);
      results.teaching_journals = uniqueJournals.length;
    }

    // 9. Nadhoman Setorans
    if (dbInstance.nadhomanSetorans.length > 0) {
      const uniqueNadhomanSetorans = deduplicateById(dbInstance.nadhomanSetorans);
      const { error } = await client.from('nadhoman_setorans').upsert(uniqueNadhomanSetorans);
      if (error) throw new Error(`Nadhoman Setorans Sync Failed: ${error.message}`);
      results.nadhoman_setorans = uniqueNadhomanSetorans.length;
    }

    return {
      success: true,
      message: 'Seluruh data lokal berhasil diunggah ke Supabase!',
      counts: results
    };
  } catch (error: any) {
    console.error('Error syncing to Supabase:', error);
    return { success: false, message: error.message || 'Terjadi kesalahan saat menyinkronkan data.' };
  }
}

// Helper: Pull data from Supabase to replace or update local tables
export async function pullSupabaseToLocal(dbInstance: any): Promise<{ success: boolean; message: string; counts?: any }> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, message: 'Supabase client is not configured.' };
  }

  try {
    const results = {
      profiles: 0,
      subjects: 0,
      classes: 0,
      students: 0,
      grades: 0,
      attendance: 0,
      syllabus_targets: 0,
      teaching_journals: 0,
      nadhoman_setorans: 0
    };

    // 1. Profiles
    const { data: profilesData, error: errProf } = await client.from('profiles').select('*');
    if (errProf) throw new Error(`Gagal memuat profiles: ${errProf.message}`);
    if (profilesData && profilesData.length > 0) {
      dbInstance.profiles = profilesData;
      results.profiles = profilesData.length;
    }

    // 2. Subjects
    const { data: subjectsData, error: errSub } = await client.from('subjects').select('*');
    if (errSub) throw new Error(`Gagal memuat subjects: ${errSub.message}`);
    if (subjectsData && subjectsData.length > 0) {
      dbInstance.subjects = subjectsData;
      results.subjects = subjectsData.length;
    }

    // 3. Classes
    const { data: classesData, error: errCls } = await client.from('classes').select('*');
    if (errCls) throw new Error(`Gagal memuat classes: ${errCls.message}`);
    if (classesData && classesData.length > 0) {
      dbInstance.classes = classesData.map((c: any) => ({
        id: c.id,
        nama: c.nama,
        tahun_ajaran: c.tahun_ajaran,
        wali_kelas_id: c.wali_kelas_id || ''
      }));
      results.classes = classesData.length;
    }

    // 4. Students
    const { data: studentsData, error: errStd } = await client.from('students').select('*');
    if (errStd) throw new Error(`Gagal memuat students: ${errStd.message}`);
    if (studentsData && studentsData.length > 0) {
      dbInstance.students = studentsData;
      results.students = studentsData.length;
    }

    // 5. Grades
    const { data: gradesData, error: errGrd } = await client.from('grades').select('*');
    if (errGrd) throw new Error(`Gagal memuat grades: ${errGrd.message}`);
    if (gradesData && gradesData.length > 0) {
      dbInstance.grades = gradesData;
      results.grades = gradesData.length;
    }

    // 6. Attendance
    const { data: attendanceData, error: errAtt } = await client.from('attendance').select('*');
    if (errAtt) throw new Error(`Gagal memuat attendance: ${errAtt.message}`);
    if (attendanceData && attendanceData.length > 0) {
      dbInstance.attendance = attendanceData;
      results.attendance = attendanceData.length;
    }

    // 7. Syllabus Targets
    const { data: targetsData, error: errSyl } = await client.from('syllabus_targets').select('*');
    if (errSyl) throw new Error(`Gagal memuat syllabus_targets: ${errSyl.message}`);
    if (targetsData && targetsData.length > 0) {
      dbInstance.syllabusTargets = targetsData.map((t: any) => ({
        id: t.id,
        subject_id: t.subject_id,
        class_id: t.class_id,
        target_materi: t.target_materi,
        ustadz_id: t.ustadz_id
      }));
      results.syllabus_targets = targetsData.length;
    }

    // 8. Teaching Journals
    const { data: journalsData, error: errJr } = await client.from('teaching_journals').select('*');
    if (errJr) throw new Error(`Gagal memuat teaching_journals: ${errJr.message}`);
    if (journalsData && journalsData.length > 0) {
      dbInstance.teachingJournals = journalsData.map((j: any) => ({
        id: j.id,
        date: j.date,
        ustadz_id: j.ustadz_id,
        subject_id: j.subject_id,
        class_id: j.class_id,
        materi_diajarkan: j.materi_diajarkan,
        kehadiran_summary: j.kehadiran_summary,
        notes: j.notes
      }));
      results.teaching_journals = journalsData.length;
    }

    // 9. Nadhoman Setorans
    const { data: setoranData, error: errNd } = await client.from('nadhoman_setorans').select('*');
    if (errNd) throw new Error(`Gagal memuat nadhoman_setorans: ${errNd.message}`);
    if (setoranData && setoranData.length > 0) {
      dbInstance.nadhomanSetorans = setoranData;
      results.nadhoman_setorans = setoranData.length;
    }

    // Persist pulled data to LocalStorage
    dbInstance.saveAll();

    return {
      success: true,
      message: 'Berhasil mengunduh data dari Supabase dan memperbarui database lokal!',
      counts: results
    };
  } catch (error: any) {
    console.error('Error syncing from Supabase:', error);
    return { success: false, message: error.message || 'Terjadi kesalahan saat mengunduh data.' };
  }
}

// Background auto-sync trigger helper
export async function autoSyncWithSupabase(tableName: string, data: any): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;

  try {
    // Normalise column structures if necessary before upserting
    await client.from(tableName).upsert(data);
    console.log(`Auto-synced ${tableName} to Supabase successfully.`);
  } catch (err) {
    console.warn(`Failed auto-sync for table ${tableName}:`, err);
  }
}
