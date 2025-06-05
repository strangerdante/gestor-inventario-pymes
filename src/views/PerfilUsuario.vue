<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
const showChangePassword = ref(false)
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const message = ref('')
const error = ref('')

function toggleChangePassword() {
  showChangePassword.value = !showChangePassword.value
  currentPassword.value = ''
  newPassword.value = ''
  confirmPassword.value = ''
  message.value = ''
  error.value = ''
}

function updatePassword() {
  error.value = ''
  message.value = ''
  
  if (!currentPassword.value || !newPassword.value || !confirmPassword.value) {
    error.value = 'Por favor complete todos los campos'
    return
  }
  
  if (newPassword.value !== confirmPassword.value) {
    error.value = 'Las contraseñas no coinciden'
    return
  }
  
  // Simular cambio de contraseña exitoso
  message.value = 'Contraseña actualizada correctamente'
  toggleChangePassword()
}
</script>

<template>
  <div class="max-w-3xl mx-auto">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Perfil de Usuario</h1>
      <p class="mt-1 text-sm text-gray-600">
        Administre su información personal y preferencias
      </p>
    </div>
    
    <!-- Información del usuario -->
    <div class="card mb-6">
      <div class="flex items-center">
        <div class="h-20 w-20 rounded-full bg-primary-200 flex items-center justify-center text-primary-700 text-2xl font-bold">
          {{ authStore.userName.charAt(0) }}
        </div>
        
        <div class="ml-6">
          <h2 class="text-xl font-semibold text-gray-900">
            {{ authStore.userName }}
          </h2>
          <p class="text-gray-500">{{ authStore.userRole }}</p>
        </div>
      </div>
    </div>
    
    <!-- Información de la cuenta -->
    <div class="card mb-6">
      <h3 class="text-lg font-medium mb-4">Información de la Cuenta</h3>
      
      <div class="space-y-4">
        <div>
          <label class="label">Nombre completo</label>
          <input 
            type="text" 
            :value="authStore.userName"
            disabled
            class="input bg-gray-50"
          />
        </div>
        
        <div>
          <label class="label">Correo electrónico</label>
          <input 
            type="email" 
            :value="authStore.user?.email"
            disabled
            class="input bg-gray-50"
          />
        </div>
        
        <div>
          <label class="label">Rol</label>
          <input 
            type="text" 
            :value="authStore.userRole"
            disabled
            class="input bg-gray-50"
          />
        </div>
      </div>
    </div>
    
    <!-- Seguridad -->
    <div class="card">
      <h3 class="text-lg font-medium mb-4">Seguridad</h3>
      
      <div v-if="!showChangePassword">
        <button 
          @click="toggleChangePassword"
          class="btn-primary"
        >
          Cambiar contraseña
        </button>
      </div>
      
      <form v-else @submit.prevent="updatePassword" class="space-y-4">
        <div v-if="error" class="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {{ error }}
        </div>
        
        <div v-if="message" class="bg-green-50 border border-green-400 text-green-700 px-4 py-3 rounded relative">
          {{ message }}
        </div>
        
        <div>
          <label for="currentPassword" class="label">Contraseña actual</label>
          <input 
            id="currentPassword"
            v-model="currentPassword"
            type="password" 
            class="input"
            placeholder="••••••••"
          />
        </div>
        
        <div>
          <label for="newPassword" class="label">Nueva contraseña</label>
          <input 
            id="newPassword"
            v-model="newPassword"
            type="password" 
            class="input"
            placeholder="••••••••"
          />
        </div>
        
        <div>
          <label for="confirmPassword" class="label">Confirmar nueva contraseña</label>
          <input 
            id="confirmPassword"
            v-model="confirmPassword"
            type="password" 
            class="input"
            placeholder="••••••••"
          />
        </div>
        
        <div class="flex space-x-4">
          <button 
            type="submit"
            class="btn-primary"
          >
            Actualizar contraseña
          </button>
          
          <button 
            type="button"
            @click="toggleChangePassword"
            class="btn-secondary"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  </div>
</template>