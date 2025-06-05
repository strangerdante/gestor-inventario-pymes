import { defineStore } from 'pinia'
import { generarId } from '../utils/helpers'

export interface Almacen {
  id: string
  nombre: string
  ubicacion: string
  responsable: string
  createdAt: string
  updatedAt: string
}

interface AlmacenesState {
  almacenes: Almacen[]
  almacenActivo: string | null
}

export const useAlmacenesStore = defineStore('almacenes', {
  state: (): AlmacenesState => ({
    almacenes: [],
    almacenActivo: null
  }),
  getters: {
    getAlmacenById: (state) => (id: string) => {
      return state.almacenes.find(almacen => almacen.id === id) || null
    },
    almacenActivoData: (state) => {
      return state.almacenActivo ? 
        state.almacenes.find(almacen => almacen.id === state.almacenActivo) : 
        null
    },
    totalAlmacenes: (state) => state.almacenes.length
  },
  actions: {
    agregarAlmacen(almacen: Omit<Almacen, 'id' | 'createdAt' | 'updatedAt'>) {
      const fecha = new Date().toISOString()
      const nuevoAlmacen: Almacen = {
        id: generarId(),
        ...almacen,
        createdAt: fecha,
        updatedAt: fecha
      }
      
      this.almacenes.push(nuevoAlmacen)
      
      // Si es el primer almacén, establecerlo como activo
      if (this.almacenes.length === 1) {
        this.seleccionarAlmacenActivo(nuevoAlmacen.id)
      }
      
      return nuevoAlmacen
    },
    
    actualizarAlmacen(id: string, datos: Partial<Almacen>) {
      const index = this.almacenes.findIndex(a => a.id === id)
      if (index !== -1) {
        this.almacenes[index] = {
          ...this.almacenes[index],
          ...datos,
          updatedAt: new Date().toISOString()
        }
        return this.almacenes[index]
      }
      return null
    },
    
    eliminarAlmacen(id: string) {
      const index = this.almacenes.findIndex(a => a.id === id)
      if (index !== -1) {
        this.almacenes.splice(index, 1)
        
        // Si el almacén eliminado era el activo, seleccionar otro
        if (this.almacenActivo === id && this.almacenes.length > 0) {
          this.seleccionarAlmacenActivo(this.almacenes[0].id)
        } else if (this.almacenes.length === 0) {
          this.almacenActivo = null
        }
        
        return true
      }
      return false
    },
    
    seleccionarAlmacenActivo(id: string) {
      const almacen = this.getAlmacenById(id)
      if (almacen) {
        this.almacenActivo = id
        return true
      }
      return false
    },
    
    // Solo para demo
    cargarAlmacenesDemo() {
      // Clear existing warehouses first
      this.almacenes = []
      this.almacenActivo = null
      
      const almacenesDemo: Omit<Almacen, 'id' | 'createdAt' | 'updatedAt'>[] = [
        {
          nombre: 'Bodega Principal',
          ubicacion: 'Calle 80 #23-45, Bogotá',
          responsable: 'Carlos Rodríguez'
        },
        {
          nombre: 'Sucursal Norte',
          ubicacion: 'Carrera 7 #124-35, Bogotá',
          responsable: 'Ana Martínez'
        },
        {
          nombre: 'Almacén Medellín',
          ubicacion: 'Calle 10 #43-12, Medellín',
          responsable: 'Julián Restrepo'
        }
      ]
      
      // Agregar almacenes demo
      almacenesDemo.forEach(almacen => {
        this.agregarAlmacen(almacen)
      })
    }
  },
  persist: {
    storage: localStorage
  }
})