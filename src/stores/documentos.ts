import { defineStore } from 'pinia'
import { useArticulosStore } from './articulos'
import { useAlmacenesStore } from './almacenes'
import { useAuthStore } from './auth'
import { generarId } from '../utils/helpers'

export type TipoDocumento = 'INVENTARIO' | 'PEDIDO' | 'RECEPCION' | 'MERMA'
export type EstadoDocumento = 'BORRADOR' | 'CERRADO'
export type MotivoMerma = 'CADUCADO' | 'ROTO' | 'EXTRAVIO'

export interface LineaDocumento {
  id: string
  articuloId: string
  cantidad: number
  motivo?: MotivoMerma
}

export interface Documento {
  id: string
  tipo: TipoDocumento
  almacenId: string
  usuarioId: string
  estado: EstadoDocumento
  lineas: LineaDocumento[]
  descripcion?: string
  createdAt: string
  updatedAt: string
  closedAt?: string
}

interface DocumentosState {
  documentos: Documento[]
  documentoActual: Documento | null
}

export const useDocumentosStore = defineStore('documentos', {
  state: (): DocumentosState => ({
    documentos: [],
    documentoActual: null
  }),
  getters: {
    getDocumentoById: (state) => (id: string) => {
      return state.documentos.find(doc => doc.id === id) || null
    },
    getDocumentosPorTipo: (state) => (tipo: TipoDocumento) => {
      return state.documentos.filter(doc => doc.tipo === tipo)
    },
    getDocumentosPorEstado: (state) => (estado: EstadoDocumento) => {
      return state.documentos.filter(doc => doc.estado === estado)
    },
    getBorradores: (state) => {
      return state.documentos.filter(doc => doc.estado === 'BORRADOR')
    },
    getDocumentosCompletos: (state) => {
      return state.documentos.map(doc => {
        const almacenesStore = useAlmacenesStore()
        const authStore = useAuthStore()
        const articulosStore = useArticulosStore()
        
        const almacen = almacenesStore.getAlmacenById(doc.almacenId)
        const lineasCompletas = doc.lineas.map(linea => {
          const articulo = articulosStore.getArticuloById(linea.articuloId)
          return {
            ...linea,
            articulo: articulo
          }
        })
        
        return {
          ...doc,
          almacen,
          usuario: authStore.user,
          lineas: lineasCompletas,
          valorTotal: lineasCompletas.reduce((total, linea) => {
            const precio = linea.articulo?.precioCompra || 0
            return total + (precio * linea.cantidad)
          }, 0)
        }
      })
    },
    totalDocumentos: (state) => state.documentos.length
  },
  actions: {
    crearDocumento(tipo: TipoDocumento, almacenId: string, descripcion?: string) {
      const authStore = useAuthStore()
      
      const fecha = new Date().toISOString()
      const nuevoDocumento: Documento = {
        id: generarId(),
        tipo,
        almacenId,
        usuarioId: authStore.userId,
        estado: 'BORRADOR',
        lineas: [],
        descripcion,
        createdAt: fecha,
        updatedAt: fecha
      }
      
      this.documentos.push(nuevoDocumento)
      this.documentoActual = nuevoDocumento
      
      return nuevoDocumento
    },
    
    agregarLinea(documentoId: string, linea: Omit<LineaDocumento, 'id'>) {
      const documento = this.getDocumentoById(documentoId)
      if (!documento) return null
      
      // Verificar si el documento está en borrador
      if (documento.estado !== 'BORRADOR') {
        return null
      }
      
      // Verificar si ya existe el artículo
      const lineaExistente = documento.lineas.find(l => l.articuloId === linea.articuloId)
      if (lineaExistente) {
        // Actualizar cantidad en vez de agregar
        lineaExistente.cantidad += linea.cantidad
        documento.updatedAt = new Date().toISOString()
        return lineaExistente
      }
      
      // Agregar nueva línea
      const nuevaLinea: LineaDocumento = {
        id: generarId(),
        ...linea
      }
      
      documento.lineas.push(nuevaLinea)
      documento.updatedAt = new Date().toISOString()
      
      return nuevaLinea
    },
    
    actualizarLinea(documentoId: string, lineaId: string, datos: Partial<LineaDocumento>) {
      const documento = this.getDocumentoById(documentoId)
      if (!documento || documento.estado !== 'BORRADOR') return null
      
      const lineaIndex = documento.lineas.findIndex(l => l.id === lineaId)
      if (lineaIndex === -1) return null
      
      documento.lineas[lineaIndex] = {
        ...documento.lineas[lineaIndex],
        ...datos
      }
      
      documento.updatedAt = new Date().toISOString()
      
      return documento.lineas[lineaIndex]
    },
    
    eliminarLinea(documentoId: string, lineaId: string) {
      const documento = this.getDocumentoById(documentoId)
      if (!documento || documento.estado !== 'BORRADOR') return false
      
      const lineaIndex = documento.lineas.findIndex(l => l.id === lineaId)
      if (lineaIndex === -1) return false
      
      documento.lineas.splice(lineaIndex, 1)
      documento.updatedAt = new Date().toISOString()
      
      return true
    },
    
    cerrarDocumento(id: string) {
      const documento = this.getDocumentoById(id)
      if (!documento || documento.estado !== 'BORRADOR') return false
      
      // Validar que tenga al menos una línea
      if (documento.lineas.length === 0) return false
      
      const fecha = new Date().toISOString()
      
      documento.estado = 'CERRADO'
      documento.updatedAt = fecha
      documento.closedAt = fecha
      
      // Actualizar stocks según el tipo de documento
      const articulosStore = useArticulosStore()
      
      switch (documento.tipo) {
        case 'INVENTARIO':
          // Para inventarios, establecer stock exacto
          documento.lineas.forEach(linea => {
            const articulo = articulosStore.getArticuloById(linea.articuloId)
            if (articulo) {
              articulosStore.actualizarArticulo(linea.articuloId, {
                stock: linea.cantidad
              })
            }
          })
          break
          
        case 'PEDIDO':
          // Los pedidos no afectan el stock
          break
          
        case 'RECEPCION':
          // Para recepciones, aumentar stock
          documento.lineas.forEach(linea => {
            const articulo = articulosStore.getArticuloById(linea.articuloId)
            if (articulo) {
              articulosStore.actualizarArticulo(linea.articuloId, {
                stock: articulo.stock + linea.cantidad
              })
            }
          })
          break
          
        case 'MERMA':
          // Para mermas, reducir stock
          documento.lineas.forEach(linea => {
            const articulo = articulosStore.getArticuloById(linea.articuloId)
            if (articulo) {
              articulosStore.actualizarArticulo(linea.articuloId, {
                stock: Math.max(0, articulo.stock - linea.cantidad)
              })
            }
          })
          break
      }
      
      return true
    },
    
    seleccionarDocumento(id: string) {
      this.documentoActual = this.getDocumentoById(id)
    },
    
    limpiarSeleccion() {
      this.documentoActual = null
    },
    
    eliminarDocumento(id: string) {
      const documento = this.getDocumentoById(id)
      if (!documento) return false
      
      // Solo permitir eliminar documentos en borrador
      if (documento.estado !== 'BORRADOR') return false
      
      const index = this.documentos.findIndex(doc => doc.id === id)
      if (index === -1) return false
      
      this.documentos.splice(index, 1)
      
      // Si era el documento actual, limpiar selección
      if (this.documentoActual?.id === id) {
        this.documentoActual = null
      }
      
      return true
    },
    
    // Solo para demo
    cargarDocumentosDemo() {
      // Clear existing documents first
      this.documentos = []
      this.documentoActual = null
      
      // Obtener stores necesarios
      const authStore = useAuthStore()
      const almacenesStore = useAlmacenesStore()
      const articulosStore = useArticulosStore()
      
      // Verificar que hay datos demo cargados
      if (almacenesStore.totalAlmacenes === 0 || articulosStore.totalArticulos === 0) {
        return
      }
      
      // Crear un documento de ejemplo de cada tipo
      const almacenId = almacenesStore.almacenes[0].id
      const userId = authStore.userId
      const fecha = new Date().toISOString()
      const fechaAnterior = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      
      // Documento de inventario cerrado
      const inventario: Documento = {
        id: generarId(),
        tipo: 'INVENTARIO',
        almacenId,
        usuarioId: userId,
        estado: 'CERRADO',
        lineas: articulosStore.articulos.slice(0, 3).map(art => ({
          id: generarId(),
          articuloId: art.id,
          cantidad: art.stock
        })),
        createdAt: fechaAnterior,
        updatedAt: fechaAnterior,
        closedAt: fechaAnterior
      }
      
      // Documento de pedido en borrador
      const pedido: Documento = {
        id: generarId(),
        tipo: 'PEDIDO',
        almacenId,
        usuarioId: userId,
        estado: 'BORRADOR',
        lineas: [
          {
            id: generarId(),
            articuloId: articulosStore.articulos[0].id,
            cantidad: 10
          },
          {
            id: generarId(),
            articuloId: articulosStore.articulos[1].id,
            cantidad: 5
          }
        ],
        createdAt: fecha,
        updatedAt: fecha
      }
      
      // Agregar documentos
      this.documentos.push(inventario, pedido)
    }
  },
  persist: {
    storage: localStorage
  }
})