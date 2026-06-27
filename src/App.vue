<template>
  <router-view />
</template>

<script setup lang="ts">
import { onMounted } from 'vue';

onMounted(() => {
  // Load saved theme or set light by default
  const theme = localStorage.getItem('simpas_theme') || 'light';
  document.documentElement.setAttribute('data-theme', theme);
});
</script>

<style>
/* Global system styles can go here if needed */
</style>
