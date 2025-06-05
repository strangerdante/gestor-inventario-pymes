<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useArticulosStore } from '../../stores/articulos'
import { useProveedoresStore } from '../../stores/proveedores'
import { useCategoriasStore } from '../../stores/categorias'
import { useAlmacenesStore } from '../../stores/almacenes'
import BarcodeInput from '../../components/UI/BarcodeInput.vue'

const router = useRouter()
const articulosStore = useArticulosStore()
const proveedoresStore = useProveedoresStore()
const categoriasStore = useCategoriasStore()
const almacenesStore = useAlmacenesStore()

const nombre = ref('')
const codigoEAN = ref('')
const precioCompra = ref(0)
const precioVenta = ref(0)
const stockMinimo = ref(1)
const stock = ref(0)
const proveedorId = ref('')
const categoriaId = ref('')
const error = ref('')
const cargando = ref(false)

async function buscarPorEAN(codigo: string) {
  cargando.value = true
  error.value = ''
  
  try {
    const resultado = await articulosStore.buscarPorEAN(codigo)
    if (resultado) {
      nombre.value = resultado.nombre
      codigoEAN.value = codigo
    }
  } catch (e) {
    console.error(e)
    error.value = 'Error al buscar el producto'
  } finally {
    cargando.value = false
  }
}

// Función para validar el código EAN
function validarEAN(codigo: string) {
  // Validar que solo contenga números
  if (!/^\d+$/.test(codigo)) {
    error.value = 'El código de barras solo debe contener números'
    return false
  }
  
  // Validar longitud (la mayoría de códigos EAN son de 8, 13 o 14 dígitos)
  if (codigo.length < 8 || codigo.length > 14) {
    error.value = 'El código de barras debe tener entre 8 y 14 dígitos'
    return false
  }
  
  return true
}

function guardarArticulo() {
  if (!nombre.value || !codigoEAN.value || !proveedorId.value) {
    error.value = 'Por favor complete todos los campos requeridos'
    return
  }

  if (!validarEAN(codigoEAN.value)) {
    return
  }

  if (!almacenesStore.almacenActivo) {
    error.value = 'Por favor seleccione un almacén antes de crear un artículo'
    return
  }

  try {
    articulosStore.agregarArticulo({
      nombre: nombre.value,
      codigoEAN: codigoEAN.value,
      precioCompra: precioCompra.value,
      precioVenta: precioVenta.value,
      stockMinimo: stockMinimo.value,
      stock: stock.value,
      proveedorId: proveedorId.value,
      categoriaId: categoriaId.value,
      atributos: []
    })

    router.push('/articulos')
  } catch (e) {
    console.error(e)
    error.value = 'Error al guardar el artículo'
  }
}
</script>

<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Nuevo Artículo</h1>
      <p class="mt-1 text-sm text-gray-600">
        Ingrese los datos del nuevo artículo
      </p>
    </div>

    <div class="card">
      <form @submit.prevent="guardarArticulo">
        <div v-if="error" class="mb-4 bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
          {{ error }}
        </div>

        <!-- Escáner de código de barras -->
        <div class="mb-6">
          <label class="label">Código de barras</label>
          <BarcodeInput 
            v-model="codigoEAN"
            :disabled="cargando"
            @scan="buscarPorEAN"
          />
        </div>

        <!-- Datos básicos -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label for="nombre" class="label">Nombre del artículo</label>
            <input 
              id="nombre"
              v-model="nombre"
              type="text"
              required
              class="input"
              :disabled="cargando"
            />
          </div>

          <div>
            <label for="proveedor" class="label">Proveedor</label>
            <select 
              id="proveedor"
              v-model="proveedorId"
              required
              class="select"
              :disabled="cargando"
            >
              <option value="">Seleccione un proveedor</option>
              <option 
                v-for="proveedor in proveedoresStore.proveedores"
                :key="proveedor.id"
                :value="proveedor.id"
              >
                {{ proveedor.nombre }}
              </option>
            </select>
          </div>
        </div>

        <!-- Categoría -->
        <div class="mb-6">
          <label for="categoria" class="label">Categoría</label>
          <select 
            id="categoria"
            v-model="categoriaId"
            class="select mb-4"
          >
            <option value="">Sin categoría</option>
            <option 
              v-for="categoria in categoriasStore.categorias"
              :key="categoria.id"
              :value="categoria.id"
            >
              {{ categoria.nombre }}
            </option>
          </select>
        </div>

        <!-- Precios y stock -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div>
            <label for="precioCompra" class="label">Precio de compra</label>
            <input 
              id="precioCompra"
              v-model.number="precioCompra"
              type="number"
              min="0"
              step="100"
              required
              class="input"
            />
          </div>

          <div>
            <label for="precioVenta" class="label">Precio de venta</label>
            <input 
              id="precioVenta"
              v-model.number="precioVenta"
              type="number"
              min="0"
              step="100"
              required
              class="input"
            />
          </div>

          <div>
            <label for="stockMinimo" class="label">Stock mínimo</label>
            <input 
              id="stockMinimo"
              v-model.number="stockMinimo"
              type="number"
              min="0"
              required
              class="input"
            />
          </div>

          <div>
            <label for="stock" class="label">Stock inicial</label>
            <input 
              id="stock"
              v-model.number="stock"
              type="number"
              min="0"
              required
              class="input"
            />
          </div>
        </div>

        <!-- Botones -->
        <div class="flex justify-end gap-4">
          <router-link to="/articulos" class="btn-secondary">
            Cancelar
          </router-link>
          <button type="submit" class="btn-primary" :disabled="cargando">
            {{ cargando ? 'Guardando...' : 'Guardar Artículo' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>