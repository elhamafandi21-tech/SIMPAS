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
                  {{ cls.nama }} ({{ cls.tingkat }})
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
                      <td>
                        <input v-model="row.tempat_lahir" type="text" class="form-control form-control-sm text-xs py-0" />
                      </td>
                      <td>
                        <input v-model="row.tanggal_lahir" type="date" class="form-control form-control-sm text-xs py-0" />
                      </td>
                      <td>
                        <input v-model="row.hp_ortu" type="text" class="form-control form-control-sm text-xs py-0" />
                      </td>
                    </template>

                    <template v-if="activeTab === 'ustadz'">
                      <td>
                        <input v-model="row.nama" type="text" class="form-control form-control-sm text-xs py-0" required />
                      </td>
                      <td>
                        <input v-model="row.username" type="text" class="form-control form-control-sm text-xs py-0" placeholder="Username login" />
                      </td>
                      <td>
                        <input v-model="row.email" type="email" class="form-control form-control-sm text-xs py-0" />
                      </td>
                      <td>
                        <input v-model="row.hp" type="text" class="form-control form-control-sm text-xs py-0" />
                      </td>
                      <td>
                        <input v-model="row.password" type="text" class="form-control form-control-sm text-xs py-0" placeholder="Sandi default" />
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
            <div class="col-md-4 border-end-md">
              <span class="badge bg-label-primary mb-2">Impor Santri</span>
              <ul class="ps-3 mb-0">
                <li class="mb-1"><strong class="text-dark">NIS</strong>: Pastikan unik (angka, misal: 25001).</li>
                <li class="mb-1"><strong class="text-dark">Nama</strong>: Nama lengkap santri.</li>
                <li class="mb-1"><strong class="text-dark">Gender</strong>: Laki-laki atau Perempuan.</li>
                <li class="mb-1"><strong class="text-dark">Kelas</strong>: Dapat diisi nama kelas (misal: "Kelas 1-A Ula") atau ID kelas.</li>
              </ul>
            </div>
            <div class="col-md-4 border-end-md">
              <span class="badge bg-label-success mb-2">Impor Ustadz</span>
              <ul class="ps-3 mb-0">
                <li class="mb-1"><strong class="text-dark">Nama</strong>: Nama guru (contoh: Ustadz Zain).</li>
                <li class="mb-1"><strong class="text-dark">Username</strong>: Unik untuk login akun ustadz.</li>
                <li class="mb-1"><strong class="text-dark">Sandi</strong>: Kata sandi awal (default: "password").</li>
                <li class="mb-1"><strong class="text-dark">HP</strong>: Nomor HP aktif untuk kontak WA.</li>
              </ul>
            </div>
            <div class="col-md-4">
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
  BookOpen as BookOpenIcon, 
  Download as DownloadIcon, 
  UploadCloud as UploadCloudIcon, 
  X as XIcon, 
  Check as CheckIcon 
} from 'lucide-vue-next';

// Tab controller state
const activeTab = ref<'siswa' | 'ustadz' | 'kitab'>('siswa');
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
  return 'Kitab / Mata Pelajaran';
});

const tabBadgeClass = computed(() => {
  if (activeTab.value === 'siswa') return 'bg-label-primary text-primary';
  if (activeTab.value === 'ustadz') return 'bg-label-success text-success';
  return 'bg-label-info text-info';
});

const previewColumns = computed(() => {
  if (activeTab.value === 'siswa') {
    return [
      { key: 'nis', label: 'NIS *' },
      { key: 'nama', label: 'Nama Lengkap *' },
      { key: 'gender', label: 'Gender' },
      { key: 'kelas_id', label: 'Kelas' },
      { key: 'tempat_lahir', label: 'Tempat Lahir' },
      { key: 'tanggal_lahir', label: 'Tanggal Lahir' },
      { key: 'hp_ortu', label: 'HP Orang Tua' }
    ];
  } else if (activeTab.value === 'ustadz') {
    return [
      { key: 'nama', label: 'Nama Lengkap *' },
      { key: 'username', label: 'Username Login *' },
      { key: 'email', label: 'Email' },
      { key: 'hp', label: 'No HP / Kontak' },
      { key: 'password', label: 'Kata Sandi' }
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

const setTab = (tab: 'siswa' | 'ustadz' | 'kitab') => {
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

      // Convert rows to Simpas specific data models
      parsedRows.value = rawJson.map((row: any) => {
        const normalized = normalizeKeys(row);
        
        if (activeTab.value === 'siswa') {
          // Find class reference from name inside Excel, or use default class
          let classId = defaultClassId.value;
          if (normalized.kelas) {
            const classStr = String(normalized.kelas).toLowerCase().trim();
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
          if (normalized.gender || normalized.jenis_kelamin || normalized.jk) {
            const gStr = String(normalized.gender || normalized.jenis_kelamin || normalized.jk).toLowerCase();
            if (gStr.startsWith('p') || gStr.includes('perempuan') || gStr.includes('wanita') || gStr.includes('f')) {
              gender = 'Perempuan';
            } else {
              gender = 'Laki-laki';
            }
          } else if (normalized.nama) {
            // Auto detect from name keys
            const femalePrefixes = ['siti', 'fatima', 'zahra', 'khadijah', 'aisyah', 'nurul', 'dwi', 'putri', 'anisa', 'ani', 'ika', 'sri', 'ni ', 'dewi', 'lail', 'ummi', 'halim', 'fitri'];
            const lowerName = String(normalized.nama).toLowerCase();
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
            nis: normalized.nis ? String(normalized.nis).trim() : '',
            nama: normalized.nama ? String(normalized.nama).trim() : '',
            gender: gender,
            kelas_id: classId,
            tempat_lahir: normalized.tempat_lahir || normalized.kota || 'Salatiga',
            tanggal_lahir: bdayStr,
            hp_ortu: normalized.hp_ortu || normalized.hp || normalized.telepon || '081234567890',
            alamat: normalized.alamat || 'Alamat santri terdaftar Salatiga'
          };
        } else if (activeTab.value === 'ustadz') {
          const username = normalized.username || normalized.user || 
            (normalized.nama ? String(normalized.nama).toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 12) : '');
          
          return {
            nama: normalized.nama ? String(normalized.nama).trim() : '',
            username: username.trim(),
            email: normalized.email || `${username}@simpas.com`,
            hp: normalized.hp || normalized.telepon || normalized.telpon || '081234567890',
            password: normalized.password || normalized.sandi || 'password'
          };
        } else {
          // Kitab
          return {
            kode: normalized.kode || normalized.kode_kitab || normalized.id || '',
            nama: normalized.nama || normalized.nama_kitab || normalized.kitab || ''
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
    const k = key.toLowerCase().trim().replace(/[\s_]/g, '');
    const val = row[key];
    
    if (['nis', 'noinduk', 'nomorinduk'].includes(k)) norm.nis = val;
    else if (['nama', 'namalengkap', 'namasantri', 'namaguru', 'namakitab', 'kitab', 'mapel', 'subject'].includes(k)) norm.nama = val;
    else if (['gender', 'jeniskelamin', 'jk', 'sex'].includes(k)) norm.gender = val;
    else if (['kelas', 'rombel', 'ruang', 'class', 'classroom'].includes(k)) norm.kelas = val;
    else if (['tempatlahir', 'kota', 'lahirdi'].includes(k)) norm.tempat_lahir = val;
    else if (['tanggallahir', 'tgllahir', 'lahir', 'birthday', 'dob'].includes(k)) norm.tanggal_lahir = val;
    else if (['hportu', 'hp', 'telepon', 'telpon', 'no_hp', 'nohp', 'phone', 'contact', 'kontak'].includes(k)) norm.hp_ortu = val;
    else if (['alamat', 'rumah', 'address'].includes(k)) norm.alamat = val;
    else if (['username', 'user', 'nama_pengguna', 'namapengguna'].includes(k)) norm.username = val;
    else if (['email', 'surel'].includes(k)) norm.email = val;
    else if (['password', 'sandi', 'katasandi'].includes(k)) norm.password = val;
    else if (['kode', 'kode_kitab', 'kodekitab', 'id', 'code'].includes(k)) norm.kode = val;
    else {
      // fallback as-is
      norm[k] = val;
    }
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
      for (const item of validData) {
        db.addStudent({
          nis: item.nis,
          nama: item.nama,
          gender: item.gender,
          kelas_id: item.kelas_id,
          tempat_lahir: item.tempat_lahir,
          tanggal_lahir: item.tanggal_lahir,
          alamat: item.alamat,
          hp_ortu: item.hp_ortu
        });
        successCount++;
      }
    } else if (activeTab.value === 'ustadz') {
      for (const item of validData) {
        const id = 'prof-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4);
        db.profiles.push({
          id,
          nama: item.nama,
          username: item.username,
          email: item.email,
          hp: item.hp,
          role: 'Ustadz',
          profile_picture_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
          password: item.password || 'password'
        });
        successCount++;
      }
      db.saveAll();
    } else {
      // Kitab
      for (const item of validData) {
        db.addSubject({
          kode: item.kode,
          nama: item.nama
        });
        successCount++;
      }
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
const downloadTemplate = (type: 'siswa' | 'ustadz' | 'kitab') => {
  let headers: string[] = [];
  let samples: any[] = [];
  let fileName = '';

  if (type === 'siswa') {
    headers = ['NIS', 'Nama Lengkap', 'Gender', 'Kelas', 'Tempat Lahir', 'Tanggal Lahir', 'HP Orang Tua', 'Alamat'];
    samples = [
      { 'NIS': '25010', 'Nama Lengkap': 'M. Wildan Al-Farabi', 'Gender': 'Laki-laki', 'Kelas': 'Kelas 1-A Ula', 'Tempat Lahir': 'Salatiga', 'Tanggal Lahir': '2014-06-15', 'HP Orang Tua': '081234567890', 'Alamat': 'Tingkir Tengah, Salatiga' },
      { 'NIS': '25011', 'Nama Lengkap': 'Lailatul Fitriyyah', 'Gender': 'Perempuan', 'Kelas': 'Kelas 2-A Ula', 'Tempat Lahir': 'Semarang', 'Tanggal Lahir': '2013-11-20', 'HP Orang Tua': '089876543210', 'Alamat': 'Ledok, Salatiga' }
    ];
    fileName = 'Template_Santri_SIMPAS.xlsx';
  } else if (type === 'ustadz') {
    headers = ['Nama Lengkap', 'Username Login', 'Email', 'No HP', 'Kata Sandi'];
    samples = [
      { 'Nama Lengkap': 'Ustadz Zainal Abidin, S.Ag', 'Username Login': 'zainal_abidin', 'Email': 'zainal@simpas.com', 'No HP': '085641222333', 'Kata Sandi': 'password123' },
      { 'Nama Lengkap': 'Ustadzah Lailiyatur Rohmah', 'Username Login': 'lailiya_rohmah', 'Email': 'lailiya@simpas.com', 'No HP': '087812000111', 'Kata Sandi': 'password123' }
    ];
    fileName = 'Template_Ustadz_SIMPAS.xlsx';
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
