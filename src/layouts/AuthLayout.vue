<script setup lang="ts">
// Layout para páginas de autenticación
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <h2 class="mt-6 text-center text-3xl font-bold text-gray-900">
        Gestión de Inventarios
      </h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        Aplicación para PyMEs
      </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <router-view />
    </div>
  </div>
</template>