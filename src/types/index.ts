export interface Articulo {
  id: string
  nombre: string
  codigoEAN: string
  precioCompra: number
  precioVenta: number
  stockMinimo: number
  stock: number
  proveedorId: string
  categoriaId?: string
  almacenId: string
  atributos: Array<{
    nombre: string
    valor: string
  }>
  createdAt: string
  updatedAt: string
} 