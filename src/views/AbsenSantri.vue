<template>
  <div>
    <div class="row mb-4">
      <div class="col-12">
        <div class="card p-4 border-0 shadow-sm">
          <h4 class="mb-1 text-heading">Absensi Santri Harian</h4>
          <p class="text-muted mb-0">Lakukan pencatatan kehadiran santri per kelas secara real-time ke Supabase.</p>
        </div>
      </div>
    </div>

    <!-- Configuration Selector -->
    <div class="card shadow-sm border-0 mb-4 p-4">
      <div class="row g-3 align-items-end">
        <div class="col-12 col-md-5">
          <label class="form-label small fw-semibold">Pilih Kelas</label>
          <select v-model="selectedClass" class="form-select" @change="loadStudentAttendance">
            <option value="">-- Silakan Pilih Kelas --</option>
            <option v-for="cls in classes" :key="cls.id" :value="cls.id">
              {{ cls.nama }}
            </option>
          </select>
        </div>
        <div class="col-12 col-md-4">
          <label class="form-label small fw-semibold">Pilih Tanggal Absen</label>
          <input v-model="attendanceDate" type="date" class="form-control" @change="loadStudentAttendance" />
        </div>
        <div class="col-12 col-md-3">
          <button @click="autoFillHadir" class="btn btn-outline-primary w-100" :disabled="!selectedClass">
            Beri Status "Hadir" Semua
          </button>
        </div>
      </div>
    </div>

    <!-- Student Attendance Grid/List -->
    <div v-if="selectedClass" class="card shadow-sm border-0 overflow-hidden">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h5 class="mb-0">Daftar Absensi Santri: <strong class="text-primary">{{ className }}</strong></h5>
        <span class="badge bg-label-info badge-custom py-1">{{ studentsList.length }} Santri</span>
      </div>
      
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th style="width: 60px">No</th>
              <th style="width: 100px">NIS</th>
              <th>Nama Lengkap</th>
              <th style="width: 120px">Jenis Kelamin</th>
              <th style="width: 320px; text-align: center">Status Kehadiran</th>
              <th>Catatan (Sakit/Izin)</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="(student, idx) in studentsList" :key="student.id">
              <tr v-if="attendanceMap[student.id]">
                <td>{{ idx + 1 }}</td>
                <td class="fw-semibold text-xs">{{ student.nis }}</td>
                <td>
                  <div class="fw-bold text-heading">{{ student.nama }}</div>
                </td>
                <td>
                  <span class="badge bg-label-secondary badge-custom text-xs">{{ student.gender }}</span>
                </td>
                <td>
                  <div class="d-flex justify-content-center gap-3">
                    <!-- Hadir -->
                    <label class="d-flex align-items-center gap-1 cursor-pointer">
                      <input 
                        type="radio" 
                        :name="'att-' + student.id" 
                        value="Hadir" 
                        v-model="attendanceMap[student.id].status"
                        class="form-check-input text-success"
                      />
                      <span class="text-xs text-success fw-bold">Hadir</span>
                    </label>
                    
                    <!-- Izin -->
                    <label class="d-flex align-items-center gap-1 cursor-pointer">
                      <input 
                        type="radio" 
                        :name="'att-' + student.id" 
                        value="Izin" 
                        v-model="attendanceMap[student.id].status"
                        class="form-check-input text-warning"
                      />
                      <span class="text-xs text-warning fw-bold">Izin</span>
                    </label>

                    <!-- Sakit -->
                    <label class="d-flex align-items-center gap-1 cursor-pointer">
                      <input 
                        type="radio" 
                        :name="'att-' + student.id" 
                        value="Sakit" 
                        v-model="attendanceMap[student.id].status"
                        class="form-check-input text-info"
                      />
                      <span class="text-xs text-info fw-bold">Sakit</span>
                    </label>

                    <!-- Alfa -->
                    <label class="d-flex align-items-center gap-1 cursor-pointer">
                      <input 
                        type="radio" 
                        :name="'att-' + student.id" 
                        value="Alfa" 
                        v-model="attendanceMap[student.id].status"
                        class="form-check-input text-danger"
                      />
                      <span class="text-xs text-danger fw-bold">Alfa</span>
                    </label>
                  </div>
                </td>
                <td>
                  <input 
                    type="text" 
                    v-model="attendanceMap[student.id].notes" 
                    class="form-control form-control-sm" 
                    placeholder="Keterangan..." 
                  />
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <!-- Action Footer -->
      <div class="card-footer bg-light border-top p-4 d-flex justify-content-end gap-2">
        <button @click="saveAttendance" class="btn btn-primary d-flex align-items-center gap-2">
          <SaveIcon :size="18" /> Simpan Presensi Real-Time
        </button>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="card border-0 shadow-sm p-5 text-center text-muted">
      <div class="mb-3 text-secondary">
        <UsersIcon :size="48" />
      </div>
      <h5>Silakan pilih kelas dan tanggal terlebih dahulu</h5>
      <p class="mb-0 small">Formulir presensi santri akan dimuat di sini secara otomatis.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { db } from '../database';
import Swal from 'sweetalert2';
import { Save as SaveIcon, Users as UsersIcon } from 'lucide-vue-next';

const selectedClass = ref('');
const attendanceDate = ref(new Date().toISOString().slice(0, 10));

// Internal map of student attendance state: student_id -> { status: string, notes: string }
const attendanceMap = ref<Record<string, { status: 'Hadir' | 'Izin' | 'Sakit' | 'Alfa'; notes: string }>>({});

const classes = computed(() => db.classes);

const className = computed(() => {
  return db.classes.find(c => c.id === selectedClass.value)?.nama || '';
});

const studentsList = computed(() => {
  if (!selectedClass.value) return [];
  return db.students.filter(s => s.kelas_id === selectedClass.value);
});

// Watch class or date changes to reload Map values
const loadStudentAttendance = () => {
  if (!selectedClass.value) return;

  const currentList = studentsList.value;
  const tempMap: Record<string, { status: 'Hadir' | 'Izin' | 'Sakit' | 'Alfa'; notes: string }> = {};

  currentList.forEach(student => {
    // Check if there is an existing record in the database for this student on this day
    const existing = db.attendance.find(a => 
      a.role === 'Santri' && 
      a.person_id === student.id && 
      a.date === attendanceDate.value
    );

    tempMap[student.id] = {
      status: existing ? existing.status : 'Hadir',
      notes: existing && existing.notes ? existing.notes : ''
    };
  });

  attendanceMap.value = tempMap;
};

// Auto-load student attendance when class or date changes
watch([selectedClass, attendanceDate], () => {
  loadStudentAttendance();
}, { immediate: true });

// Auto fill all as Present
const autoFillHadir = () => {
  studentsList.value.forEach(s => {
    if (attendanceMap.value[s.id]) {
      attendanceMap.value[s.id].status = 'Hadir';
    }
  });
};

const saveAttendance = () => {
  if (!selectedClass.value) return;

  const batch: any[] = [];
  studentsList.value.forEach(student => {
    const mapVal = attendanceMap.value[student.id];
    batch.push({
      date: attendanceDate.value,
      role: 'Santri',
      person_id: student.id,
      person_name: student.nama,
      status: mapVal ? mapVal.status : 'Hadir',
      notes: mapVal ? mapVal.notes : '',
      kelas_id: selectedClass.value
    });
  });

  db.saveAttendanceBatch(batch);

  Swal.fire({
    icon: 'success',
    title: 'Berhasil Disimpan',
    text: 'Data absensi santri berhasil disinkronkan ke Supabase secara real-time!',
    confirmButtonColor: '#696cff'
  });
};
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
.bg-label-info {
  background-color: rgba(3, 195, 236, 0.16);
  color: var(--info);
}
.bg-label-secondary {
  background-color: rgba(133, 146, 163, 0.16);
  color: var(--secondary);
}
</style>
