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
              <img :src="prof.profile_picture_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'" class="rounded-circle border border-3 shadow-xs profile-img" alt="Avatar" />
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

                <!-- Profile Picture Presets or URL -->
                <div class="mb-3">
                  <label class="form-label small fw-semibold">Foto Profil (URL)</label>
                  <input v-model="form.profile_picture_url" type="text" class="form-control mb-2" placeholder="Gunakan URL foto atau pilih ikon di bawah" required />
                  
                  <label class="form-label text-xs text-muted d-block mb-1">Atau pilih preset foto yang tersedia:</label>
                  <div class="d-flex gap-2 flex-wrap justify-content-start">
                    <button 
                      type="button" 
                      v-for="(preset, idx) in avatarPresets" 
                      :key="idx" 
                      @click="form.profile_picture_url = preset.url"
                      class="btn p-1 border-0 rounded-circle position-relative preset-avatar-btn"
                      :class="{ 'ring-active': form.profile_picture_url === preset.url }"
                      style="width: 38px; height: 38px;"
                    >
                      <img :src="preset.url" class="rounded-circle w-100 h-100 object-fit-cover border" :alt="preset.name" />
                    </button>
                  </div>
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
  Check as CheckIcon
} from 'lucide-vue-next';

const showModal = ref(false);
const isEditMode = ref(false);
const editId = ref('');

const searchQuery = ref('');
const roleFilter = ref('all');

// Exclude deleting current logged in admin
const currentAdminId = computed(() => db.session.currentUser?.id || '');

const profiles = computed(() => db.profiles);

const avatarPresets = [
  { name: 'Ustadz 1', url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150' },
  { name: 'Ustadz 2', url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150' },
  { name: 'Ustadzah 1', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150' },
  { name: 'Ustadzah 2', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150' },
  { name: 'Ustadz 3', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
  { name: 'Ustadzah 3', url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150' }
];

const form = ref({
  nama: '',
  username: '',
  password: 'password123',
  email: '',
  hp: '',
  telpon: '',
  role: 'Ustadz' as 'Ustadz' | 'Admin',
  profile_picture_url: avatarPresets[0].url
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
    profile_picture_url: avatarPresets[0].url
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
    profile_picture_url: prof.profile_picture_url || avatarPresets[0].url
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
