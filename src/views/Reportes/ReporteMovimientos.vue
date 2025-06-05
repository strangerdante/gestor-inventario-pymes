<script setup lang="ts">
import { ref, computed } from 'vue'
import { useDocumentosStore } from '../../stores/documentos'
import { useArticulosStore } from '../../stores/articulos'
import { formatDate } from '../../utils/format'
import { Line } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

const documentosStore = useDocumentosStore()
const articulosStore = useArticulosStore()

const fechaInicio = ref('')
const fechaFin = ref('')
const articuloSeleccionado = ref('')

// Configurar fechas por defecto
const hoy = new Date()
fechaFin.value = hoy.toISOString().split('T')[0]
const mesAnterior = new Date(hoy.getFullYear(), hoy.getMonth() - 1, hoy.getDate())
fechaInicio.value = mesAnterior.toISOString().split('T')[0]

const movimientos = computed(() => {
  return documentosStore.getDocumentosCompletos
    .filter(doc => doc.estado === 'CERRADO')
    .filter(doc => {
      const fecha = new Date(doc.createdAt)
      return fecha >= new Date(fechaInicio.value) && fecha <= new Date(fechaFin.value)
    })
    .flatMap(doc => doc.lineas
      .filter(linea => !articuloSeleccionado.value || linea.articuloId === articuloSeleccionado.value)
      .map(linea => ({
        fecha: doc.createdAt,
        tipo: doc.tipo,
        articulo: linea.articulo?.nombre || 'Desconocido',
        cantidad: doc.tipo === 'MERMA' ? -linea.cantidad : linea.cantidad
      }))
    )
    .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
})

const movimientosPorFecha = computed(() => {
  const datos = new Map()
  
  movimientos.value.forEach(mov => {
    const fecha = new Date(mov.fecha)
    const key = `${fecha.getFullYear()}-${(fecha.getMonth() + 1).toString().padStart(2, '0')}-${fecha.getDate().toString().padStart(2, '0')}`
    const valorActual = datos.get(key) || 0
    datos.set(key, valorActual + mov.cantidad)
  })
  
  return Array.from(datos.entries())
    .sort(([a], [b]) => a.localeCompare(b))
})

const chartData = computed(() => ({
  labels: movimientosPorFecha.value.map(([fecha]) => fecha),
  datasets: [
    {
      label: 'Movimientos',
      data: movimientosPorFecha.value.map(([, cantidad]) => cantidad),
      borderColor: '#3F83F8',
      tension: 0.1
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
      text: 'Movimientos de Inventario'
    }
  },
  scales: {
    y: {
      beginAtZero: true
    }
  }
}

const totalEntradas = computed(() => 
  movimientos.value
    .filter(m => m.cantidad > 0)
    .reduce((sum, m) => sum + m.cantidad, 0)
)

const totalSalidas = computed(() => 
  Math.abs(
    movimientos.value
      .filter(m => m.cantidad < 0)
      .reduce((sum, m) => sum + m.cantidad, 0)
  )
)
</script>

<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Movimientos de Inventario</h1>
      <p class="mt-1 text-sm text-gray-600">
        Análisis de entradas y salidas de inventario
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
        
        <div>
          <label class="label">Artículo</label>
          <select 
            v-model="articuloSeleccionado"
            class="select"
          >
            <option value="">Todos los artículos</option>
            <option 
              v-for="articulo in articulosStore.articulos"
              :key="articulo.id"
              :value="articulo.id"
            >
              {{ articulo.nombre }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- Resumen -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <div class="card bg-success-600 text-white">
        <h3 class="text-lg font-medium mb-1">Total Entradas</h3>
        <p class="text-2xl font-bold">{{ totalEntradas }}</p>
        <p class="mt-2 text-sm opacity-90">unidades</p>
      </div>
      
      <div class="card bg-danger-600 text-white">
        <h3 class="text-lg font-medium mb-1">Total Salidas</h3>
        <p class="text-2xl font-bold">{{ totalSalidas }}</p>
        <p class="mt-2 text-sm opacity-90">unidades</p>
      </div>
    </div>

    <!-- Gráfico -->
    <div class="card">
      <div class="h-96">
        <Line 
          :data="chartData"
          :options="chartOptions"
        />
      </div>
    </div>

    <!-- Tabla de movimientos -->
    <div class="card mt-6">
      <h2 class="text-lg font-medium mb-4">Detalle de Movimientos</h2>
      
      <div class="overflow-x-auto">
        <table class="table">
          <thead>
            <tr>
              <th class="table-header">Fecha</th>
              <th class="table-header">Tipo</th>
              <th class="table-header">Artículo</th>
              <th class="table-header">Cantidad</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(mov, index) in movimientos" :key="index">
              <td class="table-cell">{{ formatDate(mov.fecha) }}</td>
              <td class="table-cell">
                <span 
                  class="badge"
                  :class="{
                    'badge-success': mov.tipo === 'RECEPCION',
                    'badge-danger': mov.tipo === 'MERMA',
                    'badge-warning': mov.tipo === 'INVENTARIO'
                  }"
                >
                  {{ mov.tipo }}
                </span>
              </td>
              <td class="table-cell">{{ mov.articulo }}</td>
              <td class="table-cell" :class="mov.cantidad < 0 ? 'text-danger-600' : 'text-success-600'">
                {{ mov.cantidad }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>