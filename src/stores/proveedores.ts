import { defineStore } from 'pinia'
import { generarId } from '../utils/helpers'

export interface Proveedor {
  id: string
  nombre: string
  telefono: string
  email: string
  productos: string[]
  frecuencia?: 'Alta' | 'Media' | 'Baja'
  createdAt: string
  updatedAt: string
}

interface ProveedoresState {
  proveedores: Proveedor[]
  demoIds: {
    distribuidora: string
    lacteos: string
    bebidas: string
    granos: string
  }
}

export const useProveedoresStore = defineStore('proveedores', {
  state: (): ProveedoresState => ({
    proveedores: [],
    demoIds: {
      distribuidora: '',
      lacteos: '',
      bebidas: '',
      granos: ''
    }
  }),
  getters: {
    getProveedorById: (state) => (id: string) => {
      return state.proveedores.find(proveedor => proveedor.id === id) || null
    },
    totalProveedores: (state) => state.proveedores.length
  },
  actions: {
    agregarProveedor(proveedor: Omit<Proveedor, 'id' | 'createdAt' | 'updatedAt'>) {
      const fecha = new Date().toISOString()
      const nuevoProveedor: Proveedor = {
        id: generarId(),
        ...proveedor,
        createdAt: fecha,
        updatedAt: fecha
      }
      
      this.proveedores.push(nuevoProveedor)
      return nuevoProveedor
    },
    
    actualizarProveedor(id: string, datos: Partial<Proveedor>) {
      const index = this.proveedores.findIndex(p => p.id === id)
      if (index !== -1) {
        this.proveedores[index] = {
          ...this.proveedores[index],
          ...datos,
          updatedAt: new Date().toISOString()
        }
        return this.proveedores[index]
      }
      return null
    },
    
    eliminarProveedor(id: string) {
      const index = this.proveedores.findIndex(p => p.id === id)
      if (index !== -1) {
        this.proveedores.splice(index, 1)
        return true
      }
      return false
    },
    
    // Solo para demo
    cargarProveedoresDemo() {
      // Clear existing providers first
      this.proveedores = []
      
      const proveedoresDemo: Omit<Proveedor, 'id' | 'createdAt' | 'updatedAt'>[] = [
        {
          nombre: 'Distribuidora Alimentos SAS',
          telefono: '+57 321 5551234',
          email: 'contacto@distrialimentos.co',
          productos: ['arroz', 'aceite', 'azúcar'],
          frecuencia: 'Alta'
        },
        {
          nombre: 'Productos Lácteos El Campo',
          telefono: '+57 300 4567890',
          email: 'ventas@lacteoscampo.com.co',
          productos: ['leche', 'yogurt', 'queso'],
          frecuencia: 'Media'
        },
        {
          nombre: 'Bebidas y Refrescos Nacional',
          telefono: '+57 315 7778899',
          email: 'pedidos@bebidasnacional.co',
          productos: ['agua', 'gaseosas', 'jugos'],
          frecuencia: 'Alta'
        },
        {
          nombre: 'Importadora de Granos JL',
          telefono: '+57 310 2223344',
          email: 'info@importadorajl.com',
          productos: ['frijol', 'lenteja', 'garbanzo'],
          frecuencia: 'Baja'
        }
      ]
      
      // Agregar proveedores demo y guardar sus IDs
      const proveedores = proveedoresDemo.map(proveedor => this.agregarProveedor(proveedor))
      
      this.demoIds = {
        distribuidora: proveedores[0].id,
        lacteos: proveedores[1].id,
        bebidas: proveedores[2].id,
        granos: proveedores[3].id
      }
    }
  },
  persist: {
    storage: localStorage
  }
})