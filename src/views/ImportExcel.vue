<template>
  <div class="container-fluid py-4">
    <div class="row mb-4">
      <div class="col-12">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb mb-1">
            <li class="breadcrumb-item"><router-link to="/">Beranda</router-link></li>
            <li class="breadcrumb-item active" aria-current="page">Impor Excel / CSV</li>
          </ol>
        </nav>
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <h4 class="mb-1 text-heading">Pusat Impor Data Massal</h4>
            <p class="text-muted mb-0">Unggah berkas Excel (.xlsx/.xls) atau CSV untuk memasukkan data santri, ustadz, atau kitab sekaligus.</p>
          </div>
          <router-link to="/" class="btn btn-outline-secondary d-flex align-items-center gap-1">
            <ArrowLeftIcon :size="16" /> Kembali ke Dasbor
          </router-link>
        </div>
      </div>
    </div>

    <!-- Main Navigation Tabs -->
    <div class="row">
      <div class="col-12 col-xl-3 mb-4">
        <div class="card border-0 shadow-sm p-3">
          <div class="nav flex-column nav-pills" id="import-pills-tab" role="tablist">
            <button 
              class="nav-link text-start py-3 px-4 d-flex align-items-center gap-3 mb-2"
              :class="{ 'active bg-primary text-white': activeTab === 'siswa' }"
              @click="setTab('siswa')"
            >
              <UsersIcon :size="20" />
              <div>
                <div class="fw-bold text-xs-heading">Data Santri (Siswa)</div>
                <div class="text-xs text-muted" :class="{ 'text-white-50': activeTab === 'siswa' }">Masukkan daftar siswa baru</div>
              </div>
            </button>

            <button 
              class="nav-link text-start py-3 px-4 d-flex align-items-center gap-3 mb-2"
              :class="{ 'active bg-success text-white': activeTab === 'ustadz' }"
              @click="setTab('ustadz')"
            >
              <GraduationCapIcon :size="20" />
              <div>
                <div class="fw-bold text-xs-heading">Data Ustadz (Guru)</div>
                <div class="text-xs text-muted" :class="{ 'text-white-50': activeTab === 'ustadz' }">Daftarkan akun-akun pengajar</div>
              </div>
            </button>

            <button 
              class="nav-link text-start py-3 px-4 d-flex align-items-center gap-3 mb-2"
              :class="{ 'active bg-warning text-white': activeTab === 'kelas' }"
              @click="setTab('kelas')"
            >
              <SchoolIcon :size="20" />
              <div>
                <div class="fw-bold text-xs-heading">Data Kelas</div>
                <div class="text-xs text-muted" :class="{ 'text-white-50': activeTab === 'kelas' }">Tambah data kelompok kelas belajar</div>
              </div>
            </button>

            <button 
              class="nav-link text-start py-3 px-4 d-flex align-items-center gap-3"
              :class="{ 'active bg-info text-white': activeTab === 'kitab' }"
              @click="setTab('kitab')"
            >
              <BookOpenIcon :size="20" />
              <div>
                <div class="fw-bold text-xs-heading">Data Kitab / Pelajaran</div>
                <div class="text-xs text-muted" :class="{ 'text-white-50': activeTab === 'kitab' }">Tambah kurikulum kitab rujukan</div>
              </div>
            </button>
          </div>

          <!-- Template Downloads Section -->
          <div class="mt-4 pt-3 border-top">
            <h6 class="fw-bold text-heading mb-2 text-xs">Unduh Templat Excel</h6>
            <p class="text-muted text-xs mb-3">Gunakan struktur kolom templat ini agar sistem dapat mengimpor data secara sempurna.</p>
            <div class="d-flex flex-column gap-2">
              <button @click="downloadTemplate('siswa')" class="btn btn-xs btn-outline-primary text-start d-flex align-items-center justify-content-between">
                <span>Template Santri.xlsx</span>
                <DownloadIcon :size="14" />
              </button>
              <button @click="downloadTemplate('ustadz')" class="btn btn-xs btn-outline-success text-start d-flex align-items-center justify-content-between">
                <span>Template Ustadz.xlsx</span>
                <DownloadIcon :size="14" />
              </button>
              <button @click="downloadTemplate('kelas')" class="btn btn-xs btn-outline-warning text-start d-flex align-items-center justify-content-between">
                <span>Template Kelas.xlsx</span>
                <DownloadIcon :size="14" />
              </button>
              <button @click="downloadTemplate('kitab')" class="btn btn-xs btn-outline-info text-start d-flex align-items-center justify-content-between">
                <span>Template Kitab.xlsx</span>
                <DownloadIcon :size="14" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Upload and Preview Stage -->
      <div class="col-12 col-xl-9">
        <div class="card border-0 shadow-sm p-4 mb-4">
          <!-- Step 1: Upload File -->
          <div class="d-flex align-items-center justify-content-between mb-3">
            <h5 class="fw-bold text-heading mb-0">Unggah Berkas Data {{ tabTitle }}</h5>
            <span class="badge" :class="tabBadgeClass">{{ tabTitle }} Mode</span>
          </div>

          <!-- Drag and Drop Zone -->
          <div 
            class="upload-zone p-5 text-center border border-2 border-dashed rounded-3 cursor-pointer position-relative transition-all"
            :class="{ 'border-primary bg-primary-subtle': dragActive, 'bg-light': !dragActive }"
            @dragenter.prevent="dragActive = true"
            @dragover.prevent="dragActive = true"
            @dragleave.prevent="dragActive = false"
            @drop.prevent="handleFileDrop"
            @click="triggerFileInput"
          >
            <input 
              type="file" 
              ref="fileInput" 
              class="d-none" 
              accept=".xlsx,.xls,.csv" 
              @change="handleFileChange" 
            />
            <div class="py-3">
              <UploadCloudIcon class="text-primary mb-3 animated-bounce" :size="48" />
              <h6 class="fw-bold mb-1 text-heading">Klik untuk pilih berkas atau seret berkas ke sini</h6>
              <p class="text-muted text-xs mb-3">Mendukung format Microsoft Excel (.xlsx, .xls) atau teks berkoma (.csv)</p>
              <div class="d-flex justify-content-center gap-2">
                <span class="badge bg-secondary text-white text-xxs">Maks. 5 MB</span>
                <span class="badge bg-info text-white text-xxs">Header Baris ke-1</span>
              </div>
            </div>
          </div>

          <!-- Extra options for Siswa tab -->
          <div v-if="activeTab === 'siswa' && parsedRows.length === 0" class="row mt-4 pt-3 border-top g-3">
            <div class="col-md-6">
              <label class="form-label small fw-semibold">Kelas Tujuan (Jika kolom "Kelas" kosong / tidak ada)</label>
              <select v-model="defaultClassId" class="form-select">
                <option value="">-- Pilih Kelas Default --</option>
                <option v-for="cls in classes" :key="cls.id" :value="cls.id">
                  {{ cls.nama }}
                </option>
              </select>
            </div>
            <div class="col-md-6">
              <label class="form-label small fw-semibold">Jenis Kelamin Default (Jika kolom "Gender" kosong)</label>
              <select v-model="defaultGender" class="form-select">
                <option value="Laki-laki">Laki-laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
            </div>
          </div>

          <!-- Loading State -->
          <div v-if="loading" class="text-center py-5">
            <div class="spinner-border text-primary mb-3" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
            <h6 class="fw-bold text-heading">Membaca dan memproses berkas...</h6>
            <p class="text-muted text-xs">Menyusun struktur kolom dan memeriksa kesesuaian data.</p>
          </div>

          <!-- Step 2: Parsed Table Preview -->
          <div v-if="parsedRows.length > 0 && !loading" class="mt-4 pt-4 border-top">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h6 class="fw-bold text-heading mb-1">
                  Pratinjau Data Terbaca ({{ parsedRows.length }} Baris)
                </h6>
                <p class="text-muted text-xs mb-0">Silakan periksa kembali daftar data di bawah ini sebelum disimpan secara permanen.</p>
              </div>
              <div class="d-flex gap-2">
                <button @click="clearParsed" class="btn btn-outline-danger btn-sm d-flex align-items-center gap-1">
                  <XIcon :size="14" /> Batal
                </button>
                <button @click="saveImport" class="btn btn-primary btn-sm d-flex align-items-center gap-1">
                  <CheckIcon :size="14" /> Simpan {{ parsedRows.length }} Data ke Database
                </button>
              </div>
            </div>

            <!-- Preview Table -->
            <div class="table-responsive border rounded max-vh-50 overflow-auto">
              <table class="table table-hover table-striped align-middle mb-0 text-xs">
                <thead class="bg-light sticky-top">
                  <tr>
                    <th style="width: 50px;" class="text-center">#</th>
                    <th v-for="col in previewColumns" :key="col.key">{{ col.label }}</th>
                    <th style="width: 80px;" class="text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, idx) in parsedRows" :key="idx">
                    <td class="text-center fw-semibold text-muted">{{ idx + 1 }}</td>
                    
                    <!-- DYNAMIC FIELDS ACCORDING TO TAB -->
                    <template v-if="activeTab === 'siswa'">
                      <td>
                        <input v-model="row.nis" type="text" class="form-control form-control-sm text-xs py-0" />
                      </td>
                      <td>
                        <input v-model="row.nama" type="text" class="form-control form-control-sm text-xs py-0" />
                      </td>
                      <td>
                        <select v-model="row.gender" class="form-select form-select-sm text-xs py-0">
                          <option value="Laki-laki">Laki-laki</option>
                          <option value="Perempuan">Perempuan</option>
                        </select>
                      </td>
                      <td>
                        <select v-model="row.kelas_id" class="form-select form-select-sm text-xs py-0">
                          <option value="">-- Tanpa Kelas --</option>
                          <option v-for="cls in classes" :key="cls.id" :value="cls.id">
                            {{ cls.nama }}
                          </option>
                        </select>
                      </td>
                    </template>

                    <template v-if="activeTab === 'ustadz'">
                      <td>
                        <input v-model="row.nama" type="text" class="form-control form-control-sm text-xs py-0" required />
                      </td>
                      <td>
                        <input v-model="row.username" type="text" class="form-control form-control-sm text-xs py-0" placeholder="Username login" />
                      </td>
                    </template>

                    <template v-if="activeTab === 'kelas'">
                      <td>
                        <input v-model="row.nama" type="text" class="form-control form-control-sm text-xs py-0" required />
                      </td>
                      <td>
                        <input v-model="row.tahun_ajaran" type="text" class="form-control form-control-sm text-xs py-0" required />
                      </td>
                      <td>
                        <select v-model="row.wali_kelas_id" class="form-select form-select-sm text-xs py-0">
                          <option value="">-- Tanpa Wali Kelas --</option>
                          <option v-for="prof in db.profiles.filter(p => p.role === 'Ustadz')" :key="prof.id" :value="prof.id">
                            {{ prof.nama }}
                          </option>
                        </select>
                      </td>
                    </template>

                    <template v-if="activeTab === 'kitab'">
                      <td>
                        <input v-model="row.kode" type="text" class="form-control form-control-sm text-xs py-0" required />
                      </td>
                      <td>
                        <input v-model="row.nama" type="text" class="form-control form-control-sm text-xs py-0" required />
                      </td>
                    </template>

                    <!-- Validation Badge -->
                    <td class="text-center">
                      <span v-if="isValidRow(row)" class="badge bg-light-success text-success text-xxs">Valid</span>
                      <span v-else class="badge bg-light-danger text-danger text-xxs" v-b-tooltip.hover :title="getRowErrorMsg(row)">Error</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Quick Import Summary -->
            <div class="d-flex flex-wrap justify-content-between align-items-center mt-3 p-3 bg-light rounded border border-dashed">
              <div class="text-muted text-xs">
                <span>Rangkuman: </span>
                <span class="fw-bold text-heading text-dark">{{ parsedRows.length }} Baris Terdeteksi</span> | 
                <span class="text-success fw-semibold">{{ validRowCount }} Siap Diimpor</span> | 
                <span class="text-danger fw-semibold">{{ invalidRowCount }} Bermasalah</span>
              </div>
              <div class="d-flex gap-2">
                <button @click="clearParsed" class="btn btn-outline-secondary btn-xs">Bersihkan</button>
                <button @click="saveImport" class="btn btn-primary btn-xs" :disabled="validRowCount === 0">Mulai Proses Impor</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Helpful Documentation Card -->
        <div class="card border-0 shadow-sm p-4 bg-gradient text-heading" style="background: linear-gradient(135deg, rgba(15, 166, 98, 0.04) 0%, rgba(13, 148, 136, 0.04) 100%)">
          <h6 class="fw-bold mb-3 d-flex align-items-center gap-2">
            <BookOpenIcon class="text-primary" :size="18" />
            Petunjuk Format Pengisian Berkas (Excel & CSV)
          </h6>
          <div class="row g-3 text-muted text-xs">
            <div class="col-md-3 border-end-md">
              <span class="badge bg-label-primary mb-2">Impor Santri</span>
              <ul class="ps-3 mb-0">
                <li class="mb-1"><strong class="text-dark">Nomor Urut Santri (No.)</strong>: Urutan santri (misal: 1, 2, 3).</li>
                <li class="mb-1"><strong class="text-dark">Nama</strong>: Nama lengkap santri.</li>
                <li class="mb-1"><strong class="text-dark">Gender</strong>: Laki-laki atau Perempuan.</li>
                <li class="mb-1"><strong class="text-dark">Kelas</strong>: Dapat diisi nama kelas (misal: "Kelas 1-A") atau ID kelas.</li>
              </ul>
            </div>
            <div class="col-md-3 border-end-md">
              <span class="badge bg-label-success mb-2">Impor Ustadz</span>
              <ul class="ps-3 mb-0">
                <li class="mb-1"><strong class="text-dark">Nama</strong>: Nama guru (contoh: Ustadz Zain).</li>
                <li class="mb-1"><strong class="text-dark">Username</strong>: Unik untuk login akun ustadz.</li>
              </ul>
            </div>
            <div class="col-md-3 border-end-md">
              <span class="badge bg-label-warning mb-2">Impor Kelas</span>
              <ul class="ps-3 mb-0">
                <li class="mb-1"><strong class="text-dark">Nama Kelas</strong>: Nama rombel kelas (misal: "Kelas 1-A").</li>
                <li class="mb-1"><strong class="text-dark">Tahun Ajaran</strong>: Tahun akademik (misal: "2025/2026").</li>
                <li class="mb-1"><strong class="text-dark">Wali Kelas</strong>: Nama lengkap ustadz pembimbing.</li>
              </ul>
            </div>
            <div class="col-md-3">
              <span class="badge bg-label-info mb-2">Impor Kitab / Mapel</span>
              <ul class="ps-3 mb-0">
                <li class="mb-1"><strong class="text-dark">Kode</strong>: Unik (misal: "KIT-101", "KIT-102").</li>
                <li class="mb-1"><strong class="text-dark">Nama Kitab</strong>: Judul kitab rujukan lengkap (misal: Al-Jurumiyah).</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { db, Student, Profile, Subject } from '../database';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import { 
  ArrowLeft as ArrowLeftIcon, 
  Users as UsersIcon, 
  GraduationCap as GraduationCapIcon, 
  School as SchoolIcon,
  BookOpen as BookOpenIcon, 
  Download as DownloadIcon, 
  UploadCloud as UploadCloudIcon, 
  X as XIcon, 
  Check as CheckIcon 
} from 'lucide-vue-next';

// Tab controller state
const activeTab = ref<'siswa' | 'ustadz' | 'kitab' | 'kelas'>('siswa');
const dragActive = ref(false);
const loading = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);

// Form default values
const defaultClassId = ref('');
const defaultGender = ref<'Laki-laki' | 'Perempuan'>('Laki-laki');

// Class references for lookups
const classes = computed(() => db.classes);

// Dynamic titles and classes
const tabTitle = computed(() => {
  if (activeTab.value === 'siswa') return 'Santri (Siswa)';
  if (activeTab.value === 'ustadz') return 'Ustadz (Guru)';
  if (activeTab.value === 'kelas') return 'Data Kelas';
  return 'Kitab / Mata Pelajaran';
});

const tabBadgeClass = computed(() => {
  if (activeTab.value === 'siswa') return 'bg-label-primary text-primary';
  if (activeTab.value === 'ustadz') return 'bg-label-success text-success';
  if (activeTab.value === 'kelas') return 'bg-label-warning text-warning';
  return 'bg-label-info text-info';
});

const previewColumns = computed(() => {
  if (activeTab.value === 'siswa') {
    return [
      { key: 'nis', label: 'Nomor Urut Santri (No.) *' },
      { key: 'nama', label: 'Nama Lengkap *' },
      { key: 'gender', label: 'Gender' },
      { key: 'kelas_id', label: 'Kelas' }
    ];
  } else if (activeTab.value === 'ustadz') {
    return [
      { key: 'nama', label: 'Nama Lengkap *' },
      { key: 'username', label: 'Username Login *' }
    ];
  } else if (activeTab.value === 'kelas') {
    return [
      { key: 'nama', label: 'Nama Kelas *' },
      { key: 'tahun_ajaran', label: 'Tahun Ajaran *' },
      { key: 'wali_kelas_id', label: 'Wali Kelas' }
    ];
  } else {
    return [
      { key: 'kode', label: 'Kode Kitab *' },
      { key: 'nama', label: 'Nama Rujukan Kitab *' }
    ];
  }
});

// Parsed raw Excel data holder
const parsedRows = ref<any[]>([]);

const setTab = (tab: 'siswa' | 'ustadz' | 'kitab' | 'kelas') => {
  activeTab.value = tab;
  clearParsed();
};

const clearParsed = () => {
  parsedRows.value = [];
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};

const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleFileDrop = (e: DragEvent) => {
  dragActive.value = false;
  const files = e.dataTransfer?.files;
  if (files && files.length > 0) {
    processFile(files[0]);
  }
};

const handleFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const files = target.files;
  if (files && files.length > 0) {
    processFile(files[0]);
  }
};

// Intelligently parse excel/csv using SheetJS (XLSX)
const processFile = (file: File) => {
  loading.value = true;
  const reader = new FileReader();

  reader.onload = (e) => {
    try {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      
      // Parse to JSON rows
      const rawJson = XLSX.utils.sheet_to_json(worksheet) as any[];

      if (rawJson.length === 0) {
        throw new Error('Berkas Excel kosong atau tidak terdeteksi data baris.');
      }

      // Check if there is only 1 column key and it contains semicolons or other delimiters
      let parsedData = rawJson;
      if (rawJson.length > 0) {
        const keys = Object.keys(rawJson[0]);
        if (keys.length === 1 && (keys[0].includes(';') || keys[0].includes(','))) {
          const delimiter = keys[0].includes(';') ? ';' : ',';
          const headerFields = keys[0].split(delimiter);
          
          parsedData = rawJson.map((row: any) => {
            const rawVal = row[keys[0]];
            if (rawVal === undefined || rawVal === null) return {};
            const valFields = String(rawVal).split(delimiter);
            const newRow: any = {};
            for (let j = 0; j < headerFields.length; j++) {
              const h = headerFields[j].trim();
              const v = valFields[j] !== undefined ? valFields[j].trim() : '';
              newRow[h] = v;
            }
            return newRow;
          });
        }
      }

      // Convert rows to Simpas specific data models
      parsedRows.value = parsedData.map((row: any, idx: number) => {
        const normalized = normalizeKeys(row);
        
        // Dynamic fallback to index-based values if column names don't match perfectly
        const rowValues = Object.values(row).map(v => v !== undefined && v !== null ? String(v).trim() : '');
        
        if (activeTab.value === 'siswa') {
          let nis = normalized.nis ? String(normalized.nis).trim() : '';
          let nama = normalized.nama ? String(normalized.nama).trim() : '';
          let genderVal = normalized.gender || normalized.jenis_kelamin || normalized.jk || '';
          let kelasVal = normalized.kelas || '';

          // Fallback if nama or nis is empty but row has sequential values
          if (!nama && rowValues.length > 0) {
            if (rowValues.length >= 2) {
              // Guessing: if first column looks like a number/ID/short-string, treat as NIS and second as Nama
              if (/^\d+$/.test(rowValues[0]) || rowValues[0].length <= 5) {
                nis = nis || rowValues[0];
                nama = nama || rowValues[1];
                genderVal = genderVal || (rowValues[2] || '');
                kelasVal = kelasVal || (rowValues[3] || '');
              } else {
                nama = nama || rowValues[0];
                genderVal = genderVal || (rowValues[1] || '');
                kelasVal = kelasVal || (rowValues[2] || '');
              }
            } else {
              nama = nama || rowValues[0];
            }
          }

          // If NIS is still empty, auto-generate sequential number so the row doesn't error out
          if (!nis) {
            const currentCount = db.students.length + idx + 1;
            nis = String(1000 + currentCount);
          }

          // Find class reference from name inside Excel, or use default class
          let classId = defaultClassId.value;
          const targetKelas = kelasVal || normalized.kelas;
          if (targetKelas) {
            const classStr = String(targetKelas).toLowerCase().trim();
            const cleanStr = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
            const classStrClean = cleanStr(classStr);
            
            const foundCls = db.classes.find(c => {
              const dbNameClean = cleanStr(c.nama);
              const dbIdClean = cleanStr(c.id);
              return dbNameClean.includes(classStrClean) || 
                     classStrClean.includes(dbNameClean) ||
                     dbIdClean === classStrClean;
            });
            if (foundCls) {
              classId = foundCls.id;
            }
          }

          // Detect gender
          let gender = defaultGender.value;
          const targetGender = genderVal || normalized.gender || normalized.jenis_kelamin || normalized.jk;
          if (targetGender) {
            const gStr = String(targetGender).toLowerCase();
            if (gStr.startsWith('p') || gStr.includes('perempuan') || gStr.includes('wanita') || gStr.includes('f')) {
              gender = 'Perempuan';
            } else {
              gender = 'Laki-laki';
            }
          } else if (nama) {
            // Auto detect from name keys
            const femalePrefixes = ['siti', 'fatima', 'zahra', 'khadijah', 'aisyah', 'nurul', 'dwi', 'putri', 'anisa', 'ani', 'ika', 'sri', 'ni ', 'dewi', 'lail', 'ummi', 'halim', 'fitri'];
            const lowerName = String(nama).toLowerCase();
            const isFemale = femalePrefixes.some(p => lowerName.startsWith(p)) || lowerName.endsWith('wati') || lowerName.endsWith('ah') || lowerName.endsWith('ti');
            gender = isFemale ? 'Perempuan' : 'Laki-laki';
          }

          // Birthday
          let bdayStr = '';
          if (normalized.tanggal_lahir) {
            bdayStr = parseExcelDate(normalized.tanggal_lahir);
          } else {
            const twelveYearsAgo = new Date();
            twelveYearsAgo.setFullYear(twelveYearsAgo.getFullYear() - 12);
            bdayStr = twelveYearsAgo.toISOString().split('T')[0];
          }

          return {
            nis: nis,
            nama: nama,
            gender: gender,
            kelas_id: classId,
            tempat_lahir: normalized.tempat_lahir || normalized.kota || 'Salatiga',
            tanggal_lahir: bdayStr,
            hp_ortu: normalized.hp_ortu || normalized.hp || normalized.telepon || '081234567890',
            alamat: normalized.alamat || 'Alamat santri terdaftar Salatiga'
          };
        } else if (activeTab.value === 'ustadz') {
          let nama = normalized.nama ? String(normalized.nama).trim() : '';
          let username = normalized.username || normalized.user || '';
          
          if (!nama && rowValues.length > 0) {
            nama = rowValues[0];
            if (rowValues.length >= 2) {
              username = username || rowValues[1];
            }
          }

          if (!username) {
            username = nama ? String(nama).toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 12) : `ustadz_${idx + 1}`;
          }
          
          return {
            nama: nama,
            username: username.trim(),
            email: normalized.email || `${username}@simpas.com`,
            hp: normalized.hp || normalized.telepon || normalized.telpon || '081234567890',
            password: normalized.password || normalized.sandi || 'password'
          };
        } else if (activeTab.value === 'kelas') {
          let nama = normalized.nama || normalized.nama_kelas || '';
          let tahunAjaran = normalized.tahun_ajaran || normalized.ta || normalized.periode || '';
          let ustadzVal = normalized.wali_kelas || normalized.walikelas || normalized.wali || '';

          if (!nama && rowValues.length > 0) {
            nama = rowValues[0];
            if (rowValues.length >= 2) {
              tahunAjaran = tahunAjaran || rowValues[1];
            }
            if (rowValues.length >= 3) {
              ustadzVal = ustadzVal || rowValues[2];
            }
          }

          if (!tahunAjaran) {
            // fallback to current academic year
            const curYear = new Date().getFullYear();
            tahunAjaran = `${curYear}/${curYear + 1}`;
          }

          // Try to look up wali kelas ustadz ID from name
          let waliKelasId = '';
          if (ustadzVal) {
            const uStr = String(ustadzVal).toLowerCase().trim();
            const cleanStr = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
            const uStrClean = cleanStr(uStr);

            const foundUstadz = db.profiles.find(p => {
              if (p.role !== 'Ustadz') return false;
              const dbNameClean = cleanStr(p.nama);
              const dbUsernameClean = cleanStr(p.username || '');
              return dbNameClean.includes(uStrClean) || 
                     uStrClean.includes(dbNameClean) ||
                     dbUsernameClean === uStrClean ||
                     p.id === uStr;
            });
            if (foundUstadz) {
              waliKelasId = foundUstadz.id;
            }
          }

          return {
            nama: nama,
            tahun_ajaran: tahunAjaran,
            wali_kelas_id: waliKelasId
          };
        } else {
          // Kitab
          let kode = normalized.kode || normalized.kode_kitab || normalized.id || '';
          let nama = normalized.nama || normalized.nama_kitab || normalized.kitab || '';

          if (!nama && rowValues.length > 0) {
            if (rowValues.length >= 2) {
              kode = kode || rowValues[0];
              nama = nama || rowValues[1];
            } else {
              nama = nama || rowValues[0];
            }
          }

          // If code is empty, auto-generate sequential code
          if (!kode) {
            const currentCount = db.subjects.length + idx + 1;
            kode = `KIT-${String(100 + currentCount)}`;
          }

          return {
            kode: kode,
            nama: nama
          };
        }
      });

      Swal.fire({
        icon: 'success',
        title: 'Berkas Berhasil Dibaca',
        text: `Terdeteksi ${parsedRows.value.length} baris data siap ditinjau.`,
        confirmButtonColor: '#696cff'
      });
    } catch (err: any) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Pembacaan Berkas Gagal',
        text: err.message || 'Harap periksa kesesuaian berkas Anda.',
        confirmButtonColor: '#ff3e1d'
      });
      clearParsed();
    } finally {
      loading.value = false;
    }
  };

  reader.readAsArrayBuffer(file);
};

// Map column name options in case users upload with custom translated headers
const normalizeKeys = (row: any): any => {
  const norm: any = {};
  for (const key of Object.keys(row)) {
    const cleanKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
    const val = row[key];
    
    // Check match for kode/id
    if (
      cleanKey === 'kode' || 
      cleanKey === 'code' || 
      cleanKey === 'id' || 
      cleanKey.includes('kodekitab') || 
      cleanKey.includes('kodemapel') || 
      cleanKey.includes('kodepelajaran') ||
      cleanKey.includes('idkitab') ||
      cleanKey.includes('idsubject')
    ) {
      norm.kode = val;
    }
    
    // Check match for nis/no
    if (
      cleanKey === 'nis' || 
      cleanKey === 'nisn' || 
      cleanKey === 'no' || 
      cleanKey === 'noinduk' || 
      cleanKey.includes('nomorinduk') || 
      cleanKey.includes('nomorurutsantri') || 
      cleanKey.includes('nomorurut') || 
      cleanKey.includes('nourut') || 
      cleanKey.includes('nomerurut') || 
      cleanKey.includes('noinduksantri') ||
      cleanKey === 'nomor' ||
      cleanKey === 'nomer'
    ) {
      norm.nis = val;
    }
    
    // Check match for nama
    if (
      cleanKey === 'nama' || 
      cleanKey === 'namalengkap' || 
      cleanKey.includes('namasantri') || 
      cleanKey.includes('namasiswa') || 
      cleanKey === 'siswa' || 
      cleanKey === 'santri' || 
      cleanKey.includes('namaguru') || 
      cleanKey.includes('namaustadz') || 
      cleanKey === 'ustadz' || 
      cleanKey === 'guru' || 
      cleanKey.includes('namakitab') || 
      cleanKey === 'kitab' || 
      cleanKey === 'mapel' || 
      cleanKey === 'subject' || 
      cleanKey.includes('namamapel') || 
      cleanKey === 'pelajaran' || 
      cleanKey.includes('matapelajaran') ||
      cleanKey.includes('rujukan')
    ) {
      norm.nama = val;
    }
    
    // Check match for gender
    if (
      cleanKey === 'gender' || 
      cleanKey.includes('jeniskelamin') || 
      cleanKey === 'jk' || 
      cleanKey === 'sex' || 
      cleanKey === 'kelamin' || 
      cleanKey.includes('jenisk')
    ) {
      norm.gender = val;
    }
    
    // Check match for kelas
    if (
      cleanKey === 'kelas' || 
      cleanKey === 'rombel' || 
      cleanKey === 'ruang' || 
      cleanKey === 'class' || 
      cleanKey.includes('kelasid') || 
      cleanKey.includes('idkelas')
    ) {
      norm.kelas = val;
    }
    
    // Check match for tempat_lahir
    if (
      cleanKey.includes('tempatlahir') || 
      cleanKey === 'tempat' || 
      cleanKey === 'kota' || 
      cleanKey.includes('lahirdi')
    ) {
      norm.tempat_lahir = val;
    }
    
    // Check match for tanggal_lahir
    if (
      cleanKey.includes('tanggallahir') || 
      cleanKey.includes('tgllahir') || 
      cleanKey === 'lahir' || 
      cleanKey === 'birthday' || 
      cleanKey === 'dob'
    ) {
      norm.tanggal_lahir = val;
    }
    
    // Check match for hp_ortu or hp
    if (
      cleanKey.includes('hportu') || 
      cleanKey.includes('nohportu') || 
      cleanKey.includes('telponortu') ||
      cleanKey.includes('nohp') || 
      cleanKey === 'hp' || 
      cleanKey.includes('telepon') || 
      cleanKey.includes('telpon') || 
      cleanKey === 'phone' || 
      cleanKey === 'contact' || 
      cleanKey === 'kontak'
    ) {
      norm.hp_ortu = val;
      norm.hp = val;
    }
    
    // Check match for alamat
    if (
      cleanKey === 'alamat' || 
      cleanKey === 'rumah' || 
      cleanKey === 'address'
    ) {
      norm.alamat = val;
    }
    
    // Check match for username
    if (
      cleanKey === 'username' || 
      cleanKey === 'user' || 
      cleanKey === 'akun' || 
      cleanKey === 'pengguna' || 
      cleanKey === 'login' || 
      cleanKey.includes('idustadz')
    ) {
      norm.username = val;
    }
    
    // Check match for password
    if (
      cleanKey === 'password' || 
      cleanKey === 'sandi' || 
      cleanKey.includes('katasandi') || 
      cleanKey === 'pass'
    ) {
      norm.password = val;
    }

    // Check match for tahun_ajaran
    if (
      cleanKey.includes('tahunajaran') ||
      cleanKey === 'ta' ||
      cleanKey === 'periode' ||
      cleanKey.includes('thajaran')
    ) {
      norm.tahun_ajaran = val;
    }

    // Check match for wali_kelas
    if (
      cleanKey.includes('walikelas') ||
      cleanKey === 'wali' ||
      cleanKey.includes('ustadz') ||
      cleanKey.includes('guru') ||
      cleanKey.includes('pengajar')
    ) {
      norm.wali_kelas = val;
    }
    
    // Keep raw attributes as fallback
    norm[key] = val;
  }
  return norm;
};

// Help parse Excel raw numerical dates or other strings safely
const parseExcelDate = (val: any): string => {
  if (!val) return '';
  if (typeof val === 'number') {
    // SheetJS numerical excel date
    const date = new Date((val - 25569) * 86400 * 1000);
    return date.toISOString().split('T')[0];
  }
  const str = String(val).trim();
  
  // check if matches yyyy-mm-dd
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
  if (/^\d{4}\/\d{2}\/\d{2}$/.test(str)) return str.replace(/\//g, '-');
  
  // check if matches dd/mm/yyyy or dd-mm-yyyy or dd.mm.yyyy
  const dmyMatch = str.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/);
  if (dmyMatch) {
    const day = dmyMatch[1].padStart(2, '0');
    const month = dmyMatch[2].padStart(2, '0');
    const year = dmyMatch[3];
    return `${year}-${month}-${day}`;
  }
  
  // check if matches yyyy/mm/dd or yyyy-mm-dd (short month/day)
  const ymdMatch = str.match(/^(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})$/);
  if (ymdMatch) {
    const year = ymdMatch[1];
    const month = ymdMatch[2].padStart(2, '0');
    const day = ymdMatch[3].padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // try standard js parsing
  try {
    const parsed = new Date(str);
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString().split('T')[0];
    }
  } catch(e){}
  
  // default fallback 12 years ago
  const d = new Date();
  d.setFullYear(d.getFullYear() - 12);
  return d.toISOString().split('T')[0];
};

// Validations
const isValidRow = (row: any): boolean => {
  if (activeTab.value === 'siswa') {
    return !!(row.nis && row.nama);
  } else if (activeTab.value === 'ustadz') {
    return !!(row.nama && row.username);
  } else if (activeTab.value === 'kelas') {
    return !!(row.nama && row.tahun_ajaran);
  } else {
    return !!(row.kode && row.nama);
  }
};

const getRowErrorMsg = (row: any): string => {
  if (activeTab.value === 'siswa') {
    if (!row.nis) return 'NIS harus diisi';
    if (!row.nama) return 'Nama harus diisi';
  } else if (activeTab.value === 'ustadz') {
    if (!row.nama) return 'Nama harus diisi';
    if (!row.username) return 'Username harus diisi';
  } else if (activeTab.value === 'kelas') {
    if (!row.nama) return 'Nama kelas harus diisi';
    if (!row.tahun_ajaran) return 'Tahun ajaran harus diisi';
  } else {
    if (!row.kode) return 'Kode harus diisi';
    if (!row.nama) return 'Nama kitab harus diisi';
  }
  return 'Data tidak valid';
};

const validRowCount = computed(() => parsedRows.value.filter(isValidRow).length);
const invalidRowCount = computed(() => parsedRows.value.length - validRowCount.value);

// Save imported data directly into the DB state (with background Supabase replication)
const saveImport = () => {
  const validData = parsedRows.value.filter(isValidRow);
  if (validData.length === 0) {
    Swal.fire({
      icon: 'warning',
      title: 'Tidak Ada Data Valid',
      text: 'Silakan perbaiki kesalahan kolom merah terlebih dahulu.',
      confirmButtonColor: '#ffc107'
    });
    return;
  }

  try {
    let successCount = 0;
    
    if (activeTab.value === 'siswa') {
      const formatted = validData.map(item => ({
        nis: String(item.nis || '').trim(),
        nama: String(item.nama || '').trim(),
        gender: item.gender,
        kelas_id: item.kelas_id,
        tempat_lahir: item.tempat_lahir,
        tanggal_lahir: item.tanggal_lahir,
        alamat: item.alamat,
        hp_ortu: item.hp_ortu
      }));
      db.addStudentsBatch(formatted);
      successCount = formatted.length;
    } else if (activeTab.value === 'ustadz') {
      const formatted = validData.map(item => ({
        nama: String(item.nama || '').trim(),
        username: String(item.username || '').trim(),
        email: item.email || '-',
        hp: item.hp || '-',
        role: 'Ustadz' as const,
        profile_picture_url: '',
        password: item.password || 'password'
      }));
      db.addProfilesBatch(formatted);
      successCount = formatted.length;
    } else if (activeTab.value === 'kelas') {
      const formatted = validData.map(item => ({
        nama: String(item.nama || '').trim(),
        tahun_ajaran: String(item.tahun_ajaran || '').trim(),
        wali_kelas_id: item.wali_kelas_id || undefined
      }));
      db.addClassesBatch(formatted);
      successCount = formatted.length;
    } else {
      // Kitab
      const formatted = validData.map(item => ({
        kode: String(item.kode || '').trim(),
        nama: String(item.nama || '').trim()
      }));
      db.addSubjectsBatch(formatted);
      successCount = formatted.length;
    }

    Swal.fire({
      icon: 'success',
      title: 'Impor Berhasil',
      text: `Alhamdulillah! Berhasil mengimpor ${successCount} data ${tabTitle.value} baru.`,
      confirmButtonColor: '#696cff'
    });

    clearParsed();
  } catch (err: any) {
    Swal.fire({
      icon: 'error',
      title: 'Gagal Menyimpan Data',
      text: err.message || 'Terjadi kesalahan internal saat memasukkan data.',
      confirmButtonColor: '#ff3e1d'
    });
  }
};

// Generates and downloads standard Excel template file for Simpas
const downloadTemplate = (type: 'siswa' | 'ustadz' | 'kitab' | 'kelas') => {
  let headers: string[] = [];
  let samples: any[] = [];
  let fileName = '';

  if (type === 'siswa') {
    headers = ['Nomor Urut Santri (No.)', 'Nama Lengkap', 'Gender', 'Kelas'];
    samples = [
      { 'Nomor Urut Santri (No.)': '1', 'Nama Lengkap': 'M. Wildan Al-Farabi', 'Gender': 'Laki-laki', 'Kelas': 'Kelas 1-A' },
      { 'Nomor Urut Santri (No.)': '2', 'Nama Lengkap': 'Lailatul Fitriyyah', 'Gender': 'Perempuan', 'Kelas': 'Kelas 2-A' }
    ];
    fileName = 'Template_Santri_SIMPAS.xlsx';
  } else if (type === 'ustadz') {
    headers = ['Nama Lengkap', 'Username Login'];
    samples = [
      { 'Nama Lengkap': 'Ustadz Zainal Abidin, S.Ag', 'Username Login': 'zainal_abidin' },
      { 'Nama Lengkap': 'Ustadzah Lailiyatur Rohmah', 'Username Login': 'lailiya_rohmah' }
    ];
    fileName = 'Template_Ustadz_SIMPAS.xlsx';
  } else if (type === 'kelas') {
    headers = ['Nama Kelas', 'Tahun Ajaran', 'Wali Kelas'];
    samples = [
      { 'Nama Kelas': 'Kelas 1-A', 'Tahun Ajaran': '2025/2026', 'Wali Kelas': 'Ustadz Zainal Abidin, S.Ag' },
      { 'Nama Kelas': 'Kelas 1-B', 'Tahun Ajaran': '2025/2026', 'Wali Kelas': 'Ustadzah Lailiyatur Rohmah' }
    ];
    fileName = 'Template_Kelas_SIMPAS.xlsx';
  } else {
    headers = ['Kode Kitab', 'Nama Rujukan Kitab'];
    samples = [
      { 'Kode Kitab': 'KIT-105', 'Nama Rujukan Kitab': 'Arbain Nawawi (Hadits)' },
      { 'Kode Kitab': 'KIT-106', 'Nama Rujukan Kitab': 'Fathul Qarib (Fiqih)' }
    ];
    fileName = 'Template_Kitab_SIMPAS.xlsx';
  }

  const worksheet = XLSX.utils.json_to_sheet(samples, { header: headers });
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Templat');
  
  XLSX.writeFile(workbook, fileName);
};
</script>

<style scoped>
.upload-zone {
  border-width: 2px !important;
  transition: all 0.25s ease-in-out;
}
.upload-zone:hover {
  border-color: var(--bs-primary) !important;
  background-color: rgba(105, 108, 255, 0.02) !important;
}
.bg-light-success {
  background-color: rgba(113, 221, 55, 0.16);
}
.bg-light-danger {
  background-color: rgba(255, 62, 29, 0.16);
}
.max-vh-50 {
  max-height: 50vh;
}
.cursor-pointer {
  cursor: pointer;
}
.text-xxs {
  font-size: 0.7rem;
}
.text-xs-heading {
  font-size: 0.85rem;
}
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}
.animated-bounce {
  animation: bounce 2s infinite ease-in-out;
}
</style>
