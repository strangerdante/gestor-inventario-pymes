<script setup lang="ts">
import { ref, computed } from 'vue'
import { useDocumentosStore } from '../../stores/documentos'
import { formatCurrency } from '../../utils/format'
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const documentosStore = useDocumentosStore()
const fechaInicio = ref('')
const fechaFin = ref('')

// Configurar fechas por defecto
const hoy = new Date()
fechaFin.value = hoy.toISOString().split('T')[0]
const mesAnterior = new Date(hoy.getFullYear(), hoy.getMonth() - 1, hoy.getDate())
fechaInicio.value = mesAnterior.toISOString().split('T')[0]

const ventasPorPeriodo = computed(() => {
  const documentos = documentosStore.getDocumentosCompletos
    .filter(doc => doc.estado === 'CERRADO')
    .filter(doc => {
      const fecha = new Date(doc.createdAt)
      return fecha >= new Date(fechaInicio.value) && fecha <= new Date(fechaFin.value)
    })

  const ventas = new Map()
  
  documentos.forEach(doc => {
    const fecha = new Date(doc.createdAt)
    const key = `${fecha.getFullYear()}-${(fecha.getMonth() + 1).toString().padStart(2, '0')}-${fecha.getDate().toString().padStart(2, '0')}`
    const valorActual = ventas.get(key) || 0
    ventas.set(key, valorActual + doc.valorTotal)
  })

  return Array.from(ventas.entries())
    .sort(([a], [b]) => a.localeCompare(b))
})

const chartData = computed(() => ({
  labels: ventasPorPeriodo.value.map(([fecha]) => fecha),
  datasets: [
    {
      label: 'Ventas',
      data: ventasPorPeriodo.value.map(([, valor]) => valor),
      backgroundColor: '#3F83F8'
    }
  ]
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const
    },
    title: {
      display: true,
      text: 'Ventas por Período'
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: (value: string | number) => formatCurrency(Number(value))
      }
    }
  }
}

const totalVentas = computed(() => 
  ventasPorPeriodo.value.reduce((sum, [, valor]) => sum + valor, 0)
)

const promedioVentas = computed(() => 
  ventasPorPeriodo.value.length > 0 ? 
    totalVentas.value / ventasPorPeriodo.value.length : 
    0
)
</script>

<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Reporte de Ventas</h1>
      <p class="mt-1 text-sm text-gray-600">
        Análisis detallado de ventas por período
      </p>
    </div>

    <!-- Filtros -->
    <div class="card mb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="label">Fecha Inicio</label>
          <input 
            v-model="fechaInicio"
            type="date"
            class="input"
          />
        </div>
        
        <div>
          <label class="label">Fecha Fin</label>
          <input 
            v-model="fechaFin"
            type="date"
            class="input"
          />
        </div>
      </div>
    </div>

    <!-- Resumen -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <div class="card bg-primary-600 text-white">
        <h3 class="text-lg font-medium mb-1">Total Ventas</h3>
        <p class="text-2xl font-bold">{{ formatCurrency(totalVentas) }}</p>
      </div>
      
      <div class="card bg-success-600 text-white">
        <h3 class="text-lg font-medium mb-1">Promedio Diario</h3>
        <p class="text-2xl font-bold">{{ formatCurrency(promedioVentas) }}</p>
      </div>
    </div>

    <!-- Gráfico -->
    <div class="card">
      <div class="h-96">
        <Bar 
          :data="chartData"
          :options="chartOptions"
        />
      </div>
    </div>
  </div>
</template>