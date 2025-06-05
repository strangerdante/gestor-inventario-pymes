import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '../stores/auth'

// Layouts
import MainLayout from '../layouts/MainLayout.vue'
import AuthLayout from '../layouts/AuthLayout.vue'

// Auth Views
import Login from '../views/Auth/Login.vue'

// Main Views
import Dashboard from '../views/Dashboard.vue'
import ArticulosIndex from '../views/Articulos/ArticulosIndex.vue'
import ArticulosCreate from '../views/Articulos/ArticulosCreate.vue'
import ArticulosEdit from '../views/Articulos/ArticulosEdit.vue'
import AlmacenesIndex from '../views/Almacenes/AlmacenesIndex.vue'
import ProveedoresIndex from '../views/Proveedores/ProveedoresIndex.vue'
import DocumentosIndex from '../views/Documentos/DocumentosIndex.vue'
import DocumentosCreate from '../views/Documentos/DocumentosCreate.vue'
import DocumentosView from '../views/Documentos/DocumentosView.vue'
import PerfilUsuario from '../views/PerfilUsuario.vue'
import ReportesIndex from '../views/Reportes/ReportesIndex.vue'
import ReporteVentas from '../views/Reportes/ReporteVentas.vue'
import ReporteInventario from '../views/Reportes/ReporteInventario.vue'
import ReporteMovimientos from '../views/Reportes/ReporteMovimientos.vue'
import CategoriasIndex from '../views/Categorias/CategoriasIndex.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: MainLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'dashboard',
        component: Dashboard
      },
      {
        path: 'articulos',
        children: [
          {
            path: '',
            name: 'articulos.index',
            component: ArticulosIndex
          },
          {
            path: 'crear',
            name: 'articulos.create',
            component: ArticulosCreate,
            meta: { requieresEncargadoAlmacen: true }
          },
          {
            path: 'editar/:id',
            name: 'articulos.edit',
            component: ArticulosEdit,
            meta: { requieresEncargadoAlmacen: true }
          }
        ]
      },
      {
        path: 'categorias',
        name: 'categorias.index',
        component: CategoriasIndex,
        meta: { requieresEncargadoAlmacen: true }
      },
      {
        path: 'almacenes',
        name: 'almacenes.index',
        component: AlmacenesIndex
      },
      {
        path: 'proveedores',
        name: 'proveedores.index',
        component: ProveedoresIndex
      },
      {
        path: 'documentos',
        children: [
          {
            path: '',
            name: 'documentos.index',
            component: DocumentosIndex
          },
          {
            path: 'crear',
            name: 'documentos.create',
            component: DocumentosCreate,
            meta: { requieresEncargadoAlmacen: true }
          },
          {
            path: ':id',
            name: 'documentos.view',
            component: DocumentosView
          }
        ]
      },
      {
        path: 'reportes',
        children: [
          {
            path: '',
            name: 'reportes.index',
            component: ReportesIndex
          },
          {
            path: 'ventas',
            name: 'reportes.ventas',
            component: ReporteVentas
          },
          {
            path: 'inventario',
            name: 'reportes.inventario',
            component: ReporteInventario
          },
          {
            path: 'movimientos',
            name: 'reportes.movimientos',
            component: ReporteMovimientos
          }
        ]
      },
      {
        path: 'perfil',
        name: 'perfil',
        component: PerfilUsuario
      }
    ]
  },
  {
    path: '/auth',
    component: AuthLayout,
    meta: { isGuest: true },
    children: [
      {
        path: 'login',
        name: 'login',
        component: Login
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()
  
  // Comprobar si la ruta requiere autenticación
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login' })
    return
  }
  
  // Comprobar si la ruta es solo para invitados
  if (to.meta.isGuest && authStore.isAuthenticated) {
    next({ name: 'dashboard' })
    return
  }
  
  // Comprobar permisos de encargado de almacén
  if (to.meta.requieresEncargadoAlmacen && authStore.userRole !== 'Encargado Almacén') {
    next({ name: 'dashboard' })
    return
  }
  
  next()
})

export default router