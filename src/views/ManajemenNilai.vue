<template>
  <div>
    <div class="row mb-4 g-4">
      <div class="col-12 col-lg-8">
        <div class="card p-4 border-0 shadow-sm h-100 d-flex justify-content-center">
          <h4 class="mb-2 text-heading fw-bold">Manajemen Penilaian Akademik</h4>
          <p class="text-muted mb-0">Input nilai tamrin (tugas/harian) dan ujian semester santri dengan perhitungan nilai akhir & predikat secara otomatis dan real-time.</p>
        </div>
      </div>
      <div class="col-12 col-lg-4">
        <div class="card p-4 border-0 shadow-sm bg-success text-white h-100">
          <h6 class="fw-bold mb-3 d-flex align-items-center gap-2">
            <span>🎓</span> Aturan & Ketentuan Penilaian Detail
          </h6>
          <div class="small opacity-90">
            <!-- Persentase Formula -->
            <div class="mb-3">
              <span class="fw-bold d-block text-xs uppercase tracking-wider mb-1 text-white-50" style="font-size: 0.7rem;">Komposisi Nilai Akhir (NA):</span>
              <div class="d-flex justify-content-between mb-1 border-bottom border-white-10 pb-1">
                <span>Nilai Tamrin (Harian/Tugas)</span>
                <span class="fw-bold">40%</span>
              </div>
              <div class="d-flex justify-content-between mb-1 border-bottom border-white-10 pb-1">
                <span>Nilai Semester (Ujian Akhir)</span>
                <span class="fw-bold">60%</span>
              </div>
              <div class="bg-success-dark p-2 rounded text-xs mt-1 font-monospace" style="background-color: rgba(0,0,0,0.15);">
                Formula: NA = (Tamrin × 0.4) + (Semester × 0.6)
              </div>
            </div>

            <!-- Batas Kelulusan -->
            <div class="mb-3">
              <span class="fw-bold d-block text-xs uppercase tracking-wider mb-1 text-white-50" style="font-size: 0.7rem;">Kriteria Kelulusan:</span>
              <div class="d-flex justify-content-between align-items-center">
                <span>Standar Minimal Kelulusan</span>
                <span class="fw-bold text-success bg-white px-2 py-0.5 rounded text-xs">Nilai Akhir ≥ 65</span>
              </div>
            </div>

            <!-- Skala Predikat & Keterangan -->
            <div>
              <span class="fw-bold d-block text-xs uppercase tracking-wider mb-2 text-white-50" style="font-size: 0.7rem;">Konversi Predikat & Keterangan:</span>
              <div class="d-flex flex-column gap-1" style="font-size: 0.8rem;">
                <div class="d-flex justify-content-between align-items-center">
                  <span class="badge bg-white text-success fw-bold text-center" style="width: 24px; padding: 0.25rem 0;">A</span>
                  <span class="flex-grow-1 ms-2">85 - 100</span>
                  <span class="fw-semibold">Istimewa (Mumtaz)</span>
                </div>
                <div class="d-flex justify-content-between align-items-center">
                  <span class="badge bg-white text-success fw-bold text-center" style="width: 24px; padding: 0.25rem 0;">B</span>
                  <span class="flex-grow-1 ms-2">75 - 84</span>
                  <span class="fw-semibold">Sangat Baik (Jayyid J.)</span>
                </div>
                <div class="d-flex justify-content-between align-items-center">
                  <span class="badge bg-white text-success fw-bold text-center" style="width: 24px; padding: 0.25rem 0;">C</span>
                  <span class="flex-grow-1 ms-2">65 - 74</span>
                  <span class="fw-semibold">Baik (Jayyid)</span>
                </div>
                <div class="d-flex justify-content-between align-items-center">
                  <span class="badge bg-white text-success fw-bold text-center opacity-75" style="width: 24px; padding: 0.25rem 0; color: #15a662 !important;">D</span>
                  <span class="flex-grow-1 ms-2">50 - 64</span>
                  <span class="fw-semibold text-warning-light">Cukup (Maqbul)</span>
                </div>
                <div class="d-flex justify-content-between align-items-center">
                  <span class="badge bg-danger text-white fw-bold text-center" style="width: 24px; padding: 0.25rem 0;">E</span>
                  <span class="flex-grow-1 ms-2">&lt; 50</span>
                  <span class="fw-semibold text-warning">Kurang / Rosif</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filter Penilaian -->
    <div class="card shadow-sm border-0 mb-4 p-4">
      <div class="row g-3 align-items-end">
        <div class="col-12 col-md-4">
          <label class="form-label small fw-semibold">Pilih Mata Pelajaran (Kitab)</label>
          <select v-model="selectedSubject" class="form-select" @change="loadGrades">
            <option value="">-- Pilih Kitab --</option>
            <option v-for="sub in subjects" :key="sub.id" :value="sub.id">
              {{ sub.nama }}
            </option>
          </select>
        </div>
        <div class="col-12 col-md-4">
          <label class="form-label small fw-semibold">Pilih Kelas</label>
          <select v-model="selectedClass" class="form-select" @change="loadGrades">
            <option value="">-- Pilih Kelas --</option>
            <option v-for="cls in classes" :key="cls.id" :value="cls.id">
              {{ cls.nama }}
            </option>
          </select>
        </div>
        <div class="col-12 col-md-4" v-if="selectedSubject && selectedClass">
          <div class="d-flex gap-2">
            <button @click="exportToExcel" class="btn btn-outline-success w-50 d-flex align-items-center justify-content-center gap-1">
              <DownloadIcon :size="14" /> Excel
            </button>
            <button @click="printPDF" class="btn btn-outline-danger w-50 d-flex align-items-center justify-content-center gap-1">
              <PrinterIcon :size="14" /> PDF / Cetak
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Grades Input Table -->
    <div v-if="selectedSubject && selectedClass" class="card shadow-sm border-0 overflow-hidden">
      <div class="card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
        <h5 class="mb-0">Lembar Penilaian: <strong class="text-primary">{{ getSubjectName(selectedSubject) }}</strong> &mdash; <strong>{{ getClassName(selectedClass) }}</strong></h5>
        <span class="badge bg-label-primary badge-custom">{{ studentsList.length }} Santri</span>
      </div>

      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0" id="grades-table-print">
          <thead>
            <tr>
              <th style="width: 60px">No</th>
              <th style="width: 120px">No. Urut</th>
              <th>Nama Lengkap Santri</th>
              <th style="width: 150px">Nilai Tamrin (40%)</th>
              <th style="width: 150px">Nilai Semester (60%)</th>
              <th style="width: 120px; text-align: center">Nilai Akhir</th>
              <th style="width: 100px; text-align: center">Predikat</th>
              <th style="width: 150px">Status Kelulusan</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="(student, idx) in studentsList" :key="student.id">
              <tr v-if="gradesMap[student.id]">
                <td>{{ idx + 1 }}</td>
                <td class="fw-semibold text-xs">{{ student.nis }}</td>
                <td>
                  <div class="fw-bold text-heading">{{ student.nama }}</div>
                </td>
                <td>
                  <input 
                    type="number" 
                    min="0" 
                    max="100" 
                    v-model.number="gradesMap[student.id].tamrin_score" 
                    @input="recalculateGrade(student.id)"
                    class="form-control" 
                    placeholder="0 - 100"
                  />
                </td>
                <td>
                  <input 
                    type="number" 
                    min="0" 
                    max="100" 
                    v-model.number="gradesMap[student.id].semester_score" 
                    @input="recalculateGrade(student.id)"
                    class="form-control" 
                    placeholder="0 - 100"
                  />
                </td>
                <td class="text-center">
                  <span class="fw-bold fs-5 text-dark">
                    {{ gradesMap[student.id].final_score }}
                  </span>
                </td>
                <td class="text-center">
                  <span :class="getPredikatClass(gradesMap[student.id].predikat)" class="badge badge-custom px-3 py-1 fw-bold fs-7">
                    {{ gradesMap[student.id].predikat }}
                  </span>
                </td>
                <td>
                  <span v-if="gradesMap[student.id].final_score >= 65" class="badge bg-success text-white">LULUS (MUMTAZ)</span>
                  <span v-else class="badge bg-danger text-white">BELUM LULUS (ROSIF)</span>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <!-- Action Footer -->
      <div class="card-footer bg-light border-top p-4 d-flex justify-content-end gap-2">
        <button @click="saveGrades" class="btn btn-primary d-flex align-items-center gap-2">
          <SaveIcon :size="18" /> Simpan & Sinkronisasi Real-Time
        </button>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="card border-0 shadow-sm p-5 text-center text-muted">
      <div class="mb-3 text-secondary">
        <FileSpreadsheetIcon :size="48" />
      </div>
      <h5>Silakan pilih mata pelajaran (kitab) dan kelas</h5>
      <p class="mb-0 small">Formulir penilaian santri akan dimuat di sini secara otomatis.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { db } from '../database';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  FileSpreadsheet as FileSpreadsheetIcon, 
  Save as SaveIcon, 
  Download as DownloadIcon, 
  Printer as PrinterIcon
} from 'lucide-vue-next';

const selectedSubject = ref('');
const selectedClass = ref('');

// Grades mapping state: student_id -> { tamrin_score: number, semester_score: number, final_score: number, predikat: string }
const gradesMap = ref<Record<string, { tamrin_score: number; semester_score: number; final_score: number; predikat: 'A' | 'B' | 'C' | 'D' | 'E' }>>({});

const subjects = computed(() => db.subjects);
const classes = computed(() => db.classes);

const studentsList = computed(() => {
  if (!selectedClass.value) return [];
  return db.students.filter(s => s.kelas_id === selectedClass.value);
});

const getSubjectName = (id: string) => {
  return db.subjects.find(s => s.id === id)?.nama || 'Kitab';
};

const getClassName = (id: string) => {
  return db.classes.find(c => c.id === id)?.nama || 'Kelas';
};

const loadGrades = () => {
  if (!selectedSubject.value || !selectedClass.value) return;

  const list = studentsList.value;
  const tempMap: Record<string, { tamrin_score: number; semester_score: number; final_score: number; predikat: 'A' | 'B' | 'C' | 'D' | 'E' }> = {};

  list.forEach(student => {
    // Find existing grade in DB
    const existing = db.grades.find(g => 
      g.student_id === student.id && 
      g.subject_id === selectedSubject.value && 
      g.kelas_id === selectedClass.value
    );

    tempMap[student.id] = {
      tamrin_score: existing ? existing.tamrin_score : 0,
      semester_score: existing ? existing.semester_score : 0,
      final_score: existing ? existing.final_score : 0,
      predikat: existing ? existing.predikat : 'E'
    };
  });

  gradesMap.value = tempMap;
};

// Auto-load grades when subject or class changes
watch([selectedSubject, selectedClass], () => {
  loadGrades();
}, { immediate: true });

const recalculateGrade = (studentId: string) => {
  const score = gradesMap.value[studentId];
  if (!score) return;

  // Formula: Final score is 40% Tamrin + 60% Semester
  const final = Math.round((score.tamrin_score * 0.4) + (score.semester_score * 0.6));
  score.final_score = final;

  let pred: 'A' | 'B' | 'C' | 'D' | 'E' = 'E';
  if (final >= 85) pred = 'A';
  else if (final >= 75) pred = 'B';
  else if (final >= 65) pred = 'C';
  else if (final >= 50) pred = 'D';

  score.predikat = pred;
};

const getPredikatClass = (pred: string) => {
  if (pred === 'A') return 'badge-success';
  if (pred === 'B') return 'badge-primary';
  if (pred === 'C') return 'badge-info';
  if (pred === 'D') return 'badge-warning';
  return 'badge-danger';
};

const saveGrades = () => {
  if (!selectedSubject.value || !selectedClass.value) return;

  studentsList.value.forEach(student => {
    const mapVal = gradesMap.value[student.id];
    if (mapVal) {
      db.saveGrade({
        student_id: student.id,
        subject_id: selectedSubject.value,
        kelas_id: selectedClass.value,
        tamrin_score: mapVal.tamrin_score,
        semester_score: mapVal.semester_score,
        created_by: db.session.currentUser?.id || 'prof-1',
        date_input: new Date().toISOString().slice(0, 10)
      });
    }
  });

  Swal.fire({
    icon: 'success',
    title: 'Penilaian Disimpan',
    text: 'Nilai akhir & predikat santri berhasil diperbarui di Supabase.',
    confirmButtonColor: 'var(--primary)'
  });
};

const exportToExcel = () => {
  const data = studentsList.value.map((student, idx) => {
    const mapVal = gradesMap.value[student.id];
    return {
      No: idx + 1,
      NIS: student.nis,
      'Nama Lengkap': student.nama,
      'Nilai Tamrin (40%)': mapVal?.tamrin_score || 0,
      'Nilai Semester (60%)': mapVal?.semester_score || 0,
      'Nilai Akhir': mapVal?.final_score || 0,
      Predikat: mapVal?.predikat || 'E',
      Kelulusan: (mapVal?.final_score || 0) >= 65 ? 'LULUS' : 'BELUM LULUS'
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Penilaian Santri');
  XLSX.writeFile(workbook, `Nilai_${getSubjectName(selectedSubject.value)}_${getClassName(selectedClass.value)}.xlsx`);
};

const printPDF = () => {
  const doc = new jsPDF();
  doc.setFont('Helvetica', 'bold');
  doc.text('MADRASAH DINIYAH PANCASILA SALATIGA', 14, 15);
  doc.setFontSize(10);
  doc.setFont('Helvetica', 'normal');
  doc.text(`REKAP PENILAIAN KITAB: ${getSubjectName(selectedSubject.value).toUpperCase()}`, 14, 22);
  doc.text(`KELAS: ${getClassName(selectedClass.value).toUpperCase()} | SEMESTER GANJIL`, 14, 27);
  doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`, 14, 32);
  doc.line(14, 35, 196, 35);

  const tableData = studentsList.value.map((student, idx) => {
    const mapVal = gradesMap.value[student.id];
    return [
      idx + 1,
      student.nis,
      student.nama,
      mapVal?.tamrin_score || 0,
      mapVal?.semester_score || 0,
      mapVal?.final_score || 0,
      mapVal?.predikat || 'E',
      (mapVal?.final_score || 0) >= 65 ? 'LULUS' : 'BELUM LULUS'
    ];
  });

  autoTable(doc, {
    startY: 38,
    head: [['No', 'NIS', 'Nama Santri', 'Tamrin', 'Semester', 'Akhir', 'Predikat', 'Status']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [15, 166, 98] }
  });

  doc.save(`Rekap_Nilai_${getSubjectName(selectedSubject.value)}_${getClassName(selectedClass.value)}.pdf`);
};


</script>

<style scoped>
.bg-label-primary {
  background-color: var(--primary-light);
  color: var(--primary);
}
</style>
