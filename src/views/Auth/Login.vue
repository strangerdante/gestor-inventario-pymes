<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { useArticulosStore } from '../../stores/articulos'
import { useAlmacenesStore } from '../../stores/almacenes'
import { useProveedoresStore } from '../../stores/proveedores'
import { useDocumentosStore } from '../../stores/documentos'
import { useCategoriasStore } from '../../stores/categorias'

const router = useRouter()
const authStore = useAuthStore()

// Stores for loading demo data
const articulosStore = useArticulosStore()
const almacenesStore = useAlmacenesStore()
const proveedoresStore = useProveedoresStore()
const documentosStore = useDocumentosStore()
const categoriasStore = useCategoriasStore()

const email = ref('')
const password = ref('')
const recordar = ref(false)
const error = ref('')
const cargando = ref(false)
const mostrarPassword = ref(false)
const mostrarDemoUsers = ref(false)
const mostrarRecuperacion = ref(false)
const emailRecuperacion = ref('')
const mensajeRecuperacion = ref('')
const cargandoRecuperacion = ref(false)

async function iniciarSesion() {
  error.value = ''
  
  if (!email.value || !password.value) {
    error.value = 'Por favor complete todos los campos'
    return
  }
  
  cargando.value = true
  
  try {
    const resultado = await authStore.login(email.value, password.value)
    
    if (resultado) {
      // Load demo data in correct order
      categoriasStore.cargarCategoriasDemo() // First load categories
      proveedoresStore.cargarProveedoresDemo() // Then load providers
      almacenesStore.cargarAlmacenesDemo() // Then load warehouses
      articulosStore.cargarArticulosDemo() // Then load articles with categories and warehouses
      documentosStore.cargarDocumentosDemo() // Finally load documents
      
      router.push('/')
    } else {
      error.value = 'Credenciales incorrectas'
    }
  } catch (e) {
    console.error(e)
    error.value = 'Error al iniciar sesión'
  } finally {
    cargando.value = false
  }
}

function llenarCredenciales(emailDemo: string, passwordDemo: string) {
  email.value = emailDemo
  password.value = passwordDemo
}

function abrirRecuperacion() {
  mostrarRecuperacion.value = true
  emailRecuperacion.value = ''
  mensajeRecuperacion.value = ''
}

function cerrarRecuperacion() {
  mostrarRecuperacion.value = false
  emailRecuperacion.value = ''
  mensajeRecuperacion.value = ''
}

async function enviarRecuperacion() {
  if (!emailRecuperacion.value) {
    mensajeRecuperacion.value = 'Por favor ingresa tu correo electrónico'
    return
  }

  if (!/\S+@\S+\.\S+/.test(emailRecuperacion.value)) {
    mensajeRecuperacion.value = 'Por favor ingresa un correo electrónico válido'
    return
  }

  cargandoRecuperacion.value = true
  mensajeRecuperacion.value = ''

  // Simular envío de correo (delay de 2 segundos)
  setTimeout(() => {
    cargandoRecuperacion.value = false
    mensajeRecuperacion.value = `Se ha enviado un correo de recuperación a ${emailRecuperacion.value}. Revisa tu bandeja de entrada y spam.`
  }, 2000)
}
</script>

<template>
  <div class="flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <!-- Main Card -->
      <div class="bg-white rounded-3xl shadow-xl p-6">
        <form @submit.prevent="iniciarSesion" class="space-y-6">
          <!-- Error Alert -->
          <div v-if="error" class="bg-red-50/80 backdrop-blur-sm border border-red-200 text-red-700 px-4 py-3 rounded-2xl relative animate-pulse">
            <div class="flex items-center">
              <svg class="w-5 h-5 text-red-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
              </svg>
              <span class="block sm:inline">{{ error }}</span>
            </div>
          </div>
          
          <!-- Email Field -->
          <div class="space-y-2">
            <label for="email" class="block text-sm font-semibold text-gray-700">
              Correo electrónico
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"/>
                </svg>
              </div>
              <input 
                id="email" 
                v-model="email" 
                type="email" 
                required 
                autocomplete="email"
                class="w-full pl-12 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                placeholder="ejemplo@correo.com"
              />
            </div>
          </div>
          
          <!-- Password Field -->
          <div class="space-y-2">
            <label for="password" class="block text-sm font-semibold text-gray-700">
              Contraseña
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
              </div>
              <input 
                id="password" 
                v-model="password" 
                :type="mostrarPassword ? 'text' : 'password'"
                required 
                autocomplete="current-password"
                class="w-full pl-12 pr-12 py-3 bg-gray-50/50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                placeholder="••••••••"
              />
              <button 
                type="button"
                @click="mostrarPassword = !mostrarPassword"
                class="absolute inset-y-0 right-0 pr-4 flex items-center hover:text-blue-600 transition-colors"
              >
                <svg v-if="mostrarPassword" class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464M9.878 9.878l-.637-.637m5.656 5.656l.637.637m-.637-.637L16 17.5m-1.343-1.343l-.637-.637m0 0l-4.243-4.243"/>
                </svg>
                <svg v-else class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                </svg>
              </button>
            </div>
          </div>
          
          <!-- Remember Me -->
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <input 
                id="recordar" 
                v-model="recordar" 
                type="checkbox" 
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-colors" 
              />
              <label for="recordar" class="ml-3 block text-sm text-gray-700 font-medium">
                Recordarme
              </label>
            </div>
            <button 
              type="button" 
              @click="abrirRecuperacion"
              class="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>
          
          <!-- Submit Button -->
          <div>
            <button 
              type="submit" 
              class="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-2xl transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
              :disabled="cargando"
            >
              <div class="flex items-center justify-center">
                <svg v-if="cargando" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ cargando ? 'Iniciando sesión...' : 'Iniciar Sesión' }}
              </div>
            </button>
          </div>
        </form>

        <!-- Demo Users Section -->
        <div class="mt-8 pt-6 border-t border-gray-200">
          <button 
            @click="mostrarDemoUsers = !mostrarDemoUsers"
            class="w-full flex items-center justify-center text-sm text-gray-600 hover:text-gray-800 font-medium transition-colors"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            Usuarios de demostración
            <svg :class="{'rotate-180': mostrarDemoUsers}" class="w-4 h-4 ml-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </button>
          
          <div v-show="mostrarDemoUsers" class="mt-4 space-y-3 animate-in slide-in-from-top duration-300">
            <div class="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-2xl border border-blue-200">
              <div class="flex items-center justify-between">
                <div>
                  <h4 class="font-semibold text-blue-900 text-sm">Encargado Almacén</h4>
                  <p class="text-blue-700 text-xs mt-1">almacen@demo.com</p>
                </div>
                <button 
                  @click="llenarCredenciales('almacen@demo.com', 'almacen123')"
                  class="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 rounded-lg transition-colors font-medium"
                >
                  Usar
                </button>
              </div>
            </div>
            
            <div class="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-2xl border border-purple-200">
              <div class="flex items-center justify-between">
                <div>
                  <h4 class="font-semibold text-purple-900 text-sm">Encargado Cuentas</h4>
                  <p class="text-purple-700 text-xs mt-1">cuentas@demo.com</p>
                </div>
                <button 
                  @click="llenarCredenciales('cuentas@demo.com', 'cuentas123')"
                  class="bg-purple-600 hover:bg-purple-700 text-white text-xs px-3 py-1.5 rounded-lg transition-colors font-medium"
                >
                  Usar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="text-center mt-8">
        <p class="text-gray-500 text-sm">
          © {{ new Date().getFullYear() }} Jamel Pimienta. Todos los derechos reservados.
        </p>
      </div>
    </div>

    <!-- Modal de Recuperación de Contraseña -->
    <div v-if="mostrarRecuperacion" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-md relative animate-in zoom-in duration-300">
        <!-- Botón cerrar -->
        <button 
          @click="cerrarRecuperacion"
          class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>

        <!-- Título -->
        <div class="text-center mb-6">
          <div class="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
            </svg>
          </div>
          <h3 class="text-xl font-bold text-gray-900">Recuperar Contraseña</h3>
          <p class="text-gray-600 text-sm mt-2">
            Ingresa tu correo electrónico y te enviaremos las instrucciones para restablecer tu contraseña.
          </p>
        </div>

        <!-- Formulario -->
        <form @submit.prevent="enviarRecuperacion" class="space-y-4">
          <!-- Mensaje de estado -->
          <div v-if="mensajeRecuperacion" 
               :class="[
                 'px-4 py-3 rounded-2xl text-sm font-medium',
                 mensajeRecuperacion.includes('enviado') 
                   ? 'bg-green-50 text-green-700 border border-green-200' 
                   : 'bg-red-50 text-red-700 border border-red-200'
               ]"
          >
            <div class="flex items-center">
              <svg v-if="mensajeRecuperacion.includes('enviado')" class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
              <svg v-else class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
              </svg>
              {{ mensajeRecuperacion }}
            </div>
          </div>

          <!-- Campo de email -->
          <div class="space-y-2">
            <label for="emailRecuperacion" class="block text-sm font-semibold text-gray-700">
              Correo electrónico
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"/>
                </svg>
              </div>
              <input 
                id="emailRecuperacion"
                v-model="emailRecuperacion"
                type="email"
                required
                autocomplete="email"
                :disabled="cargandoRecuperacion"
                class="w-full pl-12 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 disabled:opacity-50"
                placeholder="ejemplo@correo.com"
              />
            </div>
          </div>

          <!-- Botones -->
          <div class="flex space-x-3 pt-4">
            <button 
              type="button"
              @click="cerrarRecuperacion"
              :disabled="cargandoRecuperacion"
              class="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-2xl transition-all duration-200 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              :disabled="cargandoRecuperacion || !emailRecuperacion"
              class="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-2xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div class="flex items-center justify-center">
                <svg v-if="cargandoRecuperacion" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ cargandoRecuperacion ? 'Enviando...' : 'Enviar' }}
              </div>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>