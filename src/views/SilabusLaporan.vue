<template>
  <div>
    <div class="row mb-4">
      <div class="col-12 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
        <div>
          <h4 class="mb-1 text-heading">Silabus & Laporan Jurnal Mengajar</h4>
          <p class="text-muted mb-0">Lihat target materi yang ditentukan Admin dan isi jurnal mengajar harian Anda.</p>
        </div>
        <div>
          <button @click="showAddJournalModal = true" class="btn btn-primary d-flex align-items-center gap-2">
            <PlusIcon :size="18" /> Isi Jurnal Mengajar Baru
          </button>
        </div>
      </div>
    </div>

    <!-- Syllabus Targets set by Admin -->
    <div class="card shadow-sm border-0 mb-4 overflow-hidden">
      <div class="card-header bg-label-primary py-3">
        <h5 class="mb-0 text-primary fw-bold d-flex align-items-center gap-2">
          <TargetIcon :size="18" /> Target Materi Pembelajaran Anda (Ditentukan Admin)
        </h5>
      </div>
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead>
            <tr>
              <th>No</th>
              <th>Nama Kitab (Mata Pelajaran)</th>
              <th>Kelas</th>
              <th>Target Materi Pembelajaran</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(syl, idx) in mySyllabus" :key="syl.id">
              <td>{{ idx + 1 }}</td>
              <td>
                <div class="fw-bold text-heading">{{ getSubjectName(syl.subject_id) }}</div>
              </td>
              <td>
                <span class="badge bg-label-info badge-custom text-xs">{{ getClassName(syl.class_id) }}</span>
              </td>
              <td class="fw-semibold text-dark">{{ syl.target_materi }}</td>
              <td>
                <span class="badge bg-success text-white">AKTIF</span>
              </td>
            </tr>
            <tr v-if="mySyllabus.length === 0">
              <td colspan="5" class="text-center py-4 text-muted">Belum ada target silabus materi yang ditentukan oleh Admin untuk Anda.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- History of Teaching Journals filled by Ustadz -->
    <div class="card shadow-sm border-0 overflow-hidden">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h5 class="mb-0">Histori Jurnal Mengajar Anda</h5>
        <span class="badge bg-label-secondary badge-custom">{{ myJournals.length }} Jurnal</span>
      </div>
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead>
            <tr>
              <th>No</th>
              <th>Tanggal</th>
              <th>Kitab</th>
              <th>Kelas</th>
              <th>Materi Yang Diajarkan</th>
              <th>Kehadiran Santri</th>
              <th>Catatan Tambahan</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(jr, idx) in myJournals" :key="jr.id">
              <td>{{ idx + 1 }}</td>
              <td class="text-xs text-muted fw-bold">{{ jr.date }}</td>
              <td>
                <div class="fw-bold text-heading">{{ getSubjectName(jr.subject_id) }}</div>
              </td>
              <td>
                <span class="badge bg-label-info badge-custom text-xs">{{ getClassName(jr.class_id) }}</span>
              </td>
              <td class="fw-semibold text-primary" style="font-size: 0.9rem">{{ jr.materi_diajarkan }}</td>
              <td>
                <span class="badge bg-label-success badge-custom text-xs">{{ jr.kehadiran_summary }}</span>
              </td>
              <td class="text-xs text-muted">{{ jr.notes || '-' }}</td>
            </tr>
            <tr v-if="myJournals.length === 0">
              <td colspan="7" class="text-center py-4 text-muted">Belum ada jurnal mengajar yang diisi. Silakan isi jurnal baru.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Dialog Modal: Add Teaching Journal -->
    <div v-if="showAddJournalModal" class="modal-backdrop">
      <div class="modal d-block" tabindex="-1" role="dialog" style="background: rgba(0,0,0,0.5)">
        <div class="modal-dialog modal-dialog-centered" role="document">
          <div class="modal-content card shadow-lg border-0">
            <div class="modal-header border-bottom py-3">
              <h5 class="modal-title fw-bold">Isi Jurnal Mengajar Baru</h5>
              <button type="button" class="btn-close" @click="showAddJournalModal = false"></button>
            </div>
            <div class="modal-body p-4">
              <form @submit.prevent="submitJournal">
                <!-- Date -->
                <div class="mb-3">
                  <label class="form-label small fw-semibold">Tanggal Mengajar</label>
                  <input v-model="journalForm.date" type="date" class="form-control" required />
                </div>
                <!-- Subject -->
                <div class="mb-3">
                  <label class="form-label small fw-semibold">Mata Pelajaran (Kitab)</label>
                  <select v-model="journalForm.subject_id" class="form-select" required>
                    <option value="">-- Pilih Kitab --</option>
                    <option v-for="sub in db.subjects" :key="sub.id" :value="sub.id">
                      {{ sub.nama }}
                    </option>
                  </select>
                </div>
                <!-- Class -->
                <div class="mb-3">
                  <label class="form-label small fw-semibold">Kelas</label>
                  <select v-model="journalForm.class_id" class="form-select" required>
                    <option value="">-- Pilih Kelas --</option>
                    <option v-for="cls in db.classes" :key="cls.id" :value="cls.id">
                      {{ cls.nama }}
                    </option>
                  </select>
                </div>
                <!-- Materi Diajarkan -->
                <div class="mb-3">
                  <label class="form-label small fw-semibold">Materi Yang Diajarkan</label>
                  <textarea v-model="journalForm.materi_diajarkan" class="form-control" rows="2" placeholder="Contoh: Bab Wudhu, Bait 1-5..." required></textarea>
                </div>
                <!-- Kehadiran Santri Summary -->
                <div class="mb-3">
                  <label class="form-label small fw-semibold">Kehadiran Santri (Ringkasan)</label>
                  <input v-model="journalForm.kehadiran_summary" type="text" class="form-control" placeholder="Contoh: 15/15 Santri Hadir" required />
                </div>
                <!-- Notes -->
                <div class="mb-3">
                  <label class="form-label small fw-semibold">Catatan / Hambatan Mengajar (Opsional)</label>
                  <input v-model="journalForm.notes" type="text" class="form-control" placeholder="Contoh: Kondusif, santri lancar membaca" />
                </div>

                <div class="d-flex justify-content-end gap-2 pt-3 border-top">
                  <button type="button" class="btn btn-outline-secondary" @click="showAddJournalModal = false">Batal</button>
                  <button type="submit" class="btn btn-primary">Simpan Jurnal</button>
                </div>
              </form>
            </div>
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
import { Plus as PlusIcon, Target as TargetIcon } from 'lucide-vue-next';

const showAddJournalModal = ref(false);

const currentUser = computed(() => db.session.currentUser);

const mySyllabus = computed(() => {
  if (!currentUser.value) return [];
  // Admin sees all targets, Ustadz only sees assigned targets
  if (currentUser.value?.role === 'Admin') {
    return db.syllabusTargets;
  }
  return db.syllabusTargets.filter(t => t.ustadz_id === currentUser.value?.id);
});

const myJournals = computed(() => {
  if (!currentUser.value) return [];
  if (currentUser.value?.role === 'Admin') {
    return db.teachingJournals;
  }
  return db.teachingJournals.filter(j => j.ustadz_id === currentUser.value?.id)
    .sort((a, b) => b.date.localeCompare(a.date));
});

const getSubjectName = (subId: string) => {
  return db.subjects.find(s => s.id === subId)?.nama || 'Kitab';
};

const getClassName = (clsId: string) => {
  return db.classes.find(c => c.id === clsId)?.nama || 'Kelas';
};

// Journal form state
const journalForm = ref({
  date: new Date().toISOString().slice(0, 10),
  subject_id: '',
  class_id: '',
  materi_diajarkan: '',
  kehadiran_summary: '',
  notes: ''
});

const submitJournal = () => {
  if (!currentUser.value) return;

  db.addTeachingJournal({
    date: journalForm.value.date,
    ustadz_id: currentUser.value.id,
    subject_id: journalForm.value.subject_id,
    class_id: journalForm.value.class_id,
    materi_diajarkan: journalForm.value.materi_diajarkan,
    kehadiran_summary: journalForm.value.kehadiran_summary,
    notes: journalForm.value.notes
  });

  showAddJournalModal.value = false;
  
  // Reset form
  journalForm.value = {
    date: new Date().toISOString().slice(0, 10),
    subject_id: '',
    class_id: '',
    materi_diajarkan: '',
    kehadiran_summary: '',
    notes: ''
  };

  Swal.fire({
    icon: 'success',
    title: 'Jurnal Berhasil Disimpan',
    text: 'Jurnal mengajar harian Anda telah tersimpan secara real-time ke database.',
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

.bg-label-success {
  background-color: rgba(113, 221, 55, 0.16);
  color: var(--success);
}

.bg-label-secondary {
  background-color: rgba(133, 146, 163, 0.16);
  color: var(--secondary);
}
</style>
