<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useArticulosStore } from '../../stores/articulos'
import { useProveedoresStore } from '../../stores/proveedores'
import { useCategoriasStore } from '../../stores/categorias'
import { useAlmacenesStore } from '../../stores/almacenes'

const router = useRouter()
const route = useRoute()
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

onMounted(() => {
  const articulo = articulosStore.getArticuloById(route.params.id as string)
  if (!articulo) {
    router.push('/articulos')
    return
  }

  if (articulo.almacenId !== almacenesStore.almacenActivo) {
    router.push('/articulos')
    error.value = 'No tiene acceso a editar este artículo'
    return
  }

  nombre.value = articulo.nombre
  codigoEAN.value = articulo.codigoEAN
  precioCompra.value = articulo.precioCompra
  precioVenta.value = articulo.precioVenta
  stockMinimo.value = articulo.stockMinimo
  stock.value = articulo.stock
  proveedorId.value = articulo.proveedorId
  categoriaId.value = articulo.categoriaId || ''
})

function guardarCambios() {
  if (!nombre.value || !codigoEAN.value || !proveedorId.value) {
    error.value = 'Por favor complete todos los campos requeridos'
    return
  }

  try {
    articulosStore.actualizarArticulo(route.params.id as string, {
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
    error.value = 'Error al actualizar el artículo'
  }
}

function eliminarArticulo() {
  if (!confirm('¿Está seguro de eliminar este artículo?')) {
    return
  }

  try {
    articulosStore.eliminarArticulo(route.params.id as string)
    router.push('/articulos')
  } catch (e) {
    console.error(e)
    error.value = 'Error al eliminar el artículo'
  }
}
</script>

<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Editar Artículo</h1>
      <p class="mt-1 text-sm text-gray-600">
        Modifique los datos del artículo
      </p>
    </div>

    <div class="card">
      <form @submit.prevent="guardarCambios">
        <div v-if="error" class="mb-4 bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
          {{ error }}
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
            />
          </div>

          <div>
            <label for="codigoEAN" class="label">Código EAN</label>
            <input 
              id="codigoEAN"
              v-model="codigoEAN"
              type="text"
              required
              class="input"
              readonly
            />
          </div>
        </div>

        <div class="mb-6">
          <label for="proveedor" class="label">Proveedor</label>
          <select 
            id="proveedor"
            v-model="proveedorId"
            required
            class="select"
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
            <label for="stock" class="label">Stock actual</label>
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
        <div class="flex justify-between">
          <button 
            type="button" 
            class="btn-danger"
            @click="eliminarArticulo"
          >
            Eliminar
          </button>

          <div class="flex gap-4">
            <router-link to="/articulos" class="btn-secondary">
              Cancelar
            </router-link>
            <button type="submit" class="btn-primary">
              Guardar
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>