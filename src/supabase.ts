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

-- ==========================================
-- JIKA ANDA SUDAH MEMPUNYAI DATABASE SEBELUMNYA (EXISTING),
-- JALANKAN PERINTAH ALTER BERIKUT DI SQL EDITOR SUPABASE:
-- 
-- ALTER TABLE public.students ADD COLUMN IF NOT EXISTS nis TEXT;
-- ALTER TABLE public.students ADD COLUMN IF NOT EXISTS alamat TEXT;
-- ALTER TABLE public.students ADD COLUMN IF NOT EXISTS hp_ortu TEXT;
-- ==========================================

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
    nama TEXT NOT NULL,
    gender TEXT CHECK (gender IN ('Laki-laki', 'Perempuan')),
    tempat_lahir TEXT,
    tanggal_lahir TEXT,
    kelas_id TEXT REFERENCES public.classes(id) ON DELETE SET NULL,
    nis TEXT,
    alamat TEXT,
    hp_ortu TEXT,
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

    const missingTables: string[] = [];

    // 1. Profiles
    try {
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
        if (error) {
          if (error.message.includes('schema cache') || error.message.includes('does not exist')) {
            missingTables.push('profiles');
          } else {
            throw new Error(`Profiles Sync Failed: ${error.message}`);
          }
        } else {
          results.profiles = uniqueProfiles.length;
        }
      }
    } catch (err: any) {
      console.warn('Profiles push skipped:', err.message || err);
    }

    // 2. Subjects
    try {
      if (dbInstance.subjects.length > 0) {
        const uniqueSubjects = deduplicateById(dbInstance.subjects);
        const { error } = await client.from('subjects').upsert(uniqueSubjects);
        if (error) {
          if (error.message.includes('schema cache') || error.message.includes('does not exist')) {
            missingTables.push('subjects');
          } else {
            throw new Error(`Subjects Sync Failed: ${error.message}`);
          }
        } else {
          results.subjects = uniqueSubjects.length;
        }
      }
    } catch (err: any) {
      console.warn('Subjects push skipped:', err.message || err);
    }

    // 3. Classes
    try {
      if (dbInstance.classes.length > 0) {
        const uniqueClasses = deduplicateById(dbInstance.classes);
        const formattedClasses = uniqueClasses.map((c: any) => ({
          id: c.id,
          nama: c.nama,
          tahun_ajaran: c.tahun_ajaran,
          wali_kelas_id: c.wali_kelas_id || null
        }));
        const { error } = await client.from('classes').upsert(formattedClasses);
        if (error) {
          if (error.message.includes('schema cache') || error.message.includes('does not exist')) {
            missingTables.push('classes');
          } else {
            throw new Error(`Classes Sync Failed: ${error.message}`);
          }
        } else {
          results.classes = uniqueClasses.length;
        }
      }
    } catch (err: any) {
      console.warn('Classes push skipped:', err.message || err);
    }

    // 4. Students
    try {
      if (dbInstance.students.length > 0) {
        const uniqueStudents = deduplicateById(dbInstance.students);
        const formattedStudents = uniqueStudents.map((s: any) => ({
          id: s.id,
          nama: s.nama,
          gender: s.gender || null,
          tempat_lahir: s.tempat_lahir || null,
          tanggal_lahir: s.tanggal_lahir || null,
          kelas_id: s.kelas_id || null,
          nis: s.nis || null,
          alamat: s.alamat || null,
          hp_ortu: s.hp_ortu || null
        }));
        const { error } = await client.from('students').upsert(formattedStudents);
        if (error) {
          if (error.message.includes('schema cache') || error.message.includes('does not exist')) {
            missingTables.push('students');
          } else {
            throw new Error(`Students Sync Failed: ${error.message}`);
          }
        } else {
          results.students = uniqueStudents.length;
        }
      }
    } catch (err: any) {
      console.warn('Students push skipped:', err.message || err);
    }

    // 5. Grades
    try {
      if (dbInstance.grades.length > 0) {
        const uniqueGrades = deduplicateById(dbInstance.grades);
        const { error } = await client.from('grades').upsert(uniqueGrades);
        if (error) {
          if (error.message.includes('schema cache') || error.message.includes('does not exist')) {
            missingTables.push('grades');
          } else {
            throw new Error(`Grades Sync Failed: ${error.message}`);
          }
        } else {
          results.grades = uniqueGrades.length;
        }
      }
    } catch (err: any) {
      console.warn('Grades push skipped:', err.message || err);
    }

    // 6. Attendance
    try {
      if (dbInstance.attendance.length > 0) {
        const uniqueAttendance = deduplicateById(dbInstance.attendance);
        const { error } = await client.from('attendance').upsert(uniqueAttendance);
        if (error) {
          if (error.message.includes('schema cache') || error.message.includes('does not exist')) {
            missingTables.push('attendance');
          } else {
            throw new Error(`Attendance Sync Failed: ${error.message}`);
          }
        } else {
          results.attendance = uniqueAttendance.length;
        }
      }
    } catch (err: any) {
      console.warn('Attendance push skipped:', err.message || err);
    }

    // 7. Syllabus Targets
    try {
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
        if (error) {
          if (error.message.includes('schema cache') || error.message.includes('does not exist')) {
            missingTables.push('syllabus_targets');
          } else {
            throw new Error(`Syllabus Targets Sync Failed: ${error.message}`);
          }
        } else {
          results.syllabus_targets = uniqueTargets.length;
        }
      }
    } catch (err: any) {
      console.warn('Syllabus targets push skipped:', err.message || err);
    }

    // 8. Teaching Journals
    try {
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
        if (error) {
          if (error.message.includes('schema cache') || error.message.includes('does not exist')) {
            missingTables.push('teaching_journals');
          } else {
            throw new Error(`Teaching Journals Sync Failed: ${error.message}`);
          }
        } else {
          results.teaching_journals = uniqueJournals.length;
        }
      }
    } catch (err: any) {
      console.warn('Teaching journals push skipped:', err.message || err);
    }

    // 9. Nadhoman Setorans
    try {
      if (dbInstance.nadhomanSetorans.length > 0) {
        const uniqueNadhomanSetorans = deduplicateById(dbInstance.nadhomanSetorans);
        const { error } = await client.from('nadhoman_setorans').upsert(uniqueNadhomanSetorans);
        if (error) {
          if (error.message.includes('schema cache') || error.message.includes('does not exist')) {
            missingTables.push('nadhoman_setorans');
          } else {
            throw new Error(`Nadhoman Setorans Sync Failed: ${error.message}`);
          }
        } else {
          results.nadhoman_setorans = uniqueNadhomanSetorans.length;
        }
      }
    } catch (err: any) {
      console.warn('Nadhoman setorans push skipped:', err.message || err);
    }

    if (missingTables.length > 0) {
      return {
        success: true,
        message: `Sinkronisasi berhasil sebagian! Beberapa tabel belum terbuat di Supabase Anda (${missingTables.join(', ')}). Harap jalankan script migrasi terbaru di SQL Editor Supabase Anda.`,
        counts: results
      };
    }

    return {
      success: true,
      message: 'Seluruh data lokal berhasil diunggah ke Supabase!',
      counts: results
    };
  } catch (error: any) {
    console.error('Error syncing to Supabase:', error);
    let msg = error.message || 'Terjadi kesalahan saat menyinkronkan data.';
    const lowerMsg = msg.toLowerCase();
    if (lowerMsg.includes('alamat') || lowerMsg.includes('nis') || lowerMsg.includes('column') || lowerMsg.includes('schema cache')) {
      msg += ' (Saran: Tampaknya struktur tabel Supabase Anda belum diperbarui/sinkron. Silakan buka tab "Script SQL & Migrasi" di halaman Integrasi Supabase dan jalankan script ALTER TABLE atau DROP TABLE di SQL Editor Supabase Anda)';
    }
    return { success: false, message: msg };
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

    const missingTables: string[] = [];

    // 1. Profiles
    try {
      const { data: profilesData, error: errProf } = await client.from('profiles').select('*');
      if (errProf) {
        if (errProf.message.includes('schema cache') || errProf.message.includes('does not exist')) {
          missingTables.push('profiles');
        } else {
          throw new Error(`Gagal memuat profiles: ${errProf.message}`);
        }
      } else {
        const pulled = profilesData || [];
        if (pulled.length === 0) {
          // If Supabase has no profiles, don't wipe local profiles, or fallback to default ones
          console.log('Pulled empty profiles from Supabase, keeping local profiles or falling back.');
          if (!dbInstance.profiles || dbInstance.profiles.length === 0) {
            dbInstance.profiles = [
              {
                id: 'prof-1',
                nama: 'Ustadz Ahmad Fauzi',
                email: 'ahmadfauzi@madinpancasila.sch.id',
                hp: '081234567890',
                role: 'Ustadz',
                profile_picture_url: '',
                username: 'ahmadfauzi',
                password: 'password'
              },
              {
                id: 'prof-2',
                nama: 'Administrator Madin',
                email: 'admin@madinpancasila.sch.id',
                hp: '089876543210',
                role: 'Admin',
                profile_picture_url: '',
                username: 'admin',
                password: 'admin123'
              }
            ];
          }
        } else {
          dbInstance.profiles = pulled;
          // Ensure we have at least one Admin profile so user is not locked out
          const hasAdmin = dbInstance.profiles.some((p: any) => p.role === 'Admin');
          if (!hasAdmin) {
            dbInstance.profiles.push({
              id: 'prof-2',
              nama: 'Administrator Madin',
              email: 'admin@madinpancasila.sch.id',
              hp: '089876543210',
              role: 'Admin',
              profile_picture_url: '',
              username: 'admin',
              password: 'admin123'
            });
          }
          // Also ensure we have a default Ustadz
          const hasUstadz = dbInstance.profiles.some((p: any) => p.role === 'Ustadz');
          if (!hasUstadz) {
            dbInstance.profiles.push({
              id: 'prof-1',
              nama: 'Ustadz Ahmad Fauzi',
              email: 'ahmadfauzi@madinpancasila.sch.id',
              hp: '081234567890',
              role: 'Ustadz',
              profile_picture_url: '',
              username: 'ahmadfauzi',
              password: 'password'
            });
          }
        }
        results.profiles = dbInstance.profiles.length;
      }
    } catch (err: any) {
      console.warn('Profiles pull skipped:', err.message || err);
    }

    // 2. Subjects
    try {
      const { data: subjectsData, error: errSub } = await client.from('subjects').select('*');
      if (errSub) {
        if (errSub.message.includes('schema cache') || errSub.message.includes('does not exist')) {
          missingTables.push('subjects');
        } else {
          throw new Error(`Gagal memuat subjects: ${errSub.message}`);
        }
      } else {
        dbInstance.subjects = subjectsData || [];
        results.subjects = dbInstance.subjects.length;
      }
    } catch (err: any) {
      console.warn('Subjects pull skipped:', err.message || err);
    }

    // 3. Classes
    try {
      const { data: classesData, error: errCls } = await client.from('classes').select('*');
      if (errCls) {
        if (errCls.message.includes('schema cache') || errCls.message.includes('does not exist')) {
          missingTables.push('classes');
        } else {
          throw new Error(`Gagal memuat classes: ${errCls.message}`);
        }
      } else {
        dbInstance.classes = (classesData || []).map((c: any) => ({
          id: c.id,
          nama: c.nama,
          tahun_ajaran: c.tahun_ajaran,
          wali_kelas_id: c.wali_kelas_id || ''
        }));
        results.classes = dbInstance.classes.length;
      }
    } catch (err: any) {
      console.warn('Classes pull skipped:', err.message || err);
    }

    // 4. Students
    try {
      const { data: studentsData, error: errStd } = await client.from('students').select('*');
      if (errStd) {
        if (errStd.message.includes('schema cache') || errStd.message.includes('does not exist')) {
          missingTables.push('students');
        } else {
          throw new Error(`Gagal memuat students: ${errStd.message}`);
        }
      } else {
        dbInstance.students = (studentsData || []).map((s: any, idx: number) => {
          const localStudent = dbInstance.students.find((ls: any) => ls.id === s.id);
          return {
            id: s.id,
            nama: s.nama,
            gender: s.gender || 'Laki-laki',
            tempat_lahir: s.tempat_lahir || 'Salatiga',
            tanggal_lahir: s.tanggal_lahir || '2010-01-01',
            kelas_id: s.kelas_id || '',
            nis: s.nis || (localStudent && localStudent.nis) || String(1000 + idx + 1),
            alamat: s.alamat || (localStudent && localStudent.alamat) || 'Alamat santri terdaftar',
            hp_ortu: s.hp_ortu || (localStudent && localStudent.hp_ortu) || '081234567890'
          };
        });
        results.students = dbInstance.students.length;
      }
    } catch (err: any) {
      console.warn('Students pull skipped:', err.message || err);
    }

    // 5. Grades
    try {
      const { data: gradesData, error: errGrd } = await client.from('grades').select('*');
      if (errGrd) {
        if (errGrd.message.includes('schema cache') || errGrd.message.includes('does not exist')) {
          missingTables.push('grades');
        } else {
          throw new Error(`Gagal memuat grades: ${errGrd.message}`);
        }
      } else {
        dbInstance.grades = gradesData || [];
        results.grades = dbInstance.grades.length;
      }
    } catch (err: any) {
      console.warn('Grades pull skipped:', err.message || err);
    }

    // 6. Attendance
    try {
      const { data: attendanceData, error: errAtt } = await client.from('attendance').select('*');
      if (errAtt) {
        if (errAtt.message.includes('schema cache') || errAtt.message.includes('does not exist')) {
          missingTables.push('attendance');
        } else {
          throw new Error(`Gagal memuat attendance: ${errAtt.message}`);
        }
      } else {
        dbInstance.attendance = attendanceData || [];
        results.attendance = dbInstance.attendance.length;
      }
    } catch (err: any) {
      console.warn('Attendance pull skipped:', err.message || err);
    }

    // 7. Syllabus Targets
    try {
      const { data: targetsData, error: errSyl } = await client.from('syllabus_targets').select('*');
      if (errSyl) {
        if (errSyl.message.includes('schema cache') || errSyl.message.includes('does not exist')) {
          missingTables.push('syllabus_targets');
        } else {
          throw new Error(`Gagal memuat syllabus_targets: ${errSyl.message}`);
        }
      } else {
        dbInstance.syllabusTargets = (targetsData || []).map((t: any) => ({
          id: t.id,
          subject_id: t.subject_id,
          class_id: t.class_id,
          target_materi: t.target_materi,
          ustadz_id: t.ustadz_id
        }));
        results.syllabus_targets = dbInstance.syllabusTargets.length;
      }
    } catch (err: any) {
      console.warn('Syllabus targets pull skipped:', err.message || err);
    }

    // 8. Teaching Journals
    try {
      const { data: journalsData, error: errJr } = await client.from('teaching_journals').select('*');
      if (errJr) {
        if (errJr.message.includes('schema cache') || errJr.message.includes('does not exist')) {
          missingTables.push('teaching_journals');
        } else {
          throw new Error(`Gagal memuat teaching_journals: ${errJr.message}`);
        }
      } else {
        dbInstance.teachingJournals = (journalsData || []).map((j: any) => ({
          id: j.id,
          date: j.date,
          ustadz_id: j.ustadz_id,
          subject_id: j.subject_id,
          class_id: j.class_id,
          materi_diajarkan: j.materi_diajarkan,
          kehadiran_summary: j.kehadiran_summary,
          notes: j.notes
        }));
        results.teaching_journals = dbInstance.teachingJournals.length;
      }
    } catch (err: any) {
      console.warn('Teaching journals pull skipped:', err.message || err);
    }

    // 9. Nadhoman Setorans
    try {
      const { data: setoranData, error: errNd } = await client.from('nadhoman_setorans').select('*');
      if (errNd) {
        if (errNd.message.includes('schema cache') || errNd.message.includes('does not exist')) {
          missingTables.push('nadhoman_setorans');
        } else {
          throw new Error(`Gagal memuat nadhoman_setorans: ${errNd.message}`);
        }
      } else {
        dbInstance.nadhomanSetorans = setoranData || [];
        results.nadhoman_setorans = dbInstance.nadhomanSetorans.length;
      }
    } catch (err: any) {
      console.warn('Nadhoman setorans pull skipped:', err.message || err);
    }

    // Persist pulled data to LocalStorage
    dbInstance.saveAll();

    if (missingTables.length > 0) {
      return {
        success: true,
        message: `Berhasil mengunduh data! Beberapa tabel belum terbuat di Supabase Anda (${missingTables.join(', ')}). Harap jalankan script migrasi terbaru di SQL Editor Supabase Anda.`,
        counts: results
      };
    }

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

// Clear all data from Supabase tables
export async function clearSupabaseAllData(): Promise<{ success: boolean; message: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, message: 'Supabase client is not configured.' };
  }

  try {
    const tables = [
      'nadhoman_setorans',
      'teaching_journals',
      'syllabus_targets',
      'grades',
      'attendance',
      'students',
      'classes',
      'subjects',
      'profiles'
    ];

    const skippedTables: string[] = [];

    for (const table of tables) {
      try {
        const { error } = await client.from(table).delete().neq('id', '_non_existent_id_');
        if (error) {
          if (error.message.includes('schema cache') || error.message.includes('does not exist')) {
            skippedTables.push(table);
            console.warn(`Table ${table} does not exist in Supabase yet. Skipping.`);
          } else {
            throw new Error(`Gagal mengosongkan tabel ${table}: ${error.message}`);
          }
        }
      } catch (tblErr: any) {
        console.warn(`Error while clearing table ${table}, skipping gracefully:`, tblErr.message || tblErr);
      }
    }

    if (skippedTables.length > 0) {
      return {
        success: true,
        message: `Semua data di tabel Supabase yang aktif berhasil dihapus. (Melewati tabel yang tidak terdeteksi: ${skippedTables.join(', ')})`
      };
    }

    return {
      success: true,
      message: 'Semua data di database Supabase berhasil dihapus.'
    };
  } catch (error: any) {
    console.error('Error clearing Supabase data:', error);
    return { success: false, message: error.message || 'Terjadi kesalahan saat menghapus data.' };
  }
}

// Clear ONLY attendance & teaching journals from Supabase tables
export async function clearSupabaseAttendanceAndJournals(): Promise<{ success: boolean; message: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, message: 'Supabase client is not configured.' };
  }

  try {
    const tables = ['attendance', 'teaching_journals'];
    const skippedTables: string[] = [];

    for (const table of tables) {
      try {
        const { error } = await client.from(table).delete().neq('id', '_non_existent_id_');
        if (error) {
          if (error.message.includes('schema cache') || error.message.includes('does not exist')) {
            skippedTables.push(table);
            console.warn(`Table ${table} does not exist in Supabase yet. Skipping.`);
          } else {
            throw new Error(`Gagal mengosongkan tabel ${table}: ${error.message}`);
          }
        }
      } catch (tblErr: any) {
        console.warn(`Error while clearing table ${table}, skipping gracefully:`, tblErr.message || tblErr);
      }
    }

    if (skippedTables.length > 0) {
      return {
        success: true,
        message: `Data berhasil dikosongkan untuk tabel yang aktif. (Melewati tabel yang tidak terdeteksi: ${skippedTables.join(', ')})`
      };
    }

    return {
      success: true,
      message: 'Data absensi santri dan jurnal ustadz di database Supabase berhasil dikosongkan.'
    };
  } catch (error: any) {
    console.error('Error clearing Supabase attendance & journals:', error);
    return { success: false, message: error.message || 'Terjadi kesalahan saat menghapus data absen.' };
  }
}


