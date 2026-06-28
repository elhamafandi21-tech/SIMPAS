<template>
  <div>
    <!-- Top Row Header -->
    <div class="row mb-4">
      <div class="col-12 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
        <div>
          <h4 class="mb-1 text-heading">Manajemen Santri (Siswa)</h4>
          <p class="text-muted mb-0">Kelola biodata santri terdaftar Madrasah Diniyyah Pancasila Salatiga.</p>
        </div>
        <div class="d-flex gap-2">
          <button @click="openBulkModal" class="btn btn-outline-primary d-flex align-items-center gap-2">
            <UploadIcon :size="18" /> Impor Massal
          </button>
          <button @click="openAddModal" class="btn btn-primary d-flex align-items-center gap-2">
            <PlusIcon :size="18" /> Tambah Santri Baru
          </button>
        </div>
      </div>
    </div>

    <!-- Filter/Search Cards -->
    <div class="card shadow-sm border-0 mb-4 p-4">
      <div class="row g-3 align-items-end">
        <!-- Search bar -->
        <div class="col-12 col-md-6">
          <label class="form-label small fw-semibold">Cari Nama / NIS Santri</label>
          <div class="input-group">
            <span class="input-group-text bg-light border-end-0"><SearchIcon :size="16" class="text-muted" /></span>
            <input v-model="searchQuery" type="text" class="form-control border-start-0" placeholder="Ketik nama lengkap atau NIS santri..." />
          </div>
        </div>

        <!-- Filter class -->
        <div class="col-12 col-md-4">
          <label class="form-label small fw-semibold">Filter Kelas</label>
          <select v-model="selectedClass" class="form-select">
            <option value="all">-- Semua Kelas --</option>
            <option v-for="cls in classes" :key="cls.id" :value="cls.id">
              {{ cls.nama }}
            </option>
          </select>
        </div>

        <!-- Reset -->
        <div class="col-12 col-md-2">
          <button @click="resetFilters" class="btn btn-outline-secondary w-100">Reset</button>
        </div>
      </div>
    </div>

    <!-- Student Table Card -->
    <div class="card shadow-sm border-0 overflow-hidden">
      <div class="card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
        <h5 class="mb-0">Daftar Santri Aktif</h5>
        <div class="d-flex align-items-center gap-2">
          <button v-if="selectedStudentIds.length > 0" @click="deleteSelectedStudents" class="btn btn-sm btn-danger d-flex align-items-center gap-2 px-3">
            <TrashIcon :size="14" /> Hapus Terpilih ({{ selectedStudentIds.length }})
          </button>
          <span class="badge bg-label-primary badge-custom">{{ filteredStudents.length }} Santri Terfilter</span>
        </div>
      </div>
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead>
            <tr>
              <th style="width: 45px" class="text-center">
                <input type="checkbox" class="form-check-input cursor-pointer" v-model="isAllSelected" />
              </th>
              <th style="width: 60px">No</th>
              <th style="width: 100px">NIS</th>
              <th>Nama Lengkap</th>
              <th>Kelas</th>
              <th>L/P</th>
              <th>Kontak Orang Tua</th>
              <th>Alamat</th>
              <th class="text-end" style="width: 150px">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(std, idx) in filteredStudents" :key="std.id" :class="{ 'bg-success-subtle': selectedStudentIds.includes(std.id) }">
              <td class="text-center">
                <input type="checkbox" class="form-check-input cursor-pointer" :value="std.id" v-model="selectedStudentIds" />
              </td>
              <td>{{ idx + 1 }}</td>
              <td class="fw-bold text-xs text-primary">{{ std.nis }}</td>
              <td>
                <div class="fw-bold text-heading">{{ std.nama }}</div>
                <span class="text-xs text-muted d-block">{{ std.tempat_lahir }}, {{ formatDate(std.tanggal_lahir) }}</span>
              </td>
              <td>
                <span class="badge bg-label-info badge-custom text-xs">
                  {{ getClassName(std.kelas_id) }}
                </span>
              </td>
              <td>
                <span class="badge" :class="std.gender === 'Laki-laki' ? 'bg-primary text-white' : 'bg-danger text-white'" style="font-size: 0.65rem">
                  {{ std.gender === 'Laki-laki' ? 'L' : 'P' }}
                </span>
              </td>
              <td class="text-xs text-heading">{{ std.hp_ortu }}</td>
              <td class="text-xs text-muted text-truncate" style="max-width: 180px" :title="std.alamat">
                {{ std.alamat }}
              </td>
              <td class="text-end">
                <div class="d-flex justify-content-end gap-1">
                  <button @click="openEditModal(std)" class="btn btn-sm btn-icon btn-outline-primary" title="Edit Santri">
                    <EditIcon :size="14" />
                  </button>
                  <button @click="deleteStudent(std.id)" class="btn btn-sm btn-icon btn-outline-danger" title="Hapus Santri">
                    <TrashIcon :size="14" />
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredStudents.length === 0">
              <td colspan="9" class="text-center py-4 text-muted">Tidak ada data santri yang cocok.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Student Form Dialog Modal (Add/Edit) -->
    <div v-if="showModal" class="modal-backdrop">
      <div class="modal d-block" tabindex="-1" role="dialog" style="background: rgba(0,0,0,0.5)">
        <div class="modal-dialog modal-dialog-centered modal-md" role="document">
          <div class="modal-content card shadow-lg border-0">
            <div class="modal-header border-bottom py-3">
              <h5 class="modal-title fw-bold">{{ isEditMode ? 'Edit Biodata Santri' : 'Tambah Santri Baru' }}</h5>
              <button type="button" class="btn-close" @click="showModal = false"></button>
            </div>
            <div class="modal-body p-4">
              <form @submit.prevent="saveStudent">
                <div class="row g-3">
                  <!-- NIS -->
                  <div class="col-6">
                    <label class="form-label small fw-semibold">Nomor Induk Santri (NIS)</label>
                    <input v-model="form.nis" type="text" class="form-control" placeholder="Contoh: 25009" required />
                  </div>
                  <!-- Kelas -->
                  <div class="col-6">
                    <div class="d-flex justify-content-between align-items-center mb-1">
                      <label class="form-label small fw-semibold mb-0">Kelas / Rombel</label>
                      <a href="#" @click.prevent="openQuickClassModal" class="text-xs text-decoration-none fw-semibold">+ Kelas Baru</a>
                    </div>
                    <select v-model="form.kelas_id" class="form-select" required>
                      <option value="">-- Pilih Kelas --</option>
                      <option v-for="cls in classes" :key="cls.id" :value="cls.id">
                        {{ cls.nama }}
                      </option>
                    </select>
                  </div>
                  <!-- Nama -->
                  <div class="col-12">
                    <label class="form-label small fw-semibold">Nama Lengkap Santri</label>
                    <input v-model="form.nama" type="text" class="form-control" placeholder="Masukkan nama lengkap..." required />
                  </div>
                  <!-- Gender -->
                  <div class="col-6">
                    <label class="form-label small fw-semibold">Jenis Kelamin</label>
                    <select v-model="form.gender" class="form-select" required>
                      <option value="Laki-laki">Laki-laki</option>
                      <option value="Perempuan">Perempuan</option>
                    </select>
                  </div>
                  <!-- HP Orang Tua -->
                  <div class="col-6">
                    <label class="form-label small fw-semibold">No HP Orang Tua</label>
                    <input v-model="form.hp_ortu" type="text" class="form-control" placeholder="Contoh: 0812..." required />
                  </div>
                  <!-- Tempat Lahir -->
                  <div class="col-6">
                    <label class="form-label small fw-semibold">Tempat Lahir</label>
                    <input v-model="form.tempat_lahir" type="text" class="form-control" placeholder="Contoh: Salatiga" required />
                  </div>
                  <!-- Tanggal Lahir -->
                  <div class="col-6">
                    <label class="form-label small fw-semibold">Tanggal Lahir</label>
                    <input v-model="form.tanggal_lahir" type="date" class="form-control" required />
                  </div>
                  <!-- Alamat -->
                  <div class="col-12">
                    <label class="form-label small fw-semibold">Alamat Lengkap</label>
                    <textarea v-model="form.alamat" class="form-control" rows="2" placeholder="Tulis alamat rumah lengkap..." required></textarea>
                  </div>
                </div>

                <div class="d-flex justify-content-end gap-2 pt-3 border-top mt-4">
                  <button type="button" class="btn btn-outline-secondary" @click="showModal = false">Batal</button>
                  <button type="submit" class="btn btn-primary">{{ isEditMode ? 'Simpan Perubahan' : 'Tambah Santri' }}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bulk Student Import Modal -->
    <div v-if="showBulkModal" class="modal-backdrop">
      <div class="modal d-block" tabindex="-1" role="dialog" style="background: rgba(0,0,0,0.5)">
        <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
          <div class="modal-content card shadow-lg border-0">
            <div class="modal-header border-bottom py-3">
              <h5 class="modal-title fw-bold">Impor Massal Santri</h5>
              <button type="button" class="btn-close" @click="showBulkModal = false"></button>
            </div>
            <div class="modal-body p-4">
              <p class="text-muted text-xs mb-3">
                Masukkan daftar nama santri baru secara sekaligus. Sistem akan membuat NIS berurutan secara otomatis berdasarkan nomor awal yang Anda tentukan.
              </p>
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label small fw-semibold">Kelas Tujuan</label>
                  <select v-model="bulkForm.kelas_id" class="form-select" required>
                    <option value="">-- Pilih Kelas --</option>
                    <option v-for="cls in classes" :key="cls.id" :value="cls.id">
                      {{ cls.nama }}
                    </option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label small fw-semibold">Mulai NIS dari Nomor</label>
                  <input v-model="bulkForm.startNis" type="number" class="form-control" placeholder="Contoh: 25001" required />
                </div>
                <div class="col-12">
                  <label class="form-label small fw-semibold">Daftar Nama Santri (Satu Nama per Baris)</label>
                  <textarea v-model="bulkForm.namesText" class="form-control text-xs" rows="8" placeholder="Contoh:&#10;Ahmad Dahlan&#10;Siti Aisyah&#10;Muhammad Wildan&#10;Fatimah Az-Zahra" required></textarea>
                </div>
                <div class="col-md-6">
                  <label class="form-label small fw-semibold">Default Jenis Kelamin</label>
                  <select v-model="bulkForm.defaultGender" class="form-select">
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                    <option value="auto">Deteksi Otomatis (Siti, Fatimah, Zahra, Aminah, dkk -> Perempuan)</option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label small fw-semibold">Default Kota Lahir & HP</label>
                  <div class="input-group">
                    <input v-model="bulkForm.defaultTempatLahir" type="text" class="form-control" placeholder="Tempat Lahir (Salatiga)" />
                    <input v-model="bulkForm.defaultHp" type="text" class="form-control" placeholder="No HP Ortu (0812...)" />
                  </div>
                </div>
              </div>
              <div class="d-flex justify-content-end gap-2 pt-3 border-top mt-4">
                <button type="button" class="btn btn-outline-secondary" @click="showBulkModal = false">Batal</button>
                <button type="button" @click="processBulkImport" class="btn btn-primary" :disabled="!bulkForm.kelas_id || !bulkForm.namesText.trim()">Proses & Simpan</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Class Creation Modal -->
    <div v-if="showQuickClassModal" class="modal-backdrop" style="z-index: 1060">
      <div class="modal-dialog modal-dialog-centered" role="document">
        <div class="modal-content card shadow-lg border-0">
          <div class="modal-header border-bottom py-3">
            <h5 class="modal-title fw-bold">Tambah Kelas Baru</h5>
            <button type="button" class="btn-close" @click="showQuickClassModal = false"></button>
          </div>
          <div class="modal-body p-4">
            <form @submit.prevent="saveQuickClass">
              <div class="mb-3">
                <label class="form-label small fw-semibold">Nama Kelas / Rombel</label>
                <input v-model="quickClassForm.nama" type="text" class="form-control" placeholder="Contoh: Kelas 1-C Ula" required />
              </div>
              <div class="mb-3">
                <label class="form-label small fw-semibold">Tingkat Pendidikan</label>
                <select v-model="quickClassForm.tingkat" class="form-select" required>
                  <option value="">-- Pilih Tingkat --</option>
                  <option value="Ula (Dasar)">Ula (Dasar)</option>
                  <option value="Wustha (Menengah)">Wustha (Menengah)</option>
                  <option value="Ulya (Tinggi)">Ulya (Tinggi)</option>
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label small fw-semibold">Tahun Ajaran</label>
                <input v-model="quickClassForm.tahun_ajaran" type="text" class="form-control" placeholder="Contoh: 2025/2026" required />
              </div>
              <div class="d-flex justify-content-end gap-2 pt-3 border-top">
                <button type="button" class="btn btn-outline-secondary" @click="showQuickClassModal = false">Batal</button>
                <button type="submit" class="btn btn-primary">Tambah Kelas</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { db, Student } from '../database';
import Swal from 'sweetalert2';
import { Plus as PlusIcon, Edit as EditIcon, Trash as TrashIcon, Search as SearchIcon, Upload as UploadIcon } from 'lucide-vue-next';

const showModal = ref(false);
const isEditMode = ref(false);
const editId = ref('');

// Bulk selection states
const selectedStudentIds = ref<string[]>([]);

const isAllSelected = computed({
  get: () => {
    if (filteredStudents.value.length === 0) return false;
    return filteredStudents.value.every(std => selectedStudentIds.value.includes(std.id));
  },
  set: (val) => {
    if (val) {
      const currentIds = new Set(selectedStudentIds.value);
      filteredStudents.value.forEach(std => currentIds.add(std.id));
      selectedStudentIds.value = Array.from(currentIds);
    } else {
      const currentFilteredIds = filteredStudents.value.map(std => std.id);
      selectedStudentIds.value = selectedStudentIds.value.filter(id => !currentFilteredIds.includes(id));
    }
  }
});

// Bulk modal state
const showBulkModal = ref(false);
const bulkForm = ref({
  kelas_id: '',
  startNis: 25001,
  namesText: '',
  defaultGender: 'auto' as 'Laki-laki' | 'Perempuan' | 'auto',
  defaultTempatLahir: 'Salatiga',
  defaultHp: '081234567890'
});

// Quick class modal state
const showQuickClassModal = ref(false);
const quickClassForm = ref({
  nama: '',
  tingkat: '',
  tahun_ajaran: '2025/2026'
});

// Filters states
const searchQuery = ref('');
const selectedClass = ref('all');

const classes = computed(() => db.classes);

const filteredStudents = computed(() => {
  return db.students.filter(std => {
    // Search query filter
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase();
      const matchName = std.nama.toLowerCase().includes(q);
      const matchNis = std.nis.toLowerCase().includes(q);
      if (!matchName && !matchNis) return false;
    }
    // Class filter
    if (selectedClass.value !== 'all' && std.kelas_id !== selectedClass.value) {
      return false;
    }
    return true;
  });
});

const getClassName = (id: string) => {
  return db.classes.find(c => c.id === id)?.nama || 'Kelas';
};

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
};

// Form state
const form = ref({
  nis: '',
  nama: '',
  gender: 'Laki-laki' as 'Laki-laki' | 'Perempuan',
  tempat_lahir: '',
  tanggal_lahir: '',
  alamat: '',
  hp_ortu: '',
  kelas_id: ''
});

const openAddModal = () => {
  isEditMode.value = false;
  editId.value = '';
  form.value = {
    nis: '',
    nama: '',
    gender: 'Laki-laki',
    tempat_lahir: '',
    tanggal_lahir: '',
    alamat: '',
    hp_ortu: '',
    kelas_id: ''
  };
  showModal.value = true;
};

const openEditModal = (std: Student) => {
  isEditMode.value = true;
  editId.value = std.id;
  form.value = {
    nis: std.nis,
    nama: std.nama,
    gender: std.gender,
    tempat_lahir: std.tempat_lahir,
    tanggal_lahir: std.tanggal_lahir,
    alamat: std.alamat,
    hp_ortu: std.hp_ortu,
    kelas_id: std.kelas_id
  };
  showModal.value = true;
};

const saveStudent = () => {
  if (isEditMode.value && editId.value) {
    db.editStudent(editId.value, form.value);
  } else {
    db.addStudent(form.value);
  }

  showModal.value = false;
  Swal.fire({
    icon: 'success',
    title: 'Santri Berhasil Disimpan',
    text: 'Data santri telah berhasil disinkronkan ke Supabase.',
    confirmButtonColor: '#696cff'
  });
};

const deleteStudent = (id: string) => {
  Swal.fire({
    title: 'Hapus Biodata Santri?',
    text: 'Menghapus santri ini juga akan menghapus data nilai, absensi harian, dan setoran nadhoman yang bersangkutan. Lanjutkan?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ff3e1d',
    cancelButtonColor: '#8592a3',
    confirmButtonText: 'Ya, Hapus',
    cancelButtonText: 'Batal'
  }).then((result) => {
    if (result.isConfirmed) {
      db.deleteStudent(id);
      selectedStudentIds.value = selectedStudentIds.value.filter(item => item !== id);
      Swal.fire({
        icon: 'success',
        title: 'Santri Terhapus',
        text: 'Biodata santri dan semua data relasi terkait telah terhapus.',
        timer: 1000,
        showConfirmButton: false
      });
    }
  });
};

const deleteSelectedStudents = () => {
  if (selectedStudentIds.value.length === 0) return;

  Swal.fire({
    title: `Hapus ${selectedStudentIds.value.length} Santri Terpilih?`,
    text: `Tindakan ini akan menghapus biodata beserta semua data relasi terkait (nilai, presensi harian, dan setoran hafalan) secara masal untuk ${selectedStudentIds.value.length} santri ini. Lanjutkan?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ff3e1d',
    cancelButtonColor: '#8592a3',
    confirmButtonText: 'Ya, Hapus Masal',
    cancelButtonText: 'Batal'
  }).then((result) => {
    if (result.isConfirmed) {
      db.deleteStudents(selectedStudentIds.value);
      selectedStudentIds.value = [];
      Swal.fire({
        icon: 'success',
        title: 'Hapus Masal Sukses',
        text: 'Semua santri yang Anda pilih berhasil dihapus beserta data relasi terkait.',
        timer: 1500,
        showConfirmButton: false
      });
    }
  });
};

const resetFilters = () => {
  searchQuery.value = '';
  selectedClass.value = 'all';
  selectedStudentIds.value = [];
};

// Bulk Import Handlers
const openBulkModal = () => {
  // Find highest NIS currently
  let maxNis = 25000;
  if (db.students.length > 0) {
    const numbers = db.students.map(s => parseInt(s.nis)).filter(n => !isNaN(n));
    if (numbers.length > 0) {
      maxNis = Math.max(...numbers);
    }
  }
  bulkForm.value = {
    kelas_id: selectedClass.value !== 'all' ? selectedClass.value : '',
    startNis: maxNis + 1,
    namesText: '',
    defaultGender: 'auto',
    defaultTempatLahir: 'Salatiga',
    defaultHp: '081234567890'
  };
  showBulkModal.value = true;
};

const processBulkImport = () => {
  const rawNames = bulkForm.value.namesText.split('\n');
  const studentsToAdd: any[] = [];
  let currentNis = Number(bulkForm.value.startNis);

  for (let rawName of rawNames) {
    let name = rawName.trim();
    if (!name) continue;

    let gender: 'Laki-laki' | 'Perempuan' = 'Laki-laki';
    
    // Auto detect gender based on name cues
    if (bulkForm.value.defaultGender === 'auto') {
      const lowerName = name.toLowerCase();
      const femalePrefixes = ['siti', 'fatima', 'zahra', 'khadijah', 'aisyah', 'nurul', 'dwi', 'putri', 'anisa', 'ani', 'ika', 'sri', 'ni ', 'dewi', 'lail', 'ummi', 'halim', 'fitri'];
      const isFemale = femalePrefixes.some(p => lowerName.startsWith(p)) || lowerName.endsWith('wati') || lowerName.endsWith('ah') || lowerName.endsWith('ti');
      gender = isFemale ? 'Perempuan' : 'Laki-laki';
    } else {
      gender = bulkForm.value.defaultGender;
    }

    // Default birthday is exactly 12 years ago
    const birthday = new Date();
    birthday.setFullYear(birthday.getFullYear() - 12);
    const dateString = birthday.toISOString().split('T')[0];

    studentsToAdd.push({
      nis: String(currentNis++),
      nama: name,
      gender: gender,
      tempat_lahir: bulkForm.value.defaultTempatLahir || 'Salatiga',
      tanggal_lahir: dateString,
      alamat: 'Alamat santri terdaftar Salatiga',
      hp_ortu: bulkForm.value.defaultHp || '081234567890',
      kelas_id: bulkForm.value.kelas_id
    });
  }

  if (studentsToAdd.length === 0) {
    Swal.fire({
      icon: 'warning',
      title: 'Data Kosong',
      text: 'Tidak ada nama santri yang valid untuk diimpor.',
      confirmButtonColor: '#ffc107'
    });
    return;
  }

  // Add all to db
  for (const std of studentsToAdd) {
    db.addStudent(std);
  }

  showBulkModal.value = false;
  Swal.fire({
    icon: 'success',
    title: 'Impor Massal Sukses',
    text: `Berhasil menambahkan ${studentsToAdd.length} santri baru ke dalam kelas.`,
    confirmButtonColor: '#71dd37'
  });
};

// Quick Class Creation Handlers
const openQuickClassModal = () => {
  quickClassForm.value = {
    nama: '',
    tingkat: '',
    tahun_ajaran: '2025/2026'
  };
  showQuickClassModal.value = true;
};

const saveQuickClass = () => {
  const newClass = db.addClass(quickClassForm.value);
  showQuickClassModal.value = false;
  
  // Auto-select the newly created class in both normal form and bulk form
  form.value.kelas_id = newClass.id;
  bulkForm.value.kelas_id = newClass.id;

  Swal.fire({
    icon: 'success',
    title: 'Kelas Berhasil Ditambahkan',
    text: `Kelas "${newClass.nama}" telah aktif dan otomatis terpilih.`,
    confirmButtonColor: '#696cff'
  });
};
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 1050;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bg-label-primary {
  background-color: var(--primary-light);
  color: var(--primary);
}

.bg-label-info {
  background-color: rgba(3, 195, 236, 0.16);
  color: var(--info);
}

.btn-icon {
  width: 28px;
  height: 28px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
</style>
