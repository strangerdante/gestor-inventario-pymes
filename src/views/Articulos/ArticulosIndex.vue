<script setup lang="ts">
import { ref, computed } from 'vue'
import { useArticulosStore } from '../../stores/articulos'
import { useCategoriasStore } from '../../stores/categorias'
import { useAuthStore } from '../../stores/auth'
import COPFormatter from '../../components/UI/COPFormatter.vue'
import { exportarCSV } from '../../utils/helpers'

const articulosStore = useArticulosStore()
const categoriasStore = useCategoriasStore()
const authStore = useAuthStore()

const busqueda = ref('')
const mostrarSoloStockBajo = ref(false)
const categoriaSeleccionada = ref('')

const articulosFiltrados = computed(() => {
  let articulos = articulosStore.articulosDelAlmacenActivo

  if (mostrarSoloStockBajo.value) {
    articulos = articulosStore.articulosConStockBajo
  }

  if (categoriaSeleccionada.value) {
    articulos = articulos.filter(articulo => articulo.categoriaId === categoriaSeleccionada.value)
  }

  if (!busqueda.value.trim()) return articulos

  const query = busqueda.value.toLowerCase().trim()
  return articulos.filter(
    articulo => articulo.nombre.toLowerCase().includes(query) || 
                articulo.codigoEAN.includes(query)
  )
})

function exportarListado() {
  const datos = articulosFiltrados.value.map(articulo => ({
    Nombre: articulo.nombre,
    'Código EAN': articulo.codigoEAN,
    'Precio Compra': articulo.precioCompra,
    'Precio Venta': articulo.precioVenta,
    Stock: articulo.stock,
    'Stock Mínimo': articulo.stockMinimo
  }))

  exportarCSV(datos, 'articulos')
}

function eliminarArticulo(id: string) {
  if (confirm('¿Está seguro de que desea eliminar este artículo? Esta acción no se puede deshacer.')) {
    articulosStore.eliminarArticulo(id)
  }
}
</script>

<template>
  <div>
    <div class="mb-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Artículos</h1>
          <p class="mt-1 text-sm text-gray-600">
            Gestiona el catálogo de artículos y su stock
          </p>
        </div>
        
        <div class="mt-4 sm:mt-0 space-x-3">
          <router-link 
            v-if="authStore.isEncargadoAlmacen"
            to="/articulos/crear" 
            class="btn-primary"
          >
            Nuevo Artículo
          </router-link>
          
          <button 
            @click="exportarListado"
            class="btn-secondary"
          >
            Exportar
          </button>
        </div>
      </div>
    </div>
    
    <!-- Filtros -->
    <div class="mb-6 bg-white p-4 rounded-lg shadow">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="label">Buscar</label>
          <input 
            v-model="busqueda" 
            type="text" 
            class="input" 
            placeholder="Buscar por nombre o código..."
          />
        </div>

        <div>
          <label class="label">Categoría</label>
          <select v-model="categoriaSeleccionada" class="select">
            <option value="">Todas las categorías</option>
            <option 
              v-for="categoria in categoriasStore.categorias" 
              :key="categoria.id" 
              :value="categoria.id"
            >
              {{ categoria.nombre }}
            </option>
          </select>
        </div>
        
        <div class="flex items-end">
          <label class="inline-flex items-center">
            <input 
              v-model="mostrarSoloStockBajo"
              type="checkbox"
              class="form-checkbox h-4 w-4 text-primary-600"
            />
            <span class="ml-2 text-sm text-gray-700">Mostrar solo artículos con stock bajo</span>
          </label>
        </div>
      </div>
    </div>

    <!-- Vista móvil -->
    <div class="block md:hidden">
      <div class="space-y-4">
        <div 
          v-for="articulo in articulosFiltrados" 
          :key="articulo.id"
          class="bg-white rounded-lg shadow p-4"
        >
          <!-- Encabezado con nombre y categoría -->
          <div class="flex justify-between items-start mb-4">
            <div class="flex-1">
              <h3 class="font-medium text-gray-900">{{ articulo.nombre }}</h3>
              <p class="text-sm text-gray-500">{{ articulo.codigoEAN }}</p>
            </div>
            <span 
              class="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
            >
              {{ categoriasStore.getCategoriaById(articulo.categoriaId || '')?.nombre || 'Sin categoría' }}
            </span>
          </div>
          
          <!-- Precios -->
          <div class="flex justify-between mb-4">
            <div class="flex-1">
              <p class="text-xs text-gray-500 mb-1">Precio Compra</p>
              <p class="font-medium text-gray-900">
                <COPFormatter :valor="articulo.precioCompra" />
              </p>
            </div>
            <div class="flex-1 text-right">
              <p class="text-xs text-gray-500 mb-1">Precio Venta</p>
              <p class="font-medium text-gray-900">
                <COPFormatter :valor="articulo.precioVenta" />
              </p>
            </div>
          </div>
          
          <!-- Stock -->
          <div class="mb-4">
            <p class="text-xs text-gray-500 mb-1">Stock</p>
            <div class="flex items-center">
              <span 
                :class="articulo.stock < articulo.stockMinimo ? 'text-danger-600' : 'text-success-600'"
                class="text-lg font-medium"
              >
                {{ articulo.stock }}
              </span>
              <span class="text-sm text-gray-500 ml-1">/{{ articulo.stockMinimo }} unidades</span>
            </div>
          </div>
          
          <!-- Acciones -->
          <div v-if="authStore.isEncargadoAlmacen" class="flex justify-end space-x-2">
            <router-link 
              :to="'/articulos/editar/' + articulo.id" 
              class="text-primary-600 hover:text-primary-900"
            >
              <span class="sr-only">Editar</span>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </router-link>
            <button 
              @click="eliminarArticulo(articulo.id)"
              class="text-danger-600 hover:text-danger-900"
            >
              <span class="sr-only">Eliminar</span>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
        
        <div v-if="articulosFiltrados.length === 0" class="text-center py-8 text-gray-500">
          No se encontraron artículos
        </div>
      </div>
    </div>

    <!-- Vista desktop -->
    <div class="hidden md:block overflow-x-auto">
      <table class="table">
        <thead class="bg-gray-50">
          <tr>
            <th scope="col" class="table-header">Artículo</th>
            <th scope="col" class="table-header">Categoría</th>
            <th scope="col" class="table-header">Stock</th>
            <th scope="col" class="table-header">Precio Compra</th>
            <th scope="col" class="table-header">Precio Venta</th>
            <th scope="col" class="table-header text-center">Acciones</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="articulo in articulosFiltrados" :key="articulo.id">
            <td class="table-cell">
              <div class="flex flex-col">
                <span class="font-medium text-gray-900">{{ articulo.nombre }}</span>
                <span class="text-xs text-gray-500">{{ articulo.codigoEAN }}</span>
              </div>
            </td>
            <td class="table-cell">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                {{ categoriasStore.getCategoriaById(articulo.categoriaId || '')?.nombre || 'Sin categoría' }}
              </span>
            </td>
            <td class="table-cell">
              <div class="flex items-center">
                <span 
                  :class="articulo.stock < articulo.stockMinimo ? 'text-danger-600' : 'text-success-600'"
                  class="font-medium"
                >
                  {{ articulo.stock }}
                </span>
                <span class="text-gray-500 ml-1">/{{ articulo.stockMinimo }}</span>
              </div>
            </td>
            <td class="table-cell">
              <COPFormatter :valor="articulo.precioCompra" />
            </td>
            <td class="table-cell">
              <COPFormatter :valor="articulo.precioVenta" />
            </td>
            <td class="table-cell">
              <div class="flex justify-center space-x-2">
                <router-link 
                  v-if="authStore.isEncargadoAlmacen"
                  :to="'/articulos/editar/' + articulo.id" 
                  class="text-primary-600 hover:text-primary-900"
                >
                  <span class="sr-only">Editar</span>
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </router-link>
                <button 
                  v-if="authStore.isEncargadoAlmacen"
                  @click="eliminarArticulo(articulo.id)"
                  class="text-danger-600 hover:text-danger-900"
                >
                  <span class="sr-only">Eliminar</span>
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="articulosFiltrados.length === 0">
            <td colspan="6" class="px-6 py-4 text-center text-gray-500">
              No se encontraron artículos
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>