import { createRouter, createWebHashHistory } from 'vue-router';
import { db } from './database';

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('./views/Login.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/',
      component: () => import('./views/Layout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'dashboard',
          component: () => import('./views/DashboardOverview.vue')
        },
        {
          path: 'absensi-ustadz',
          name: 'absensi-ustadz',
          component: () => import('./views/AbsensiUstadz.vue')
        },
        {
          path: 'rekapan-ustadz',
          name: 'rekapan-ustadz',
          component: () => import('./views/RekapanAbsenUstadz.vue')
        },
        {
          path: 'absen-santri',
          name: 'absen-santri',
          component: () => import('./views/AbsenSantri.vue')
        },
        {
          path: 'rekapan-santri',
          name: 'rekapan-santri',
          component: () => import('./views/RekapanAbsenSantri.vue')
        },
        {
          path: 'silabus-laporan',
          name: 'silabus-laporan',
          component: () => import('./views/SilabusLaporan.vue')
        },
        {
          path: 'silabus-target',
          name: 'silabus-target',
          component: () => import('./views/SilabusTarget.vue')
        },
        {
          path: 'nadhoman-setoran',
          name: 'nadhoman-setoran',
          component: () => import('./views/NadhomanSetoran.vue')
        },
        {
          path: 'nadhoman-rekap',
          name: 'nadhoman-rekap',
          component: () => import('./views/RekapanNadhoman.vue')
        },
        {
          path: 'mata-pelajaran',
          name: 'mata-pelajaran',
          component: () => import('./views/MataPelajaran.vue')
        },
        {
          path: 'kelas',
          name: 'kelas',
          component: () => import('./views/Kelas.vue')
        },
        {
          path: 'siswa',
          name: 'siswa',
          component: () => import('./views/Siswa.vue')
        },
        {
          path: 'manajemen-nilai',
          name: 'manajemen-nilai',
          component: () => import('./views/ManajemenNilai.vue')
        },
        {
          path: 'laporan',
          name: 'laporan',
          component: () => import('./views/Laporan.vue')
        },
        {
          path: 'profil',
          name: 'profil',
          component: () => import('./views/Profil.vue')
        },
        {
          path: 'import-excel',
          name: 'import-excel',
          component: () => import('./views/ImportExcel.vue')
        },
        {
          path: 'supabase',
          name: 'supabase',
          component: () => import('./views/SupabaseIntegration.vue')
        }
      ]
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/'
    }
  ]
});

// Guard router
router.beforeEach((to, from, next) => {
  const session = db.session;
  const isLoggedIn = !!session.currentUser;

  if (to.meta.requiresAuth && !isLoggedIn) {
    next({ name: 'login' });
  } else if (to.name === 'login' && isLoggedIn) {
    next({ name: 'dashboard' });
  } else {
    next();
  }
});

export default router;
