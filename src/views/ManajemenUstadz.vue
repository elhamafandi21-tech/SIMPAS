<template>
  <div>
    <div class="row mb-4">
      <div class="col-12 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
        <div>
          <h4 class="mb-1 text-heading">Manajemen Ustadz & Staff</h4>
          <p class="text-muted mb-0">Kelola pendataan ustadz, ustadzah, dan pengurus Madrasah Diniyyah Pancasila Salatiga.</p>
        </div>
        <div>
          <button @click="openAddModal" class="btn btn-primary d-flex align-items-center gap-2">
            <PlusIcon :size="18" /> Tambah Ustadz Baru
          </button>
        </div>
      </div>
    </div>

    <!-- Search and Filter Panel -->
    <div class="card shadow-sm border-0 mb-4">
      <div class="card-body p-3">
        <div class="row g-3">
          <div class="col-12 col-md-8">
            <div class="input-group">
              <span class="input-group-text bg-light border-end-0 text-muted">
                <SearchIcon :size="16" />
              </span>
              <input v-model="searchQuery" type="text" class="form-control bg-light border-start-0" placeholder="Cari berdasarkan nama, username, email, atau nomor HP..." />
            </div>
          </div>
          <div class="col-12 col-md-4">
            <select v-model="roleFilter" class="form-select bg-light">
              <option value="all">Semua Peran / Role</option>
              <option value="Ustadz">Ustadz / Pengajar</option>
              <option value="Admin">Administrator</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Teacher Grid and List Cards -->
    <div class="row g-4">
      <div v-for="prof in filteredProfiles" :key="prof.id" class="col-12 col-md-6 col-lg-4">
        <div class="card h-100 shadow-sm border-0 teacher-card position-relative overflow-hidden">
          <!-- Role Badge -->
          <div class="position-absolute top-0 end-0 m-3">
            <span class="badge" :class="prof.role === 'Admin' ? 'bg-danger-subtle text-danger' : 'bg-primary-subtle text-primary'">
              {{ prof.role }}
            </span>
          </div>

          <div class="card-body p-4 text-center">
            <!-- Profile Photo -->
            <div class="mb-3 position-relative d-inline-block">
              <img v-if="prof.profile_picture_url" :src="prof.profile_picture_url" class="rounded-circle border border-3 shadow-xs profile-img object-fit-cover" alt="Avatar" />
              <div v-else class="rounded-circle border border-3 shadow-xs profile-img d-flex align-items-center justify-content-center bg-light text-secondary" style="width: 90px; height: 90px;">
                <UserIcon :size="40" />
              </div>
            </div>

            <!-- Profile Info -->
            <h5 class="fw-bold mb-1 text-heading">{{ prof.nama }}</h5>
            <p class="text-xs text-primary mb-3">@{{ prof.username || 'username_belum_set' }}</p>

            <hr class="my-3 opacity-50" />

            <!-- Details list -->
            <div class="text-start space-y-2 mb-4">
              <div class="d-flex align-items-center gap-2 text-sm text-secondary">
                <MailIcon :size="14" class="text-muted flex-shrink-0" />
                <span class="text-truncate" :title="prof.email">{{ prof.email }}</span>
              </div>
              <div class="d-flex align-items-center gap-2 text-sm text-secondary">
                <PhoneIcon :size="14" class="text-muted flex-shrink-0" />
                <span>{{ prof.hp || prof.telpon || '-' }}</span>
              </div>
              <div class="d-flex align-items-center gap-2 text-sm text-secondary">
                <KeyIcon :size="14" class="text-muted flex-shrink-0" />
                <span class="text-xs">Sandi: <code class="text-danger">{{ prof.password || '******' }}</code></span>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="d-flex gap-2 justify-content-center">
              <button @click="openEditModal(prof)" class="btn btn-sm btn-outline-primary d-flex align-items-center gap-1 px-3">
                <EditIcon :size="13" /> Edit
              </button>
              <button v-if="prof.id !== currentAdminId" @click="deleteTeacher(prof)" class="btn btn-sm btn-outline-danger d-flex align-items-center gap-1 px-3">
                <TrashIcon :size="13" /> Hapus
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="filteredProfiles.length === 0" class="col-12">
        <div class="card shadow-sm border-0 py-5 text-center">
          <div class="card-body">
            <div class="text-muted mb-3">
              <UsersIcon :size="48" class="opacity-50" />
            </div>
            <h5 class="fw-bold text-heading">Tidak Ada Data Ustadz</h5>
            <p class="text-muted mb-0">Tidak ada data ustadz atau pengurus yang cocok dengan pencarian Anda.</p>
            <button @click="resetFilters" class="btn btn-sm btn-outline-secondary mt-3">Reset Pencarian</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Modal Dialog -->
    <div v-if="showModal" class="modal-backdrop">
      <div class="modal d-block" tabindex="-1" role="dialog" style="background: rgba(0,0,0,0.5)">
        <div class="modal-dialog modal-dialog-centered" role="document">
          <div class="modal-content card shadow-lg border-0">
            <div class="modal-header border-bottom py-3">
              <h5 class="modal-title fw-bold">{{ isEditMode ? 'Edit Profil Ustadz/Pengurus' : 'Tambah Ustadz/Pengurus Baru' }}</h5>
              <button type="button" class="btn-close" @click="showModal = false"></button>
            </div>
            <div class="modal-body p-4">
              <form @submit.prevent="saveTeacher">
                <!-- Nama Lengkap -->
                <div class="mb-3">
                  <label class="form-label small fw-semibold">Nama Lengkap beserta Gelar</label>
                  <input v-model="form.nama" type="text" class="form-control" placeholder="Contoh: Ustadz M. Syakir, S.H." required />
                </div>

                <div class="row">
                  <!-- Username -->
                  <div class="col-12 col-sm-6 mb-3">
                    <label class="form-label small fw-semibold">Username Login</label>
                    <input v-model="form.username" type="text" class="form-control" placeholder="Contoh: ustadzsyakir" required @input="cleanUsername" />
                  </div>
                  <!-- Password -->
                  <div class="col-12 col-sm-6 mb-3">
                    <label class="form-label small fw-semibold">Kata Sandi (Password)</label>
                    <input v-model="form.password" type="text" class="form-control" placeholder="Isikan sandi login" required />
                  </div>
                </div>

                <div class="row">
                  <!-- Email -->
                  <div class="col-12 col-sm-6 mb-3">
                    <label class="form-label small fw-semibold">Alamat Email</label>
                    <input v-model="form.email" type="email" class="form-control" placeholder="Contoh: syakir@simpas.com" required />
                  </div>
                  <!-- No HP -->
                  <div class="col-12 col-sm-6 mb-3">
                    <label class="form-label small fw-semibold">No. HP (WhatsApp)</label>
                    <input v-model="form.hp" type="text" class="form-control" placeholder="Contoh: 0812345678" required />
                  </div>
                </div>

                <div class="row">
                  <!-- Role -->
                  <div class="col-12 col-sm-6 mb-3">
                    <label class="form-label small fw-semibold">Peran Akses (Role)</label>
                    <select v-model="form.role" class="form-select" required>
                      <option value="Ustadz">Ustadz / Pengajar</option>
                      <option value="Admin">Admin / Kepala Sekolah</option>
                    </select>
                  </div>
                  <!-- Telpon Alternatif -->
                  <div class="col-12 col-sm-6 mb-3">
                    <label class="form-label small fw-semibold">Telepon Alternatif (Opsional)</label>
                    <input v-model="form.telpon" type="text" class="form-control" placeholder="Contoh: 0298-323xxx" />
                  </div>
                </div>

                <!-- Profile Picture Upload -->
                <div class="mb-3">
                  <label class="form-label small fw-semibold d-block">Foto Profil (JPG/PNG)</label>
                  
                  <div class="d-flex align-items-center gap-3">
                    <!-- Current Picture Preview -->
                    <div class="position-relative">
                      <img v-if="form.profile_picture_url" :src="form.profile_picture_url" class="rounded-circle border object-fit-cover shadow-sm" style="width: 70px; height: 70px;" alt="Preview" />
                      <div v-else class="rounded-circle border d-flex align-items-center justify-content-center bg-light text-secondary" style="width: 70px; height: 70px;">
                        <UserIcon :size="32" />
                      </div>
                    </div>

                    <!-- Actions -->
                    <div class="d-flex flex-column gap-2">
                      <div class="d-flex gap-2">
                        <button type="button" class="btn btn-sm btn-outline-primary d-flex align-items-center gap-1" @click="triggerModalFileInput">
                          <UploadIcon :size="14" /> Unggah Foto
                        </button>
                        <button v-if="form.profile_picture_url" type="button" class="btn btn-sm btn-outline-danger d-flex align-items-center gap-1" @click="form.profile_picture_url = ''">
                          <Trash2Icon :size="14" /> Hapus Foto
                        </button>
                      </div>
                      <span class="text-xs text-muted">Format: JPG atau PNG. Ukuran ideal 1:1.</span>
                    </div>
                  </div>

                  <!-- Hidden Input File -->
                  <input 
                    type="file" 
                    ref="modalFileInput" 
                    accept="image/png, image/jpeg, image/jpg" 
                    style="display: none" 
                    @change="onModalFileChange" 
                  />
                </div>

                <div class="d-flex justify-content-end gap-2 pt-3 border-top mt-4">
                  <button type="button" class="btn btn-outline-secondary" @click="showModal = false">Batal</button>
                  <button type="submit" class="btn btn-primary d-flex align-items-center gap-1">
                    <CheckIcon :size="16" /> {{ isEditMode ? 'Simpan Perubahan' : 'Tambah Ustadz' }}
                  </button>
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
import { db, Profile } from '../database';
import Swal from 'sweetalert2';
import {
  Plus as PlusIcon,
  Edit as EditIcon,
  Trash as TrashIcon,
  Search as SearchIcon,
  Mail as MailIcon,
  Phone as PhoneIcon,
  Key as KeyIcon,
  Users as UsersIcon,
  Check as CheckIcon,
  User as UserIcon,
  Upload as UploadIcon,
  Trash2 as Trash2Icon
} from 'lucide-vue-next';

const showModal = ref(false);
const isEditMode = ref(false);
const editId = ref('');

const searchQuery = ref('');
const roleFilter = ref('all');

// Exclude deleting current logged in admin
const currentAdminId = computed(() => db.session.currentUser?.id || '');

const profiles = computed(() => db.profiles);

const modalFileInput = ref<HTMLInputElement | null>(null);

const form = ref({
  nama: '',
  username: '',
  password: 'password123',
  email: '',
  hp: '',
  telpon: '',
  role: 'Ustadz' as 'Ustadz' | 'Admin',
  profile_picture_url: ''
});

const filteredProfiles = computed(() => {
  return profiles.value.filter(prof => {
    // Role filter
    if (roleFilter.value !== 'all' && prof.role !== roleFilter.value) {
      return false;
    }
    // Search query filter
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase().trim();
      const nameMatch = prof.nama.toLowerCase().includes(q);
      const emailMatch = prof.email.toLowerCase().includes(q);
      const userMatch = (prof.username || '').toLowerCase().includes(q);
      const hpMatch = (prof.hp || '').toLowerCase().includes(q) || (prof.telpon || '').toLowerCase().includes(q);
      return nameMatch || emailMatch || userMatch || hpMatch;
    }
    return true;
  });
});

const cleanUsername = () => {
  form.value.username = form.value.username.toLowerCase().replace(/[^a-z0-9]/g, '');
};

const resetFilters = () => {
  searchQuery.value = '';
  roleFilter.value = 'all';
};

const triggerModalFileInput = () => {
  if (modalFileInput.value) {
    modalFileInput.value.click();
  }
};

const onModalFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const files = target.files;
  if (!files || files.length === 0) return;

  const file = files[0];
  if (!file.type.match('image.*')) {
    Swal.fire({
      icon: 'error',
      title: 'Berkas Tidak Valid',
      text: 'Silakan pilih berkas gambar yang valid (JPG atau PNG).',
      confirmButtonColor: '#ff3e1d'
    });
    return;
  }

  const reader = new FileReader();
  reader.onload = (event) => {
    const img = new Image();
    img.src = event.target?.result as string;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const max_size = 180; // 180x180 resolution is crisp and lightweight
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > max_size) {
          height *= max_size / width;
          width = max_size;
        }
      } else {
        if (height > max_size) {
          width *= max_size / height;
          height = max_size;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        form.value.profile_picture_url = dataUrl;
      }
    };
  };
  reader.readAsDataURL(file);
};

const openAddModal = () => {
  isEditMode.value = false;
  editId.value = '';
  form.value = {
    nama: '',
    username: '',
    password: 'password123',
    email: '',
    hp: '',
    telpon: '',
    role: 'Ustadz',
    profile_picture_url: ''
  };
  showModal.value = true;
};

const openEditModal = (prof: Profile) => {
  isEditMode.value = true;
  editId.value = prof.id;
  form.value = {
    nama: prof.nama,
    username: prof.username || '',
    password: prof.password || 'password123',
    email: prof.email,
    hp: prof.hp || '',
    telpon: prof.telpon || '',
    role: prof.role,
    profile_picture_url: prof.profile_picture_url || ''
  };
  showModal.value = true;
};

const saveTeacher = () => {
  // Check unique username
  const dupUser = db.profiles.find(p => p.id !== editId.value && p.username?.toLowerCase() === form.value.username.toLowerCase());
  if (dupUser) {
    Swal.fire({
      icon: 'error',
      title: 'Username Sudah Digunakan',
      text: 'Silakan gunakan username lain yang unik.',
      confirmButtonColor: '#ff3e1d'
    });
    return;
  }

  if (isEditMode.value && editId.value) {
    db.editProfile(editId.value, form.value);
  } else {
    db.addProfile(form.value);
  }

  showModal.value = false;
  Swal.fire({
    icon: 'success',
    title: 'Profil Berhasil Disimpan',
    text: 'Sistem menyinkronkan data ustadz ke database lokal dan Supabase.',
    timer: 2000,
    showConfirmButton: false
  });
};

const deleteTeacher = (prof: Profile) => {
  if (prof.id === currentAdminId.value) {
    Swal.fire({
      icon: 'error',
      title: 'Aksi Ditolak',
      text: 'Anda tidak dapat menghapus akun Anda sendiri yang sedang aktif.',
      confirmButtonColor: '#ff3e1d'
    });
    return;
  }

  Swal.fire({
    title: `Hapus ${prof.nama}?`,
    text: `Tindakan ini akan menghapus data ustadz serta semua relasi bimbingan, jurnal mengajar, dan setoran nadhoman yang didampingi ustadz ini. Lanjutkan?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ff3e1d',
    cancelButtonColor: '#8592a3',
    confirmButtonText: 'Ya, Hapus Permanen',
    cancelButtonText: 'Batal'
  }).then((result) => {
    if (result.isConfirmed) {
      db.deleteProfile(prof.id);
      Swal.fire({
        icon: 'success',
        title: 'Ustadz Dihapus',
        text: 'Data ustadz dan relasinya telah terhapus dari sistem.',
        timer: 1500,
        showConfirmButton: false
      });
    }
  });
};
</script>

<script lang="ts">
export default {
  name: 'ManajemenUstadz'
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

.teacher-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.teacher-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 0.5rem 1.5rem rgba(0, 0, 0, 0.08) !important;
}

.profile-img {
  width: 90px;
  height: 90px;
  object-fit: cover;
  background-color: #f5f5f9;
}

.bg-danger-subtle {
  background-color: rgba(255, 62, 29, 0.12);
}

.bg-primary-subtle {
  background-color: rgba(105, 108, 255, 0.12);
}

.ring-active {
  box-shadow: 0 0 0 3px var(--primary) !important;
  transform: scale(1.1);
}

.preset-avatar-btn {
  transition: transform 0.15s ease;
}

.preset-avatar-btn:hover {
  transform: scale(1.15);
}

.space-y-2 > * + * {
  margin-top: 0.5rem;
}
</style>
