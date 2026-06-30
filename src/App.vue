<template>
  <router-view />
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { db } from './database';

let syncInterval: any = null;

onMounted(async () => {
  // Load saved theme or set light by default
  const theme = localStorage.getItem('simpas_theme') || 'light';
  document.documentElement.setAttribute('data-theme', theme);

  // Background silent sync pull if Supabase is configured
  const triggerPull = async () => {
    try {
      const { getSupabaseConfig, pullSupabaseToLocal } = await import('./supabase');
      const config = getSupabaseConfig();
      const autoSync = localStorage.getItem('simpas_supabase_autosync') !== 'false';
      
      if (config.url && config.anonKey && autoSync) {
        await pullSupabaseToLocal(db);
        console.log('Background silent pull completed successfully.');
      }
    } catch (e) {
      console.warn('Background silent pull failed:', e);
    }
  };

  // Run immediately on startup
  await triggerPull();

  // Run periodically every 30 seconds to fetch changes from other users
  syncInterval = setInterval(triggerPull, 30000);
});

onUnmounted(() => {
  if (syncInterval) {
    clearInterval(syncInterval);
  }
});
</script>

<style>
/* Global system styles can go here if needed */
</style>
