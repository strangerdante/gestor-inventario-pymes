<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAlmacenesStore } from '../../stores/almacenes'
import { useAuthStore } from '../../stores/auth'

const almacenesStore = useAlmacenesStore()
const authStore = useAuthStore()

const nuevoAlmacen = ref({
  nombre: '',
  ubicacion: '',
  responsable: ''
})

const editandoAlmacen = ref<string | null>(null)
const mostrarFormulario = ref(false)

function agregarAlmacen() {
  if (!nuevoAlmacen.value.nombre || !nuevoAlmacen.value.ubicacion || !nuevoAlmacen.value.responsable) {
    alert('Por favor complete todos los campos')
    return
  }
  
  almacenesStore.agregarAlmacen(nuevoAlmacen.value)
  
  // Limpiar formulario
  nuevoAlmacen.value = {
    nombre: '',
    ubicacion: '',
    responsable: ''
  }
  mostrarFormulario.value = false
}

function iniciarEdicion(id: string) {
  const almacen = almacenesStore.getAlmacenById(id)
  if (almacen) {
    editandoAlmacen.value = id
    nuevoAlmacen.value = { ...almacen }
    mostrarFormulario.value = true
  }
}

function guardarEdicion() {
  if (!editandoAlmacen.value) return
  
  almacenesStore.actualizarAlmacen(editandoAlmacen.value, nuevoAlmacen.value)
  
  // Limpiar formulario
  editandoAlmacen.value = null
  nuevoAlmacen.value = {
    nombre: '',
    ubicacion: '',
    responsable: ''
  }
  mostrarFormulario.value = false
}

function eliminarAlmacen(id: string) {
  if (confirm('¿Está seguro de eliminar este almacén?')) {
    almacenesStore.eliminarAlmacen(id)
  }
}

function seleccionarAlmacen(id: string) {
  almacenesStore.seleccionarAlmacenActivo(id)
}

onMounted(() => {
  // Si no hay almacenes, mostrar formulario
  if (almacenesStore.totalAlmacenes === 0) {
    mostrarFormulario.value = true
  }
})
</script>

<template>
  <div>
    <div class="mb-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Almacenes</h1>
          <p class="mt-1 text-sm text-gray-600">
            Gestione sus almacenes y seleccione el almacén activo.
          </p>
        </div>
        <div class="mt-4 sm:mt-0 space-x-3">
          <button 
            v-if="authStore.isEncargadoAlmacen && !mostrarFormulario" 
            @click="mostrarFormulario = true"
            class="btn-primary"
          >
            Nuevo Almacén
          </button>
        </div>
      </div>
    </div>
    
    <!-- Formulario -->
    <div v-if="mostrarFormulario" class="mb-6">
      <div class="card">
        <h2 class="text-lg font-medium mb-4">
          {{ editandoAlmacen ? 'Editar Almacén' : 'Nuevo Almacén' }}
        </h2>
        
        <form @submit.prevent="editandoAlmacen ? guardarEdicion() : agregarAlmacen()">
          <div class="grid grid-cols-1 gap-4">
            <div>
              <label class="label" for="nombre">Nombre</label>
              <input 
                id="nombre"
                v-model="nuevoAlmacen.nombre"
                type="text"
                required
                class="input"
                placeholder="Ej: Bodega Principal"
              />
            </div>
            
            <div>
              <label class="label" for="ubicacion">Ubicación</label>
              <input 
                id="ubicacion"
                v-model="nuevoAlmacen.ubicacion"
                type="text"
                required
                class="input"
                placeholder="Ej: Calle 80 #23-45, Bogotá"
              />
            </div>
            
            <div>
              <label class="label" for="responsable">Responsable</label>
              <input 
                id="responsable"
                v-model="nuevoAlmacen.responsable"
                type="text"
                required
                class="input"
                placeholder="Ej: Carlos Rodríguez"
              />
            </div>
          </div>
          
          <div class="mt-6 flex justify-end space-x-3">
            <button 
              type="button"
              class="btn-secondary"
              @click="mostrarFormulario = false"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              class="btn-primary"
            >
              {{ editandoAlmacen ? 'Guardar Cambios' : 'Crear Almacén' }}
            </button>
          </div>
        </form>
      </div>
    </div>
    
    <!-- Lista de almacenes -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="almacen in almacenesStore.almacenes" 
        :key="almacen.id"
        class="card relative"
        :class="{
          'border-2 border-primary-500': almacenesStore.almacenActivo === almacen.id
        }"
      >
        <div class="absolute top-4 right-4">
          <div class="flex space-x-2">
            <button 
              v-if="authStore.isEncargadoAlmacen"
              @click="iniciarEdicion(almacen.id)" 
              class="text-gray-400 hover:text-gray-500"
            >
              <span class="sr-only">Editar</span>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            
            <button 
              v-if="authStore.isEncargadoAlmacen"
              @click="eliminarAlmacen(almacen.id)" 
              class="text-red-400 hover:text-red-500"
            >
              <span class="sr-only">Eliminar</span>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
        
        <div class="mb-4">
          <h3 class="text-lg font-medium">{{ almacen.nombre }}</h3>
          <p class="text-gray-500">{{ almacen.ubicacion }}</p>
        </div>
        
        <div class="flex items-center text-sm text-gray-500 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          {{ almacen.responsable }}
        </div>
        
        <button 
          @click="seleccionarAlmacen(almacen.id)"
          class="w-full btn"
          :class="almacenesStore.almacenActivo === almacen.id ? 'btn-success' : 'btn-primary'"
        >
          {{ almacenesStore.almacenActivo === almacen.id ? 'Almacén Activo' : 'Seleccionar Almacén' }}
        </button>
      </div>
      
      <!-- Mensaje cuando no hay almacenes -->
      <div v-if="almacenesStore.almacenes.length === 0" class="col-span-full">
        <div class="text-center py-12 bg-gray-50 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">No hay almacenes</h3>
          <p class="mt-1 text-sm text-gray-500">
            Comience creando su primer almacén.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>