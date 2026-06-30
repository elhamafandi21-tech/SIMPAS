<template>
  <div>
    <div class="row mb-4">
      <div class="col-12">
        <div class="card p-4 border-0 shadow-sm">
          <h4 class="mb-1 text-heading">Setoran Hafalan Nadhoman</h4>
          <p class="text-muted mb-0">Catat perkembangan hafalan bait-bait nazhom santri harian secara langsung.</p>
        </div>
      </div>
    </div>

    <div class="row g-4">
      <!-- Form Card -->
      <div class="col-12 col-md-6 col-lg-5">
        <div class="card shadow-sm border-0 p-4">
          <h5 class="fw-bold text-heading mb-3 d-flex align-items-center gap-2">
            <BookmarkPlusIcon class="text-primary" :size="20" /> Catat Setoran Baru
          </h5>

          <form @submit.prevent="submitSetoran">
            <!-- Select Class first to filter Students -->
            <div class="mb-3">
              <label class="form-label small fw-semibold">Pilih Kelas</label>
              <select v-model="selectedClass" class="form-select" required @change="selectedStudent = ''">
                <option value="">-- Pilih Kelas Santri --</option>
                <option v-for="cls in classes" :key="cls.id" :value="cls.id">
                  {{ cls.nama }}
                </option>
              </select>
            </div>

            <!-- Select Student -->
            <div class="mb-3">
              <label class="form-label small fw-semibold">Pilih Nama Santri</label>
              <select v-model="selectedStudent" class="form-select" :disabled="!selectedClass" required>
                <option value="">-- Pilih Nama Santri --</option>
                <option v-for="std in students" :key="std.id" :value="std.id">
                  {{ std.nama }} ({{ std.nis }})
                </option>
              </select>
            </div>

            <!-- Bait range -->
            <div class="row g-2 mb-3">
              <div class="col-6">
                <label class="form-label small fw-semibold">Bait Awal</label>
                <input v-model.number="baitAwal" type="number" min="1" class="form-control" placeholder="Mulai" required />
              </div>
              <div class="col-6">
                <label class="form-label small fw-semibold">Bait Akhir</label>
                <input v-model.number="baitAkhir" type="number" min="1" class="form-control" placeholder="Selesai" required />
              </div>
            </div>

            <!-- Date of setoran -->
            <div class="mb-3">
              <label class="form-label small fw-semibold">Tanggal Setoran</label>
              <input v-model="setoranDate" type="date" class="form-control" required />
            </div>

            <!-- Notes -->
            <div class="mb-4">
              <label class="form-label small fw-semibold">Catatan Kelancaran / Tajwid</label>
              <input v-model="notes" type="text" class="form-control" placeholder="Contoh: Lancar, makhraj baik..." />
            </div>

            <button type="submit" class="btn btn-primary w-100 py-2 d-flex align-items-center justify-content-center gap-2" :disabled="!selectedStudent">
              <SaveIcon :size="18" /> Simpan Setoran Hafalan
            </button>
          </form>
        </div>
      </div>

      <!-- History / Info Card -->
      <div class="col-12 col-md-6 col-lg-7">
        <div class="card shadow-sm border-0 p-4 h-100">
          <h5 class="fw-bold text-heading mb-3">Histori Setoran Hari Ini</h5>
          
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th>Santri</th>
                  <th>Bait Setoran</th>
                  <th>Keterangan</th>
                  <th class="text-end">Aksi</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="nd in todaySetorans" :key="nd.id">
                  <td>
                    <div class="fw-bold text-heading text-sm">{{ getStudentName(nd.student_id) }}</div>
                    <span class="text-xs text-muted">{{ getClassName(nd.kelas_id) }}</span>
                  </td>
                  <td>
                    <span class="badge bg-label-primary badge-custom text-xs fw-bold">
                      Bait {{ nd.bait_awal }} - {{ nd.bait_akhir }}
                    </span>
                  </td>
                  <td class="text-xs text-muted">{{ nd.notes || '-' }}</td>
                  <td class="text-end">
                    <button @click="deleteSetoran(nd.id)" class="btn btn-sm btn-icon btn-outline-danger" title="Hapus Setoran">
                      <TrashIcon :size="14" />
                    </button>
                  </td>
                </tr>
                <tr v-if="todaySetorans.length === 0">
                  <td colspan="4" class="text-center py-4 text-muted small">Belum ada setoran hafalan nadhoman yang dicatat untuk hari ini.</td>
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
import Swal from 'sweetalert2';
import { BookmarkPlus as BookmarkPlusIcon, Save as SaveIcon, Trash as TrashIcon } from 'lucide-vue-next';

const selectedClass = ref('');
const selectedStudent = ref('');
const baitAwal = ref<number | null>(null);
const baitAkhir = ref<number | null>(null);
const setoranDate = ref(new Date().toISOString().slice(0, 10));
const notes = ref('');

const currentUser = computed(() => db.session.currentUser);

const classes = computed(() => db.classes);

const students = computed(() => {
  if (!selectedClass.value) return [];
  const list = db.students.filter(s => s.kelas_id === selectedClass.value);
  return list.sort((a, b) => {
    const nisA = String(a.nis || '');
    const nisB = String(b.nis || '');
    const numA = parseInt(nisA.replace(/[^0-9]/g, ''), 10);
    const numB = parseInt(nisB.replace(/[^0-9]/g, ''), 10);
    if (!isNaN(numA) && !isNaN(numB)) {
      return numA - numB;
    }
    return nisA.localeCompare(nisB, undefined, { numeric: true, sensitivity: 'base' });
  });
});

// Today's sector records
const todaySetorans = computed(() => {
  const today = new Date().toISOString().slice(0, 10);
  return db.nadhomanSetorans.filter(nd => nd.date === today).reverse();
});

const getStudentName = (id: string) => {
  return db.students.find(s => s.id === id)?.nama || 'Santri';
};

const getClassName = (id: string) => {
  return db.classes.find(c => c.id === id)?.nama || 'Kelas';
};

const submitSetoran = () => {
  if (!selectedStudent.value || baitAwal.value === null || baitAkhir.value === null) return;

  if (baitAkhir.value < baitAwal.value) {
    Swal.fire({
      icon: 'error',
      title: 'Bait Salah',
      text: 'Bait akhir harus lebih besar atau sama dengan bait awal!',
      confirmButtonColor: '#ff3e1d'
    });
    return;
  }

  db.addNadhomanSetoran({
    student_id: selectedStudent.value,
    kelas_id: selectedClass.value,
    bait_awal: baitAwal.value,
    bait_akhir: baitAkhir.value,
    date: setoranDate.value,
    ustadz_id: currentUser.value?.id || 'prof-1',
    notes: notes.value
  });

  // Reset inputs
  baitAwal.value = null;
  baitAkhir.value = null;
  notes.value = '';

  Swal.fire({
    icon: 'success',
    title: 'Hafalan Ditambahkan',
    text: 'Setoran nadhoman santri berhasil dicatat secara real-time!',
    confirmButtonColor: '#696cff'
  });
};

const deleteSetoran = (id: string) => {
  Swal.fire({
    title: 'Hapus Setoran',
    text: 'Apakah Anda yakin ingin menghapus catatan setoran nadhoman ini?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ff3e1d',
    cancelButtonColor: '#8592a3',
    confirmButtonText: 'Ya, Hapus',
    cancelButtonText: 'Batal'
  }).then((result) => {
    if (result.isConfirmed) {
      db.nadhomanSetorans = db.nadhomanSetorans.filter(nd => nd.id !== id);
      db.saveAll();
      Swal.fire({
        icon: 'success',
        title: 'Berhasil Dihapus',
        text: 'Catatan setoran nadhoman telah berhasil dihapus.',
        timer: 1000,
        showConfirmButton: false
      });
    }
  });
};
</script>

<style scoped>
.bg-label-primary {
  background-color: var(--primary-light);
  color: var(--primary);
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
