<template>
  <div>
    <div class="row mb-4">
      <div class="col-12">
        <div class="card p-4 border-0 shadow-sm">
          <h4 class="mb-1 text-heading">Pusat Laporan & Ekspor Data</h4>
          <p class="text-muted mb-0">Cetak rekapitulasi nilai harian, rekapitulasi absensi bulanan, serta jurnal realisasi mengajar kelas.</p>
        </div>
      </div>
    </div>

    <!-- Tab navigation -->
    <div class="card shadow-sm border-0 mb-4 p-2">
      <ul class="nav nav-pills d-flex flex-wrap gap-2 justify-content-center justify-content-md-start">
        <li class="nav-item">
          <button 
            @click="activeTab = 'nilai'" 
            class="nav-link py-2 px-4" 
            :class="activeTab === 'nilai' ? 'active btn-primary' : 'text-secondary bg-transparent border-0'"
          >
            Laporan Nilai
          </button>
        </li>
        <li class="nav-item">
          <button 
            @click="activeTab = 'absensi'" 
            class="nav-link py-2 px-4" 
            :class="activeTab === 'absensi' ? 'active btn-primary' : 'text-secondary bg-transparent border-0'"
          >
            Laporan Absensi
          </button>
        </li>
        <li class="nav-item">
          <button 
            @click="activeTab = 'jurnal'" 
            class="nav-link py-2 px-4" 
            :class="activeTab === 'jurnal' ? 'active btn-primary' : 'text-secondary bg-transparent border-0'"
          >
            Laporan Jurnal Mengajar
          </button>
        </li>
      </ul>
    </div>

    <!-- Active Tab Content -->
    <div>
      <!-- 1. LAPORAN NILAI -->
      <div v-if="activeTab === 'nilai'">
        <!-- Filters -->
        <div class="card shadow-sm border-0 mb-4 p-4">
          <div class="row g-3 align-items-end">
            <div class="col-12 col-md-4">
              <label class="form-label small fw-semibold">Pilih Kelas</label>
              <select v-model="filterNilai.class_id" class="form-select">
                <option value="">-- Pilih Kelas --</option>
                <option v-for="c in classes" :key="c.id" :value="c.id">{{ c.nama }}</option>
              </select>
            </div>
            <div class="col-12 col-md-4">
              <label class="form-label small fw-semibold">Pilih Mata Pelajaran (Kitab)</label>
              <select v-model="filterNilai.subject_id" class="form-select">
                <option value="">-- Pilih Kitab --</option>
                <option v-for="s in subjects" :key="s.id" :value="s.id">{{ s.nama }}</option>
              </select>
            </div>
            <div class="col-12 col-md-4" v-if="filterNilai.class_id && filterNilai.subject_id">
              <div class="d-flex gap-2">
                <button @click="exportNilaiExcel" class="btn btn-outline-success w-50">
                  <DownloadIcon :size="14" /> Export Excel
                </button>
                <button @click="exportNilaiPDF" class="btn btn-outline-danger w-50">
                  <PrinterIcon :size="14" /> Cetak PDF
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Report Table -->
        <div v-if="filterNilai.class_id && filterNilai.subject_id" class="card shadow-sm border-0 overflow-hidden">
          <div class="card-header bg-label-primary py-3">
            <h5 class="mb-0 text-primary font-bold">Laporan Nilai - {{ getSubjectName(filterNilai.subject_id) }} - {{ getClassName(filterNilai.class_id) }}</h5>
          </div>
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th>No</th>
                  <th>NIS</th>
                  <th>Nama Lengkap</th>
                  <th>Nilai Tamrin (40%)</th>
                  <th>Nilai Semester (60%)</th>
                  <th>Nilai Akhir</th>
                  <th>Predikat</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, idx) in reportNilaiData" :key="row.student_id">
                  <td>{{ idx + 1 }}</td>
                  <td class="fw-semibold text-xs">{{ row.nis }}</td>
                  <td>
                    <div class="fw-bold text-heading">{{ row.nama }}</div>
                  </td>
                  <td>{{ row.tamrin }}</td>
                  <td>{{ row.semester }}</td>
                  <td><strong class="text-dark">{{ row.akhir }}</strong></td>
                  <td>
                    <span :class="getPredikatClass(row.predikat)" class="badge badge-custom px-2 py-1">
                      {{ row.predikat }}
                    </span>
                  </td>
                  <td>
                    <span v-if="row.akhir >= 65" class="badge bg-success text-white">LULUS</span>
                    <span v-else class="badge bg-danger text-white">BELUM LULUS</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div v-else class="card border-0 shadow-sm p-5 text-center text-muted">
          <FileSpreadsheetIcon :size="48" class="text-secondary mb-2" />
          <h5>Pilih kelas dan mata pelajaran untuk membuat laporan nilai.</h5>
        </div>
      </div>

      <!-- 2. LAPORAN ABSENSI -->
      <div v-if="activeTab === 'absensi'">
        <!-- Filters -->
        <div class="card shadow-sm border-0 mb-4 p-4">
          <div class="row g-3 align-items-end">
            <div class="col-12 col-md-3">
              <label class="form-label small fw-semibold">Pilih Kelas</label>
              <select v-model="filterAbsen.class_id" class="form-select">
                <option value="all">-- Semua Kelas --</option>
                <option v-for="c in classes" :key="c.id" :value="c.id">{{ c.nama }}</option>
              </select>
            </div>
            <div class="col-12 col-md-3">
              <label class="form-label small fw-semibold">Mulai Tanggal</label>
              <input v-model="filterAbsen.startDate" type="date" class="form-control" />
            </div>
            <div class="col-12 col-md-3">
              <label class="form-label small fw-semibold">Selesai Tanggal</label>
              <input v-model="filterAbsen.endDate" type="date" class="form-control" />
            </div>
            <div class="col-12 col-md-3">
              <div class="d-flex gap-2">
                <button @click="exportAbsenExcel" class="btn btn-outline-success w-50">Excel</button>
                <button @click="exportAbsenPDF" class="btn btn-outline-danger w-50">PDF</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Report Table -->
        <div class="card shadow-sm border-0 overflow-hidden">
          <div class="card-header bg-label-success py-3">
            <h5 class="mb-0 text-success font-bold">Laporan Kehadiran Santri</h5>
          </div>
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Nama Santri</th>
                  <th>Kelas</th>
                  <th>Tanggal</th>
                  <th>Status</th>
                  <th>Catatan</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(rec, idx) in reportAbsenData" :key="rec.id">
                  <td>{{ idx + 1 }}</td>
                  <td>
                    <div class="fw-bold text-heading">{{ rec.person_name }}</div>
                  </td>
                  <td>
                    <span class="badge bg-label-info badge-custom text-xs">{{ getClassName(rec.kelas_id) }}</span>
                  </td>
                  <td class="text-xs text-muted">{{ rec.date }}</td>
                  <td>
                    <span :class="getStatusClass(rec.status)" class="badge badge-custom py-1">
                      {{ rec.status }}
                    </span>
                  </td>
                  <td class="text-sm text-muted">{{ rec.notes || '-' }}</td>
                </tr>
                <tr v-if="reportAbsenData.length === 0">
                  <td colspan="6" class="text-center py-4 text-muted">Tidak ada data absensi untuk filter terpilih.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- 3. LAPORAN JURNAL MENGAJAR -->
      <div v-if="activeTab === 'jurnal'">
        <!-- Filters -->
        <div class="card shadow-sm border-0 mb-4 p-4">
          <div class="row g-3 align-items-end">
            <div class="col-12 col-md-4">
              <label class="form-label small fw-semibold">Mulai Tanggal</label>
              <input v-model="filterJurnal.startDate" type="date" class="form-control" />
            </div>
            <div class="col-12 col-md-4">
              <label class="form-label small fw-semibold">Selesai Tanggal</label>
              <input v-model="filterJurnal.endDate" type="date" class="form-control" />
            </div>
            <div class="col-12 col-md-4">
              <div class="d-flex gap-2">
                <button @click="exportJurnalExcel" class="btn btn-outline-success w-50">Excel</button>
                <button @click="exportJurnalPDF" class="btn btn-outline-danger w-50">PDF</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Report Table -->
        <div class="card shadow-sm border-0 overflow-hidden">
          <div class="card-header bg-label-primary py-3">
            <h5 class="mb-0 text-primary font-bold">Laporan Realisasi Jurnal Mengajar Ustadz</h5>
          </div>
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Tanggal</th>
                  <th>Nama Pengajar</th>
                  <th>Kitab</th>
                  <th>Kelas</th>
                  <th>Materi Terlaksana</th>
                  <th>Absen Santri</th>
                  <th>Hambatan / Catatan</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(rec, idx) in reportJurnalData" :key="rec.id">
                  <td>{{ idx + 1 }}</td>
                  <td class="text-xs text-muted font-bold">{{ rec.date }}</td>
                  <td class="fw-bold text-heading">{{ getUstadzName(rec.ustadz_id) }}</td>
                  <td class="text-primary fw-semibold">{{ getSubjectName(rec.subject_id) }}</td>
                  <td>
                    <span class="badge bg-label-info badge-custom text-xs">{{ getClassName(rec.class_id) }}</span>
                  </td>
                  <td class="fw-bold text-dark">{{ rec.materi_diajarkan }}</td>
                  <td>
                    <span class="badge bg-label-success badge-custom text-xs">{{ rec.kehadiran_summary }}</span>
                  </td>
                  <td class="text-sm text-muted">{{ rec.notes || '-' }}</td>
                </tr>
                <tr v-if="reportJurnalData.length === 0">
                  <td colspan="8" class="text-center py-4 text-muted">Tidak ada data jurnal mengajar untuk filter terpilih.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { db } from '../database';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  FileSpreadsheet as FileSpreadsheetIcon, 
  Download as DownloadIcon, 
  Printer as PrinterIcon 
} from 'lucide-vue-next';

const activeTab = ref('nilai');

const classes = computed(() => db.classes);
const subjects = computed(() => db.subjects);

const getClassName = (id?: string) => {
  if (!id) return '-';
  return db.classes.find(c => c.id === id)?.nama || 'Kelas';
};

const getSubjectName = (id: string) => {
  return db.subjects.find(s => s.id === id)?.nama || 'Kitab';
};

const getUstadzName = (id: string) => {
  return db.profiles.find(p => p.id === id)?.nama || 'Ustadz';
};

// 1. LAPORAN NILAI DATA BUILDER
const filterNilai = ref({ class_id: '', subject_id: '' });

const reportNilaiData = computed(() => {
  if (!filterNilai.value.class_id || !filterNilai.value.subject_id) return [];
  
  const classStudents = db.students.filter(s => s.kelas_id === filterNilai.value.class_id);
  const sortedStudents = [...classStudents].sort((a, b) => {
    const nisA = String(a.nis || '');
    const nisB = String(b.nis || '');
    const numA = parseInt(nisA.replace(/[^0-9]/g, ''), 10);
    const numB = parseInt(nisB.replace(/[^0-9]/g, ''), 10);
    if (!isNaN(numA) && !isNaN(numB)) {
      return numA - numB;
    }
    return nisA.localeCompare(nisB, undefined, { numeric: true, sensitivity: 'base' });
  });
  
  return sortedStudents.map(student => {
    const score = db.grades.find(g => 
      g.student_id === student.id && 
      g.subject_id === filterNilai.value.subject_id && 
      g.kelas_id === filterNilai.value.class_id
    );

    return {
      student_id: student.id,
      nis: student.nis,
      nama: student.nama,
      tamrin: score ? score.tamrin_score : 0,
      semester: score ? score.semester_score : 0,
      akhir: score ? score.final_score : 0,
      predikat: score ? score.predikat : 'E'
    };
  });
});

const getPredikatClass = (pred: string) => {
  if (pred === 'A') return 'badge-success';
  if (pred === 'B') return 'badge-primary';
  if (pred === 'C') return 'badge-info';
  if (pred === 'D') return 'badge-warning';
  return 'badge-danger';
};

// 2. LAPORAN ABSENSI DATA BUILDER
const filterAbsen = ref({
  class_id: 'all',
  startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10), // 30 days ago
  endDate: new Date().toISOString().slice(0, 10)
});

const reportAbsenData = computed(() => {
  return db.attendance.filter(a => {
    if (a.role !== 'Santri') return false;
    if (filterAbsen.value.class_id !== 'all' && a.kelas_id !== filterAbsen.value.class_id) return false;
    if (filterAbsen.value.startDate && a.date < filterAbsen.value.startDate) return false;
    if (filterAbsen.value.endDate && a.date > filterAbsen.value.endDate) return false;
    return true;
  }).sort((a, b) => b.date.localeCompare(a.date));
});

const getStatusClass = (status: string) => {
  if (status === 'Hadir') return 'badge-success';
  if (status === 'Izin') return 'badge-warning';
  if (status === 'Sakit') return 'badge-info';
  return 'badge-danger';
};

// 3. LAPORAN JURNAL DATA BUILDER
const filterJurnal = ref({
  startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  endDate: new Date().toISOString().slice(0, 10)
});

const reportJurnalData = computed(() => {
  return db.teachingJournals.filter(jr => {
    if (filterJurnal.value.startDate && jr.date < filterJurnal.value.startDate) return false;
    if (filterJurnal.value.endDate && jr.date > filterJurnal.value.endDate) return false;
    return true;
  }).sort((a, b) => b.date.localeCompare(a.date));
});

// EXPORTS FOR TAB 1 (NILAI)
const exportNilaiExcel = () => {
  const mapped = reportNilaiData.value.map((row, idx) => ({
    No: idx + 1,
    NIS: row.nis,
    'Nama Santri': row.nama,
    'Nilai Tamrin (40%)': row.tamrin,
    'Nilai Semester (60%)': row.semester,
    'Nilai Akhir': row.akhir,
    Predikat: row.predikat,
    Kelulusan: row.akhir >= 65 ? 'LULUS' : 'BELUM LULUS'
  }));

  const worksheet = XLSX.utils.json_to_sheet(mapped);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan Nilai');
  XLSX.writeFile(workbook, `Laporan_Nilai_${getSubjectName(filterNilai.value.subject_id)}_${getClassName(filterNilai.value.class_id)}.xlsx`);
};

const exportNilaiPDF = () => {
  const doc = new jsPDF();
  doc.setFont('Helvetica', 'bold');
  doc.text('MADRASAH DINIYAH PANCASILA SALATIGA', 14, 15);
  doc.setFontSize(10);
  doc.setFont('Helvetica', 'normal');
  doc.text(`LAPORAN NILAI PENILAIAN AKADEMIK KITAB: ${getSubjectName(filterNilai.value.subject_id).toUpperCase()}`, 14, 22);
  doc.text(`KELAS: ${getClassName(filterNilai.value.class_id).toUpperCase()}`, 14, 27);
  doc.line(14, 32, 196, 32);

  const tableData = reportNilaiData.value.map((row, idx) => [
    idx + 1,
    row.nis,
    row.nama,
    row.tamrin,
    row.semester,
    row.akhir,
    row.predikat,
    row.akhir >= 65 ? 'LULUS' : 'BELUM LULUS'
  ]);

  autoTable(doc, {
    startY: 35,
    head: [['No', 'NIS', 'Nama Santri', 'Tamrin', 'Semester', 'Akhir', 'Predikat', 'Status']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [105, 108, 255] }
  });

  doc.save(`Laporan_Nilai_${getSubjectName(filterNilai.value.subject_id)}_${getClassName(filterNilai.value.class_id)}.pdf`);
};

// EXPORTS FOR TAB 2 (ABSENSI)
const exportAbsenExcel = () => {
  const mapped = reportAbsenData.value.map((rec, idx) => ({
    No: idx + 1,
    'Nama Santri': rec.person_name,
    Kelas: getClassName(rec.kelas_id),
    Tanggal: rec.date,
    Status: rec.status,
    Catatan: rec.notes || '-'
  }));

  const worksheet = XLSX.utils.json_to_sheet(mapped);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan Absensi');
  XLSX.writeFile(workbook, `Laporan_Absensi_Santri_${filterAbsen.value.startDate}_s_d_${filterAbsen.value.endDate}.xlsx`);
};

const exportAbsenPDF = () => {
  const doc = new jsPDF();
  doc.setFont('Helvetica', 'bold');
  doc.text('MADRASAH DINIYAH PANCASILA SALATIGA', 14, 15);
  doc.setFontSize(10);
  doc.setFont('Helvetica', 'normal');
  doc.text(`LAPORAN REKAPITULASI KEHADIRAN SANTRI MADIN`, 14, 22);
  doc.text(`Periode: ${filterAbsen.value.startDate} s/d ${filterAbsen.value.endDate}`, 14, 27);
  doc.line(14, 32, 196, 32);

  const tableData = reportAbsenData.value.map((rec, idx) => [
    idx + 1,
    rec.person_name,
    getClassName(rec.kelas_id),
    rec.date,
    rec.status,
    rec.notes || '-'
  ]);

  autoTable(doc, {
    startY: 35,
    head: [['No', 'Nama Santri', 'Kelas', 'Tanggal', 'Status', 'Catatan']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [113, 221, 55] }
  });

  doc.save(`Laporan_Absensi_Santri_${filterAbsen.value.startDate}_ke_${filterAbsen.value.endDate}.pdf`);
};

// EXPORTS FOR TAB 3 (JURNAL)
const exportJurnalExcel = () => {
  const mapped = reportJurnalData.value.map((rec, idx) => ({
    No: idx + 1,
    Tanggal: rec.date,
    Pengajar: getUstadzName(rec.ustadz_id),
    Kitab: getSubjectName(rec.subject_id),
    Kelas: getClassName(rec.class_id),
    'Materi Diajarkan': rec.materi_diajarkan,
    Kehadiran: rec.kehadiran_summary,
    Catatan: rec.notes || '-'
  }));

  const worksheet = XLSX.utils.json_to_sheet(mapped);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan Jurnal Mengajar');
  XLSX.writeFile(workbook, `Laporan_Jurnal_Mengajar_${filterJurnal.value.startDate}_s_d_${filterJurnal.value.endDate}.xlsx`);
};

const exportJurnalPDF = () => {
  const doc = new jsPDF();
  doc.setFont('Helvetica', 'bold');
  doc.text('MADRASAH DINIYAH PANCASILA SALATIGA', 14, 15);
  doc.setFontSize(10);
  doc.setFont('Helvetica', 'normal');
  doc.text(`LAPORAN JURNAL REALISASI MENGAJAR USTADZ`, 14, 22);
  doc.text(`Periode: ${filterJurnal.value.startDate} s/d ${filterJurnal.value.endDate}`, 14, 27);
  doc.line(14, 32, 196, 32);

  const tableData = reportJurnalData.value.map((rec, idx) => [
    idx + 1,
    rec.date,
    getUstadzName(rec.ustadz_id),
    getSubjectName(rec.subject_id),
    getClassName(rec.class_id),
    rec.materi_diajarkan,
    rec.kehadiran_summary,
    rec.notes || '-'
  ]);

  autoTable(doc, {
    startY: 35,
    head: [['No', 'Tanggal', 'Pengajar', 'Kitab', 'Kelas', 'Materi', 'Absen', 'Catatan']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [3, 195, 236] }
  });

  doc.save(`Laporan_Jurnal_Mengajar_${filterJurnal.value.startDate}_ke_${filterJurnal.value.endDate}.pdf`);
};
</script>

<style scoped>
.bg-label-primary {
  background-color: var(--primary-light);
  color: var(--primary);
}
.bg-label-success {
  background-color: rgba(113, 221, 55, 0.16);
  color: var(--success);
}
.bg-label-info {
  background-color: rgba(3, 195, 236, 0.16);
  color: var(--info);
}
.bg-label-secondary {
  background-color: rgba(133, 146, 163, 0.16);
  color: var(--secondary);
}
</style>
