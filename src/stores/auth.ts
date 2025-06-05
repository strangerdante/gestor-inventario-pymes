import { defineStore } from 'pinia'

interface User {
  id: string
  email: string
  nombre: string
  rol: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
}

// Demo users with plain passwords for testing
const demoUsers = [
  { 
    id: 'user1',
    email: 'almacen@demo.com', 
    nombre: 'Encargado Almacén', 
    rol: 'Encargado Almacén',
    password: 'almacen123'
  },
  { 
    id: 'user2',
    email: 'cuentas@demo.com', 
    nombre: 'Encargado Cuentas', 
    rol: 'Encargado Cuentas',
    password: 'cuentas123'
  }
]

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    isAuthenticated: false
  }),
  getters: {
    userName: (state) => state.user?.nombre || '',
    userRole: (state) => state.user?.rol || '',
    userId: (state) => state.user?.id || '',
    isEncargadoAlmacen: (state) => state.user?.rol === 'Encargado Almacén'
  },
  actions: {
    async login(email: string, password: string): Promise<boolean> {
      try {
        console.log('Attempting login for:', email)
        
        // Find user by email (case insensitive)
        const user = demoUsers.find(u => u.email.toLowerCase() === email.toLowerCase())
        if (!user) {
          console.log('User not found')
          return false
        }
        
        // Simple password check
        if (user.password !== password) {
          console.log('Invalid password')
          return false
        }
        
        // Successful login
        const { password: _, ...userWithoutPassword } = user
        this.user = userWithoutPassword
        this.isAuthenticated = true
        
        console.log('Login successful')
        return true
      } catch (error) {
        console.error('Login error:', error)
        return false
      }
    },
    
    logout() {
      this.user = null
      this.isAuthenticated = false
    },
    
    // Only for demo purposes
    async registerDemoUsers() {
      console.log('Demo users available')
    }
  },
  persist: {
    storage: localStorage,
    paths: ['user', 'isAuthenticated']
  }
})