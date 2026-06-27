<template>
  <div>
    <div class="row mb-4">
      <div class="col-12 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
        <div>
          <h4 class="mb-1 text-heading">Manajemen Mata Pelajaran (Kitab)</h4>
          <p class="text-muted mb-0">Kelola kurikulum kitab yang diajarkan di Madrasah Diniyyah Pancasila Salatiga.</p>
        </div>
        <div>
          <button @click="openAddModal" class="btn btn-primary d-flex align-items-center gap-2">
            <PlusIcon :size="18" /> Tambah Kitab Baru
          </button>
        </div>
      </div>
    </div>

    <!-- Table of Subjects -->
    <div class="card shadow-sm border-0 overflow-hidden">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h5 class="mb-0">Daftar Kitab Kurikulum</h5>
        <span class="badge bg-label-primary badge-custom">{{ subjects.length }} Kitab</span>
      </div>
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead>
            <tr>
              <th style="width: 80px">No</th>
              <th style="width: 150px">Kode Kitab</th>
              <th>Nama Kitab / Pelajaran</th>
              <th class="text-end" style="width: 150px">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(sub, idx) in subjects" :key="sub.id">
              <td>{{ idx + 1 }}</td>
              <td>
                <span class="badge bg-label-primary badge-custom fw-bold text-xs">{{ sub.kode }}</span>
              </td>
              <td>
                <div class="fw-bold text-heading text-md">{{ sub.nama }}</div>
              </td>
              <td class="text-end">
                <div class="d-flex justify-content-end gap-1">
                  <button @click="openEditModal(sub)" class="btn btn-sm btn-icon btn-outline-primary" title="Edit Kitab">
                    <EditIcon :size="14" />
                  </button>
                  <button @click="deleteSubject(sub.id)" class="btn btn-sm btn-icon btn-outline-danger" title="Hapus Kitab">
                    <TrashIcon :size="14" />
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="subjects.length === 0">
              <td colspan="4" class="text-center py-4 text-muted">Belum ada data mata pelajaran/kitab. Silakan tambah data baru.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add/Edit Modal Dialog -->
    <div v-if="showModal" class="modal-backdrop">
      <div class="modal d-block" tabindex="-1" role="dialog" style="background: rgba(0,0,0,0.5)">
        <div class="modal-dialog modal-dialog-centered" role="document">
          <div class="modal-content card shadow-lg border-0">
            <div class="modal-header border-bottom py-3">
              <h5 class="modal-title fw-bold">{{ isEditMode ? 'Edit Mata Pelajaran' : 'Tambah Mata Pelajaran Baru' }}</h5>
              <button type="button" class="btn-close" @click="showModal = false"></button>
            </div>
            <div class="modal-body p-4">
              <form @submit.prevent="saveSubject">
                <!-- Kode -->
                <div class="mb-3">
                  <label class="form-label small fw-semibold">Kode Mata Pelajaran</label>
                  <input v-model="form.kode" type="text" class="form-control" placeholder="Contoh: KIT-005" required />
                </div>
                <!-- Nama -->
                <div class="mb-3">
                  <label class="form-label small fw-semibold">Nama Kitab / Pelajaran</label>
                  <input v-model="form.nama" type="text" class="form-control" placeholder="Contoh: Safinatun Najah (Fiqih)" required />
                </div>

                <div class="d-flex justify-content-end gap-2 pt-3 border-top">
                  <button type="button" class="btn btn-outline-secondary" @click="showModal = false">Batal</button>
                  <button type="submit" class="btn btn-primary">{{ isEditMode ? 'Simpan Perubahan' : 'Tambah Kitab' }}</button>
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
import { db, Subject } from '../database';
import Swal from 'sweetalert2';
import { Plus as PlusIcon, Edit as EditIcon, Trash as TrashIcon } from 'lucide-vue-next';

const showModal = ref(false);
const isEditMode = ref(false);
const editId = ref('');

const subjects = computed(() => db.subjects);

const form = ref({
  kode: '',
  nama: ''
});

const openAddModal = () => {
  isEditMode.value = false;
  editId.value = '';
  form.value = {
    kode: '',
    nama: ''
  };
  showModal.value = true;
};

const openEditModal = (sub: Subject) => {
  isEditMode.value = true;
  editId.value = sub.id;
  form.value = {
    kode: sub.kode,
    nama: sub.nama
  };
  showModal.value = true;
};

const saveSubject = () => {
  if (isEditMode.value && editId.value) {
    db.editSubject(editId.value, form.value);
  } else {
    db.addSubject(form.value);
  }

  showModal.value = false;
  Swal.fire({
    icon: 'success',
    title: 'Mata Pelajaran Disimpan',
    text: 'Data kurikulum kitab berhasil disinkronkan ke Supabase.',
    confirmButtonColor: '#696cff'
  });
};

const deleteSubject = (id: string) => {
  Swal.fire({
    title: 'Hapus Mata Pelajaran?',
    text: 'Menghapus kitab ini juga akan menghapus data silabus, nilai, dan jurnal mengajar terkait. Apakah Anda yakin?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ff3e1d',
    cancelButtonColor: '#8592a3',
    confirmButtonText: 'Ya, Hapus',
    cancelButtonText: 'Batal'
  }).then((result) => {
    if (result.isConfirmed) {
      db.deleteSubject(id);
      Swal.fire({
        icon: 'success',
        title: 'Berhasil Dihapus',
        text: 'Data mata pelajaran kurikulum telah terhapus.',
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

.btn-icon {
  width: 28px;
  height: 28px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
</style>
