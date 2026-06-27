<template>
  <div>
    <div class="row mb-4">
      <div class="col-12 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
        <div>
          <h4 class="mb-1 text-heading">Penetapan Target Silabus Guru</h4>
          <p class="text-muted mb-0">Tentukan target materi pembelajaran (Kitab) untuk masing-masing ustadz/ustadzah harian.</p>
        </div>
        <div>
          <button @click="openAddModal" class="btn btn-primary d-flex align-items-center gap-2">
            <PlusIcon :size="18" /> Tambah Target Baru
          </button>
        </div>
      </div>
    </div>

    <!-- Syllabus List Card -->
    <div class="card shadow-sm border-0 overflow-hidden">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h5 class="mb-0">Daftar Target Pembelajaran Aktif</h5>
        <span class="badge bg-label-primary badge-custom">{{ syllabusList.length }} Silabus</span>
      </div>
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead>
            <tr>
              <th>No</th>
              <th>Nama Pengajar (Ustadz)</th>
              <th>Kitab (Mata Pelajaran)</th>
              <th>Kelas</th>
              <th>Target Materi Pembelajaran</th>
              <th class="text-end" style="width: 150px">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(syl, idx) in syllabusList" :key="syl.id">
              <td>{{ idx + 1 }}</td>
              <td>
                <div class="fw-bold text-heading">{{ getUstadzName(syl.ustadz_id) }}</div>
              </td>
              <td>
                <div class="fw-bold text-primary">{{ getSubjectName(syl.subject_id) }}</div>
              </td>
              <td>
                <span class="badge bg-label-info badge-custom text-xs">{{ getClassName(syl.class_id) }}</span>
              </td>
              <td class="fw-semibold text-dark">{{ syl.target_materi }}</td>
              <td class="text-end">
                <div class="d-flex justify-content-end gap-1">
                  <button @click="openEditModal(syl)" class="btn btn-sm btn-icon btn-outline-primary" title="Edit Target">
                    <EditIcon :size="14" />
                  </button>
                  <button @click="deleteTarget(syl.id)" class="btn btn-sm btn-icon btn-outline-danger" title="Hapus Target">
                    <TrashIcon :size="14" />
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="syllabusList.length === 0">
              <td colspan="6" class="text-center py-4 text-muted">Belum ada target silabus yang ditentukan. Silakan buat target baru.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Syllabus Target Modal (Add/Edit) -->
    <div v-if="showModal" class="modal-backdrop">
      <div class="modal d-block" tabindex="-1" role="dialog" style="background: rgba(0,0,0,0.5)">
        <div class="modal-dialog modal-dialog-centered" role="document">
          <div class="modal-content card shadow-lg border-0">
            <div class="modal-header border-bottom py-3">
              <h5 class="modal-title fw-bold">{{ isEditMode ? 'Edit Target Silabus' : 'Tambah Target Silabus Baru' }}</h5>
              <button type="button" class="btn-close" @click="showModal = false"></button>
            </div>
            <div class="modal-body p-4">
              <form @submit.prevent="saveTarget">
                <!-- Select Ustadz -->
                <div class="mb-3">
                  <label class="form-label small fw-semibold">Pilih Guru / Ustadz</label>
                  <select v-model="form.ustadz_id" class="form-select" required>
                    <option value="">-- Pilih Ustadz/Ustadzah --</option>
                    <option v-for="prof in teachers" :key="prof.id" :value="prof.id">
                      {{ prof.nama }}
                    </option>
                  </select>
                </div>

                <!-- Select Subject -->
                <div class="mb-3">
                  <label class="form-label small fw-semibold">Kitab (Mata Pelajaran)</label>
                  <select v-model="form.subject_id" class="form-select" required>
                    <option value="">-- Pilih Kitab --</option>
                    <option v-for="sub in subjects" :key="sub.id" :value="sub.id">
                      {{ sub.nama }}
                    </option>
                  </select>
                </div>

                <!-- Select Class -->
                <div class="mb-3">
                  <label class="form-label small fw-semibold">Kelas</label>
                  <select v-model="form.class_id" class="form-select" required>
                    <option value="">-- Pilih Kelas --</option>
                    <option v-for="cls in classes" :key="cls.id" :value="cls.id">
                      {{ cls.nama }} ({{ cls.tingkat }})
                    </option>
                  </select>
                </div>

                <!-- Target Materi -->
                <div class="mb-3">
                  <label class="form-label small fw-semibold">Target Materi Pembelajaran</label>
                  <textarea v-model="form.target_materi" class="form-control" rows="3" placeholder="Contoh: Menyelesaikan Bab Thaharah bait 1 s/d 25..." required></textarea>
                </div>

                <div class="d-flex justify-content-end gap-2 pt-3 border-top">
                  <button type="button" class="btn btn-outline-secondary" @click="showModal = false">Batal</button>
                  <button type="submit" class="btn btn-primary">{{ isEditMode ? 'Simpan Perubahan' : 'Tentukan Target' }}</button>
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
import { db, SyllabusTarget } from '../database';
import Swal from 'sweetalert2';
import { Plus as PlusIcon, Edit as EditIcon, Trash as TrashIcon } from 'lucide-vue-next';

const showModal = ref(false);
const isEditMode = ref(false);
const editTargetId = ref('');

// Seed items for dropdowns
const teachers = computed(() => db.profiles.filter(p => p.role === 'Ustadz'));
const subjects = computed(() => db.subjects);
const classes = computed(() => db.classes);
const syllabusList = computed(() => db.syllabusTargets);

const getUstadzName = (id: string) => {
  return db.profiles.find(p => p.id === id)?.nama || 'Guru';
};

const getSubjectName = (id: string) => {
  return db.subjects.find(s => s.id === id)?.nama || 'Kitab';
};

const getClassName = (id: string) => {
  return db.classes.find(c => c.id === id)?.nama || 'Kelas';
};

// Form state
const form = ref({
  ustadz_id: '',
  subject_id: '',
  class_id: '',
  target_materi: ''
});

const openAddModal = () => {
  isEditMode.value = false;
  editTargetId.value = '';
  form.value = {
    ustadz_id: '',
    subject_id: '',
    class_id: '',
    target_materi: ''
  };
  showModal.value = true;
};

const openEditModal = (target: SyllabusTarget) => {
  isEditMode.value = true;
  editTargetId.value = target.id;
  form.value = {
    ustadz_id: target.ustadz_id,
    subject_id: target.subject_id,
    class_id: target.class_id,
    target_materi: target.target_materi
  };
  showModal.value = true;
};

const saveTarget = () => {
  if (isEditMode.value && editTargetId.value) {
    // Edit existing target
    const idx = db.syllabusTargets.findIndex(t => t.id === editTargetId.value);
    if (idx !== -1) {
      db.syllabusTargets[idx] = {
        ...db.syllabusTargets[idx],
        ...form.value
      };
      db.saveAll();
    }
  } else {
    // Add new target
    db.saveSyllabusTarget(form.value);
  }

  showModal.value = false;
  Swal.fire({
    icon: 'success',
    title: 'Berhasil Disimpan',
    text: 'Target silabus guru telah disinkronkan secara real-time ke Supabase.',
    confirmButtonColor: '#696cff'
  });
};

const deleteTarget = (id: string) => {
  Swal.fire({
    title: 'Hapus Target Silabus',
    text: 'Apakah Anda yakin ingin menghapus penetapan target silabus ini?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ff3e1d',
    cancelButtonColor: '#8592a3',
    confirmButtonText: 'Ya, Hapus',
    cancelButtonText: 'Batal'
  }).then((result) => {
    if (result.isConfirmed) {
      db.syllabusTargets = db.syllabusTargets.filter(t => t.id !== id);
      db.saveAll();
      Swal.fire({
        icon: 'success',
        title: 'Hapus Berhasil',
        text: 'Penetapan target silabus telah berhasil dihapus.',
        timer: 1000,
        showConfirmButton: false
      });
    }
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
