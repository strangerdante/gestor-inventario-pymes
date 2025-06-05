<script setup lang="ts">
import { ref, computed } from 'vue'
import { useDocumentosStore, type TipoDocumento, type EstadoDocumento } from '../../stores/documentos'
import { useAuthStore } from '../../stores/auth'
import { formatDate } from '../../utils/format'
import { getClaseDocumento, getClaseEstado } from '../../utils/helpers'
import COPFormatter from '../../components/UI/COPFormatter.vue'

const documentosStore = useDocumentosStore()
const authStore = useAuthStore()

const tipoFiltro = ref<TipoDocumento | ''>('')
const estadoFiltro = ref<EstadoDocumento | ''>('')
const busqueda = ref('')

const documentosFiltrados = computed(() => {
  let docs = documentosStore.getDocumentosCompletos
  
  if (tipoFiltro.value) {
    docs = docs.filter(doc => doc.tipo === tipoFiltro.value)
  }
  
  if (estadoFiltro.value) {
    docs = docs.filter(doc => doc.estado === estadoFiltro.value)
  }
  
  if (busqueda.value.trim()) {
    const query = busqueda.value.toLowerCase()
    docs = docs.filter(doc => 
      doc.id.toLowerCase().includes(query) ||
      doc.almacen?.nombre.toLowerCase().includes(query) ||
      doc.lineas.some(linea => linea.articulo?.nombre.toLowerCase().includes(query))
    )
  }
  
  return docs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
})

function exportarDocumentos() {
  alert('Funcionalidad de exportación simulada')
}

function eliminarDocumento(id: string, event: Event) {
  event.preventDefault()
  event.stopPropagation()
  
  if (confirm('¿Estás seguro de que deseas eliminar este documento? Esta acción no se puede deshacer.')) {
    const exito = documentosStore.eliminarDocumento(id)
    if (exito) {
      alert('Documento eliminado correctamente')
    } else {
      alert('Error: Solo se pueden eliminar documentos en borrador')
    }
  }
}
</script>

<template>
  <div>
    <div class="mb-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Documentos</h1>
          <p class="mt-1 text-sm text-gray-600">
            Gestiona tus documentos de inventario, pedidos, recepciones y mermas
          </p>
        </div>
        
        <div class="mt-4 sm:mt-0 space-x-3">
          <router-link 
            v-if="authStore.isEncargadoAlmacen"
            to="/documentos/crear" 
            class="btn-primary"
          >
            Nuevo Documento
          </router-link>
          
          <button 
            @click="exportarDocumentos"
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
          <label class="label">Tipo de Documento</label>
          <select v-model="tipoFiltro" class="select">
            <option value="">Todos</option>
            <option value="INVENTARIO">Inventario</option>
            <option value="PEDIDO">Pedido</option>
            <option value="RECEPCION">Recepción</option>
            <option value="MERMA">Merma</option>
          </select>
        </div>
        
        <div>
          <label class="label">Estado</label>
          <select v-model="estadoFiltro" class="select">
            <option value="">Todos</option>
            <option value="BORRADOR">Borrador</option>
            <option value="CERRADO">Cerrado</option>
          </select>
        </div>
        
        <div>
          <label class="label">Buscar</label>
          <input 
            v-model="busqueda" 
            type="text" 
            class="input" 
            placeholder="Buscar por ID, almacén o artículo..."
          />
        </div>
      </div>
    </div>
    
    <!-- Lista de documentos -->
    <div class="bg-white shadow overflow-hidden sm:rounded-md">
      <ul role="list" class="divide-y divide-gray-200">
        <li v-for="doc in documentosFiltrados" :key="doc.id">
          <div class="relative group">
            <router-link :to="`/documentos/${doc.id}`" class="block hover:bg-gray-50 transition-colors">
              <div class="px-4 py-5 sm:px-6">
                <!-- Header con pills y botón eliminar -->
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-3">
                    <span :class="getClaseDocumento(doc.tipo)" class="px-3 py-1 text-xs font-medium rounded-full">
                      {{ doc.tipo }}
                    </span>
                    <span :class="getClaseEstado(doc.estado)" class="px-3 py-1 text-xs font-medium rounded-full">
                      {{ doc.estado }}
                    </span>
                  </div>
                  
                  <button
                    v-if="doc.estado === 'BORRADOR' && authStore.isEncargadoAlmacen"
                    @click="eliminarDocumento(doc.id, $event)"
                    class="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-full transition-all duration-200"
                    title="Eliminar documento"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                  </button>
                </div>
                
                <!-- Fecha -->
                <div class="mt-2 text-sm text-gray-500 font-medium">
                  {{ formatDate(doc.createdAt) }}
                </div>
                
                <!-- Información principal -->
                <div class="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <div class="sm:col-span-1">
                    <p class="text-sm font-medium text-gray-900">
                      {{ doc.almacen?.nombre }}
                    </p>
                    <p class="text-xs text-gray-500 mt-1">
                      {{ doc.lineas.length }} {{ doc.lineas.length === 1 ? 'artículo' : 'artículos' }}
                    </p>
                  </div>
                  
                  <div class="sm:col-span-2 sm:text-right">
                    <p class="text-lg font-semibold text-gray-900">
                      <COPFormatter :valor="doc.valorTotal" />
                    </p>
                    <p class="text-xs text-gray-500 mt-1">
                      Valor total
                    </p>
                  </div>
                </div>
              </div>
            </router-link>
          </div>
        </li>
        
        <li v-if="documentosFiltrados.length === 0" class="px-4 py-4 sm:px-6 text-center text-gray-500">
          No se encontraron documentos con los filtros seleccionados
        </li>
      </ul>
    </div>
  </div>
</template>