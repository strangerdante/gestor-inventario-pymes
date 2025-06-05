import { defineStore } from 'pinia'
import { useProveedoresStore } from './proveedores'
import { useCategoriasStore } from './categorias'
import { useAlmacenesStore } from './almacenes'
import type { Articulo } from '../types'

export const useArticulosStore = defineStore('articulos', {
  state: () => ({
    articulos: [] as Articulo[]
  }),

  getters: {
    getArticuloById: (state) => (id: string) => {
      return state.articulos.find((articulo: Articulo) => articulo.id === id)
    },

    getArticuloByEAN: (state) => (ean: string) => {
      const almacenesStore = useAlmacenesStore()
      return state.articulos.find((articulo: Articulo) => 
        articulo.codigoEAN === ean && 
        articulo.almacenId === almacenesStore.almacenActivo
      )
    },

    articulosDelAlmacenActivo: (state) => {
      const almacenesStore = useAlmacenesStore()
      return state.articulos.filter((articulo: Articulo) => 
        articulo.almacenId === almacenesStore.almacenActivo
      )
    },

    articulosConStockBajo: (state) => {
      const almacenesStore = useAlmacenesStore()
      return state.articulos.filter((articulo: Articulo) => 
        articulo.stock <= articulo.stockMinimo &&
        articulo.almacenId === almacenesStore.almacenActivo
      )
    },

    valorTotalInventario: (state) => {
      const almacenesStore = useAlmacenesStore()
      return state.articulos
        .filter((articulo: Articulo) => articulo.almacenId === almacenesStore.almacenActivo)
        .reduce((total: number, articulo: Articulo) => {
          return total + (articulo.precioCompra * articulo.stock)
        }, 0)
    },

    valorTotalVenta: (state) => {
      const almacenesStore = useAlmacenesStore()
      return state.articulos
        .filter((articulo: Articulo) => articulo.almacenId === almacenesStore.almacenActivo)
        .reduce((total: number, articulo: Articulo) => {
          return total + (articulo.precioVenta * articulo.stock)
        }, 0)
    },

    totalArticulos: (state) => {
      const almacenesStore = useAlmacenesStore()
      return state.articulos.filter(
        (articulo: Articulo) => articulo.almacenId === almacenesStore.almacenActivo
      ).length
    }
  },

  actions: {
    agregarArticulo(articulo: Omit<Articulo, 'id' | 'createdAt' | 'updatedAt' | 'almacenId'>) {
      const almacenesStore = useAlmacenesStore()
      if (!almacenesStore.almacenActivo) {
        throw new Error('No hay un almacén seleccionado')
      }

      const newArticulo: Articulo = {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        almacenId: almacenesStore.almacenActivo,
        ...articulo
      }
      this.articulos.push(newArticulo)
    },

    actualizarArticulo(id: string, datos: Partial<Omit<Articulo, 'id' | 'createdAt' | 'almacenId'>>) {
      const index = this.articulos.findIndex(a => a.id === id)
      if (index !== -1) {
        this.articulos[index] = {
          ...this.articulos[index],
          ...datos,
          updatedAt: new Date().toISOString()
        }
      }
    },

    eliminarArticulo(id: string) {
      const index = this.articulos.findIndex(a => a.id === id)
      if (index !== -1) {
        this.articulos.splice(index, 1)
      }
    },

    async buscarPorEAN(ean: string) {
      // Primero buscar en la base de datos local del almacén actual
      const articuloLocal = this.getArticuloByEAN(ean)
      if (articuloLocal) {
        return articuloLocal
      }

      // TODO: Implementar búsqueda en API externa
      return null
    },

    cargarArticulosDemo() {
      // Limpiar artículos existentes para evitar duplicados
      this.articulos = []
      
      const proveedoresStore = useProveedoresStore()
      const categoriasStore = useCategoriasStore()
      const almacenesStore = useAlmacenesStore()
      
      if (proveedoresStore.proveedores.length === 0) {
        console.warn('Los proveedores deben cargarse antes que los artículos')
        return
      }

      if (almacenesStore.almacenes.length === 0) {
        console.warn('Los almacenes deben cargarse antes que los artículos')
        return
      }

      // Obtener IDs de categorías
      const categorias = categoriasStore.categorias
      const categoriaLacteos = categorias.find(c => c.nombre === 'Lácteos')?.id
      const categoriaGranos = categorias.find(c => c.nombre === 'Granos')?.id
      const categoriaAceites = categorias.find(c => c.nombre === 'Aceites y Grasas')?.id
      const categoriaBebidas = categorias.find(c => c.nombre === 'Bebidas')?.id
      const categoriaSnacks = categorias.find(c => c.nombre === 'Snacks')?.id
      
      // Artículos base con sus datos
      const articulosBase = [
        {
          nombre: 'Arroz Diana 500g',
          codigoEAN: '7701234567890',
          precioCompra: 2500,
          precioVenta: 3500,
          stockMinimo: 10,
          proveedorId: proveedoresStore.demoIds.distribuidora,
          categoriaId: categoriaGranos,
          atributos: []
        },
        {
          nombre: 'Aceite Gourmet 1L',
          codigoEAN: '7701234567891',
          precioCompra: 8500,
          precioVenta: 12000,
          stockMinimo: 5,
          proveedorId: proveedoresStore.demoIds.distribuidora,
          categoriaId: categoriaAceites,
          atributos: []
        },
        {
          nombre: 'Leche Alquería 1L',
          codigoEAN: '7701234567894',
          precioCompra: 2800,
          precioVenta: 3600,
          stockMinimo: 15,
          proveedorId: proveedoresStore.demoIds.lacteos,
          categoriaId: categoriaLacteos,
          atributos: []
        },
        {
          nombre: 'Gaseosa Coca-Cola 2L',
          codigoEAN: '7701234567895',
          precioCompra: 3500,
          precioVenta: 4500,
          stockMinimo: 20,
          proveedorId: proveedoresStore.demoIds.bebidas,
          categoriaId: categoriaBebidas,
          atributos: []
        },
        {
          nombre: 'Papas Margarita 45g',
          codigoEAN: '7701234567896',
          precioCompra: 1200,
          precioVenta: 1800,
          stockMinimo: 30,
          proveedorId: proveedoresStore.demoIds.distribuidora,
          categoriaId: categoriaSnacks,
          atributos: []
        }
      ]
      
      // Inventario por almacén (diferentes cantidades para cada artículo en cada almacén)
      const inventarioPorAlmacen = {
        'Bodega Principal': [25, 15, 40, 50, 60], // Stock para cada artículo en orden
        'Sucursal Norte': [18, 8, 22, 35, 45],
        'Almacén Medellín': [30, 12, 35, 45, 55]
      }
      
      // Crear artículos para cada almacén con su stock específico
      almacenesStore.almacenes.forEach(almacen => {
        const stockArray = inventarioPorAlmacen[almacen.nombre as keyof typeof inventarioPorAlmacen] || []
        
        articulosBase.forEach((articulo, index) => {
          const fecha = new Date().toISOString()
          const nuevoArticulo = {
            id: crypto.randomUUID(),
            createdAt: fecha,
            updatedAt: fecha,
            almacenId: almacen.id,
            ...articulo,
            stock: stockArray[index] || 0
          }
          this.articulos.push(nuevoArticulo)
        })
      })

      // Establecer el almacén activo al primero si no hay ninguno seleccionado
      if (!almacenesStore.almacenActivo && almacenesStore.almacenes.length > 0) {
        almacenesStore.seleccionarAlmacenActivo(almacenesStore.almacenes[0].id)
      }
    }
  },

  persist: {
    storage: localStorage
  }
})