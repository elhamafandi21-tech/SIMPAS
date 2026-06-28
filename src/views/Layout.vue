<template>
  <div class="layout-wrapper">
    <!-- Sidebar Overlay for Mobile -->
    <div v-if="mobileSidebarOpen" class="menu-overlay" @click="toggleMobileSidebar"></div>

    <!-- Layout Menu (Sidebar) -->
    <aside 
      class="layout-menu" 
      :class="{ 'show': mobileSidebarOpen }"
      id="layout-sidebar"
    >
      <!-- Brand Logo Header -->
      <div class="d-flex align-items-center justify-content-between p-3 border-bottom">
        <router-link to="/" class="d-flex align-items-center text-decoration-none">
          <img src="/app_icon.jpg" class="rounded me-2 border shadow-xs" style="width: 36px; height: 36px; object-fit: cover;" alt="Logo" />
          <div>
            <span class="fs-5 fw-bold text-heading text-primary block m-0 p-0">SIMPAS</span>
            <span class="text-xs text-muted d-block" style="font-size: 0.65rem; margin-top: -3px;">MADIN PANCASILA</span>
          </div>
        </router-link>
        <!-- Close button on Mobile -->
        <button class="btn btn-sm d-lg-none text-muted" @click="toggleMobileSidebar">
          <XIcon :size="18" />
        </button>
      </div>

      <!-- Scrollable Menu Items -->
      <div class="flex-grow-1 overflow-y-auto py-3">
        <!-- ROLE BADGE -->
        <div class="px-4 mb-3">
          <div class="p-2 rounded d-flex align-items-center bg-light border">
            <img v-if="currentUser?.profile_picture_url" :src="currentUser?.profile_picture_url" class="rounded-circle me-2 object-fit-cover" width="30" height="30" alt="Avatar" />
            <div v-else class="rounded-circle me-2 border d-flex align-items-center justify-content-center bg-light text-secondary" style="width: 30px; height: 30px; min-width: 30px;">
              <UserIcon :size="16" />
            </div>
            <div class="min-w-0">
              <div class="fw-bold text-heading text-truncate text-sm" style="font-size: 0.85rem">
                {{ currentUser?.nama.split(',')[0] }}
              </div>
              <span class="badge" :class="currentUser?.role === 'Admin' ? 'bg-danger text-white' : 'bg-primary text-white'" style="font-size: 0.65rem">
                {{ currentUser?.role }}
              </span>
            </div>
          </div>
        </div>

        <ul class="menu-inner">
          <!-- GENERAL HEADER -->
          <li class="menu-header">Dasbor Utama</li>
          
          <li class="menu-item" :class="{ 'active': $route.name === 'dashboard' }">
            <router-link to="/" class="menu-link" @click="closeMobileSidebar">
              <LayoutDashboardIcon class="menu-icon text-primary" />
              <span>Dasbor {{ currentUser?.role }}</span>
            </router-link>
          </li>

          <!-- ABSENSI SECTION -->
          <li class="menu-header">Absensi</li>
          
          <!-- Ustadz Only: Absensi Ustadz -->
          <li v-if="currentUser?.role === 'Ustadz'" class="menu-item" :class="{ 'active': $route.name === 'absensi-ustadz' }">
            <router-link to="/absensi-ustadz" class="menu-link" @click="closeMobileSidebar">
              <ClipboardCheckIcon class="menu-icon text-success" />
              <span>Absen Mandiri Ustadz</span>
            </router-link>
          </li>

          <li class="menu-item" :class="{ 'active': $route.name === 'rekapan-ustadz' }">
            <router-link to="/rekapan-ustadz" class="menu-link" @click="closeMobileSidebar">
              <HistoryIcon class="menu-icon text-secondary" />
              <span>Rekapan Absen Ustadz</span>
            </router-link>
          </li>

          <!-- Ustadz Only: Absen Santri -->
          <li v-if="currentUser?.role === 'Ustadz'" class="menu-item" :class="{ 'active': $route.name === 'absen-santri' }">
            <router-link to="/absen-santri" class="menu-link" @click="closeMobileSidebar">
              <UserCheckIcon class="menu-icon text-info" />
              <span>Absensi Santri</span>
            </router-link>
          </li>

          <li class="menu-item" :class="{ 'active': $route.name === 'rekapan-santri' }">
            <router-link to="/rekapan-santri" class="menu-link" @click="closeMobileSidebar">
              <UsersIcon class="menu-icon text-warning" />
              <span>Rekapan Absen Santri</span>
            </router-link>
          </li>

          <!-- SILABUS SECTION -->
          <li class="menu-header">Silabus & Materi</li>

          <li v-if="currentUser?.role === 'Ustadz'" class="menu-item" :class="{ 'active': $route.name === 'silabus-laporan' }">
            <router-link to="/silabus-laporan" class="menu-link" @click="closeMobileSidebar">
              <BookOpenIcon class="menu-icon text-success" />
              <span>Laporan Jurnal Mengajar</span>
            </router-link>
          </li>

          <li v-if="currentUser?.role === 'Admin'" class="menu-item" :class="{ 'active': $route.name === 'silabus-target' }">
            <router-link to="/silabus-target" class="menu-link" @click="closeMobileSidebar">
              <TargetIcon class="menu-icon text-danger" />
              <span>Target Silabus Guru</span>
            </router-link>
          </li>

          <!-- NADHOMAN SECTION -->
          <li class="menu-header">Nadhoman</li>

          <li v-if="currentUser?.role === 'Ustadz'" class="menu-item" :class="{ 'active': $route.name === 'nadhoman-setoran' }">
            <router-link to="/nadhoman-setoran" class="menu-link" @click="closeMobileSidebar">
              <BookmarkPlusIcon class="menu-icon text-primary" />
              <span>Setoran Nadhoman</span>
            </router-link>
          </li>

          <li class="menu-item" :class="{ 'active': $route.name === 'nadhoman-rekap' }">
            <router-link to="/nadhoman-rekap" class="menu-link" @click="closeMobileSidebar">
              <AwardIcon class="menu-icon text-info" />
              <span>Rekap Setoran Nadhoman</span>
            </router-link>
          </li>

          <!-- ADMIN ONLY: DATA MASTER -->
          <template v-if="currentUser?.role === 'Admin'">
            <li class="menu-header">Data Master (Admin)</li>

            <li class="menu-item" :class="{ 'active': $route.name === 'mata-pelajaran' }">
              <router-link to="/mata-pelajaran" class="menu-link" @click="closeMobileSidebar">
                <BookIcon class="menu-icon text-primary" />
                <span>Mata Pelajaran</span>
              </router-link>
            </li>

            <li class="menu-item" :class="{ 'active': $route.name === 'kelas' }">
              <router-link to="/kelas" class="menu-link" @click="closeMobileSidebar">
                <GraduationCapIcon class="menu-icon text-success" />
                <span>Manajemen Kelas</span>
              </router-link>
            </li>

            <li class="menu-item" :class="{ 'active': $route.name === 'manajemen-ustadz' }">
              <router-link to="/ustadz" class="menu-link" @click="closeMobileSidebar">
                <ContactIcon class="menu-icon text-danger" />
                <span>Manajemen Ustadz</span>
              </router-link>
            </li>

            <li class="menu-item" :class="{ 'active': $route.name === 'siswa' }">
              <router-link to="/siswa" class="menu-link" @click="closeMobileSidebar">
                <Users2Icon class="menu-icon text-info" />
                <span>Manajemen Santri</span>
              </router-link>
            </li>

            <li class="menu-item" :class="{ 'active': $route.name === 'import-excel' }">
              <router-link to="/import-excel" class="menu-link" @click="closeMobileSidebar">
                <FileSpreadsheetIcon class="menu-icon text-warning" />
                <span>Impor Excel / CSV</span>
              </router-link>
            </li>
          </template>

          <!-- GRADES MANAGEMENT -->
          <li class="menu-header">Akademik</li>

          <li class="menu-item" :class="{ 'active': $route.name === 'manajemen-nilai' }">
            <router-link to="/manajemen-nilai" class="menu-link" @click="closeMobileSidebar">
              <FileSpreadsheetIcon class="menu-icon text-danger" />
              <span>Manajemen Nilai</span>
            </router-link>
          </li>

          <li class="menu-item" :class="{ 'active': $route.name === 'laporan' }">
            <router-link to="/laporan" class="menu-link" @click="closeMobileSidebar">
              <TrendingUpIcon class="menu-icon text-success" />
              <span>Laporan & Cetak</span>
            </router-link>
          </li>

          <!-- SETTINGS -->
          <li class="menu-header">Pengaturan</li>

          <li class="menu-item" :class="{ 'active': $route.name === 'profil' }">
            <router-link to="/profil" class="menu-link" @click="closeMobileSidebar">
              <UserCogIcon class="menu-icon text-secondary" />
              <span>Profil Pengguna</span>
            </router-link>
          </li>

          <li class="menu-item" :class="{ 'active': $route.name === 'supabase' }">
            <router-link to="/supabase" class="menu-link" @click="closeMobileSidebar">
              <DatabaseIcon class="menu-icon text-info" />
              <span>Integrasi Supabase</span>
            </router-link>
          </li>

          <li class="menu-item mt-3">
            <a href="#" class="menu-link text-danger" @click.prevent="handleLogout">
              <LogOutIcon class="menu-icon text-danger" />
              <span>Keluar Sesi</span>
            </a>
          </li>
        </ul>
      </div>

      <!-- Realtime badge info -->
      <div class="p-3 border-top bg-light text-center">
        <div class="d-flex align-items-center justify-content-center gap-2">
          <span class="pulse-indicator"></span>
          <span class="text-xs fw-semibold text-muted">Supabase Sync Live</span>
        </div>
      </div>
    </aside>

    <!-- Layout Page container -->
    <div class="layout-page">
      <!-- Navbar SNEAT -->
      <nav class="layout-navbar navbar navbar-expand-xl align-items-center" id="layout-navbar">
        <div class="w-full d-flex align-items-center justify-content-between">
          <!-- Left trigger for Mobile -->
          <div class="d-flex align-items-center">
            <button class="btn btn-sm d-lg-none me-2 border-0 text-muted" @click="toggleMobileSidebar">
              <MenuIcon :size="24" />
            </button>
            <!-- Mobile Only Brand Header -->
            <div class="d-flex d-md-none align-items-center gap-2 me-3">
              <img src="/app_icon.jpg" class="rounded border" style="width: 28px; height: 28px; object-fit: cover;" alt="Logo" />
              <span class="fw-bold text-primary" style="font-size: 0.95rem; letter-spacing: 0.05em;">SIMPAS</span>
            </div>
            <!-- Desktop Brand Header -->
            <div class="d-none d-md-flex align-items-center gap-1">
              <span class="fw-semibold text-heading text-primary">MADIN PANCASILA SALATIGA</span>
              <span class="text-muted text-sm px-2">|</span>
              <span class="text-muted text-sm">Aplikasi SIMPAS</span>
            </div>
          </div>

          <!-- Right side user menu -->
          <div class="d-flex align-items-center gap-3">
            <!-- Theme Mode Toggle Button -->
            <button class="btn btn-sm btn-icon rounded-circle border-0 text-secondary hover-bg-light" @click="toggleTheme" title="Toggle Theme Mode">
              <SunIcon v-if="currentTheme === 'light'" :size="20" />
              <MoonIcon v-else :size="20" class="text-warning" />
            </button>

            <!-- Real-time time display -->
            <div class="d-none d-lg-block text-end me-2">
              <div class="fw-bold text-heading text-sm" style="font-size: 0.85rem">{{ formattedTime }}</div>
              <div class="text-muted small" style="font-size: 0.75rem">Tahun Ajaran 2025/2026</div>
            </div>

            <!-- Profile Dropdown -->
            <div class="dropdown">
              <button 
                class="btn p-0 d-flex align-items-center gap-2 border-0" 
                type="button" 
                data-bs-toggle="dropdown" 
                aria-expanded="false"
                id="profileDropdown"
              >
                <img v-if="currentUser?.profile_picture_url" :src="currentUser?.profile_picture_url" class="rounded-circle border object-fit-cover" width="38" height="38" alt="Profile" />
                <div v-else class="rounded-circle border d-flex align-items-center justify-content-center bg-light text-secondary" style="width: 38px; height: 38px; min-width: 38px;">
                  <UserIcon :size="18" />
                </div>
              </button>
              <ul class="dropdown-menu dropdown-menu-end shadow border p-2" aria-labelledby="profileDropdown">
                <li>
                  <div class="dropdown-item d-flex align-items-center gap-2 py-2 border-bottom">
                    <img v-if="currentUser?.profile_picture_url" :src="currentUser?.profile_picture_url" class="rounded-circle border object-fit-cover" width="40" height="40" alt="Profile" />
                    <div v-else class="rounded-circle border d-flex align-items-center justify-content-center bg-light text-secondary" style="width: 40px; height: 40px; min-width: 40px;">
                      <UserIcon :size="20" />
                    </div>
                    <div>
                      <div class="fw-bold text-heading text-sm">{{ currentUser?.nama }}</div>
                      <div class="text-muted text-xs small">{{ currentUser?.email }}</div>
                    </div>
                  </div>
                </li>
                <li>
                  <router-link class="dropdown-item d-flex align-items-center gap-2 py-2 mt-2" to="/profil">
                    <UserCogIcon :size="16" />
                    <span>Profil Saya</span>
                  </router-link>
                </li>
                <li>
                  <a class="dropdown-item d-flex align-items-center gap-2 py-2 text-danger" href="#" @click.prevent="handleLogout">
                    <LogOutIcon :size="16" />
                    <span>Keluar Sesi</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </nav>

      <!-- Main Layout Content -->
      <main class="layout-content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>

      <!-- Clean Sneat Footer -->
      <footer class="footer bg-white border-top py-3 px-4 d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2">
        <div class="text-muted small">
          &copy; 2026 <strong>SIMPAS</strong>. Pondok Pesantren Pancasila Salatiga. All Rights Reserved.
        </div>
        <div class="d-flex gap-3 text-muted small">
          <span class="badge bg-label-primary badge-custom py-1 px-2 text-xs">Vite + Vue 3 App</span>
          <span class="badge bg-label-success badge-custom py-1 px-2 text-xs">Bootstrap 5 + Sneat Layout</span>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { db } from '../database';
import Swal from 'sweetalert2';
import {
  LayoutDashboard as LayoutDashboardIcon,
  ClipboardCheck as ClipboardCheckIcon,
  History as HistoryIcon,
  UserCheck as UserCheckIcon,
  Users as UsersIcon,
  BookOpen as BookOpenIcon,
  TargetIcon,
  BookmarkPlus as BookmarkPlusIcon,
  Award as AwardIcon,
  Book as BookIcon,
  GraduationCap as GraduationCapIcon,
  Users2 as Users2Icon,
  FileSpreadsheet as FileSpreadsheetIcon,
  TrendingUp as TrendingUpIcon,
  UserCog as UserCogIcon,
  LogOut as LogOutIcon,
  X as XIcon,
  Menu as MenuIcon,
  Sun as SunIcon,
  Moon as MoonIcon,
  Database as DatabaseIcon,
  Contact as ContactIcon,
  User as UserIcon
} from 'lucide-vue-next';

const router = useRouter();
const mobileSidebarOpen = ref(false);
const currentTheme = ref('light');
const currentTime = ref(new Date());

const currentUser = computed(() => {
  return db.session.currentUser;
});

let timerId: any = null;

onMounted(() => {
  // Load saved theme or check body
  const theme = localStorage.getItem('simpas_theme') || 'light';
  currentTheme.value = theme;
  document.documentElement.setAttribute('data-theme', theme);

  timerId = setInterval(() => {
    currentTime.value = new Date();
  }, 1000);
});

onUnmounted(() => {
  if (timerId) clearInterval(timerId);
});

const formattedTime = computed(() => {
  return currentTime.value.toLocaleString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }) + ' WIB';
});

const toggleMobileSidebar = () => {
  mobileSidebarOpen.value = !mobileSidebarOpen.value;
};

const closeMobileSidebar = () => {
  mobileSidebarOpen.value = false;
};

const toggleTheme = () => {
  const newTheme = currentTheme.value === 'light' ? 'dark' : 'light';
  currentTheme.value = newTheme;
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('simpas_theme', newTheme);
};

const handleLogout = () => {
  Swal.fire({
    title: 'Keluar Sesi',
    text: 'Apakah Anda yakin ingin keluar dari aplikasi SIMPAS?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Ya, Keluar',
    cancelButtonText: 'Batal',
    confirmButtonColor: '#ff3e1d',
    cancelButtonColor: '#8592a3'
  }).then((result) => {
    if (result.isConfirmed) {
      db.logout();
      router.push({ name: 'login' });
      Swal.fire({
        icon: 'success',
        title: 'Berhasil Keluar',
        text: 'Sesi Anda telah dihapus secara aman.',
        timer: 1000,
        showConfirmButton: false
      });
    }
  });
};
</script>

<style scoped>
.brand-box {
  width: 38px;
  height: 38px;
  border-radius: 8px;
  font-weight: 800;
  font-size: 1.3rem;
}

.bg-label-primary {
  background-color: var(--primary-light);
  color: var(--primary);
}

.bg-label-success {
  background-color: rgba(113, 221, 55, 0.16);
  color: var(--success);
}

.hover-bg-light:hover {
  background-color: rgba(67, 89, 113, 0.08);
}

.pulse-indicator {
  display: inline-block;
  width: 8px;
  height: 8px;
  background-color: var(--success);
  border-radius: 50%;
  animation: pulse-animation 2s infinite;
}

@keyframes pulse-animation {
  0% {
    box-shadow: 0 0 0 0 rgba(113, 221, 55, 0.7);
  }
  70% {
    box-shadow: 0 0 0 6px rgba(113, 221, 55, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(113, 221, 55, 0);
  }
}

/* Page transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
