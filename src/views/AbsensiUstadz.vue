<template>
  <div>
    <div class="row mb-4">
      <div class="col-12">
        <div class="card p-4 border-0 shadow-sm">
          <h4 class="mb-1 text-heading">Absensi Mandiri Ustadz / Ustadzah</h4>
          <p class="text-muted mb-0">Lakukan pencatatan kehadiran harian mengajar Anda untuk keperluan administrasi Madin Pancasila.</p>
        </div>
      </div>
    </div>

    <div class="row g-4">
      <!-- Active Punch Card -->
      <div class="col-12 col-md-6 col-lg-5">
        <div class="card shadow-sm border-0 h-100 text-center p-4">
          <div class="card-body d-flex flex-column justify-content-center align-items-center">
            <div class="mb-3 text-primary bg-light p-3 rounded-circle d-inline-block">
              <ClockIcon :size="48" />
            </div>
            
            <h5 class="fw-bold text-heading mb-1">Presensi Hari Ini</h5>
            <p class="text-muted text-sm">{{ todayStr }}</p>

            <div class="display-5 fw-bold text-primary mb-4" id="digital-clock">
              {{ clockTime }}
            </div>

            <div v-if="hasCheckedIn" class="alert alert-success d-flex align-items-center justify-content-center gap-2 w-100 py-3 mb-0">
              <CheckCircleIcon :size="20" />
              <div>
                <div class="fw-bold small">Sudah Presensi Hadir!</div>
                <div class="text-xs">Dicatat pada: {{ checkInRecord?.date }}</div>
              </div>
            </div>

            <div v-else class="w-100">
              <div class="mb-3">
                <label class="form-label text-start d-block small fw-semibold">Status Kehadiran</label>
                <select v-model="status" class="form-select">
                  <option value="Hadir">Hadir (Mengajar)</option>
                  <option value="Izin">Izin (Berhalangan)</option>
                  <option value="Sakit">Sakit</option>
                </select>
              </div>

              <div class="mb-4">
                <label class="form-label text-start d-block small fw-semibold">Catatan / Keterangan (Opsional)</label>
                <input v-model="notes" type="text" class="form-control" placeholder="Contoh: Mengganti jam, dll..." />
              </div>

              <button @click="submitCheckIn" class="btn btn-primary w-100 py-2 d-flex align-items-center justify-content-center gap-2">
                <ClipboardCheckIcon :size="18" />
                Kirim Presensi Sekarang
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Presensi Instructions Info Box -->
      <div class="col-12 col-md-6 col-lg-7">
        <div class="card shadow-sm border-0 h-100 p-4">
          <h5 class="fw-bold text-heading mb-3">Ketentuan & Panduan Presensi Guru</h5>
          <div class="d-flex flex-column gap-3">
            <div class="d-flex gap-3 align-items-start">
              <div class="badge bg-label-primary p-2 rounded text-primary">01</div>
              <div>
                <h6 class="fw-semibold text-heading mb-1">Presensi Satu Kali Sehari</h6>
                <p class="text-muted text-sm mb-0">Ustadz/Ustadzah hanya diperkenankan melakukan presensi harian sebanyak satu kali per hari sebelum jam pembelajaran dimulai.</p>
              </div>
            </div>
            
            <div class="d-flex gap-3 align-items-start">
              <div class="badge bg-label-success p-2 rounded text-success">02</div>
              <div>
                <h6 class="fw-semibold text-heading mb-1">Sinkronisasi Otomatis Supabase</h6>
                <p class="text-muted text-sm mb-0">Seluruh data presensi Anda tersimpan di database cloud Supabase/Firebase secara real-time dan dipantau langsung oleh Admin Madin.</p>
              </div>
            </div>

            <div class="d-flex gap-3 align-items-start">
              <div class="badge bg-label-warning p-2 rounded text-warning">03</div>
              <div>
                <h6 class="fw-semibold text-heading mb-1">Izin Berhalangan Mengajar</h6>
                <p class="text-muted text-sm mb-0">Jika berhalangan mengajar karena udzur syar'i, silakan pilih status 'Izin' atau 'Sakit' dan berikan keterangan singkat di kolom catatan.</p>
              </div>
            </div>
          </div>

          <!-- Total Presence Progress Info -->
          <div class="mt-4 pt-3 border-top">
            <h6 class="fw-semibold text-heading mb-2">Statistik Kehadiran Anda Bulan Ini</h6>
            <div class="d-flex justify-content-between align-items-center mb-1">
              <span class="text-sm text-muted">Persentase Kehadiran</span>
              <span class="fw-bold text-heading text-sm">{{ presencePercentage }}%</span>
            </div>
            <div class="progress" style="height: 8px;">
              <div class="progress-bar bg-success" role="progressbar" :style="{ width: presencePercentage + '%' }" aria-valuenow="presencePercentage" aria-valuemin="0" aria-valuemax="100"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { db, Attendance } from '../database';
import Swal from 'sweetalert2';
import { 
  Clock as ClockIcon, 
  CheckCircle as CheckCircleIcon,
  ClipboardCheck as ClipboardCheckIcon
} from 'lucide-vue-next';

const status = ref<'Hadir' | 'Izin' | 'Sakit' | 'Alfa'>('Hadir');
const notes = ref('');
const clockTime = ref('');
const todayStr = ref('');
let intervalId: any = null;

const currentUser = computed(() => db.session.currentUser);

// Load current records
const userAttendanceRecords = computed(() => {
  if (!currentUser.value) return [];
  return db.attendance.filter(a => a.role === 'Ustadz' && a.person_id === currentUser.value?.id);
});

const todayFormatted = computed(() => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const date = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${date}`;
});

const checkInRecord = computed(() => {
  return userAttendanceRecords.value.find(a => a.date === todayFormatted.value);
});

const hasCheckedIn = computed(() => {
  return !!checkInRecord.value;
});

const presencePercentage = computed(() => {
  const total = userAttendanceRecords.value.length;
  if (total === 0) return 100;
  const hadir = userAttendanceRecords.value.filter(a => a.status === 'Hadir').length;
  return Math.round((hadir / total) * 100);
});

const updateClock = () => {
  const now = new Date();
  clockTime.value = now.toLocaleTimeString('id-ID', { hour12: false });
};

onMounted(() => {
  updateClock();
  intervalId = setInterval(updateClock, 1000);

  const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  todayStr.value = new Date().toLocaleDateString('id-ID', options);
});

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId);
});

const submitCheckIn = () => {
  if (!currentUser.value) return;

  const record: Omit<Attendance, 'id'> = {
    date: todayFormatted.value,
    role: 'Ustadz',
    person_id: currentUser.value.id,
    person_name: currentUser.value.nama,
    status: status.value,
    notes: notes.value
  };

  db.saveAttendanceBatch([record]);

  Swal.fire({
    icon: 'success',
    title: 'Presensi Berhasil',
    text: `Presensi ${status.value} Anda telah dicatat untuk hari ini.`,
    confirmButtonColor: '#696cff'
  });
};
</script>

<style scoped>
#digital-clock {
  font-family: 'Courier New', Courier, monospace;
  letter-spacing: 2px;
}
.bg-label-primary {
  background-color: var(--primary-light);
  color: var(--primary);
}
.bg-label-success {
  background-color: rgba(113, 221, 55, 0.16);
  color: var(--success);
}
.bg-label-warning {
  background-color: rgba(255, 171, 0, 0.16);
  color: var(--warning);
}
</style>
