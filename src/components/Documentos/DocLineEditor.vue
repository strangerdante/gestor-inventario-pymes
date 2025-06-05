<script setup lang="ts">
import { ref, computed } from 'vue'
import { useArticulosStore } from '../../stores/articulos'
import { useDocumentosStore, type LineaDocumento, type MotivoMerma } from '../../stores/documentos'
import COPFormatter from '../UI/COPFormatter.vue'
import BarcodeInput from '../UI/BarcodeInput.vue'

interface Props {
  documentoId: string
  esMerma?: boolean
  soloLectura?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  esMerma: false,
  soloLectura: false
})

const articulosStore = useArticulosStore()
const documentosStore = useDocumentosStore()

const documento = computed(() => {
  return documentosStore.getDocumentoById(props.documentoId)
})

const busqueda = ref('')
const cantidad = ref(1)
const motivoMerma = ref<MotivoMerma>('CADUCADO')
const articuloSeleccionado = ref<string | null>(null)
const codigoEAN = ref('')
const mostrarDropdown = ref(true)

const articulosFiltrados = computed(() => {
  if (!busqueda.value.trim()) return articulosStore.articulos.slice(0, 5)
  
  const query = busqueda.value.toLowerCase().trim()
  return articulosStore.articulos.filter(
    articulo => articulo.nombre.toLowerCase().includes(query) || 
               articulo.codigoEAN.includes(query)
  )
})

const lineasCompletas = computed(() => {
  if (!documento.value) return []
  
  return documento.value.lineas.map(linea => {
    const articulo = articulosStore.getArticuloById(linea.articuloId)
    return {
      ...linea,
      articulo
    }
  })
})

// Obtener artículo por código EAN
async function buscarPorEAN(codigo: string) {
  // Verificar si ya existe localmente
  const articuloExistente = articulosStore.getArticuloByEAN(codigo)
  
  if (articuloExistente) {
    agregarArticuloADocumento(articuloExistente.id)
  } else {
    // Buscar en Open Food Facts
    try {
      const result = await articulosStore.buscarPorEAN(codigo)
      if (result) {
        alert(`Artículo encontrado: ${result.nombre}. Debe añadirlo al sistema primero.`)
        busqueda.value = result.nombre
      } else {
        alert('Código EAN no encontrado')
      }
    } catch (error) {
      console.error('Error buscando EAN:', error)
    }
  }
}

// Agregar artículo al documento
function agregarArticuloADocumento(articuloId: string) {
  if (!documento.value || documento.value.estado !== 'BORRADOR') return
  
  const linea: Omit<LineaDocumento, 'id'> = {
    articuloId,
    cantidad: cantidad.value
  }
  
  // Agregar motivo si es merma
  if (props.esMerma) {
    linea.motivo = motivoMerma.value
  }
  
  documentosStore.agregarLinea(props.documentoId, linea)
  
  // Limpiar valores
  cantidad.value = 1
  articuloSeleccionado.value = null
  busqueda.value = ''
  mostrarDropdown.value = true
}

// Eliminar línea del documento
function eliminarLinea(lineaId: string) {
  documentosStore.eliminarLinea(props.documentoId, lineaId)
}

// Actualizar cantidad de una línea
function actualizarCantidad(lineaId: string, nuevaCantidad: number) {
  if (nuevaCantidad <= 0) return
  
  documentosStore.actualizarLinea(props.documentoId, lineaId, {
    cantidad: nuevaCantidad
  })
}

// Seleccionar artículo de la búsqueda
function seleccionarArticulo(articulo: any) {
  articuloSeleccionado.value = articulo.id
  busqueda.value = articulo.nombre
  codigoEAN.value = articulo.codigoEAN
  mostrarDropdown.value = false
}
</script>

<template>
  <div>
    <!-- Editor de líneas (si no es de solo lectura) -->
    <div v-if="!soloLectura && documento && documento.estado === 'BORRADOR'" class="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <h3 class="text-lg font-medium mb-4">Añadir artículos</h3>
      
      <div class="mb-4">
        <label class="label">Escanear código de barras</label>
        <BarcodeInput v-model="codigoEAN" @scan="buscarPorEAN" />
      </div>
      
      <div class="mb-4">
        <label class="label">Buscar artículo</label>
        <div class="relative">
          <input 
            v-model="busqueda" 
            type="text" 
            class="input" 
            placeholder="Nombre o código"
            @input="mostrarDropdown = true"
            @focus="mostrarDropdown = true"
          />
          <div v-if="busqueda && articulosFiltrados.length > 0 && mostrarDropdown" class="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg">
            <ul class="max-h-60 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm">
              <li 
                v-for="articulo in articulosFiltrados" 
                :key="articulo.id"
                class="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-primary-100"
                @click="seleccionarArticulo(articulo)"
              >
                <div class="flex items-center">
                  <span class="ml-3 truncate">{{ articulo.nombre }}</span>
                  <span class="ml-2 truncate text-gray-500">{{ articulo.codigoEAN }}</span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="label">Cantidad</label>
          <input 
            v-model.number="cantidad" 
            type="number" 
            min="1" 
            class="input no-spinner" 
          />
        </div>
        
        <div v-if="esMerma">
          <label class="label">Motivo de merma</label>
          <select v-model="motivoMerma" class="select">
            <option value="CADUCADO">Caducado</option>
            <option value="ROTO">Roto/Dañado</option>
            <option value="EXTRAVIO">Extravío</option>
          </select>
        </div>
        
        <div class="flex items-end">
          <button 
            @click="agregarArticuloADocumento(articuloSeleccionado as string)" 
            class="btn-primary"
            :disabled="!articuloSeleccionado"
          >
            Añadir artículo
          </button>
        </div>
      </div>
    </div>
    
    <!-- Tabla de líneas -->
    <div class="overflow-x-auto">
      <table class="table">
        <thead class="bg-gray-50">
          <tr>
            <th scope="col" class="table-header">Artículo</th>
            <th scope="col" class="table-header">Cantidad</th>
            <th scope="col" class="table-header">Precio unitario</th>
            <th scope="col" class="table-header">Subtotal</th>
            <th v-if="esMerma" scope="col" class="table-header">Motivo</th>
            <th v-if="!soloLectura && documento?.estado === 'BORRADOR'" scope="col" class="table-header">Acciones</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="linea in lineasCompletas" :key="linea.id">
            <td class="table-cell">
              <div class="flex flex-col">
                <span class="font-medium text-gray-900">{{ linea.articulo?.nombre }}</span>
                <span class="text-xs text-gray-500">{{ linea.articulo?.codigoEAN }}</span>
              </div>
            </td>
            <td class="table-cell">
              <div v-if="!soloLectura && documento?.estado === 'BORRADOR'" class="flex items-center">
                <div class="quantity-control">
                  <button 
                    @click="actualizarCantidad(linea.id, linea.cantidad - 1)" 
                    class="quantity-btn quantity-btn-left"
                    :disabled="linea.cantidad <= 1"
                  >
                    -
                  </button>
                  <input 
                    type="number" 
                    :value="linea.cantidad"
                    @change="e => actualizarCantidad(linea.id, parseInt((e.target as HTMLInputElement).value))" 
                    class="quantity-input no-spinner"
                    min="1"
                  />
                  <button 
                    @click="actualizarCantidad(linea.id, linea.cantidad + 1)" 
                    class="quantity-btn quantity-btn-right"
                  >
                    +
                  </button>
                </div>
              </div>
              <span v-else>{{ linea.cantidad }}</span>
            </td>
            <td class="table-cell">
              <COPFormatter :valor="linea.articulo?.precioCompra || 0" />
            </td>
            <td class="table-cell">
              <COPFormatter :valor="(linea.articulo?.precioCompra || 0) * linea.cantidad" />
            </td>
            <td v-if="esMerma" class="table-cell">
              <span class="badge-danger">{{ linea.motivo }}</span>
            </td>
            <td v-if="!soloLectura && documento?.estado === 'BORRADOR'" class="table-cell">
              <button 
                @click="eliminarLinea(linea.id)" 
                class="text-red-600 hover:text-red-900"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </td>
          </tr>
          <tr v-if="lineasCompletas.length === 0">
            <td :colspan="esMerma ? 5 : 4" class="px-6 py-4 text-center text-gray-500">
              No hay artículos en este documento
            </td>
          </tr>
        </tbody>
        <tfoot class="bg-gray-50">
          <tr>
            <td colspan="3" class="px-6 py-3 text-right font-medium">Total:</td>
            <td class="px-6 py-3 font-medium">
              <COPFormatter 
                :valor="lineasCompletas.reduce((sum, linea) => sum + ((linea.articulo?.precioCompra || 0) * linea.cantidad), 0)" 
              />
            </td>
            <td v-if="esMerma"></td>
            <td v-if="!soloLectura && documento?.estado === 'BORRADOR'"></td>
          </tr>
        </tfoot>
      </table>
    </div>
  </div>
</template>

<style scoped>
/* Ocultar las flechas del input type="number" */
.no-spinner::-webkit-outer-spin-button,
.no-spinner::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.no-spinner[type=number] {
  -moz-appearance: textfield;
}

/* Estilos para controles de cantidad alineados */
.quantity-control {
  display: inline-flex;
  align-items: stretch;
  background-color: #f9fafb;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  overflow: hidden;
}

.quantity-btn {
  background-color: #f3f4f6;
  border: none;
  color: #374151;
  font-weight: 500;
  font-size: 0.875rem;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease-in-out;
  user-select: none;
}

.quantity-btn:hover:not(:disabled) {
  background-color: #e5e7eb;
  color: #111827;
}

.quantity-btn:disabled {
  background-color: #f9fafb;
  color: #9ca3af;
  cursor: not-allowed;
}

.quantity-btn-left {
  border-right: 1px solid #d1d5db;
}

.quantity-btn-right {
  border-left: 1px solid #d1d5db;
}

.quantity-input {
  border: none;
  background-color: #ffffff;
  text-align: center;
  width: 3rem;
  height: 2rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #111827;
  outline: none;
  margin: 0;
  padding: 0;
}

.quantity-input:focus {
  background-color: #ffffff;
  outline: none;
  box-shadow: none;
}
</style>