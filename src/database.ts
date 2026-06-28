// Database Simpas with LocalStorage persistence and authentic data structure

export interface Profile {
  id: string;
  nama: string;
  email: string;
  hp: string;
  role: 'Ustadz' | 'Admin';
  profile_picture_url: string;
  password?: string;
  username?: string;
  telpon?: string;
}

export interface Subject {
  id: string;
  kode: string;
  nama: string;
}

export interface ClassRoom {
  id: string;
  nama: string;
  tingkat?: string;
  tahun_ajaran: string;
  wali_kelas_id?: string;
}

export interface Student {
  id: string;
  nis: string;
  nama: string;
  gender: 'Laki-laki' | 'Perempuan';
  tempat_lahir: string;
  tanggal_lahir: string;
  alamat: string;
  hp_ortu: string;
  kelas_id: string; // Relasi ke ClassRoom
}

export interface Grade {
  id: string;
  student_id: string;
  subject_id: string;
  kelas_id: string;
  tamrin_score: number;
  semester_score: number;
  final_score: number;
  predikat: 'A' | 'B' | 'C' | 'D' | 'E';
  created_by: string; // Ustadz ID
  date_input: string;
}

export interface Attendance {
  id: string;
  date: string;
  role: 'Ustadz' | 'Santri';
  person_id: string; // profile_id for ustadz, student_id for santri
  person_name: string;
  status: 'Hadir' | 'Izin' | 'Sakit' | 'Alfa';
  notes?: string;
  kelas_id?: string; // only for Santri
}

export interface SyllabusTarget {
  id: string;
  subject_id: string;
  class_id: string;
  target_materi: string; // Target determined by Admin
  ustadz_id: string; // Assigned ustadz
}

export interface TeachingJournal {
  id: string;
  date: string;
  ustadz_id: string;
  subject_id: string;
  class_id: string;
  materi_diajarkan: string;
  kehadiran_summary: string; // e.g. "20/22 Santri Hadir"
  notes?: string;
}

export interface NadhomanSetoran {
  id: string;
  student_id: string;
  kelas_id: string;
  bait_awal: number;
  bait_akhir: number;
  date: string;
  ustadz_id: string;
  notes?: string;
}

// Initial default seed data
const initialProfiles: Profile[] = [
  {
    id: 'prof-1',
    nama: 'Ustadz Ahmad Fauzi, S.Pd.I',
    email: 'ustadz@simpas.com',
    hp: '081234567890',
    role: 'Ustadz',
    profile_picture_url: '',
    password: 'password'
  },
  {
    id: 'prof-2',
    nama: 'Admin KH. Muhammad Shodiq',
    email: 'admin@simpas.com',
    hp: '089876543210',
    role: 'Admin',
    profile_picture_url: '',
    password: 'password'
  }
];

const initialSubjects: Subject[] = [];

const initialClasses: ClassRoom[] = [
  { id: 'cls-1', nama: 'Kelas 1-A', tahun_ajaran: '2025/2026', wali_kelas_id: 'prof-1' },
  { id: 'cls-2', nama: 'Kelas 2-A', tahun_ajaran: '2025/2026', wali_kelas_id: 'prof-1' },
  { id: 'cls-3', nama: 'Kelas 3-B', tahun_ajaran: '2025/2026', wali_kelas_id: 'prof-2' }
];

const initialStudents: Student[] = [];

const initialSyllabusTargets: SyllabusTarget[] = [];

const initialTeachingJournals: TeachingJournal[] = [];

const initialNadhomanSetorans: NadhomanSetoran[] = [];

const initialGrades: Grade[] = [];

const initialAttendance: Attendance[] = [];

// Helper functions to retrieve/store to LocalStorage
export function loadFromLocalStorage<T>(key: string, initial: T): T {
  const data = localStorage.getItem(`simpas_${key}`);
  if (data) {
    try {
      return JSON.parse(data) as T;
    } catch (e) {
      console.error(`Error parsing ${key} from localStorage`, e);
    }
  }
  // Store initial to localStorage
  localStorage.setItem(`simpas_${key}`, JSON.stringify(initial));
  return initial;
}

export function saveToLocalStorage<T>(key: string, data: T): void {
  localStorage.setItem(`simpas_${key}`, JSON.stringify(data));
}

// Global active session
export interface AuthSession {
  currentUser: Profile | null;
  rememberMe: boolean;
}

// Database state container
export class SimpasDatabase {
  profiles: Profile[];
  subjects: Subject[];
  classes: ClassRoom[];
  students: Student[];
  grades: Grade[];
  attendance: Attendance[];
  syllabusTargets: SyllabusTarget[];
  teachingJournals: TeachingJournal[];
  nadhomanSetorans: NadhomanSetoran[];
  session: AuthSession;

  constructor() {
    // One-time clear of requested items to start fresh
    const resetFlag = localStorage.getItem('simpas_clear_seeds_v3');
    if (!resetFlag) {
      localStorage.removeItem('simpas_students');
      localStorage.removeItem('simpas_subjects');
      localStorage.removeItem('simpas_grades');
      localStorage.removeItem('simpas_attendance');
      localStorage.removeItem('simpas_syllabus_targets');
      localStorage.removeItem('simpas_teaching_journals');
      localStorage.removeItem('simpas_nadhoman_setorans');
      localStorage.setItem('simpas_clear_seeds_v3', 'true');
    }

    this.profiles = loadFromLocalStorage<Profile[]>('profiles', initialProfiles);
    
    // Ensure default profiles have usernames if they don't already
    let updatedProfiles = false;
    this.profiles.forEach(p => {
      if (!p.username) {
        if (p.id === 'prof-1') {
          p.username = 'ahmadfauzi';
          updatedProfiles = true;
        } else if (p.id === 'prof-2') {
          p.username = 'admin';
          updatedProfiles = true;
        } else {
          p.username = p.nama.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 12);
          updatedProfiles = true;
        }
      }
    });

    this.subjects = loadFromLocalStorage<Subject[]>('subjects', initialSubjects);
    this.classes = loadFromLocalStorage<ClassRoom[]>('classes', initialClasses);
    this.students = loadFromLocalStorage<Student[]>('students', initialStudents);
    this.grades = loadFromLocalStorage<Grade[]>('grades', initialGrades);
    this.attendance = loadFromLocalStorage<Attendance[]>('attendance', initialAttendance);
    this.syllabusTargets = loadFromLocalStorage<SyllabusTarget[]>('syllabus_targets', initialSyllabusTargets);
    this.teachingJournals = loadFromLocalStorage<TeachingJournal[]>('teaching_journals', initialTeachingJournals);
    this.nadhomanSetorans = loadFromLocalStorage<NadhomanSetoran[]>('nadhoman_setorans', initialNadhomanSetorans);
    
    // Auth Session setup
    this.session = loadFromLocalStorage<AuthSession>('session', { currentUser: null, rememberMe: false });

    if (updatedProfiles) {
      this.saveAll();
    }
  }

  saveAll() {
    saveToLocalStorage('profiles', this.profiles);
    saveToLocalStorage('subjects', this.subjects);
    saveToLocalStorage('classes', this.classes);
    saveToLocalStorage('students', this.students);
    saveToLocalStorage('grades', this.grades);
    saveToLocalStorage('attendance', this.attendance);
    saveToLocalStorage('syllabus_targets', this.syllabusTargets);
    saveToLocalStorage('teaching_journals', this.teachingJournals);
    saveToLocalStorage('nadhoman_setorans', this.nadhomanSetorans);
    saveToLocalStorage('session', this.session);

    // Background auto-sync if enabled (uses dynamic import to prevent circular dependency)
    if (localStorage.getItem('simpas_supabase_autosync') === 'true') {
      import('./supabase').then(({ getSupabaseClient }) => {
        const client = getSupabaseClient();
        if (client) {
          // Execute background saves in an async block to avoid promise typing issues
          (async () => {
            try {
              await client.from('profiles').upsert(this.profiles);
              await client.from('subjects').upsert(this.subjects);
              
              const formattedClasses = this.classes.map((c: any) => ({
                id: c.id,
                nama: c.nama,
                tahun_ajaran: c.tahun_ajaran,
                wali_kelas_id: c.wali_kelas_id || null
              }));
              await client.from('classes').upsert(formattedClasses);
              await client.from('students').upsert(this.students);
              await client.from('grades').upsert(this.grades);
              await client.from('attendance').upsert(this.attendance);
              
              const formattedTargets = this.syllabusTargets.map((t: any) => ({
                id: t.id,
                subject_id: t.subject_id,
                class_id: t.class_id,
                target_materi: t.target_materi,
                ustadz_id: t.ustadz_id
              }));
              await client.from('syllabus_targets').upsert(formattedTargets);
              
              const formattedJournals = this.teachingJournals.map((j: any) => ({
                id: j.id,
                date: j.date,
                ustadz_id: j.ustadz_id,
                subject_id: j.subject_id,
                class_id: j.class_id,
                materi_diajarkan: j.materi_diajarkan,
                kehadiran_summary: j.kehadiran_summary,
                notes: j.notes
              }));
              await client.from('teaching_journals').upsert(formattedJournals);
              await client.from('nadhoman_setorans').upsert(this.nadhomanSetorans);
            } catch (err) {
              console.warn('Supabase background auto-sync failed:', err);
            }
          })();
        }
      }).catch(err => console.error('Failed to dynamic import supabase:', err));
    }
  }

  // Auth operations
  login(nama: string, role: 'Ustadz' | 'Admin', password?: string, remember: boolean = false): Profile | null {
    const inputClean = nama.trim().toLowerCase();
    const user = this.profiles.find(p => 
      p.role === role && 
      (p.nama.toLowerCase() === inputClean || (p.username && p.username.toLowerCase() === inputClean))
    );
    if (user) {
      if (role === 'Admin') {
        // Admin must enter the correct password
        if (password && user.password === password) {
          this.session.currentUser = user;
          this.session.rememberMe = remember;
          this.saveAll();
          return user;
        }
        return null;
      } else {
        // Ustadz can login instantly with just full name or username
        this.session.currentUser = user;
        this.session.rememberMe = remember;
        this.saveAll();
        return user;
      }
    }
    return null;
  }

  logout() {
    this.session.currentUser = null;
    this.session.rememberMe = false;
    this.saveAll();
  }

  updateProfile(id: string, updated: Partial<Profile>) {
    const idx = this.profiles.findIndex(p => p.id === id);
    if (idx !== -1) {
      this.profiles[idx] = { ...this.profiles[idx], ...updated };
      if (this.session.currentUser && this.session.currentUser.id === id) {
        this.session.currentUser = this.profiles[idx];
      }
      this.saveAll();
      return this.profiles[idx];
    }
    return null;
  }

  // CRUD Profiles / Ustadz
  addProfile(profile: Omit<Profile, 'id'>) {
    const usernameVal = profile.username || profile.nama.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 12);
    const newProfile = { 
      ...profile, 
      id: 'prof-' + Date.now(),
      username: usernameVal
    };
    this.profiles.push(newProfile);
    this.saveAll();
    return newProfile;
  }

  editProfile(id: string, updated: Omit<Profile, 'id'>) {
    const idx = this.profiles.findIndex(p => p.id === id);
    if (idx !== -1) {
      const usernameVal = updated.username || updated.nama.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 12);
      this.profiles[idx] = { 
        ...this.profiles[idx], 
        ...updated,
        username: usernameVal
      };
      if (this.session.currentUser && this.session.currentUser.id === id) {
        this.session.currentUser = this.profiles[idx];
      }
      this.saveAll();
      return this.profiles[idx];
    }
    return null;
  }

  deleteProfile(id: string) {
    this.profiles = this.profiles.filter(p => p.id !== id);
    // Clean up associations
    this.classes.forEach(c => {
      if (c.wali_kelas_id === id) {
        c.wali_kelas_id = undefined;
      }
    });
    this.syllabusTargets = this.syllabusTargets.filter(t => t.ustadz_id !== id);
    this.teachingJournals = this.teachingJournals.filter(j => j.ustadz_id !== id);
    this.nadhomanSetorans = this.nadhomanSetorans.filter(n => n.ustadz_id !== id);
    this.attendance = this.attendance.filter(a => !(a.person_id === id && a.role === 'Ustadz'));
    this.saveAll();
  }

  // CRUD Subjects
  addSubject(sub: Omit<Subject, 'id'>) {
    const newSub = { ...sub, id: 'sub-' + Date.now() };
    this.subjects.push(newSub);
    this.saveAll();
    return newSub;
  }

  editSubject(id: string, updated: Omit<Subject, 'id'>) {
    const idx = this.subjects.findIndex(s => s.id === id);
    if (idx !== -1) {
      this.subjects[idx] = { ...this.subjects[idx], ...updated };
      this.saveAll();
      return this.subjects[idx];
    }
    return null;
  }

  deleteSubject(id: string) {
    this.subjects = this.subjects.filter(s => s.id !== id);
    // Cascade delete targets, grades, journals
    this.syllabusTargets = this.syllabusTargets.filter(t => t.subject_id !== id);
    this.grades = this.grades.filter(g => g.subject_id !== id);
    this.teachingJournals = this.teachingJournals.filter(j => j.subject_id !== id);
    this.saveAll();
  }

  // CRUD Classes
  addClass(cls: Omit<ClassRoom, 'id'>) {
    const newCls = { ...cls, id: 'cls-' + Date.now() };
    this.classes.push(newCls);
    this.saveAll();
    return newCls;
  }

  editClass(id: string, updated: Omit<ClassRoom, 'id'>) {
    const idx = this.classes.findIndex(c => c.id === id);
    if (idx !== -1) {
      this.classes[idx] = { ...this.classes[idx], ...updated };
      this.saveAll();
      return this.classes[idx];
    }
    return null;
  }

  deleteClass(id: string) {
    this.classes = this.classes.filter(c => c.id !== id);
    // Cascade delete students, grades, journals, nadhoman
    this.students = this.students.filter(s => s.kelas_id !== id);
    this.grades = this.grades.filter(g => g.kelas_id !== id);
    this.teachingJournals = this.teachingJournals.filter(j => j.class_id !== id);
    this.syllabusTargets = this.syllabusTargets.filter(t => t.class_id !== id);
    this.nadhomanSetorans = this.nadhomanSetorans.filter(n => n.kelas_id !== id);
    this.saveAll();
  }

  // CRUD Students
  addStudent(std: Omit<Student, 'id'>) {
    const newStd = { ...std, id: 'std-' + Date.now() };
    this.students.push(newStd);
    this.saveAll();
    return newStd;
  }

  editStudent(id: string, updated: Omit<Student, 'id'>) {
    const idx = this.students.findIndex(s => s.id === id);
    if (idx !== -1) {
      this.students[idx] = { ...this.students[idx], ...updated };
      this.saveAll();
      return this.students[idx];
    }
    return null;
  }

  deleteStudent(id: string) {
    this.students = this.students.filter(s => s.id !== id);
    // Cascade delete grades, attendance, nadhoman
    this.grades = this.grades.filter(g => g.student_id !== id);
    this.attendance = this.attendance.filter(a => a.person_id !== id && a.role === 'Santri');
    this.nadhomanSetorans = this.nadhomanSetorans.filter(n => n.student_id !== id);
    this.saveAll();
  }

  deleteStudents(ids: string[]) {
    this.students = this.students.filter(s => !ids.includes(s.id));
    // Cascade delete grades, attendance, nadhoman
    this.grades = this.grades.filter(g => !ids.includes(g.student_id));
    this.attendance = this.attendance.filter(a => !(ids.includes(a.person_id) && a.role === 'Santri'));
    this.nadhomanSetorans = this.nadhomanSetorans.filter(n => !ids.includes(n.student_id));
    this.saveAll();
  }

  // CRUD Grades
  saveGrade(grade: Omit<Grade, 'id' | 'final_score' | 'predikat'>) {
    const final_score = Math.round((grade.tamrin_score * 0.4) + (grade.semester_score * 0.6));
    let predikat: 'A' | 'B' | 'C' | 'D' | 'E' = 'E';
    if (final_score >= 85) predikat = 'A';
    else if (final_score >= 75) predikat = 'B';
    else if (final_score >= 65) predikat = 'C';
    else if (final_score >= 50) predikat = 'D';

    const existingIdx = this.grades.findIndex(g => g.student_id === grade.student_id && g.subject_id === grade.subject_id && g.kelas_id === grade.kelas_id);
    if (existingIdx !== -1) {
      this.grades[existingIdx] = {
        ...this.grades[existingIdx],
        ...grade,
        final_score,
        predikat
      };
      this.saveAll();
      return this.grades[existingIdx];
    } else {
      const newGrade: Grade = {
        ...grade,
        id: 'grd-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
        final_score,
        predikat
      };
      this.grades.push(newGrade);
      this.saveAll();
      return newGrade;
    }
  }

  // Syllabus / Target Materi
  saveSyllabusTarget(target: Omit<SyllabusTarget, 'id'>) {
    const existingIdx = this.syllabusTargets.findIndex(t => t.subject_id === target.subject_id && t.class_id === target.class_id);
    if (existingIdx !== -1) {
      this.syllabusTargets[existingIdx] = {
        ...this.syllabusTargets[existingIdx],
        ...target
      };
      this.saveAll();
      return this.syllabusTargets[existingIdx];
    } else {
      const newTarget: SyllabusTarget = {
        ...target,
        id: 'syl-' + Date.now()
      };
      this.syllabusTargets.push(newTarget);
      this.saveAll();
      return newTarget;
    }
  }

  // Teaching Journal
  addTeachingJournal(journal: Omit<TeachingJournal, 'id'>) {
    const newJournal = {
      ...journal,
      id: 'jr-' + Date.now()
    };
    this.teachingJournals.push(newJournal);
    this.saveAll();
    return newJournal;
  }

  // Attendance CRUD
  saveAttendanceBatch(batch: Omit<Attendance, 'id'>[]) {
    batch.forEach(record => {
      // Find existing record for same day and person
      const existingIdx = this.attendance.findIndex(a => 
        a.date === record.date && 
        a.person_id === record.person_id && 
        a.role === record.role
      );

      if (existingIdx !== -1) {
        this.attendance[existingIdx] = {
          ...this.attendance[existingIdx],
          ...record
        };
      } else {
        this.attendance.push({
          ...record,
          id: 'att-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4)
        });
      }
    });
    this.saveAll();
  }

  // Nadhoman Setoran CRUD
  addNadhomanSetoran(setoran: Omit<NadhomanSetoran, 'id'>) {
    const newSetoran = {
      ...setoran,
      id: 'nd-' + Date.now()
    };
    this.nadhomanSetorans.push(newSetoran);
    this.saveAll();
    return newSetoran;
  }
}

export const db = new SimpasDatabase();
