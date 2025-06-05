<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const reportes = [
  {
    titulo: 'Reporte de Ventas',
    descripcion: 'Análisis detallado de ventas por período y artículo',
    icono: 'M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
    ruta: 'reportes.ventas'
  },
  {
    titulo: 'Inventario Valorizado',
    descripcion: 'Valor actual del inventario y análisis de stock',
    icono: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
    ruta: 'reportes.inventario'
  },
  {
    titulo: 'Movimientos de Artículos',
    descripcion: 'Registro de entradas y salidas de inventario',
    icono: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4',
    ruta: 'reportes.movimientos'
  }
]

function navegarA(ruta: string) {
  router.push({ name: ruta })
}
</script>

<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Reportes</h1>
      <p class="mt-1 text-sm text-gray-600">
        Acceda a reportes detallados para análisis y toma de decisiones
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="reporte in reportes" 
        :key="reporte.titulo"
        class="card hover:shadow-lg transition-shadow cursor-pointer"
        @click="navegarA(reporte.ruta)"
      >
        <div class="flex items-center justify-center h-12 w-12 rounded-md bg-primary-600 text-white mb-4">
          <svg 
            class="h-6 w-6" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              stroke-linecap="round" 
              stroke-linejoin="round" 
              stroke-width="2" 
              :d="reporte.icono" 
            />
          </svg>
        </div>
        
        <h2 class="text-lg font-medium text-gray-900 mb-2">
          {{ reporte.titulo }}
        </h2>
        
        <p class="text-gray-500">
          {{ reporte.descripcion }}
        </p>
      </div>
    </div>
  </div>
</template>