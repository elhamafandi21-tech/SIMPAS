<template>
  <div>
    <!-- Page Header -->
    <div class="row mb-4">
      <div class="col-12">
        <div class="card p-4 border-0 shadow-sm bg-gradient-primary text-white">
          <div class="d-flex align-items-center justify-content-between flex-wrap gap-3">
            <div>
              <h4 class="mb-1 text-white fw-bold d-flex align-items-center gap-2">
                <DatabaseIcon :size="24" /> Integrasi Cloud Database Supabase
              </h4>
              <p class="mb-0 text-white-50 text-sm">
                Hubungkan data lokal aplikasi SIMPAS ke server Cloud Supabase Anda untuk penyimpanan terpusat dan sinkronisasi real-time.
              </p>
            </div>
            <div>
              <span class="badge bg-white text-primary px-3 py-2 fw-semibold fs-7 d-flex align-items-center gap-1">
                <span class="pulse-status-dot" :class="{ 'connected': connectionStatus === 'connected' }"></span>
                {{ connectionStatus === 'connected' ? 'Terhubung ke Cloud' : 'Mode Offline / Lokal' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="row g-4">
      <!-- Left Column: Settings and Connection -->
      <div class="col-12 col-lg-5">
        <!-- Configuration Form -->
        <div class="card shadow-sm border-0 mb-4">
          <div class="card-body p-4">
            <h5 class="fw-bold text-heading mb-3 pb-2 border-bottom d-flex align-items-center gap-2">
              <SettingsIcon :size="18" class="text-primary" /> Pengaturan API Credentials
            </h5>
            <p class="text-muted text-xs mb-4">
              Konfigurasikan detail API dari dashboard project Supabase Anda. Kunci ini disimpan dengan aman di browser lokal Anda.
            </p>

            <form @submit.prevent="saveConfig">
              <div class="mb-3">
                <label class="form-label small fw-semibold">SUPABASE URL</label>
                <div class="input-group">
                  <span class="input-group-text bg-light text-muted small"><LinkIcon :size="14" /></span>
                  <input 
                    v-model="form.url" 
                    type="url" 
                    class="form-control" 
                    placeholder="https://xxxxxx.supabase.co" 
                    required 
                  />
                </div>
              </div>

              <div class="mb-4">
                <label class="form-label small fw-semibold">SUPABASE ANON KEY</label>
                <div class="input-group">
                  <span class="input-group-text bg-light text-muted small"><KeyIcon :size="14" /></span>
                  <input 
                    v-model="form.anonKey" 
                    type="password" 
                    class="form-control" 
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." 
                    required 
                  />
                </div>
              </div>

              <!-- Action buttons -->
              <div class="d-flex gap-2">
                <button type="submit" class="btn btn-primary flex-grow-1 py-2 d-flex align-items-center justify-content-center gap-2">
                  <SaveIcon :size="16" /> Simpan & Hubungkan
                </button>
                <button 
                  v-if="hasSavedConfig" 
                  type="button" 
                  @click="disconnectSupabase" 
                  class="btn btn-outline-danger py-2"
                  title="Putus Koneksi"
                >
                  <TrashIcon :size="16" />
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Connection Diagnostics Card -->
        <div class="card shadow-sm border-0">
          <div class="card-body p-4">
            <h5 class="fw-bold text-heading mb-3 pb-2 border-bottom">Status & Diagnostik</h5>
            
            <div class="p-3 rounded mb-3" :class="connectionStatus === 'connected' ? 'bg-light-success text-success' : 'bg-light-secondary text-muted'">
              <div class="d-flex align-items-center gap-2 fw-semibold">
                <span class="pulse-status-dot" :class="{ 'connected': connectionStatus === 'connected' }"></span>
                Status: {{ connectionStatus === 'connected' ? 'TERKONEKSI SECARA REAL-TIME' : 'BELUM TERHUBUNG' }}
              </div>
              <p class="text-xs mb-0 mt-1">
                {{ connectionStatus === 'connected' 
                  ? 'Aplikasi terhubung ke database cloud Supabase. Sinkronisasi data dua arah siap digunakan.' 
                  : 'Aplikasi berjalan dalam mode fallback offline (Local Storage). Hubungkan credentials di atas untuk mengaktifkan sinkronisasi.' }}
              </p>
            </div>

            <!-- Auto Sync Toggle -->
            <div class="form-check form-switch mb-3 p-0 ps-4 py-2 border rounded bg-light">
              <input 
                class="form-check-input ms-0 float-start me-2" 
                type="checkbox" 
                role="switch" 
                id="autoSyncSwitch" 
                v-model="autoSyncEnabled"
                @change="toggleAutoSync"
              />
              <label class="form-check-label fw-semibold text-heading small" for="autoSyncSwitch">
                Aktifkan Auto-Sync Otomatis
              </label>
              <div class="text-muted text-xs ms-4">Setiap perubahan data lokal akan disinkronkan ke Supabase secara real-time.</div>
            </div>

            <button 
              type="button" 
              @click="testConnection" 
              class="btn btn-outline-secondary w-full py-2 d-flex align-items-center justify-content-center gap-2"
              :disabled="!form.url || !form.anonKey"
            >
              <WifiIcon :size="16" /> Tes Validasi Koneksi
            </button>
          </div>
        </div>
      </div>

      <!-- Right Column: Sync Center & SQL Generator -->
      <div class="col-12 col-lg-7">
        <div class="card shadow-sm border-0">
          <div class="card-header bg-white border-bottom p-0">
            <!-- Tabs Navigation -->
            <ul class="nav nav-tabs card-header-tabs m-0 border-0" id="supabaseTab" role="tablist">
              <li class="nav-item flex-grow-1 text-center" role="presentation">
                <button 
                  class="nav-link w-full py-3 fw-semibold border-0 rounded-0 active d-flex align-items-center justify-content-center gap-2" 
                  id="sync-tab" 
                  data-bs-toggle="tab" 
                  data-bs-target="#sync-pane" 
                  type="button" 
                  role="tab"
                >
                  <RefreshCwIcon :size="16" /> Pusat Sinkronisasi Data
                </button>
              </li>
              <li class="nav-item flex-grow-1 text-center" role="presentation">
                <button 
                  class="nav-link w-full py-3 fw-semibold border-0 rounded-0 d-flex align-items-center justify-content-center gap-2" 
                  id="sql-tab" 
                  data-bs-toggle="tab" 
                  data-bs-target="#sql-pane" 
                  type="button" 
                  role="tab"
                >
                  <FileCodeIcon :size="16" /> Script Skema Tabel (SQL)
                </button>
              </li>
            </ul>
          </div>

          <div class="card-body p-4">
            <div class="tab-content" id="supabaseTabContent">
              <!-- Pane 1: Sync Actions -->
              <div class="tab-pane fade show active" id="sync-pane" role="tabpanel" aria-labelledby="sync-tab">
                <h5 class="fw-bold text-heading mb-3">Manajemen Sinkronisasi Sinkron</h5>
                <p class="text-muted text-xs mb-4">
                  Pastikan Anda telah menjalankan <strong>Script Skema Tabel (SQL)</strong> di dashboard Supabase Anda sebelum melakukan sinkronisasi massal di bawah ini.
                </p>

                <div class="row g-3">
                  <!-- Push Data Card -->
                  <div class="col-12 col-md-6">
                    <div class="border rounded p-3 h-full d-flex flex-column justify-content-between">
                      <div>
                        <div class="d-flex align-items-center gap-2 text-primary fw-bold mb-2">
                          <UploadCloudIcon :size="20" /> Upload ke Cloud (Push)
                        </div>
                        <p class="text-muted text-xs mb-3">
                          Kirim seluruh data lokal (santri, presensi, nilai, dll.) dari browser Anda saat ini ke server database Supabase.
                        </p>
                      </div>
                      <button 
                        @click="handlePush" 
                        class="btn btn-primary w-full py-2 d-flex align-items-center justify-content-center gap-2"
                        :disabled="connectionStatus !== 'connected' || syncing"
                      >
                        <span v-if="syncing" class="spinner-border spinner-border-sm"></span>
                        <span v-else><UploadCloudIcon :size="16" /> Jalankan Push Data</span>
                      </button>
                    </div>
                  </div>

                  <!-- Pull Data Card -->
                  <div class="col-12 col-md-6">
                    <div class="border rounded p-3 h-full d-flex flex-column justify-content-between">
                      <div>
                        <div class="d-flex align-items-center gap-2 text-success fw-bold mb-2">
                          <DownloadCloudIcon :size="20" /> Download ke Lokal (Pull)
                        </div>
                        <p class="text-muted text-xs mb-3">
                          Ambil seluruh data yang ada di database cloud Supabase Anda, lalu sinkronkan dan timpa data di local storage browser Anda.
                        </p>
                      </div>
                      <button 
                        @click="handlePull" 
                        class="btn btn-success text-white w-full py-2 d-flex align-items-center justify-content-center gap-2"
                        :disabled="connectionStatus !== 'connected' || syncing"
                      >
                        <span v-if="syncing" class="spinner-border spinner-border-sm"></span>
                        <span v-else><DownloadCloudIcon :size="16" /> Jalankan Pull Data</span>
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Statistics of current offline database -->
                <div class="mt-4 pt-3 border-top">
                  <h6 class="fw-bold text-heading mb-3">Ringkasan Data Lokal yang Tersedia:</h6>
                  <div class="row g-2">
                    <div v-for="(count, label) in localStats" :key="label" class="col-6 col-sm-4">
                      <div class="p-2 border rounded text-center bg-light">
                        <div class="fw-bold text-heading fs-5 mb-0">{{ count }}</div>
                        <span class="text-muted small text-xs block" style="font-size: 0.7rem">{{ label }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Pane 2: SQL Scripts -->
              <div class="tab-pane fade" id="sql-pane" role="tabpanel" aria-labelledby="sql-tab">
                <div class="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
                  <div>
                    <h5 class="fw-bold text-heading mb-1">Skema Inisialisasi Supabase</h5>
                    <p class="text-muted text-xs mb-0">Salin skema SQL di bawah ini dan jalankan langsung di dashboard SQL Editor Supabase Anda.</p>
                  </div>
                  <button @click="copySQL" class="btn btn-outline-primary btn-sm d-flex align-items-center gap-1">
                    <CopyIcon :size="14" /> {{ copied ? 'Tersalin!' : 'Salin Script' }}
                  </button>
                </div>

                <div class="position-relative">
                  <pre class="bg-dark text-light p-3 rounded text-xs overflow-auto font-mono mb-3" style="max-height: 280px; font-family: monospace;">{{ sqlSchema }}</pre>
                </div>

                <div class="alert bg-label-info text-info border-0 p-3 small">
                  <h6 class="fw-bold mb-1" style="color: var(--info)"><InfoIcon :size="16" class="align-middle me-1" /> Cara Menyiapkan Database Supabase:</h6>
                  <ol class="mb-2 ps-3 text-xs text-muted">
                    <li>Masuk ke <a href="https://supabase.com" target="_blank" class="fw-semibold">Supabase Dashboard</a> lalu buat proyek baru atau gunakan yang sudah ada.</li>
                    <li>Di menu sidebar kiri, pilih <strong>SQL Editor</strong>, lalu klik <strong>New query</strong>.</li>
                    <li>Tempelkan script SQL di atas, lalu tekan tombol <strong>Run</strong> di kanan bawah.</li>
                    <li>Salin URL & Anon Key proyek baru Anda di menu <strong>Settings > API</strong> lalu tempel di form kiri halaman ini!</li>
                  </ol>

                  <div class="border-top pt-2 mt-2">
                    <strong class="d-block text-warning mb-1">⚠️ Migrasi/Update Database yang Sudah Ada:</strong>
                    <span class="text-xs text-muted d-block mb-2">
                      Jika Anda mendapatkan error saat melakukan Push Data karena perubahan struktur kelas atau profil (penghapusan kolom <code>tingkat</code>, penambahan <code>wali_kelas_id</code>, <code>username</code>, dan <code>telpon</code>), silakan salin dan jalankan query berikut di <strong>SQL Editor Supabase</strong> Anda untuk memperbarui skema:
                    </span>
                    <pre class="bg-dark text-warning p-2 rounded text-xxs mb-0 font-mono" style="font-family: monospace;">ALTER TABLE public.classes DROP COLUMN IF EXISTS tingkat;
ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS wali_kelas_id TEXT REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS telpon TEXT;</pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { db } from '../database';
import { 
  getSupabaseConfig, 
  saveSupabaseConfig, 
  clearSupabaseConfig, 
  getSupabaseClient,
  pushLocalToSupabase,
  pullSupabaseToLocal,
  SUPABASE_SQL_SCHEMA
} from '../supabase';
import Swal from 'sweetalert2';
import { 
  Database as DatabaseIcon, 
  Settings as SettingsIcon, 
  Link as LinkIcon, 
  Key as KeyIcon, 
  Save as SaveIcon, 
  Trash as TrashIcon,
  Wifi as WifiIcon,
  RefreshCw as RefreshCwIcon,
  FileCode as FileCodeIcon,
  UploadCloud as UploadCloudIcon,
  DownloadCloud as DownloadCloudIcon,
  Copy as CopyIcon,
  Info as InfoIcon
} from 'lucide-vue-next';

const form = ref({
  url: '',
  anonKey: ''
});

const connectionStatus = ref<'disconnected' | 'connected'>('disconnected');
const hasSavedConfig = ref(false);
const autoSyncEnabled = ref(false);
const syncing = ref(false);
const copied = ref(false);

const sqlSchema = SUPABASE_SQL_SCHEMA;

// Local stats derived from LocalStorage db
const localStats = computed(() => {
  return {
    'Kelas': db.classes.length,
    'Siswa/Santri': db.students.length,
    'Presensi/Absen': db.attendance.length,
    'Mata Pelajaran': db.subjects.length,
    'Jurnal Mengajar': db.teachingJournals.length,
    'Setoran Hafalan': db.nadhomanSetorans.length,
    'Nilai Rapor': db.grades.length,
    'Pengguna': db.profiles.length
  };
});

onMounted(async () => {
  // Load saved credentials if any
  const config = getSupabaseConfig();
  form.value.url = config.url;
  form.value.anonKey = config.anonKey;

  if (config.url && config.anonKey) {
    hasSavedConfig.value = true;
    await verifyConnection();
  }

  // Load auto sync toggle
  autoSyncEnabled.value = localStorage.getItem('simpas_supabase_autosync') !== 'false';
});

const verifyConnection = async () => {
  const client = getSupabaseClient();
  if (!client) {
    connectionStatus.value = 'disconnected';
    return false;
  }

  try {
    // Quick test query to a default table or schema
    const { error } = await client.from('profiles').select('count', { count: 'exact', head: true });
    
    // If the error is 'relation does not exist', the connection is valid, but schema is not set. We consider this valid.
    if (error && error.code !== 'PGRST116' && error.message.includes('relation') === false) {
      console.warn('Diagnostics error code:', error.code, error.message);
      connectionStatus.value = 'disconnected';
      return false;
    }
    
    connectionStatus.value = 'connected';
    return true;
  } catch (err) {
    console.error('Verify connection error:', err);
    connectionStatus.value = 'disconnected';
    return false;
  }
};

const saveConfig = async () => {
  if (!form.value.url.startsWith('https://')) {
    Swal.fire({
      icon: 'error',
      title: 'URL Tidak Valid',
      text: 'Format URL Supabase harus dimulai dengan https://',
      confirmButtonColor: '#ff3e1d'
    });
    return;
  }

  saveSupabaseConfig(form.value.url, form.value.anonKey);
  hasSavedConfig.value = true;

  Swal.fire({
    title: 'Menghubungkan...',
    html: 'Sedang mencoba memvalidasi koneksi API Supabase...',
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });

  const ok = await verifyConnection();
  Swal.close();

  if (ok) {
    Swal.fire({
      icon: 'success',
      title: 'Supabase Terhubung',
      text: 'Koneksi berhasil diverifikasi! Sekarang Anda dapat mengunggah atau mengunduh data.',
      confirmButtonColor: '#696cff'
    });
  } else {
    Swal.fire({
      icon: 'warning',
      title: 'Koneksi Bermasalah',
      html: 'Credentials disimpan, namun kami tidak dapat menghubungi server Supabase Anda.<br><br><small class="text-muted">Pastikan URL dan Anon Key sudah benar, atau periksa koneksi internet Anda.</small>',
      confirmButtonColor: '#ffc107'
    });
  }
};

const disconnectSupabase = () => {
  Swal.fire({
    title: 'Hapus Kredensial',
    text: 'Apakah Anda yakin ingin menghapus konfigurasi Supabase dan kembali ke mode offline lokal?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Ya, Putuskan',
    cancelButtonText: 'Batal',
    confirmButtonColor: '#ff3e1d',
    cancelButtonColor: '#8592a3'
  }).then((result) => {
    if (result.isConfirmed) {
      clearSupabaseConfig();
      form.value.url = '';
      form.value.anonKey = '';
      hasSavedConfig.value = false;
      connectionStatus.value = 'disconnected';
      autoSyncEnabled.value = false;
      localStorage.setItem('simpas_supabase_autosync', 'false');

      Swal.fire({
        icon: 'success',
        title: 'Koneksi Diputus',
        text: 'Aplikasi kembali beroperasi penuh secara offline/lokal.',
        confirmButtonColor: '#696cff'
      });
    }
  });
};

const testConnection = async () => {
  Swal.fire({
    title: 'Menguji Koneksi...',
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });

  const ok = await verifyConnection();
  Swal.close();

  if (ok) {
    Swal.fire({
      icon: 'success',
      title: 'Koneksi Berhasil!',
      text: 'Server Supabase merespons dengan sukses. Database cloud siap digunakan.',
      confirmButtonColor: '#71dd37'
    });
  } else {
    Swal.fire({
      icon: 'error',
      title: 'Koneksi Gagal',
      text: 'Gagal memvalidasi kredensial Supabase. Silakan periksa URL/Key atau pastikan tabel skema database sudah Anda buat.',
      confirmButtonColor: '#ff3e1d'
    });
  }
};

const toggleAutoSync = () => {
  if (autoSyncEnabled.value && connectionStatus.value !== 'connected') {
    autoSyncEnabled.value = false;
    Swal.fire({
      icon: 'warning',
      title: 'Koneksi Diperlukan',
      text: 'Hubungkan Supabase terlebih dahulu sebelum mengaktifkan Auto-Sync real-time.',
      confirmButtonColor: '#ffc107'
    });
    return;
  }
  localStorage.setItem('simpas_supabase_autosync', autoSyncEnabled.value ? 'true' : 'false');
  
  Swal.fire({
    icon: 'success',
    title: autoSyncEnabled.value ? 'Auto-Sync Aktif' : 'Auto-Sync Dinonaktifkan',
    text: autoSyncEnabled.value 
      ? 'Setiap penambahan/perubahan data sekarang akan otomatis diteruskan ke Supabase.'
      : 'Perubahan data hanya akan tersimpan lokal di browser.',
    timer: 1500,
    showConfirmButton: false
  });
};

const handlePush = async () => {
  Swal.fire({
    title: 'Sedang Mengunggah...',
    html: 'Mengunggah seluruh tabel ke Supabase. Mohon jangan menutup halaman ini...',
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });

  syncing.value = true;
  const result = await pushLocalToSupabase(db);
  syncing.value = false;
  Swal.close();

  if (result.success) {
    let summary = '<ul class="text-start small mb-0">';
    if (result.counts) {
      for (const [tbl, qty] of Object.entries(result.counts)) {
        summary += `<li><strong>${tbl}</strong>: ${qty} baris berhasil diunggah</li>`;
      }
    }
    summary += '</ul>';

    Swal.fire({
      icon: 'success',
      title: 'Push Sukses!',
      html: `Sinkronisasi lokal -> cloud selesai.<br><br>${summary}`,
      confirmButtonColor: '#696cff'
    });
  } else {
    Swal.fire({
      icon: 'error',
      title: 'Gagal Push Data',
      html: `Terjadi kendala saat sinkronisasi:<br><span class="text-danger small">${result.message}</span><br><br><small class="text-muted">Pastikan Anda sudah menjalankan script SQL inisialisasi tabel di Supabase Dashboard SQL Editor.</small>`,
      confirmButtonColor: '#ff3e1d'
    });
  }
};

const handlePull = () => {
  Swal.fire({
    title: 'Download Data (Pull)',
    text: 'Aksi ini akan MENGGANTI/MENIMPA seluruh data lokal di browser Anda dengan data teranyar yang tersimpan di cloud Supabase. Lanjutkan?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Ya, Download & Timpa',
    cancelButtonText: 'Batal',
    confirmButtonColor: '#71dd37',
    cancelButtonColor: '#8592a3'
  }).then(async (res) => {
    if (res.isConfirmed) {
      Swal.fire({
        title: 'Mengunduh Data...',
        html: 'Menarik seluruh tabel dari Supabase...',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      syncing.value = true;
      const result = await pullSupabaseToLocal(db);
      syncing.value = false;
      Swal.close();

      if (result.success) {
        let summary = '<ul class="text-start small mb-0">';
        if (result.counts) {
          for (const [tbl, qty] of Object.entries(result.counts)) {
            summary += `<li><strong>${tbl}</strong>: ${qty} baris dimuat</li>`;
          }
        }
        summary += '</ul>';

        Swal.fire({
          icon: 'success',
          title: 'Pull Sukses!',
          html: `Database lokal browser berhasil diperbarui dari Cloud.<br><br>${summary}`,
          confirmButtonColor: '#71dd37'
        }).then(() => {
          // Hard reload or state trigger to update all views
          window.location.reload();
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Gagal Pull Data',
          html: `Terjadi kesalahan saat memuat data cloud:<br><span class="text-danger small">${result.message}</span>`,
          confirmButtonColor: '#ff3e1d'
        });
      }
    }
  });
};

const copySQL = () => {
  navigator.clipboard.writeText(sqlSchema);
  copied.value = true;
  setTimeout(() => {
    copied.value = false;
  }, 2000);

  Swal.fire({
    icon: 'success',
    title: 'Script Tersalin',
    text: 'Script skema SQL berhasil disalin ke clipboard Anda.',
    timer: 1000,
    showConfirmButton: false
  });
};
</script>

<style scoped>
.bg-gradient-primary {
  background: linear-gradient(72.47deg, var(--primary) 22.16%, #34d399 76.47%);
}

.bg-light-success {
  background-color: rgba(113, 221, 55, 0.08);
  border: 1px solid rgba(113, 221, 55, 0.2);
}

.bg-light-secondary {
  background-color: rgba(133, 146, 163, 0.08);
  border: 1px solid rgba(133, 146, 163, 0.2);
}

.pulse-status-dot {
  display: inline-block;
  width: 9px;
  height: 9px;
  background-color: #8592a3;
  border-radius: 50%;
}

.pulse-status-dot.connected {
  background-color: #71dd37;
  box-shadow: 0 0 0 0 rgba(113, 221, 55, 0.7);
  animation: pulse-green 1.5s infinite;
}

@keyframes pulse-green {
  0% {
    box-shadow: 0 0 0 0 rgba(113, 221, 55, 0.7);
  }
  70% {
    box-shadow: 0 0 0 5px rgba(113, 221, 55, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(113, 221, 55, 0);
  }
}

.font-mono {
  font-family: 'JetBrains Mono', 'Courier New', Courier, monospace;
  white-space: pre-wrap;
  word-break: break-all;
}

.nav-tabs .nav-link {
  color: var(--secondary);
  border-bottom: 2px solid transparent !important;
}

.nav-tabs .nav-link.active {
  color: var(--primary) !important;
  border-bottom: 2px solid var(--primary) !important;
  background-color: transparent !important;
}

.bg-label-info {
  background-color: rgba(3, 195, 236, 0.08);
  color: var(--info) !important;
}
</style>
