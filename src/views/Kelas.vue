<template>
  <div>
    <div class="row mb-4">
      <div class="col-12 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
        <div>
          <h4 class="mb-1 text-heading">Manajemen Kelas Pembelajaran</h4>
          <p class="text-muted mb-0">Kelola rombongan belajar (rombel) dan tingkat jenjang pendidikan Madin Pancasila Salatiga.</p>
        </div>
        <div>
          <button @click="openAddModal" class="btn btn-primary d-flex align-items-center gap-2">
            <PlusIcon :size="18" /> Tambah Kelas Baru
          </button>
        </div>
      </div>
    </div>

    <!-- Classes Table -->
    <div class="card shadow-sm border-0 overflow-hidden">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h5 class="mb-0">Daftar Kelas Aktif</h5>
        <span class="badge bg-label-success badge-custom">{{ classes.length }} Kelas</span>
      </div>
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead>
            <tr>
              <th style="width: 80px">No</th>
              <th>Nama Rombel / Kelas</th>
              <th>Wali Kelas</th>
              <th>Tahun Ajaran</th>
              <th class="text-end" style="width: 150px">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(cls, idx) in classes" :key="cls.id">
              <td>{{ idx + 1 }}</td>
              <td>
                <div class="fw-bold text-heading text-md">{{ cls.nama }}</div>
              </td>
              <td>
                <div v-if="getWaliKelas(cls.wali_kelas_id)" class="d-flex align-items-center gap-2">
                  <img :src="getWaliKelas(cls.wali_kelas_id)?.profile_picture_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'" class="rounded-circle border" style="width: 24px; height: 24px; object-fit: cover;" />
                  <div>
                    <span class="fw-semibold text-xs-heading d-block">{{ getWaliKelas(cls.wali_kelas_id)?.nama }}</span>
                    <span class="badge bg-label-primary badge-custom text-xxs m-0" style="font-size: 0.65rem; padding: 0.15rem 0.35rem;">{{ getWaliKelas(cls.wali_kelas_id)?.role }}</span>
                  </div>
                </div>
                <span v-else class="text-xs text-muted font-italic">Belum Ditentukan</span>
              </td>
              <td>
                <span class="fw-semibold text-secondary">{{ cls.tahun_ajaran }}</span>
              </td>
              <td class="text-end">
                <div class="d-flex justify-content-end gap-1">
                  <button @click="openEditModal(cls)" class="btn btn-sm btn-icon btn-outline-primary" title="Edit Kelas">
                    <EditIcon :size="14" />
                  </button>
                  <button @click="deleteClass(cls.id)" class="btn btn-sm btn-icon btn-outline-danger" title="Hapus Kelas">
                    <TrashIcon :size="14" />
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="classes.length === 0">
              <td colspan="5" class="text-center py-4 text-muted">Belum ada data kelas aktif. Silakan tambahkan kelas baru.</td>
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
              <h5 class="modal-title fw-bold">{{ isEditMode ? 'Edit Kelas' : 'Tambah Kelas Baru' }}</h5>
              <button type="button" class="btn-close" @click="showModal = false"></button>
            </div>
            <div class="modal-body p-4">
              <form @submit.prevent="saveClass">
                <!-- Nama Kelas -->
                <div class="mb-3">
                  <label class="form-label small fw-semibold">Nama Kelas / Rombel</label>
                  <input v-model="form.nama" type="text" class="form-control" placeholder="Contoh: Kelas 1-B Ula" required />
                </div>
                <!-- Wali Kelas -->
                <div class="mb-3">
                  <label class="form-label small fw-semibold">Wali Kelas / Penanggung Jawab</label>
                  <select v-model="form.wali_kelas_id" class="form-select">
                    <option value="">-- Pilih Wali Kelas --</option>
                    <option v-for="prof in ustadzList" :key="prof.id" :value="prof.id">
                      {{ prof.nama }} ({{ prof.role }})
                    </option>
                  </select>
                </div>
                <!-- Tahun Ajaran -->
                <div class="mb-3">
                  <label class="form-label small fw-semibold">Tahun Ajaran</label>
                  <input v-model="form.tahun_ajaran" type="text" class="form-control" placeholder="Contoh: 2025/2026" required />
                </div>

                <div class="d-flex justify-content-end gap-2 pt-3 border-top">
                  <button type="button" class="btn btn-outline-secondary" @click="showModal = false">Batal</button>
                  <button type="submit" class="btn btn-primary">{{ isEditMode ? 'Simpan Perubahan' : 'Tambah Kelas' }}</button>
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
import { db, ClassRoom } from '../database';
import Swal from 'sweetalert2';
import { Plus as PlusIcon, Edit as EditIcon, Trash as TrashIcon } from 'lucide-vue-next';

const showModal = ref(false);
const isEditMode = ref(false);
const editId = ref('');

const classes = computed(() => db.classes);
const ustadzList = computed(() => db.profiles);

const getWaliKelas = (id?: string) => {
  if (!id) return null;
  return db.profiles.find(p => p.id === id) || null;
};

const form = ref({
  nama: '',
  tingkat: '',
  tahun_ajaran: '2025/2026',
  wali_kelas_id: ''
});

const openAddModal = () => {
  isEditMode.value = false;
  editId.value = '';
  form.value = {
    nama: '',
    tingkat: '',
    tahun_ajaran: '2025/2026',
    wali_kelas_id: ''
  };
  showModal.value = true;
};

const openEditModal = (cls: ClassRoom) => {
  isEditMode.value = true;
  editId.value = cls.id;
  form.value = {
    nama: cls.nama,
    tingkat: cls.tingkat || '',
    tahun_ajaran: cls.tahun_ajaran,
    wali_kelas_id: cls.wali_kelas_id || ''
  };
  showModal.value = true;
};

const saveClass = () => {
  if (isEditMode.value && editId.value) {
    db.editClass(editId.value, form.value);
  } else {
    db.addClass(form.value);
  }

  showModal.value = false;
  Swal.fire({
    icon: 'success',
    title: 'Kelas Berhasil Disimpan',
    text: 'Data kelas baru berhasil disinkronkan ke Supabase.',
    confirmButtonColor: '#696cff'
  });
};

const deleteClass = (id: string) => {
  Swal.fire({
    title: 'Hapus Rombongan Kelas?',
    text: 'Menghapus kelas ini juga akan menghapus santri, nilai, absensi, serta jurnal terkait di dalamnya. Lanjutkan?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ff3e1d',
    cancelButtonColor: '#8592a3',
    confirmButtonText: 'Ya, Hapus',
    cancelButtonText: 'Batal'
  }).then((result) => {
    if (result.isConfirmed) {
      db.deleteClass(id);
      Swal.fire({
        icon: 'success',
        title: 'Berhasil Dihapus',
        text: 'Data kelas dan relasinya telah dihapus.',
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

.bg-label-success {
  background-color: rgba(113, 221, 55, 0.16);
  color: var(--success);
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
