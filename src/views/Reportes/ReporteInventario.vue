<script setup lang="ts">
import { computed } from 'vue'
import { useArticulosStore } from '../../stores/articulos'
import { useProveedoresStore } from '../../stores/proveedores'
import { formatCurrency } from '../../utils/format'
import { Bar, Doughnut } from 'vue-chartjs'
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const articulosStore = useArticulosStore()
const proveedoresStore = useProveedoresStore()

// Datos para el gráfico de valor por proveedor
const valorPorProveedor = computed(() => {
  const datos = new Map()
  
  articulosStore.articulos.forEach(articulo => {
    const proveedor = proveedoresStore.getProveedorById(articulo.proveedorId)
    const nombreProveedor = proveedor?.nombre || 'Sin Proveedor'
    const valorActual = datos.get(nombreProveedor) || 0
    datos.set(nombreProveedor, valorActual + (articulo.stock * articulo.precioCompra))
  })
  
  return Array.from(datos.entries())
    .sort(([, a], [, b]) => b - a)
})

const chartDataProveedor = computed(() => ({
  labels: valorPorProveedor.value.map(([nombre]) => nombre),
  datasets: [
    {
      data: valorPorProveedor.value.map(([, valor]) => valor),
      backgroundColor: [
        '#3F83F8',
        '#10B981',
        '#F59E0B',
        '#EF4444',
        '#8B5CF6'
      ]
    }
  ]
}))

// Datos para el gráfico de artículos con mayor valor
const articulosMayorValor = computed(() => {
  return articulosStore.articulos
    .map(articulo => ({
      nombre: articulo.nombre,
      valor: articulo.stock * articulo.precioCompra
    }))
    .sort((a, b) => b.valor - a.valor)
    .slice(0, 10)
})

const chartDataArticulos = computed(() => ({
  labels: articulosMayorValor.value.map(a => a.nombre),
  datasets: [
    {
      label: 'Valor en Inventario',
      data: articulosMayorValor.value.map(a => a.valor),
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
    }
  }
}

const barChartOptions = {
  ...chartOptions,
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: (value: string | number) => formatCurrency(Number(value))
      }
    }
  }
}

// Estadísticas generales
const totalArticulos = computed(() => articulosStore.totalArticulos)
const valorTotalInventario = computed(() => articulosStore.valorTotalInventario)
const articulosStockBajo = computed(() => articulosStore.articulosConStockBajo.length)
</script>

<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Inventario Valorizado</h1>
      <p class="mt-1 text-sm text-gray-600">
        Análisis del valor actual del inventario
      </p>
    </div>

    <!-- Resumen -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <div class="card bg-primary-600 text-white">
        <h3 class="text-lg font-medium mb-1">Valor Total</h3>
        <p class="text-2xl font-bold">{{ formatCurrency(valorTotalInventario) }}</p>
        <p class="mt-2 text-sm opacity-90">{{ totalArticulos }} artículos en total</p>
      </div>
      
      <div class="card bg-warning-600 text-white">
        <h3 class="text-lg font-medium mb-1">Stock Bajo</h3>
        <p class="text-2xl font-bold">{{ articulosStockBajo }}</p>
        <p class="mt-2 text-sm opacity-90">artículos por debajo del mínimo</p>
      </div>
      
      <div class="card bg-success-600 text-white">
        <h3 class="text-lg font-medium mb-1">Promedio por Artículo</h3>
        <p class="text-2xl font-bold">
          {{ formatCurrency(totalArticulos > 0 ? valorTotalInventario / totalArticulos : 0) }}
        </p>
        <p class="mt-2 text-sm opacity-90">valor promedio</p>
      </div>
    </div>

    <!-- Gráficos -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="card">
        <h2 class="text-lg font-medium mb-4">Valor por Proveedor</h2>
        <div class="h-96">
          <Doughnut 
            :data="chartDataProveedor"
            :options="chartOptions"
          />
        </div>
      </div>
      
      <div class="card">
        <h2 class="text-lg font-medium mb-4">Top 10 Artículos por Valor</h2>
        <div class="h-96">
          <Bar 
            :data="chartDataArticulos"
            :options="barChartOptions"
          />
        </div>
      </div>
    </div>
  </div>
</template>