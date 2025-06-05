import { defineStore } from 'pinia'
import { generarId } from '../utils/helpers'

export type TipoAlerta = 'stockBajo' | 'error' | 'info' | 'advertencia'

export interface Alerta {
  id: string
  tipo: TipoAlerta
  mensaje: string
  articuloId?: string
  createdAt: string
  leida: boolean
}

interface AlertasState {
  alertas: Alerta[]
}

export const useAlertasStore = defineStore('alertas', {
  state: (): AlertasState => ({
    alertas: []
  }),
  getters: {
    alertasNoLeidas: (state) => {
      return state.alertas.filter(alerta => !alerta.leida)
    },
    alertasStockBajo: (state) => {
      return state.alertas.filter(alerta => alerta.tipo === 'stockBajo')
    },
    totalAlertas: (state) => {
      return state.alertas.filter(alerta => !alerta.leida).length
    }
  },
  actions: {
    agregarAlerta(datos: Omit<Alerta, 'id' | 'createdAt' | 'leida'>) {
      // Verificar si ya existe una alerta similar no leída
      const alertaExistente = this.alertas.find(a => 
        !a.leida && 
        a.tipo === datos.tipo && 
        a.articuloId === datos.articuloId
      )
      
      if (alertaExistente) {
        // Actualizar la alerta existente
        alertaExistente.mensaje = datos.mensaje
        alertaExistente.createdAt = new Date().toISOString()
        return alertaExistente
      }
      
      // Crear nueva alerta
      const nuevaAlerta: Alerta = {
        id: generarId(),
        ...datos,
        createdAt: new Date().toISOString(),
        leida: false
      }
      
      this.alertas.push(nuevaAlerta)
      return nuevaAlerta
    },
    
    marcarComoLeida(id: string) {
      const alerta = this.alertas.find(a => a.id === id)
      if (alerta) {
        alerta.leida = true
        return true
      }
      return false
    },
    
    marcarTodasComoLeidas() {
      this.alertas.forEach(alerta => {
        alerta.leida = true
      })
    },
    
    eliminarAlerta(id: string) {
      const index = this.alertas.findIndex(a => a.id === id)
      if (index !== -1) {
        this.alertas.splice(index, 1)
        return true
      }
      return false
    },
    
    eliminarAlertasPorArticulo(articuloId: string) {
      this.alertas = this.alertas.filter(a => a.articuloId !== articuloId)
    }
  },
  persist: {
    storage: localStorage
  }
})