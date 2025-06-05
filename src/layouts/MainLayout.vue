<!-- Contenido del menú móvil -->
<template>
  <div class="h-screen flex overflow-hidden bg-gray-100">
    <!-- Sidebar para móvil -->
    <div 
      v-if="isSidebarOpen" 
      class="fixed inset-0 flex z-40 md:hidden" 
      role="dialog" 
      aria-modal="true"
    >
      <!-- Fondo oscuro (sin animación) -->
      <div 
        class="fixed inset-0 bg-gray-600 bg-opacity-75" 
        aria-hidden="true"
        @click="closeSidebar"
      ></div>
      
      <!-- Sidebar con animación -->
      <Transition
        enter-active-class="sidebar-enter-active"
        enter-from-class="sidebar-enter-from"
        leave-active-class="sidebar-leave-active"
        leave-to-class="sidebar-leave-to"
        appear
      >
        <div class="relative flex-1 flex flex-col max-w-xs w-full pt-5 pb-4 bg-primary-700">
          <div class="flex-shrink-0 flex items-center justify-between px-4">
            <span class="text-white text-xl font-bold">Inventario PyMEs</span>
            <button 
              type="button" 
              class="text-white hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              @click="closeSidebar"
            >
              <span class="sr-only">Cerrar sidebar</span>
              <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div class="mt-5 flex-1 h-0 overflow-y-auto">
            <nav class="px-2 space-y-1">
              <router-link 
                to="/" 
                class="group flex items-center px-2 py-2 text-base font-medium rounded-md text-white hover:bg-primary-600"
                :class="{ 'bg-primary-600': $route.path === '/' }"
                @click="closeSidebar"
              >
                <svg class="mr-4 h-6 w-6 text-primary-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Dashboard
              </router-link>
              
              <router-link 
                to="/articulos" 
                class="group flex items-center px-2 py-2 text-base font-medium rounded-md text-white hover:bg-primary-600"
                :class="{ 'bg-primary-600': $route.path.startsWith('/articulos') }"
                @click="closeSidebar"
              >
                <svg class="mr-4 h-6 w-6 text-primary-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                Artículos
              </router-link>

              <router-link 
                to="/categorias" 
                class="group flex items-center px-2 py-2 text-base font-medium rounded-md text-white hover:bg-primary-600"
                :class="{ 'bg-primary-600': $route.path.startsWith('/categorias') }"
                @click="closeSidebar"
              >
                <svg class="mr-4 h-6 w-6 text-primary-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                Categorías
              </router-link>
              
              <router-link 
                to="/almacenes" 
                class="group flex items-center px-2 py-2 text-base font-medium rounded-md text-white hover:bg-primary-600"
                :class="{ 'bg-primary-600': $route.path.startsWith('/almacenes') }"
                @click="closeSidebar"
              >
                <svg class="mr-4 h-6 w-6 text-primary-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                </svg>
                Almacenes
              </router-link>
              
              <router-link 
                to="/proveedores" 
                class="group flex items-center px-2 py-2 text-base font-medium rounded-md text-white hover:bg-primary-600"
                :class="{ 'bg-primary-600': $route.path.startsWith('/proveedores') }"
                @click="closeSidebar"
              >
                <svg class="mr-4 h-6 w-6 text-primary-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Proveedores
              </router-link>
              
              <router-link 
                to="/documentos" 
                class="group flex items-center px-2 py-2 text-base font-medium rounded-md text-white hover:bg-primary-600"
                :class="{ 'bg-primary-600': $route.path.startsWith('/documentos') }"
                @click="closeSidebar"
              >
                <svg class="mr-4 h-6 w-6 text-primary-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Documentos
              </router-link>

              <router-link 
                to="/reportes" 
                class="group flex items-center px-2 py-2 text-base font-medium rounded-md text-white hover:bg-primary-600"
                :class="{ 'bg-primary-600': $route.path.startsWith('/reportes') }"
                @click="closeSidebar"
              >
                <svg class="mr-4 h-6 w-6 text-primary-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Reportes
              </router-link>
            </nav>
          </div>
        </div>
      </Transition>
    </div>
    
    <!-- Sidebar para desktop -->
    <div class="hidden md:flex md:flex-shrink-0">
      <div class="flex flex-col w-64">
        <div class="flex flex-col h-0 flex-1">
          <div class="flex items-center h-16 flex-shrink-0 px-4 bg-primary-700">
            <span class="text-white text-xl font-bold">Inventario PyMEs</span>
          </div>
          
          <div class="flex-1 flex flex-col overflow-y-auto bg-primary-800">
            <nav class="flex-1 px-2 py-4 space-y-1">
              <router-link 
                to="/" 
                class="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-white hover:bg-primary-600"
                :class="{ 'bg-primary-600': $route.path === '/' }"
              >
                <svg class="mr-3 h-6 w-6 text-primary-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Dashboard
              </router-link>
              
              <router-link 
                to="/articulos" 
                class="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-white hover:bg-primary-600"
                :class="{ 'bg-primary-600': $route.path.startsWith('/articulos') }"
              >
                <svg class="mr-3 h-6 w-6 text-primary-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                Artículos
              </router-link>

              <router-link 
                to="/categorias" 
                class="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-white hover:bg-primary-600"
                :class="{ 'bg-primary-600': $route.path.startsWith('/categorias') }"
              >
                <svg class="mr-3 h-6 w-6 text-primary-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                Categorías
              </router-link>
              
              <router-link 
                to="/almacenes" 
                class="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-white hover:bg-primary-600"
                :class="{ 'bg-primary-600': $route.path.startsWith('/almacenes') }"
              >
                <svg class="mr-3 h-6 w-6 text-primary-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                </svg>
                Almacenes
              </router-link>
              
              <router-link 
                to="/proveedores" 
                class="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-white hover:bg-primary-600"
                :class="{ 'bg-primary-600': $route.path.startsWith('/proveedores') }"
              >
                <svg class="mr-3 h-6 w-6 text-primary-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Proveedores
              </router-link>
              
              <router-link 
                to="/documentos" 
                class="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-white hover:bg-primary-600"
                :class="{ 'bg-primary-600': $route.path.startsWith('/documentos') }"
              >
                <svg class="mr-3 h-6 w-6 text-primary-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Documentos
              </router-link>

              <router-link 
                to="/reportes" 
                class="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-white hover:bg-primary-600"
                :class="{ 'bg-primary-600': $route.path.startsWith('/reportes') }"
              >
                <svg class="mr-3 h-6 w-6 text-primary-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Reportes
              </router-link>
            </nav>
          </div>
        </div>
      </div>
    </div>
    
    <div class="flex flex-col w-0 flex-1 overflow-hidden">
      <div class="relative z-10 flex-shrink-0 flex h-16 bg-white shadow">
        <button 
          type="button" 
          class="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 md:hidden"
          @click="toggleSidebar"
        >
          <span class="sr-only">Abrir sidebar</span>
          <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        
        <div class="flex-1 px-4 flex justify-between">
          <div class="flex-1 flex items-center">
            <!-- Selector de Almacén -->
            <div class="relative">
              <div v-if="almacenesStore.totalAlmacenes > 0" class="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary-600 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                
                <div class="relative">
                  <button 
                    @click="toggleAlmacenDropdown"
                    class="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-md px-2 py-1 hover:bg-gray-50"
                  >
                    <span>
                      {{ almacenesStore.almacenActivo ? almacenesStore.getAlmacenById(almacenesStore.almacenActivo)?.nombre : 'Seleccionar Almacén' }}
                    </span>
                    <svg class="ml-1 h-5 w-5 md:h-4 md:w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                  </button>
                  
                  <!-- Dropdown -->
                  <div 
                    v-if="isAlmacenDropdownOpen" 
                    class="absolute left-0 mt-2 w-64 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
                  >
                    <div class="py-1" role="menu" aria-orientation="vertical">
                      <button
                        v-for="almacen in almacenesStore.almacenes"
                        :key="almacen.id"
                        @click="seleccionarAlmacen(almacen.id)"
                        class="group flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                        :class="{ 'bg-primary-50 text-primary-700': almacenesStore.almacenActivo === almacen.id }"
                        role="menuitem"
                      >
                        <svg v-if="almacenesStore.almacenActivo === almacen.id" class="mr-3 h-4 w-4 text-primary-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                        </svg>
                        <div class="flex flex-col items-start" :class="{ 'ml-7': almacenesStore.almacenActivo !== almacen.id }">
                          <span class="font-medium">{{ almacen.nombre }}</span>
                          <span class="text-xs text-gray-500">{{ almacen.ubicacion }}</span>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Cuando no hay almacenes -->
              <div v-else class="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-warning-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <router-link to="/almacenes" class="text-sm font-medium text-warning-700 hover:text-warning-800">
                  Crear Almacén
                </router-link>
              </div>
            </div>
          </div>
          
          <div class="ml-4 flex items-center md:ml-6">
            <!-- Botón de notificaciones -->
            <button 
              class="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <span class="sr-only">Ver notificaciones</span>
              <div class="relative">
                <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span v-if="alertasCount > 0" class="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-danger-600 rounded-full">
                  {{ alertasCount }}
                </span>
              </div>
            </button>
            
            <!-- Perfil de usuario -->
            <div class="ml-3 relative">
              <div class="flex items-center">
                <span class="hidden md:block mr-2 text-sm font-medium text-gray-700">{{ userName }}</span>
                <span class="hidden md:block text-xs text-gray-500">{{ userRole }}</span>
                <router-link to="/perfil" class="ml-2 bg-white flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                  <span class="sr-only">Abrir menú de usuario</span>
                  <div class="h-8 w-8 rounded-full bg-primary-200 flex items-center justify-center text-primary-700 font-bold">
                    {{ userName.charAt(0) }}
                  </div>
                </router-link>
              </div>
            </div>
            
            <!-- Botón de cerrar sesión -->
            <button 
              @click="logout"
              class="ml-4 bg-white p-2 rounded-full text-gray-400 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
              title="Cerrar Sesión"
            >
              <span class="sr-only">Cerrar sesión</span>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h5a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      <main class="flex-1 relative overflow-y-auto focus:outline-none">
        <div class="py-6">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            <router-view />
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useAlertasStore } from '../stores/alertas'
import { useAlmacenesStore } from '../stores/almacenes'

const router = useRouter()
const authStore = useAuthStore()
const alertasStore = useAlertasStore()
const almacenesStore = useAlmacenesStore()

const isSidebarOpen = ref(false)
const isAlmacenDropdownOpen = ref(false)
const userName = computed(() => authStore.userName)
const userRole = computed(() => authStore.userRole)
const alertasCount = computed(() => alertasStore.totalAlertas)

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

const closeSidebar = () => {
  isSidebarOpen.value = false
}

const toggleAlmacenDropdown = () => {
  isAlmacenDropdownOpen.value = !isAlmacenDropdownOpen.value
}

const seleccionarAlmacen = (almacenId: string) => {
  almacenesStore.seleccionarAlmacenActivo(almacenId)
  isAlmacenDropdownOpen.value = false
}

const logout = () => {
  authStore.logout()
  router.push({ name: 'login' })
}

// Cerrar dropdown al hacer clic fuera
const handleClickOutside = (event: Event) => {
  const target = event.target as Element
  if (!target.closest('.relative')) {
    isAlmacenDropdownOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style>
.animate__animated {
  --animate-duration: 500ms;
}

.animate__slideInLeft,
.animate__slideOutLeft {
  --animate-duration: 500ms;
}

/* Transiciones personalizadas para el sidebar */
.sidebar-enter-active,
.sidebar-leave-active {
  transition: transform 0.3s ease-in-out;
}

.sidebar-enter-from {
  transform: translateX(-100%);
}

.sidebar-leave-to {
  transform: translateX(-100%);
}
</style>