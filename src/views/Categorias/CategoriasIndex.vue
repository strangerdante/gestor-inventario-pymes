<script setup lang="ts">
import { ref } from 'vue'
import { useCategoriasStore } from '../../stores/categorias'
import { useAuthStore } from '../../stores/auth'

const categoriasStore = useCategoriasStore()
const authStore = useAuthStore()

const mostrarFormulario = ref(false)
const categoriaEditando = ref<string | null>(null)

// Formulario
const formData = ref({
  nombre: '',
  descripcion: ''
})

// Resetear formulario
function resetearFormulario() {
  formData.value = {
    nombre: '',
    descripcion: ''
  }
  categoriaEditando.value = null
  mostrarFormulario.value = false
}

// Editar categoría
function editarCategoria(id: string) {
  const categoria = categoriasStore.getCategoriaById(id)
  if (categoria) {
    categoriaEditando.value = id
    formData.value = {
      nombre: categoria.nombre,
      descripcion: categoria.descripcion || ''
    }
    mostrarFormulario.value = true
  }
}

// Guardar categoría
function guardarCategoria() {
  if (categoriaEditando.value) {
    categoriasStore.actualizarCategoria(categoriaEditando.value, formData.value)
  } else {
    categoriasStore.agregarCategoria(formData.value)
  }
  resetearFormulario()
}

// Eliminar categoría
function eliminarCategoria(id: string) {
  if (confirm('¿Está seguro de eliminar esta categoría?')) {
    categoriasStore.eliminarCategoria(id)
  }
}
</script>

<template>
  <div>
    <div class="mb-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Categorías</h1>
          <p class="mt-1 text-sm text-gray-600">
            Gestione las categorías para organizar el inventario
          </p>
        </div>
        
        <div class="mt-4 sm:mt-0 space-x-3">
          <button 
            v-if="authStore.isEncargadoAlmacen && !mostrarFormulario"
            @click="mostrarFormulario = true"
            class="btn-primary"
          >
            Nueva Categoría
          </button>
        </div>
      </div>
    </div>

    <!-- Formulario -->
    <div v-if="mostrarFormulario" class="card mb-6">
      <h2 class="text-lg font-medium mb-4">
        {{ categoriaEditando ? 'Editar' : 'Nueva' }} Categoría
      </h2>
      
      <form @submit.prevent="guardarCategoria" class="space-y-4">
        <div>
          <label class="label">Nombre</label>
          <input 
            v-model="formData.nombre"
            type="text"
            required
            class="input"
            placeholder="Ej: Lácteos"
          />
        </div>
        
        <div>
          <label class="label">Descripción</label>
          <textarea 
            v-model="formData.descripcion"
            class="input"
            rows="2"
            placeholder="Descripción de la categoría"
          ></textarea>
        </div>
        
        <div class="flex justify-end gap-4">
          <button 
            type="button"
            @click="resetearFormulario"
            class="btn-secondary"
          >
            Cancelar
          </button>
          <button 
            type="submit"
            class="btn-primary"
          >
            {{ categoriaEditando ? 'Actualizar' : 'Crear' }} Categoría
          </button>
        </div>
      </form>
    </div>

    <!-- Lista de categorías -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      <div 
        v-for="categoria in categoriasStore.categorias"
        :key="categoria.id"
        class="card transition-all duration-200 hover:shadow-lg"
      >
        <div class="flex justify-between items-start">
          <div class="flex-1 min-w-0">
            <h3 class="text-lg font-medium truncate">{{ categoria.nombre }}</h3>
            <p class="text-gray-500 mt-1 line-clamp-2">{{ categoria.descripcion }}</p>
          </div>
          
          <div class="flex space-x-2 ml-4 flex-shrink-0">
            <button 
              v-if="authStore.isEncargadoAlmacen"
              @click="editarCategoria(categoria.id)"
              class="text-primary-600 hover:text-primary-800"
            >
              <span class="sr-only">Editar</span>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            
            <button 
              v-if="authStore.isEncargadoAlmacen"
              @click="eliminarCategoria(categoria.id)"
              class="text-red-600 hover:text-red-800"
            >
              <span class="sr-only">Eliminar</span>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>