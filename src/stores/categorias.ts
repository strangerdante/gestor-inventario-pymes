import { defineStore } from 'pinia'
import { generarId } from '../utils/helpers'

export interface Categoria {
  id: string
  nombre: string
  descripcion?: string
  createdAt: string
  updatedAt: string
}

interface CategoriasState {
  categorias: Categoria[]
}

export const useCategoriasStore = defineStore('categorias', {
  state: (): CategoriasState => ({
    categorias: []
  }),
  
  getters: {
    getCategoriaById: (state) => (id: string) => {
      return state.categorias.find(cat => cat.id === id) || null
    }
  },
  
  actions: {
    agregarCategoria(categoria: Omit<Categoria, 'id' | 'createdAt' | 'updatedAt'>) {
      const fecha = new Date().toISOString()
      const nuevaCategoria: Categoria = {
        id: generarId(),
        ...categoria,
        createdAt: fecha,
        updatedAt: fecha
      }
      
      this.categorias.push(nuevaCategoria)
      return nuevaCategoria
    },
    
    actualizarCategoria(id: string, datos: Partial<Categoria>) {
      const index = this.categorias.findIndex(c => c.id === id)
      if (index !== -1) {
        this.categorias[index] = {
          ...this.categorias[index],
          ...datos,
          updatedAt: new Date().toISOString()
        }
        return this.categorias[index]
      }
      return null
    },
    
    eliminarCategoria(id: string) {
      const index = this.categorias.findIndex(c => c.id === id)
      if (index !== -1) {
        this.categorias.splice(index, 1)
        return true
      }
      return false
    },
    
    cargarCategoriasDemo() {
      // Clear existing categories first
      this.categorias = []
      
      const categoriasDemo: Omit<Categoria, 'id' | 'createdAt' | 'updatedAt'>[] = [
        {
          nombre: 'Lácteos',
          descripcion: 'Productos lácteos y derivados'
        },
        {
          nombre: 'Granos',
          descripcion: 'Cereales y legumbres'
        },
        {
          nombre: 'Aceites y Grasas',
          descripcion: 'Aceites vegetales y grasas comestibles'
        },
        {
          nombre: 'Bebidas',
          descripcion: 'Bebidas y refrescos'
        },
        {
          nombre: 'Snacks',
          descripcion: 'Productos de paquete y snacks'
        }
      ]
      
      categoriasDemo.forEach(categoria => {
        this.agregarCategoria(categoria)
      })
    }
  },
  
  persist: {
    storage: localStorage
  }
})