<template>
  <div>
    <div class="row mb-4">
      <div class="col-12">
        <div class="card p-4 border-0 shadow-sm">
          <h4 class="mb-1 text-heading">Rekapan Absensi Santri</h4>
          <p class="text-muted mb-0">Lihat ringkasan, rekap, serta analisis statistik kehadiran santri Madrasah Diniyyah Pancasila Salatiga.</p>
        </div>
      </div>
    </div>

    <!-- Filter Card -->
    <div class="card shadow-sm border-0 mb-4 p-4">
      <div class="row g-3 align-items-end">
        <div class="col-12 col-md-3">
          <label class="form-label small fw-semibold">Pilih Kelas</label>
          <select v-model="selectedClass" class="form-select">
            <option value="all">-- Semua Kelas --</option>
            <option v-for="cls in classes" :key="cls.id" :value="cls.id">
              {{ cls.nama }}
            </option>
          </select>
        </div>
        <div class="col-12 col-md-3">
          <label class="form-label small fw-semibold">Pencarian Santri</label>
          <input v-model="searchQuery" type="text" class="form-control" placeholder="Ketik nama santri..." />
        </div>
        <div class="col-12 col-md-3">
          <label class="form-label small fw-semibold">Tanggal Absen</label>
          <input v-model="selectedDate" type="date" class="form-control" />
        </div>
        <div class="col-12 col-md-3">
          <button @click="resetFilters" class="btn btn-outline-secondary w-100">
            Reset Filter
          </button>
        </div>
      </div>
    </div>

    <!-- Summary Statistics Grid -->
    <div class="row g-3 mb-4">
      <!-- 1. Hadir Percentage -->
      <div class="col-6 col-lg-3">
        <div class="card border-0 p-3 shadow-sm bg-light-success text-center">
          <div class="text-xs text-success fw-bold uppercase mb-1">Total Hadir</div>
          <h3 class="mb-0 fw-bold text-success">{{ stats.hadir }} <span class="fs-6 text-muted font-normal">Sesi</span></h3>
          <span class="text-xs text-muted d-block mt-1">Hadir Belajar</span>
        </div>
      </div>
      <!-- 2. Izin Percentage -->
      <div class="col-6 col-lg-3">
        <div class="card border-0 p-3 shadow-sm bg-light-warning text-center">
          <div class="text-xs text-warning fw-bold uppercase mb-1">Total Izin</div>
          <h3 class="mb-0 fw-bold text-warning">{{ stats.izin }} <span class="fs-6 text-muted font-normal">Sesi</span></h3>
          <span class="text-xs text-muted d-block mt-1">Udzur Syar'i</span>
        </div>
      </div>
      <!-- 3. Sakit Percentage -->
      <div class="col-6 col-lg-3">
        <div class="card border-0 p-3 shadow-sm bg-light-info text-center">
          <div class="text-xs text-info fw-bold uppercase mb-1">Total Sakit</div>
          <h3 class="mb-0 fw-bold text-info">{{ stats.sakit }} <span class="fs-6 text-muted font-normal">Sesi</span></h3>
          <span class="text-xs text-muted d-block mt-1">Demam/Lainnya</span>
        </div>
      </div>
      <!-- 4. Alfa Percentage -->
      <div class="col-6 col-lg-3">
        <div class="card border-0 p-3 shadow-sm bg-light-danger text-center">
          <div class="text-xs text-danger fw-bold uppercase mb-1">Total Alfa</div>
          <h3 class="mb-0 fw-bold text-danger">{{ stats.alfa }} <span class="fs-6 text-muted font-normal">Sesi</span></h3>
          <span class="text-xs text-muted d-block mt-1">Tanpa Keterangan</span>
        </div>
      </div>
    </div>

    <!-- Attendance Table Card -->
    <div class="card shadow-sm border-0 overflow-hidden">
      <div class="card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
        <h5 class="mb-0">Daftar Histori Kehadiran Santri</h5>
        <div class="d-flex gap-2">
          <button @click="exportToExcel" class="btn btn-sm btn-outline-success d-flex align-items-center gap-1">
            <DownloadIcon :size="14" /> Export Excel
          </button>
        </div>
      </div>

      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead>
            <tr>
              <th style="width: 60px">No</th>
              <th>Nama Santri</th>
              <th>Kelas</th>
              <th>Tanggal</th>
              <th>Status</th>
              <th>Catatan / Keterangan</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(rec, idx) in filteredRecords" :key="rec.id">
              <td>{{ idx + 1 }}</td>
              <td>
                <div class="fw-bold text-heading">{{ rec.person_name }}</div>
              </td>
              <td>
                <span class="badge bg-label-info badge-custom text-xs">
                  {{ getClassName(rec.kelas_id) }}
                </span>
              </td>
              <td class="text-xs text-muted">
                {{ formatDate(rec.date) }}
              </td>
              <td>
                <span :class="getStatusClass(rec.status)" class="badge badge-custom py-1">
                  {{ rec.status }}
                </span>
              </td>
              <td class="text-sm text-muted">
                {{ rec.notes || '-' }}
              </td>
            </tr>
            <tr v-if="filteredRecords.length === 0">
              <td colspan="6" class="text-center py-4 text-muted">Tidak ada data kehadiran santri yang ditemukan.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { db } from '../database';
import * as XLSX from 'xlsx';
import { Download as DownloadIcon } from 'lucide-vue-next';

// Filter States
const selectedClass = ref('all');
const searchQuery = ref('');
const selectedDate = ref('');

const classes = computed(() => db.classes);

const getClassName = (kelasId?: string) => {
  if (!kelasId) return 'Tidak Diketahui';
  return db.classes.find(c => c.id === kelasId)?.nama || 'Kelas Terhapus';
};

const rawRecords = computed(() => {
  return db.attendance.filter(a => a.role === 'Santri');
});

const filteredRecords = computed(() => {
  return rawRecords.value.filter(rec => {
    // Class filter
    if (selectedClass.value !== 'all' && rec.kelas_id !== selectedClass.value) {
      return false;
    }
    // Search filter
    if (searchQuery.value && !rec.person_name.toLowerCase().includes(searchQuery.value.toLowerCase())) {
      return false;
    }
    // Date filter
    if (selectedDate.value && rec.date !== selectedDate.value) {
      return false;
    }
    return true;
  }).sort((a, b) => b.date.localeCompare(a.date));
});

// Stats Calculator
const stats = computed(() => {
  const records = filteredRecords.value;
  const hadir = records.filter(r => r.status === 'Hadir').length;
  const izin = records.filter(r => r.status === 'Izin').length;
  const sakit = records.filter(r => r.status === 'Sakit').length;
  const alfa = records.filter(r => r.status === 'Alfa').length;

  return { hadir, izin, sakit, alfa };
});

const getStatusClass = (status: string) => {
  if (status === 'Hadir') return 'badge-success';
  if (status === 'Izin') return 'badge-warning';
  if (status === 'Sakit') return 'badge-info';
  return 'badge-danger';
};

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
};

const resetFilters = () => {
  selectedClass.value = 'all';
  searchQuery.value = '';
  selectedDate.value = '';
};

const exportToExcel = () => {
  const mapped = filteredRecords.value.map((rec, idx) => ({
    No: idx + 1,
    'Nama Santri': rec.person_name,
    Kelas: getClassName(rec.kelas_id),
    Tanggal: rec.date,
    Status: rec.status,
    'Catatan / Keterangan': rec.notes || '-'
  }));

  const worksheet = XLSX.utils.json_to_sheet(mapped);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Absensi Santri');
  XLSX.writeFile(workbook, `Rekapan_Absensi_Santri_${new Date().toISOString().slice(0, 10)}.xlsx`);
};
</script>

<style scoped>
.bg-light-success {
  background-color: rgba(113, 221, 55, 0.08);
}
.bg-light-warning {
  background-color: rgba(255, 171, 0, 0.08);
}
.bg-light-info {
  background-color: rgba(3, 195, 236, 0.08);
}
.bg-light-danger {
  background-color: rgba(255, 62, 29, 0.08);
}
.bg-label-info {
  background-color: rgba(3, 195, 236, 0.16);
  color: var(--info);
}
</style>
