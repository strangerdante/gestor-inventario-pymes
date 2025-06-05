<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDocumentosStore } from '../../stores/documentos'
import { useAuthStore } from '../../stores/auth'
import DocLineEditor from '../../components/Documentos/DocLineEditor.vue'
import { formatDate } from '../../utils/format'
import { getClaseDocumento, getClaseEstado } from '../../utils/helpers'

const route = useRoute()
const router = useRouter()
const documentosStore = useDocumentosStore()
const authStore = useAuthStore()

const documentoId = route.params.id as string
const cargando = ref(true)
const error = ref('')

onMounted(() => {
  documentosStore.seleccionarDocumento(documentoId)
  cargando.value = false
})

const documento = computed(() => {
  return documentosStore.getDocumentoById(documentoId)
})

const documentoCompleto = computed(() => {
  return documentosStore.getDocumentosCompletos.find(doc => doc.id === documentoId)
})

function cerrarDocumento() {
  if (!documento.value) return
  
  const resultado = documentosStore.cerrarDocumento(documentoId)
  if (resultado) {
    router.push({ name: 'documentos.index' })
  } else {
    error.value = 'No se pudo cerrar el documento. Verifique que tenga al menos una línea.'
  }
}
</script>

<template>
  <div>
    <div v-if="cargando" class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
    
    <div v-else-if="!documento" class="text-center py-12">
      <h2 class="text-2xl font-bold text-gray-900 mb-2">Documento no encontrado</h2>
      <p class="text-gray-600 mb-4">El documento que busca no existe o ha sido eliminado.</p>
      <router-link :to="{ name: 'documentos.index' }" class="btn-primary">
        Volver a Documentos
      </router-link>
    </div>
    
    <div v-else>
      <!-- Encabezado -->
      <div class="mb-6">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">
              {{ documento.tipo === 'MERMA' ? 'Registro de Merma' : 'Documento de Inventario' }}
            </h1>
            <p class="mt-1 text-sm text-gray-600">
              Creado el {{ formatDate(documento.createdAt) }}
            </p>
          </div>
          
          <div class="mt-4 sm:mt-0 space-x-3">
            <button 
              v-if="documento.estado === 'BORRADOR' && authStore.isEncargadoAlmacen"
              @click="cerrarDocumento"
              class="btn-success"
            >
              Cerrar Documento
            </button>
            
            <router-link 
              :to="{ name: 'documentos.index' }"
              class="btn-secondary"
            >
              Volver
            </router-link>
          </div>
        </div>
      </div>
      
      <!-- Información del documento -->
      <div class="bg-white shadow rounded-lg p-6 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 class="text-sm font-medium text-gray-500">Tipo de Documento</h3>
            <div class="mt-1">
              <span :class="['badge', getClaseDocumento(documento.tipo)]">
                {{ documento.tipo }}
              </span>
            </div>
          </div>
          
          <div>
            <h3 class="text-sm font-medium text-gray-500">Estado</h3>
            <div class="mt-1">
              <span :class="['badge', getClaseEstado(documento.estado)]">
                {{ documento.estado }}
              </span>
            </div>
          </div>
          
          <div>
            <h3 class="text-sm font-medium text-gray-500">Almacén</h3>
            <p class="mt-1 text-sm text-gray-900">
              {{ documentoCompleto?.almacen?.nombre || 'No especificado' }}
            </p>
          </div>
          
          <div>
            <h3 class="text-sm font-medium text-gray-500">Usuario</h3>
            <p class="mt-1 text-sm text-gray-900">
              {{ documentoCompleto?.usuario?.nombre || 'No especificado' }}
            </p>
          </div>
          
          <div v-if="documento.closedAt">
            <h3 class="text-sm font-medium text-gray-500">Fecha de Cierre</h3>
            <p class="mt-1 text-sm text-gray-900">
              {{ formatDate(documento.closedAt) }}
            </p>
          </div>
        </div>
        
        <!-- Descripción del documento -->
        <div v-if="documento.descripcion" class="mt-6 pt-6 border-t border-gray-200">
          <h3 class="text-sm font-medium text-gray-500 mb-2">Notas</h3>
          <p class="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
            {{ documento.descripcion }}
          </p>
        </div>
      </div>
      
      <!-- Error al cerrar documento -->
      <div v-if="error" class="mb-6 bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <span class="block sm:inline">{{ error }}</span>
      </div>
      
      <!-- Editor de líneas -->
      <DocLineEditor 
        :documentoId="documentoId"
        :esMerma="documento.tipo === 'MERMA'"
        :soloLectura="documento.estado === 'CERRADO'"
      />
    </div>
  </div>
</template>