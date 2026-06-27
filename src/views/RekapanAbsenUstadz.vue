<template>
  <div>
    <div class="row mb-4">
      <div class="col-12 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
        <div>
          <h4 class="mb-1 text-heading">Rekapan Absensi Ustadz / Ustadzah</h4>
          <p class="text-muted mb-0">Lihat histori dan statistik presensi pengajar Madin Pancasila Salatiga.</p>
        </div>
        <div v-if="currentUser?.role === 'Admin'">
          <span class="badge bg-danger text-white py-2 px-3 fs-7">Admin Control</span>
        </div>
      </div>
    </div>

    <!-- Filter Card -->
    <div class="card shadow-sm border-0 mb-4 p-4">
      <div class="row g-3 align-items-end">
        <div class="col-12 col-md-4" v-if="currentUser?.role === 'Admin'">
          <label class="form-label small fw-semibold">Pilih Ustadz / Ustadzah</label>
          <select v-model="selectedUstadz" class="form-select">
            <option value="all">-- Semua Pengajar --</option>
            <option v-for="prof in ustadzList" :key="prof.id" :value="prof.id">
              {{ prof.nama }}
            </option>
          </select>
        </div>
        <div class="col-12 col-md-4">
          <label class="form-label small fw-semibold">Status Kehadiran</label>
          <select v-model="selectedStatus" class="form-select">
            <option value="all">-- Semua Status --</option>
            <option value="Hadir">Hadir</option>
            <option value="Izin">Izin</option>
            <option value="Sakit">Sakit</option>
            <option value="Alfa">Alfa</option>
          </select>
        </div>
        <div class="col-12 col-md-4">
          <label class="form-label small fw-semibold">Tanggal Mulai</label>
          <input v-model="startDate" type="date" class="form-control" />
        </div>
      </div>
    </div>

    <!-- Stats summary Row -->
    <div class="row g-3 mb-4 text-center">
      <div class="col-6 col-md-3">
        <div class="card border-0 p-3 bg-light border-start border-3 border-success">
          <div class="text-xs text-muted mb-1 font-semibold">Total Hadir</div>
          <h4 class="mb-0 fw-bold text-success">{{ stats.hadir }}</h4>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="card border-0 p-3 bg-light border-start border-3 border-warning">
          <div class="text-xs text-muted mb-1 font-semibold">Total Izin</div>
          <h4 class="mb-0 fw-bold text-warning">{{ stats.izin }}</h4>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="card border-0 p-3 bg-light border-start border-3 border-info">
          <div class="text-xs text-muted mb-1 font-semibold">Total Sakit</div>
          <h4 class="mb-0 fw-bold text-info">{{ stats.sakit }}</h4>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="card border-0 p-3 bg-light border-start border-3 border-danger">
          <div class="text-xs text-muted mb-1 font-semibold">Total Kehadiran</div>
          <h4 class="mb-0 fw-bold text-dark">{{ stats.total }}</h4>
        </div>
      </div>
    </div>

    <!-- Table of records -->
    <div class="card shadow-sm border-0 overflow-hidden">
      <div class="card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
        <h5 class="mb-0">Daftar Histori Presensi</h5>
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
              <th>No</th>
              <th>Nama Pengajar</th>
              <th>Tanggal</th>
              <th>Peran</th>
              <th>Status</th>
              <th>Keterangan / Catatan</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(rec, idx) in filteredRecords" :key="rec.id">
              <td>{{ idx + 1 }}</td>
              <td>
                <div class="fw-bold text-heading">{{ rec.person_name }}</div>
              </td>
              <td>{{ formatDate(rec.date) }}</td>
              <td>
                <span class="badge bg-label-secondary badge-custom py-1">{{ rec.role }}</span>
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
              <td colspan="6" class="text-center py-4 text-muted">Tidak ada rekapan presensi yang cocok.</td>
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

const currentUser = computed(() => db.session.currentUser);

// Filter States
const selectedUstadz = ref('all');
const selectedStatus = ref('all');
const startDate = ref('');

// List of all Ustadzs
const ustadzList = computed(() => {
  return db.profiles.filter(p => p.role === 'Ustadz');
});

// Attendance records
const rawRecords = computed(() => {
  // If Ustadz, only return their own. If Admin, return all.
  if (currentUser.value?.role === 'Ustadz') {
    return db.attendance.filter(a => a.role === 'Ustadz' && a.person_id === currentUser.value?.id);
  }
  return db.attendance.filter(a => a.role === 'Ustadz');
});

const filteredRecords = computed(() => {
  return rawRecords.value.filter(rec => {
    // Selected ustadz filter
    if (currentUser.value?.role === 'Admin' && selectedUstadz.value !== 'all' && rec.person_id !== selectedUstadz.value) {
      return false;
    }
    // Status filter
    if (selectedStatus.value !== 'all' && rec.status !== selectedStatus.value) {
      return false;
    }
    // Date filter
    if (startDate.value && rec.date < startDate.value) {
      return false;
    }
    return true;
  }).sort((a, b) => b.date.localeCompare(a.date));
});

// Statistics calculators
const stats = computed(() => {
  const records = filteredRecords.value;
  const hadir = records.filter(r => r.status === 'Hadir').length;
  const izin = records.filter(r => r.status === 'Izin').length;
  const sakit = records.filter(r => r.status === 'Sakit').length;
  const total = records.length;

  return { hadir, izin, sakit, total };
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

const exportToExcel = () => {
  const mapped = filteredRecords.value.map((rec, idx) => ({
    No: idx + 1,
    'Nama Pengajar': rec.person_name,
    Tanggal: rec.date,
    Status: rec.status,
    'Catatan / Keterangan': rec.notes || '-'
  }));

  const worksheet = XLSX.utils.json_to_sheet(mapped);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Absensi Ustadz');
  XLSX.writeFile(workbook, `Rekapan_Absensi_Ustadz_${new Date().toISOString().slice(0,10)}.xlsx`);
};
</script>

<style scoped>
.bg-label-secondary {
  background-color: rgba(133, 146, 163, 0.16);
  color: var(--secondary);
}
</style>
