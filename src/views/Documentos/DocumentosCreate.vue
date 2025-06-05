<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Encabezado -->
    <div class="mb-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Crear Nuevo Documento</h1>
          <p class="mt-1 text-sm text-gray-600">
            Seleccione el tipo de documento y el almacén donde desea trabajar
          </p>
        </div>
        <button @click="cancelar" class="btn-secondary">
          Cancelar
        </button>
      </div>
    </div>

    <!-- Verificar si hay almacenes disponibles -->
    <div v-if="almacenesStore.totalAlmacenes === 0" class="bg-yellow-50 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-yellow-800">
            No hay almacenes configurados
          </h3>
          <div class="mt-2 text-sm text-yellow-700">
            <p>Debe crear al menos un almacén antes de poder crear documentos.</p>
          </div>
          <div class="mt-4">
            <router-link to="/almacenes" class="btn-primary">
              Ir a Almacenes
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Formulario de creación -->
    <div v-else class="bg-white shadow rounded-lg">
      <div class="px-6 py-8">
        <form @submit.prevent="crearDocumento" class="space-y-8">
          <!-- Selección de tipo de documento -->
          <div>
            <label class="text-lg font-medium text-gray-900 block mb-4">
              Tipo de Documento *
            </label>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div 
                v-for="tipo in tiposDocumento" 
                :key="tipo.value"
                @click="seleccionarTipo(tipo.value as TipoDocumento)"
                class="relative border rounded-lg p-4 cursor-pointer transition-all duration-200 hover:border-primary-300 hover:shadow-md"
                :class="{
                  'border-primary-500 bg-primary-50 ring-2 ring-primary-500': formulario.tipo === tipo.value,
                  'border-gray-300': formulario.tipo !== tipo.value
                }"
              >
                <div class="flex items-center">
                  <input 
                    type="radio" 
                    :value="tipo.value" 
                    v-model="formulario.tipo"
                    class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                  />
                  <label class="ml-3 block text-sm font-medium text-gray-900">
                    {{ tipo.label }}
                  </label>
                </div>
                <p class="mt-2 text-sm text-gray-500">
                  {{ tipo.descripcion }}
                </p>
              </div>
            </div>
          </div>

          <!-- Selección de almacén -->
          <div>
            <label for="almacen" class="label">
              Almacén *
            </label>
            <select 
              id="almacen"
              v-model="formulario.almacenId" 
              class="select"
              required
            >
              <option value="">Seleccione un almacén</option>
              <option 
                v-for="almacen in almacenesDisponibles" 
                :key="almacen.id" 
                :value="almacen.id"
              >
                {{ almacen.nombre }} - {{ almacen.ubicacion }}
              </option>
            </select>
            <p class="mt-1 text-sm text-gray-500">
              Seleccione el almacén donde se realizará el documento
            </p>
          </div>

          <!-- Descripción opcional -->
          <div>
            <label for="descripcion" class="label">
              Notas (Opcional)
            </label>
            <textarea 
              id="descripcion"
              v-model="formulario.descripcion"
              rows="3"
              class="input"
              placeholder="Agregue cualquier nota o comentario sobre este documento..."
            ></textarea>
          </div>

          <!-- Mensaje de error -->
          <div v-if="error" class="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            <span class="block sm:inline">{{ error }}</span>
          </div>

          <!-- Botones de acción -->
          <div class="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button 
              type="button" 
              @click="cancelar"
              class="btn-secondary"
              :disabled="creando"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              class="btn-primary"
              :disabled="!puedeCrear || creando"
            >
              <svg v-if="creando" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ creando ? 'Creando...' : 'Crear Documento' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Información adicional -->
    <div class="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-blue-800">
            Información sobre tipos de documento
          </h3>
          <div class="mt-2 text-sm text-blue-700">
            <ul class="list-disc list-inside space-y-1">
              <li><strong>Inventario:</strong> Use para contar y actualizar el stock actual de productos</li>
              <li><strong>Pedido:</strong> Use para solicitar productos a sus proveedores</li>
              <li><strong>Recepción:</strong> Use cuando reciba productos e incremente su stock</li>
              <li><strong>Merma:</strong> Use para registrar productos perdidos, dañados o vencidos</li>
            </ul>
            <p class="mt-2">
              Una vez creado, podrá agregar productos al documento y luego cerrarlo para aplicar los cambios al inventario.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDocumentosStore, type TipoDocumento } from '../../stores/documentos'
import { useAlmacenesStore } from '../../stores/almacenes'

const router = useRouter()
const documentosStore = useDocumentosStore()
const almacenesStore = useAlmacenesStore()

const formulario = ref({
  tipo: '' as TipoDocumento | '',
  almacenId: '',
  descripcion: ''
})

const creando = ref(false)
const error = ref('')

const tiposDocumento = [
  { value: 'INVENTARIO', label: 'Inventario', descripcion: 'Para contar y registrar el stock actual de productos' },
  { value: 'PEDIDO', label: 'Pedido', descripcion: 'Para solicitar productos a proveedores' },
  { value: 'RECEPCION', label: 'Recepción', descripcion: 'Para registrar la llegada de productos al almacén' },
  { value: 'MERMA', label: 'Merma', descripcion: 'Para registrar productos perdidos, dañados o vencidos' }
]

const almacenesDisponibles = computed(() => {
  return almacenesStore.almacenes
})

const puedeCrear = computed(() => {
  return formulario.value.tipo && formulario.value.almacenId && almacenesStore.totalAlmacenes > 0
})

// Establecer almacén activo por defecto
onMounted(() => {
  if (almacenesStore.almacenActivo) {
    formulario.value.almacenId = almacenesStore.almacenActivo
  }
})

async function crearDocumento() {
  if (!puedeCrear.value) {
    error.value = 'Por favor complete todos los campos requeridos'
    return
  }

  creando.value = true
  error.value = ''

  try {
    const nuevoDocumento = documentosStore.crearDocumento(
      formulario.value.tipo as TipoDocumento,
      formulario.value.almacenId,
      formulario.value.descripcion.trim() || undefined
    )

    if (nuevoDocumento) {
      // Redirigir a la vista del documento creado
      router.push(`/documentos/${nuevoDocumento.id}`)
    } else {
      error.value = 'Error al crear el documento. Inténtelo nuevamente.'
    }
  } catch (err) {
    console.error('Error creando documento:', err)
    error.value = 'Error inesperado al crear el documento'
  } finally {
    creando.value = false
  }
}

function cancelar() {
  router.push('/documentos')
}

function seleccionarTipo(tipo: TipoDocumento) {
  formulario.value.tipo = tipo
}
</script>