<template>
  <div>
    <div class="row mb-4">
      <div class="col-12 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
        <div>
          <h4 class="mb-1 text-heading">Rekapan Hafalan Nadhoman Real-Time</h4>
          <p class="text-muted mb-0">Pantau perkembangan setoran nazhom seluruh santri per kelas secara langsung.</p>
        </div>
        <div>
          <span class="badge bg-label-success badge-custom text-xs fw-bold">Live Supabase Sync</span>
        </div>
      </div>
    </div>

    <!-- Filters Card -->
    <div class="card shadow-sm border-0 mb-4 p-4">
      <div class="row g-3 align-items-end">
        <div class="col-12 col-md-4">
          <label class="form-label small fw-semibold">Filter Kelas</label>
          <select v-model="selectedClass" class="form-select">
            <option value="all">-- Semua Kelas --</option>
            <option v-for="cls in classes" :key="cls.id" :value="cls.id">
              {{ cls.nama }} ({{ cls.tingkat }})
            </option>
          </select>
        </div>
        <div class="col-12 col-md-5">
          <label class="form-label small fw-semibold">Pencarian Santri</label>
          <input v-model="searchQuery" type="text" class="form-control" placeholder="Ketik nama santri..." />
        </div>
        <div class="col-12 col-md-3">
          <button @click="resetFilters" class="btn btn-outline-secondary w-100">
            Reset Filter
          </button>
        </div>
      </div>
    </div>

    <!-- Student Progress List / Real-Time Progress Meter -->
    <div class="card shadow-sm border-0 mb-4 overflow-hidden">
      <div class="card-header bg-label-primary py-3">
        <h5 class="mb-0 text-primary fw-bold d-flex align-items-center gap-2">
          <AwardIcon :size="18" /> Capaian Hafalan Tertinggi Santri (Real-Time)
        </h5>
      </div>
      <div class="card-body p-4">
        <div class="row g-4">
          <div v-for="student in studentProgress" :key="student.id" class="col-12 col-md-6 col-lg-4">
            <div class="border rounded p-3 bg-light-card">
              <div class="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <h6 class="fw-bold mb-1 text-heading">{{ student.nama }}</h6>
                  <span class="badge bg-label-info badge-custom text-xs py-1">{{ getClassName(student.kelas_id) }}</span>
                </div>
                <div class="text-end">
                  <span class="text-xs text-muted d-block">Terakhir Setor</span>
                  <span class="fw-bold text-primary" style="font-size: 0.95rem">Bait {{ student.highestBait }}</span>
                </div>
              </div>
              
              <!-- Progress Bar -->
              <div class="progress mb-2" style="height: 10px;">
                <!-- Assume target bait is 100 for visual progress percent representation -->
                <div 
                  class="progress-bar bg-success" 
                  role="progressbar" 
                  :style="{ width: Math.min((student.highestBait / 100) * 100, 100) + '%' }"
                  aria-valuemin="0" 
                  aria-valuemax="100"
                ></div>
              </div>
              <div class="d-flex justify-content-between text-xs text-muted">
                <span>Progress: {{ Math.min(student.highestBait, 100) }}% (Est. 100 Bait)</span>
                <span>Setoran: {{ student.setoranCount }}x</span>
              </div>
            </div>
          </div>
          <div v-if="studentProgress.length === 0" class="col-12 text-center py-4 text-muted">
            Tidak ada data progres hafalan santri yang cocok dengan filter.
          </div>
        </div>
      </div>
    </div>

    <!-- Historical setoran log table -->
    <div class="card shadow-sm border-0 overflow-hidden">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h5 class="mb-0">Histori Rincian Setoran Masuk</h5>
        <button @click="exportToExcel" class="btn btn-sm btn-outline-success d-flex align-items-center gap-1">
          <DownloadIcon :size="14" /> Export Excel
        </button>
      </div>
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead>
            <tr>
              <th>No</th>
              <th>Nama Santri</th>
              <th>Kelas</th>
              <th>Bait Hafalan</th>
              <th>Penerima (Ustadz)</th>
              <th>Tanggal</th>
              <th>Catatan / Kelancaran</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(nd, idx) in filteredSetorans" :key="nd.id">
              <td>{{ idx + 1 }}</td>
              <td>
                <div class="fw-bold text-heading">{{ getStudentName(nd.student_id) }}</div>
              </td>
              <td>
                <span class="badge bg-label-info badge-custom text-xs">{{ getClassName(nd.kelas_id) }}</span>
              </td>
              <td>
                <span class="badge bg-label-success badge-custom text-xs fw-bold">
                  Bait {{ nd.bait_awal }} - {{ nd.bait_akhir }}
                </span>
              </td>
              <td class="text-xs text-muted">{{ getUstadzName(nd.ustadz_id) }}</td>
              <td class="text-xs text-muted">{{ nd.date }}</td>
              <td class="text-sm text-muted">
                {{ nd.notes || '-' }}
              </td>
            </tr>
            <tr v-if="filteredSetorans.length === 0">
              <td colspan="7" class="text-center py-4 text-muted">Tidak ada catatan setoran masuk.</td>
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
import { Award as AwardIcon, Download as DownloadIcon } from 'lucide-vue-next';

const selectedClass = ref('all');
const searchQuery = ref('');

const classes = computed(() => db.classes);

const getClassName = (id: string) => {
  return db.classes.find(c => c.id === id)?.nama || 'Kelas';
};

const getStudentName = (id: string) => {
  return db.students.find(s => s.id === id)?.nama || 'Santri';
};

const getUstadzName = (id: string) => {
  return db.profiles.find(p => p.id === id)?.nama || 'Ustadz';
};

const filteredSetorans = computed(() => {
  return db.nadhomanSetorans.filter(nd => {
    if (selectedClass.value !== 'all' && nd.kelas_id !== selectedClass.value) {
      return false;
    }
    const stdName = getStudentName(nd.student_id).toLowerCase();
    if (searchQuery.value && !stdName.includes(searchQuery.value.toLowerCase())) {
      return false;
    }
    return true;
  }).sort((a, b) => b.date.localeCompare(a.date));
});

// Highest memorized bait progress per student
const studentProgress = computed(() => {
  const studentsFiltered = db.students.filter(std => {
    if (selectedClass.value !== 'all' && std.kelas_id !== selectedClass.value) {
      return false;
    }
    if (searchQuery.value && !std.nama.toLowerCase().includes(searchQuery.value.toLowerCase())) {
      return false;
    }
    return true;
  });

  return studentsFiltered.map(std => {
    const studentSetorans = db.nadhomanSetorans.filter(nd => nd.student_id === std.id);
    let highestBait = 0;
    studentSetorans.forEach(nd => {
      if (nd.bait_akhir > highestBait) {
        highestBait = nd.bait_akhir;
      }
    });

    return {
      id: std.id,
      nama: std.nama,
      kelas_id: std.kelas_id,
      highestBait,
      setoranCount: studentSetorans.length
    };
  }).sort((a, b) => b.highestBait - a.highestBait);
});

const resetFilters = () => {
  selectedClass.value = 'all';
  searchQuery.value = '';
};

const exportToExcel = () => {
  const mapped = filteredSetorans.value.map((rec, idx) => ({
    No: idx + 1,
    'Nama Santri': getStudentName(rec.student_id),
    Kelas: getClassName(rec.kelas_id),
    'Bait Mulai': rec.bait_awal,
    'Bait Akhir': rec.bait_akhir,
    Penerima: getUstadzName(rec.ustadz_id),
    Tanggal: rec.date,
    Catatan: rec.notes || '-'
  }));

  const worksheet = XLSX.utils.json_to_sheet(mapped);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Rekap Nadhoman');
  XLSX.writeFile(workbook, `Rekapan_Setoran_Nadhoman_${new Date().toISOString().slice(0, 10)}.xlsx`);
};
</script>

<style scoped>
.bg-light-card {
  background-color: var(--bg-app);
  border: 1px solid var(--border-color) !important;
}
.bg-label-primary {
  background-color: var(--primary-light);
  color: var(--primary);
}
.bg-label-info {
  background-color: rgba(3, 195, 236, 0.16);
  color: var(--info);
}
.bg-label-success {
  background-color: rgba(113, 221, 55, 0.16);
  color: var(--success);
}
</style>
