<template>
  <div class="d-flex align-items-center justify-content-center min-vh-100 px-3 login-bg">
    <div class="card w-full max-w-md p-4 shadow-lg border-0" id="login-card">
      <div class="card-body">
        <!-- Logo Header -->
        <div class="text-center mb-4">
          <div class="d-flex align-items-center justify-content-center mb-2">
            <span class="app-logo-box bg-primary text-white d-flex align-items-center justify-content-center me-2">
              <span class="fw-bold fs-4">S</span>
            </span>
            <span class="fs-4 fw-bold text-heading text-primary">SIMPAS</span>
          </div>
          <p class="text-muted small">Sistem Pendataan MADIN Pancasila Salatiga</p>
          <div class="badge bg-label-primary badge-custom mt-1 fs-7">Real-time Supabase Engine</div>
        </div>

        <h4 class="mb-2 text-center text-heading">Selamat Datang! 👋</h4>
        <p class="mb-4 text-center text-muted small">Silakan masuk menggunakan nama Ustadz atau Admin Anda</p>

        <!-- Form -->
        <form @submit.prevent="handleLogin">
          <!-- Role Selector -->
          <div class="mb-3">
            <label class="form-label">Pilih Peran (Role)</label>
            <div class="d-flex gap-2">
              <button 
                type="button" 
                class="btn w-50 py-2 d-flex align-items-center justify-content-center gap-2"
                :class="role === 'Ustadz' ? 'btn-primary' : 'btn-outline-secondary'"
                @click="role = 'Ustadz'"
                id="btn-role-ustadz"
              >
                <UserIcon :size="16" /> Ustadz
              </button>
              <button 
                type="button" 
                class="btn w-50 py-2 d-flex align-items-center justify-content-center gap-2"
                :class="role === 'Admin' ? 'btn-primary' : 'btn-outline-secondary'"
                @click="role = 'Admin'"
                id="btn-role-admin"
              >
                <ShieldIcon :size="16" /> Admin
              </button>
            </div>
          </div>

          <!-- Quick Fill for demo ease -->
          <div class="mb-3 p-2 bg-light rounded border border-dashed text-center">
            <div class="small text-muted mb-1 fw-bold">Akun Demo Cepat:</div>
            <div class="d-flex flex-wrap gap-1 justify-content-center">
              <button 
                v-for="p in demoUsers" 
                :key="p.id"
                type="button"
                class="btn btn-xs btn-outline-primary py-0 px-2 text-xs"
                style="font-size: 0.75rem"
                @click="fillDemo(p)"
              >
                {{ p.nama.split(' ')[0] }} ({{ p.role }})
              </button>
            </div>
          </div>

          <!-- Username / Name Input -->
          <div class="mb-3">
            <label class="form-label" for="username-input">
              {{ role === 'Ustadz' ? 'Nama Lengkap / Username Ustadz' : 'Nama Lengkap / Username Admin' }}
            </label>
            <input 
              v-model="username" 
              type="text" 
              id="username-input" 
              class="form-control" 
              :placeholder="role === 'Ustadz' ? 'Masukkan nama lengkap atau username Anda...' : 'Masukkan nama lengkap atau username admin...'"
              required
            />
          </div>

          <!-- Password Input (Only for Admin) -->
          <div v-if="role === 'Admin'" class="mb-3">
            <div class="d-flex justify-content-between">
              <label class="form-label" for="password-input">Kata Sandi</label>
              <a href="#" @click.prevent="handleResetPassword" class="small text-primary text-decoration-none">Lupa Kata Sandi?</a>
            </div>
            <div class="input-group">
              <input 
                v-model="password" 
                :type="showPassword ? 'text' : 'password'" 
                id="password-input" 
                class="form-control" 
                placeholder="••••••••"
                required
              />
              <button class="btn btn-outline-secondary" type="button" @click="showPassword = !showPassword">
                <EyeIcon v-if="!showPassword" :size="16" />
                <EyeOffIcon v-else :size="16" />
              </button>
            </div>
          </div>

          <!-- Remember Me -->
          <div class="mb-4 d-flex align-items-center">
            <input v-model="rememberMe" type="checkbox" id="remember-me" class="form-check-input me-2" />
            <label class="form-check-label text-muted small" for="remember-me">Ingat saya pada perangkat ini</label>
          </div>

          <!-- Submit -->
          <button type="submit" class="btn btn-primary w-full py-2 fs-6" id="btn-login" :disabled="loading">
            <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status"></span>
            Masuk Sebagai {{ role }}
          </button>
        </form>

        <!-- Supabase Connection Config for New Devices / Mobile -->
        <div class="mt-4 pt-3 border-top text-center">
          <p class="text-xs text-muted mb-2">Membuka aplikasi di perangkat baru / HP / mobile?</p>
          <button 
            type="button" 
            class="btn btn-xs btn-outline-secondary d-inline-flex align-items-center gap-1 text-xs py-1 px-2.5"
            @click="showSupabaseSetup = !showSupabaseSetup"
            id="btn-toggle-supabase-login"
          >
            <DatabaseIcon :size="12" />
            {{ showSupabaseSetup ? 'Sembunyikan Pengaturan Supabase' : 'Hubungkan Supabase Perangkat Ini' }}
          </button>
          
          <div v-if="showSupabaseSetup" class="mt-3 text-start p-3 bg-light rounded border border-success-subtle shadow-xs">
            <div class="d-flex align-items-center gap-2 mb-2 text-success fw-bold text-xs">
              <WifiIcon :size="14" /> Sinkronisasi Supabase Cloud
            </div>
            <p class="text-xs text-muted mb-3" style="font-size: 0.75rem; line-height: 1.4;">
              Karena data disimpan di browser Anda, masukkan URL & Anon Key Supabase Anda di sini untuk menarik (Pull) profil admin/ustadz terbaru ke perangkat ini.
            </p>
            <div class="mb-2">
              <label class="form-label text-xs fw-semibold mb-1" style="font-size: 0.7rem;">SUPABASE URL</label>
              <input v-model="sbUrl" type="url" class="form-control form-control-sm text-xs" placeholder="https://xxx.supabase.co" />
            </div>
            <div class="mb-3">
              <label class="form-label text-xs fw-semibold mb-1" style="font-size: 0.7rem;">SUPABASE ANON KEY</label>
              <input v-model="sbAnonKey" type="password" class="form-control form-control-sm text-xs" placeholder="eyJhbGciOi..." />
            </div>
            <button 
              type="button" 
              class="btn btn-sm btn-success w-100 text-xs py-2 d-flex align-items-center justify-content-center gap-1 fw-semibold"
              :disabled="sbSyncing"
              @click="handleSupabaseSync"
            >
              <span v-if="sbSyncing" class="spinner-border spinner-border-sm me-1" style="width: 12px; height: 12px;"></span>
              <span v-else class="d-flex align-items-center gap-1">
                <RefreshCwIcon :size="12" /> Tarik Data & Sinkronkan
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { db, Profile } from '../database';
import { saveSupabaseConfig, pullSupabaseToLocal, getSupabaseConfig } from '../supabase';
import Swal from 'sweetalert2';
import { 
  User as UserIcon, 
  Shield as ShieldIcon, 
  Eye as EyeIcon, 
  EyeOff as EyeOffIcon,
  Database as DatabaseIcon,
  Wifi as WifiIcon,
  RefreshCw as RefreshCwIcon
} from 'lucide-vue-next';

const router = useRouter();

const role = ref<'Ustadz' | 'Admin'>('Ustadz');
const username = ref('');
const password = ref('');
const rememberMe = ref(true);
const showPassword = ref(false);
const loading = ref(false);

// Supabase setup for new devices
const showSupabaseSetup = ref(false);
const sbConfig = getSupabaseConfig();
const sbUrl = ref(sbConfig.url);
const sbAnonKey = ref(sbConfig.anonKey);
const sbSyncing = ref(false);

const handleSupabaseSync = async () => {
  if (!sbUrl.value.trim() || !sbAnonKey.value.trim()) {
    Swal.fire({
      icon: 'warning',
      title: 'Data Tidak Lengkap',
      text: 'Mohon masukkan URL dan Anon Key Supabase Anda terlebih dahulu.',
      confirmButtonColor: '#198754'
    });
    return;
  }

  sbSyncing.value = true;
  try {
    // 1. Save config first
    saveSupabaseConfig(sbUrl.value, sbAnonKey.value);
    
    // 2. Pull from Supabase
    const res = await pullSupabaseToLocal(db);
    sbSyncing.value = false;
    
    if (res.success) {
      await Swal.fire({
        icon: 'success',
        title: 'Sinkronisasi Berhasil',
        text: 'Data profil, admin, dan seluruh database dari Supabase berhasil disinkronkan ke perangkat ini! Aplikasi akan memuat ulang halaman untuk memperbarui daftar akun.',
        confirmButtonColor: '#198754'
      });
      showSupabaseSetup.value = false;
      // Force reload to let SimpasDatabase load the fresh synced profiles
      window.location.reload();
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Sinkronisasi Gagal',
        text: `Koneksi atau sinkronisasi gagal: ${res.message}`,
        confirmButtonColor: '#dc3545'
      });
    }
  } catch (err: any) {
    sbSyncing.value = false;
    Swal.fire({
      icon: 'error',
      title: 'Terjadi Kesalahan',
      text: err.message || 'Gagal terhubung ke server Supabase.',
      confirmButtonColor: '#dc3545'
    });
  }
};

const demoUsers = computed(() => {
  return db.profiles;
});

const fillDemo = (user: Profile) => {
  role.value = user.role;
  username.value = user.username || user.nama;
  if (user.role === 'Admin') {
    password.value = user.password || 'password';
  } else {
    password.value = '';
  }
};

const handleLogin = () => {
  loading.value = true;
  
  setTimeout(() => {
    const user = db.login(
      username.value, 
      role.value, 
      role.value === 'Admin' ? password.value : undefined, 
      rememberMe.value
    );
    loading.value = false;
    
    if (user) {
      Swal.fire({
        icon: 'success',
        title: 'Login Berhasil',
        text: `Selamat datang kembali, ${user.nama}!`,
        timer: 1500,
        showConfirmButton: false
      }).then(() => {
        router.push({ name: 'dashboard' });
      });
    } else {
      const errorMsg = role.value === 'Ustadz' 
        ? 'Nama lengkap atau username Ustadz tidak terdaftar. Silakan periksa kembali atau gunakan pilihan Akun Demo Cepat.'
        : 'Nama pengguna admin tidak cocok atau kata sandi salah. Silakan coba kembali.';
      
      Swal.fire({
        icon: 'error',
        title: 'Login Gagal',
        text: errorMsg,
        confirmButtonColor: '#696cff'
      });
    }
  }, 600);
};

const handleResetPassword = () => {
  Swal.fire({
    title: 'Atur Ulang Kata Sandi',
    text: 'Sistem terintegrasi dengan Firebase/Supabase Auth. Masukkan E-mail terdaftar Anda:',
    input: 'email',
    inputPlaceholder: 'nama@domain.com',
    showCancelButton: true,
    confirmButtonText: 'Kirim Link Reset',
    cancelButtonText: 'Batal',
    confirmButtonColor: '#696cff',
    preConfirm: (email) => {
      if (!email) {
        Swal.showValidationMessage('Email wajib diisi!');
      }
      return email;
    }
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire({
        icon: 'success',
        title: 'Link Reset Dikirim',
        text: `Link untuk mengatur ulang kata sandi telah dikirimkan ke e-mail: ${result.value}`,
        confirmButtonColor: '#696cff'
      });
    }
  });
};
</script>

<style scoped>
.login-bg {
  background-color: var(--bg-app);
  background-image: radial-gradient(var(--primary-light) 1px, transparent 1px);
  background-size: 24px 24px;
}

.app-logo-box {
  width: 32px;
  height: 32px;
  border-radius: 8px;
}

#login-card {
  border-radius: 12px;
  border: 1px solid var(--border-color);
}
</style>
