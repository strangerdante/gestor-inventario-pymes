<script setup lang="ts">
import { useAuthStore } from './stores/auth'
import { onMounted } from 'vue'

const authStore = useAuthStore()

onMounted(() => {
  // Registrar usuarios demo para facilitar el login
  authStore.registerDemoUsers()
  
  // Actualizar título de la página
  document.title = 'Sistema de Inventario - PyMEs'
})
</script>

<template>
  <router-view />
</template>