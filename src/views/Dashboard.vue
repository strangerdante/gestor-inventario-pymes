<script setup lang="ts">
import { computed } from 'vue'
import { useArticulosStore } from '../stores/articulos'
import { useAlmacenesStore } from '../stores/almacenes'
import { useProveedoresStore } from '../stores/proveedores'
import { useAuthStore } from '../stores/auth'
import { formatCurrency } from '../utils/format'
import { Chart, registerables } from 'chart.js'
import { Doughnut, Bar } from 'vue-chartjs'

// Registrar componentes de Chart.js
Chart.register(...registerables)

// Stores
const articulosStore = useArticulosStore()
const almacenesStore = useAlmacenesStore()
const proveedoresStore = useProveedoresStore()
const authStore = useAuthStore()

// Datos para gráfico de stock crítico
const stockCriticoChartData = computed(() => {
  const articulosStockBajo = articulosStore.articulosConStockBajo.length
  const articulosStockNormal = articulosStore.articulos.length - articulosStockBajo
  
  return {
    labels: ['Stock normal', 'Stock crítico'],
    datasets: [
      {
        data: [articulosStockNormal, articulosStockBajo],
        backgroundColor: ['#10B981', '#EF4444'],
        hoverBackgroundColor: ['#065F46', '#B91C1C']
      }
    ]
  }
})

// Datos para gráfico de artículos con mayor valor
const articulosValorChartData = computed(() => {
  const articulosOrdenados = [...articulosStore.articulos]
    .map(articulo => ({
      nombre: articulo.nombre,
      valor: articulo.stock * articulo.precioCompra
    }))
    .sort((a, b) => b.valor - a.valor)
    .slice(0, 5)

  return {
    labels: articulosOrdenados.map(a => a.nombre),
    datasets: [{
      label: 'Valor en inventario',
      data: articulosOrdenados.map(a => a.valor),
      backgroundColor: '#3F83F8',
      borderColor: '#1E40AF',
      borderWidth: 1
    }]
  }
})

// Datos para gráfico de distribución por proveedor
const proveedoresChartData = computed(() => {
  const valorPorProveedor = new Map()
  
  articulosStore.articulos.forEach(articulo => {
    const valorActual = valorPorProveedor.get(articulo.proveedorId) || 0
    valorPorProveedor.set(
      articulo.proveedorId, 
      valorActual + (articulo.stock * articulo.precioCompra)
    )
  })
  
  const proveedoresData = Array.from(valorPorProveedor.entries()).map(([proveedorId, valor]) => {
    const proveedor = proveedoresStore.getProveedorById(proveedorId)
    return {
      nombre: proveedor?.nombre || 'Desconocido',
      valor: valor as number
    }
  })

  return {
    labels: proveedoresData.map(p => p.nombre),
    datasets: [{
      data: proveedoresData.map(p => p.valor),
      backgroundColor: [
        '#3F83F8',
        '#10B981',
        '#F59E0B',
        '#EF4444',
        '#8B5CF6'
      ]
    }]
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const
    }
  }
}

const barChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const
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

// Cálculos
const totalInventario = computed(() => articulosStore.valorTotalInventario)
const totalVenta = computed(() => articulosStore.valorTotalVenta)
const margenEstimado = computed(() => totalVenta.value - totalInventario.value)
const porcentajeMargen = computed(() => {
  if (totalVenta.value === 0) return 0
  return ((margenEstimado.value / totalVenta.value) * 100).toFixed(2)
})

const articulosCriticos = computed(() => articulosStore.articulosConStockBajo)

// Para simular la exportación a Excel
function exportarInventario() {
  alert('Funcionalidad de exportación a Excel simulada')
}

// Para simular la sincronización con la nube
function sincronizarConNube() {
  alert('Sincronización con la nube simulada')
}
</script>

<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
      <p class="mt-1 text-sm text-gray-600">
        Bienvenido, {{ authStore.userName }}. Aquí tienes un resumen de tu inventario.
      </p>
    </div>
    
    <!-- Resumen financiero -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <div class="card bg-gradient-to-br from-primary-500 to-primary-700 text-white">
        <h3 class="text-lg font-medium mb-1">Valor de Inventario</h3>
        <p class="text-2xl font-bold">{{ formatCurrency(totalInventario) }}</p>
        <p class="mt-2 text-sm opacity-90">Total de {{ articulosStore.totalArticulos }} artículos</p>
      </div>
      
      <div class="card bg-gradient-to-br from-secondary-500 to-secondary-700 text-white">
        <h3 class="text-lg font-medium mb-1">Valor de Venta</h3>
        <p class="text-2xl font-bold">{{ formatCurrency(totalVenta) }}</p>
        <p class="mt-2 text-sm opacity-90">Basado en precios actuales</p>
      </div>
      
      <div class="card" :class="margenEstimado >= 0 ? 'bg-gradient-to-br from-success-500 to-success-700 text-white' : 'bg-gradient-to-br from-danger-500 to-danger-700 text-white'">
        <h3 class="text-lg font-medium mb-1">Margen Estimado</h3>
        <p class="text-2xl font-bold">{{ formatCurrency(margenEstimado) }}</p>
        <p class="mt-2 text-sm opacity-90">{{ porcentajeMargen }}% sobre venta</p>
      </div>
    </div>
    
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <!-- Gráfico de stock crítico -->
      <div class="card">
        <h2 class="text-lg font-medium mb-4">Estado del Inventario</h2>
        <div class="h-64">
          <Doughnut
            :data="stockCriticoChartData"
            :options="chartOptions"
          />
        </div>
      </div>
      
      <!-- Artículos con stock crítico -->
      <div class="card">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-medium">Artículos con Stock Crítico</h2>
          <span class="badge-danger px-3 py-1">{{ articulosCriticos.length }} artículos</span>
        </div>
        
        <div class="overflow-hidden">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Artículo</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mínimo</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="articulo in articulosCriticos.slice(0, 5)" :key="articulo.id">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ articulo.nombre }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="text-sm text-danger-600 font-medium">{{ articulo.stock }}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ articulo.stockMinimo }}
                </td>
              </tr>
              <tr v-if="articulosCriticos.length === 0">
                <td colspan="3" class="px-6 py-4 text-center text-sm text-gray-500">
                  No hay artículos con stock crítico
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div v-if="articulosCriticos.length > 5" class="mt-4 text-center">
          <router-link to="/articulos" class="text-primary-600 hover:text-primary-800 text-sm font-medium">
            Ver todos los artículos con stock crítico
          </router-link>
        </div>
      </div>
    </div>

    <!-- Nuevos gráficos -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <!-- Gráfico de artículos con mayor valor -->
      <div class="card">
        <h2 class="text-lg font-medium mb-4">Top 5 Artículos por Valor en Inventario</h2>
        <div class="h-64">
          <Bar
            :data="articulosValorChartData"
            :options="barChartOptions"
          />
        </div>
      </div>

      <!-- Gráfico de distribución por proveedor -->
      <div class="card">
        <h2 class="text-lg font-medium mb-4">Distribución del Inventario por Proveedor</h2>
        <div class="h-64">
          <Doughnut
            :data="proveedoresChartData"
            :options="chartOptions"
          />
        </div>
      </div>
    </div>
    
    <!-- Acciones rápidas -->
    <div class="card mb-6">
      <h2 class="text-lg font-medium mb-4">Acciones Rápidas</h2>
      
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <router-link to="/articulos/crear" class="p-4 bg-gray-50 rounded-lg text-center hover:bg-gray-100 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 mx-auto text-primary-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="text-sm font-medium">Nuevo Artículo</span>
        </router-link>
        
        <router-link to="/documentos/crear" class="p-4 bg-gray-50 rounded-lg text-center hover:bg-gray-100 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 mx-auto text-primary-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span class="text-sm font-medium">Nuevo Documento</span>
        </router-link>
        
        <button @click="exportarInventario" class="p-4 bg-gray-50 rounded-lg text-center hover:bg-gray-100 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 mx-auto text-primary-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span class="text-sm font-medium">Exportar a Excel</span>
        </button>
        
        <button @click="sincronizarConNube" class="p-4 bg-gray-50 rounded-lg text-center hover:bg-gray-100 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 mx-auto text-primary-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          <span class="text-sm font-medium">Sincronizar</span>
        </button>
      </div>
    </div>
    
    <!-- Información del almacén activo -->
    <div class="card">
      <h2 class="text-lg font-medium mb-4">Almacén Activo</h2>
      
      <div v-if="almacenesStore.almacenActivoData" class="bg-gray-50 p-4 rounded-lg">
        <h3 class="font-medium text-lg mb-1">{{ almacenesStore.almacenActivoData.nombre }}</h3>
        <p class="text-gray-600 mb-2">{{ almacenesStore.almacenActivoData.ubicacion }}</p>
        
        <div class="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span class="text-sm">Responsable: {{ almacenesStore.almacenActivoData.responsable }}</span>
        </div>
      </div>
      
      <div v-else class="bg-yellow-50 p-4 rounded-lg">
        <p class="text-yellow-800">No hay almacén seleccionado. Por favor, cree o seleccione un almacén.</p>
        <router-link to="/almacenes" class="mt-2 btn-primary inline-block">
          Ir a Almacenes
        </router-link>
      </div>
    </div>
  </div>
</template>