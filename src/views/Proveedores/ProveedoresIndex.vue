<script setup lang="ts">
import { ref, computed } from 'vue'
import { useProveedoresStore } from '../../stores/proveedores'
import { useAuthStore } from '../../stores/auth'

const proveedoresStore = useProveedoresStore()
const authStore = useAuthStore()

const busqueda = ref('')
const mostrarFormulario = ref(false)
const proveedorEditando = ref<string | null>(null)

// Formulario
const formData = ref({
  nombre: '',
  telefono: '',
  email: '',
  productos: [] as string[],
  frecuencia: 'Media' as 'Alta' | 'Media' | 'Baja'
})

const nuevoProducto = ref('')

// Filtrar proveedores
const proveedoresFiltrados = computed(() => {
  if (!busqueda.value.trim()) return proveedoresStore.proveedores
  
  const query = busqueda.value.toLowerCase()
  return proveedoresStore.proveedores.filter(proveedor => 
    proveedor.nombre.toLowerCase().includes(query) ||
    proveedor.email.toLowerCase().includes(query) ||
    proveedor.productos.some(producto => producto.toLowerCase().includes(query))
  )
})

// Resetear formulario
function resetearFormulario() {
  formData.value = {
    nombre: '',
    telefono: '',
    email: '',
    productos: [],
    frecuencia: 'Media'
  }
  proveedorEditando.value = null
  mostrarFormulario.value = false
}

// Agregar producto al formulario
function agregarProducto() {
  if (nuevoProducto.value.trim() && !formData.value.productos.includes(nuevoProducto.value)) {
    formData.value.productos.push(nuevoProducto.value.trim())
    nuevoProducto.value = ''
  }
}

// Eliminar producto del formulario
function eliminarProducto(index: number) {
  formData.value.productos.splice(index, 1)
}

// Editar proveedor
function editarProveedor(id: string) {
  if (!id) return
  const proveedor = proveedoresStore.getProveedorById(id)
  if (proveedor) {
    proveedorEditando.value = id
    formData.value = {
      nombre: proveedor.nombre,
      telefono: proveedor.telefono,
      email: proveedor.email,
      productos: [...proveedor.productos],
      frecuencia: proveedor.frecuencia || 'Media'
    }
    mostrarFormulario.value = true
  }
}

// Guardar proveedor
function guardarProveedor() {
  // Asegurar que frecuencia no sea undefined
  if (!formData.value.frecuencia) {
    formData.value.frecuencia = 'Media'
  }
  
  if (proveedorEditando.value) {
    proveedoresStore.actualizarProveedor(proveedorEditando.value, formData.value)
  } else {
    proveedoresStore.agregarProveedor(formData.value)
  }
  resetearFormulario()
}

// Eliminar proveedor
function eliminarProveedor(id: string) {
  if (id && confirm('¿Está seguro de eliminar este proveedor?')) {
    proveedoresStore.eliminarProveedor(id)
  }
}

// Obtener clase CSS según frecuencia
function getClaseFrecuencia(frecuencia: string | undefined): string {
  switch (frecuencia) {
    case 'Alta':
      return 'bg-success-100 text-success-800'
    case 'Media':
      return 'bg-warning-100 text-warning-800'
    case 'Baja':
      return 'bg-danger-100 text-danger-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}
</script>

<template>
  <div>
    <div class="mb-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Proveedores</h1>
          <p class="mt-1 text-sm text-gray-600">
            Gestione sus proveedores y mantenga actualizada su información de contacto.
          </p>
        </div>
        
        <div class="mt-4 sm:mt-0 space-x-3">
          <button 
            v-if="authStore.isEncargadoAlmacen"
            @click="mostrarFormulario = true"
            class="btn-primary"
          >
            Nuevo Proveedor
          </button>
        </div>
      </div>
    </div>

    <!-- Barra de búsqueda -->
    <div class="mb-6">
      <input 
        v-model="busqueda"
        type="text"
        placeholder="Buscar proveedores..."
        class="input w-full"
      />
    </div>
    
    <!-- Formulario modal -->
    <div v-if="mostrarFormulario" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <h2 class="text-xl font-semibold mb-4">
            {{ proveedorEditando ? 'Editar' : 'Nuevo' }} Proveedor
          </h2>
          
          <form @submit.prevent="guardarProveedor" class="space-y-4">
            <div>
              <label class="label">Nombre</label>
              <input 
                v-model="formData.nombre"
                type="text"
                required
                class="input"
                placeholder="Distribuidora Alimentos SAS"
              />
            </div>
            
            <div>
              <label class="label">Teléfono</label>
              <input 
                v-model="formData.telefono"
                type="tel"
                required
                class="input"
                placeholder="+57 321 5551234"
              />
            </div>
            
            <div>
              <label class="label">Email</label>
              <input 
                v-model="formData.email"
                type="email"
                required
                class="input"
                placeholder="contacto@empresa.co"
              />
            </div>
            
            <div>
              <label class="label">Frecuencia de Pedidos</label>
              <select v-model="formData.frecuencia" class="select">
                <option value="Alta">Alta</option>
                <option value="Media">Media</option>
                <option value="Baja">Baja</option>
              </select>
            </div>
            
            <div>
              <label class="label">Productos</label>
              <div class="flex gap-2 mb-2">
                <input 
                  v-model="nuevoProducto"
                  type="text"
                  class="input flex-1"
                  placeholder="Nombre del producto"
                  @keyup.enter="agregarProducto"
                />
                <button 
                  type="button"
                  @click="agregarProducto"
                  class="btn-secondary"
                >
                  Agregar
                </button>
              </div>
              
              <div class="flex flex-wrap gap-2 mt-2">
                <div 
                  v-for="(producto, index) in formData.productos"
                  :key="index"
                  class="bg-gray-100 px-3 py-1 rounded-full flex items-center gap-2"
                >
                  <span>{{ producto }}</span>
                  <button 
                    type="button"
                    @click="eliminarProducto(index)"
                    class="text-gray-500 hover:text-gray-700"
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>
            
            <div class="flex justify-end gap-4 mt-6">
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
                {{ proveedorEditando ? 'Actualizar' : 'Crear' }} Proveedor
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    
    <!-- Lista de proveedores (vista móvil) -->
    <div class="block md:hidden">
      <div class="space-y-4">
        <div 
          v-for="proveedor in proveedoresFiltrados" 
          :key="proveedor.id"
          class="bg-white rounded-lg shadow p-4"
        >
          <div class="flex justify-between items-start mb-2">
            <h3 class="font-medium">{{ proveedor.nombre }}</h3>
            <span 
              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
              :class="getClaseFrecuencia(proveedor.frecuencia)"
            >
              {{ proveedor.frecuencia || 'Media' }}
            </span>
          </div>
          
          <div class="space-y-2 text-sm">
            <div>
              <a :href="`tel:${proveedor.telefono}`" class="text-primary-600">
                {{ proveedor.telefono }}
              </a>
            </div>
            <div>
              <a :href="`mailto:${proveedor.email}`" class="text-primary-600">
                {{ proveedor.email }}
              </a>
            </div>
            <div class="flex flex-wrap gap-1 mt-2">
              <span 
                v-for="producto in proveedor.productos" 
                :key="producto"
                class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
              >
                {{ producto }}
              </span>
            </div>
          </div>
          
          <div class="mt-4 flex justify-end gap-2" v-if="authStore.isEncargadoAlmacen">
            <button 
              @click="editarProveedor(proveedor.id)"
              class="text-primary-600 hover:text-primary-900 text-sm"
            >
              Editar
            </button>
            <button 
              @click="eliminarProveedor(proveedor.id)"
              class="text-danger-600 hover:text-danger-900 text-sm"
            >
              Eliminar
            </button>
          </div>
        </div>
        
        <div v-if="proveedoresFiltrados.length === 0" class="text-center py-8 text-gray-500">
          No se encontraron proveedores
        </div>
      </div>
    </div>
    
    <!-- Lista de proveedores (vista desktop) -->
    <div class="hidden md:block bg-white rounded-lg shadow overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Proveedor
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Contacto
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Productos
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Frecuencia
            </th>
            <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="proveedor in proveedoresFiltrados" :key="proveedor.id">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm font-medium text-gray-900">{{ proveedor.nombre }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900">
                <a :href="`tel:${proveedor.telefono}`" class="text-primary-600 hover:text-primary-800">
                  {{ proveedor.telefono }}
                </a>
              </div>
              <div class="text-sm text-gray-500">{{ proveedor.email }}</div>
            </td>
            <td class="px-6 py-4">
              <div class="flex flex-wrap gap-2">
                <span 
                  v-for="producto in proveedor.productos" 
                  :key="producto"
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                >
                  {{ producto }}
                </span>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span 
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                :class="getClaseFrecuencia(proveedor.frecuencia)"
              >
                {{ proveedor.frecuencia || 'Media' }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <div class="flex justify-end gap-2">
                <button 
                  v-if="authStore.isEncargadoAlmacen"
                  @click="editarProveedor(proveedor.id)"
                  class="text-primary-600 hover:text-primary-900"
                >
                  Editar
                </button>
                <button 
                  v-if="authStore.isEncargadoAlmacen"
                  @click="eliminarProveedor(proveedor.id)"
                  class="text-danger-600 hover:text-danger-900"
                >
                  Eliminar
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="proveedoresFiltrados.length === 0">
            <td colspan="5" class="px-6 py-4 text-center text-gray-500">
              No se encontraron proveedores
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>