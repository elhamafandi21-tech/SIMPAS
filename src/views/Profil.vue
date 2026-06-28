<template>
  <div>
    <div class="row mb-4">
      <div class="col-12">
        <div class="card p-4 border-0 shadow-sm">
          <h4 class="mb-1 text-heading">Pengaturan Profil Pengguna</h4>
          <p class="text-muted mb-0">Ubah data profil pribadi Anda serta kata sandi akun SIMPAS secara mandiri.</p>
        </div>
      </div>
    </div>

    <div class="row g-4">
      <!-- Left side: Avatar and Quick Stats -->
      <div class="col-12 col-md-4">
        <div class="card shadow-sm border-0 text-center p-4">
          <div class="card-body">
            <!-- Avatar mockup with upload trigger -->
            <div class="avatar-wrapper mb-3 position-relative d-inline-block" @click="triggerFileInput" style="cursor: pointer;" title="Klik untuk mengunggah foto baru">
              <img v-if="profilePicUrl" :src="profilePicUrl" class="rounded-circle object-fit-cover border shadow-sm" style="width: 100px; height: 100px; object-fit: cover; margin: 0 auto; display: block;" alt="Foto Profil" />
              <div v-else class="avatar bg-label-primary rounded-circle d-flex align-items-center justify-content-center" style="width: 100px; height: 100px; font-size: 2.5rem; font-weight: bold; margin: 0 auto">
                {{ avatarInitials }}
              </div>
              <div class="position-absolute bottom-0 end-0 bg-primary text-white rounded-circle d-flex align-items-center justify-content-center border border-white" style="width: 32px; height: 32px; box-shadow: 0 2px 6px rgba(0,0,0,0.15)">
                <CameraIcon :size="16" />
              </div>
            </div>
            
            <!-- Hidden File Input -->
            <input 
              type="file" 
              ref="fileInput" 
              accept="image/png, image/jpeg, image/jpg" 
              style="display: none" 
              @change="onFileChange" 
            />

            <h5 class="fw-bold text-heading mb-1">{{ currentUser?.nama }}</h5>
            <span class="badge bg-primary text-white py-1 px-3 fs-7 mb-4">{{ currentUser?.role }}</span>

            <p class="text-xs text-muted mb-3">Format diperbolehkan: JPG atau PNG. Ukuran ideal 1:1.</p>

            <!-- Read-only info -->
            <div class="text-start border-top pt-3">
              <div class="mb-2">
                <span class="text-muted text-xs d-block">ID AKUN SUPABASE</span>
                <span class="fw-semibold text-sm text-heading">{{ currentUser?.id }}</span>
              </div>
              <div class="mb-2">
                <span class="text-muted text-xs d-block">TERDAFTAR SEBAGAI</span>
                <span class="fw-semibold text-sm text-heading text-capitalize">{{ currentUser?.role }} SIMPAS</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right side: Edit form -->
      <div class="col-12 col-md-8">
        <div class="card shadow-sm border-0 p-4">
          <h5 class="fw-bold text-heading mb-4 pb-2 border-bottom">Informasi Biodata Profil</h5>

          <form @submit.prevent="updateProfil">
            <div class="row g-3">
              <!-- Nama -->
              <div class="col-12 col-md-6">
                <label class="form-label small fw-semibold">Nama Lengkap</label>
                <input v-model="form.nama" type="text" class="form-control" required />
              </div>

              <!-- Username (login name) -->
              <div class="col-12 col-md-6">
                <label class="form-label small fw-semibold">Username Login</label>
                <input v-model="form.username" type="text" class="form-control" required />
              </div>

              <!-- Password section -->
              <div class="col-12 mt-4 pt-3 border-top">
                <template v-if="currentUser?.role === 'Admin'">
                  <h6 class="fw-bold text-heading mb-3 text-primary">Ganti Kata Sandi (Opsional)</h6>
                  <div class="row g-3">
                    <div class="col-12 col-md-6">
                      <label class="form-label small fw-semibold">Kata Sandi Baru</label>
                      <input v-model="form.new_password" type="password" class="form-control" placeholder="Minimal 6 karakter" minlength="6" />
                    </div>
                    <div class="col-12 col-md-6">
                      <label class="form-label small fw-semibold">Ulangi Kata Sandi Baru</label>
                      <input v-model="form.confirm_password" type="password" class="form-control" placeholder="Ulangi kata sandi baru" />
                    </div>
                  </div>
                </template>
                <template v-else>
                  <div class="alert alert-light-info border-0 p-3 mb-0 d-flex align-items-center gap-2">
                    <span class="fs-4">💡</span>
                    <div>
                      <h6 class="fw-bold mb-1 text-heading" style="font-size: 0.85rem">Autentikasi Tanpa Sandi Aktif</h6>
                      <p class="text-muted text-xs mb-0">Sebagai Ustadz, Anda login menggunakan nama lengkap atau username saja tanpa memerlukan kata sandi.</p>
                    </div>
                  </div>
                </template>
              </div>
            </div>

            <!-- Submit button -->
            <div class="d-flex justify-content-end gap-2 pt-4 mt-3 border-top">
              <button type="submit" class="btn btn-primary px-4 py-2 d-flex align-items-center gap-2">
                <SaveIcon :size="18" /> Simpan Pembaruan Profil
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { db } from '../database';
import Swal from 'sweetalert2';
import { Save as SaveIcon, Camera as CameraIcon } from 'lucide-vue-next';

const currentUser = computed(() => db.session.currentUser);
const fileInput = ref<HTMLInputElement | null>(null);
const profilePicUrl = ref('');

const avatarInitials = computed(() => {
  if (!currentUser.value?.nama) return 'US';
  const parts = currentUser.value.nama.split(' ');
  if (parts.length > 1) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return parts[0][0].toUpperCase();
});

// Form state
const form = ref({
  nama: '',
  username: '',
  email: '',
  telpon: '',
  new_password: '',
  confirm_password: ''
});

onMounted(() => {
  if (currentUser.value) {
    form.value.nama = currentUser.value.nama;
    form.value.username = currentUser.value.username || '';
    form.value.email = currentUser.value.email || '';
    form.value.telpon = currentUser.value.telpon || '';
    profilePicUrl.value = currentUser.value.profile_picture_url || '';
  }
});

const triggerFileInput = () => {
  if (fileInput.value) {
    fileInput.value.click();
  }
};

const onFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const files = target.files;
  if (!files || files.length === 0) return;

  const file = files[0];
  if (!file.type.match('image.*')) {
    Swal.fire({
      icon: 'error',
      title: 'Berkas Tidak Valid',
      text: 'Silakan pilih berkas gambar yang valid (JPG atau PNG).',
      confirmButtonColor: 'var(--primary)'
    });
    return;
  }

  const reader = new FileReader();
  reader.onload = (event) => {
    const img = new Image();
    img.src = event.target?.result as string;
    img.onload = () => {
      // Create canvas for downscaling to save storage space and remain super lightweight
      const canvas = document.createElement('canvas');
      const max_size = 180; // 180x180 resolution is crisp for avatar
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
        // output with good quality
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        profilePicUrl.value = dataUrl;
      }
    };
  };
  reader.readAsDataURL(file);
};

const updateProfil = () => {
  if (!currentUser.value) return;

  // Password confirmation check if new password is typed
  if (form.value.new_password) {
    if (form.value.new_password !== form.value.confirm_password) {
      Swal.fire({
        icon: 'error',
        title: 'Sandi Tidak Cocok',
        text: 'Konfirmasi kata sandi baru Anda tidak cocok!',
        confirmButtonColor: '#ff3e1d'
      });
      return;
    }
  }

  // Find index in database
  const idx = db.profiles.findIndex(p => p.id === currentUser.value?.id);
  if (idx !== -1) {
    db.profiles[idx].nama = form.value.nama;
    db.profiles[idx].username = form.value.username;
    db.profiles[idx].email = form.value.email;
    db.profiles[idx].telpon = form.value.telpon;
    db.profiles[idx].profile_picture_url = profilePicUrl.value;
    
    // Change password if provided
    if (form.value.new_password) {
      db.profiles[idx].password = form.value.new_password;
    }

    // Save changes
    db.saveAll();

    // Re-assign session user to trigger reactive navbar updating
    db.session.currentUser = { ...db.profiles[idx] };

    // Clear password inputs
    form.value.new_password = '';
    form.value.confirm_password = '';

    Swal.fire({
      icon: 'success',
      title: 'Profil Diperbarui',
      text: 'Biodata akun dan foto profil Anda berhasil diperbarui secara real-time.',
      confirmButtonColor: 'var(--primary)'
    });
  }
};
</script>

<style scoped>
.bg-label-primary {
  background-color: var(--primary-light);
  color: var(--primary);
}
</style>
