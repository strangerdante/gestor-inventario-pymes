/**
 * Genera un ID único para usar en entidades
 */
export function generarId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2)
}

/**
 * Retorna la clase CSS para un tipo de documento
 */
export function getClaseDocumento(tipo: string): string {
  switch (tipo) {
    case 'INVENTARIO':
      return 'bg-blue-100 text-blue-800'
    case 'PEDIDO':
      return 'bg-purple-100 text-purple-800'
    case 'RECEPCION':
      return 'bg-green-100 text-green-800'
    case 'MERMA':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

/**
 * Retorna la clase CSS para un estado de documento
 */
export function getClaseEstado(estado: string): string {
  switch (estado) {
    case 'BORRADOR':
      return 'bg-yellow-100 text-yellow-800'
    case 'CERRADO':
      return 'bg-green-100 text-green-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

/**
 * Guarda datos en un archivo CSV y lo descarga
 */
export function exportarCSV(datos: any[], nombreArchivo: string): void {
  if (!datos.length) return
  
  // Obtener encabezados de las propiedades
  const headers = Object.keys(datos[0])
  
  // Crear contenido CSV
  const csv = [
    headers.join(','), // Encabezados
    ...datos.map(row => 
      headers.map(header => {
        // Manejar valores con comas o comillas
        let value = row[header]
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          value = `"${value.replace(/"/g, '""')}"`
        }
        return value
      }).join(',')
    )
  ].join('\n')
  
  // Crear Blob y descargar
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  
  link.setAttribute('href', url)
  link.setAttribute('download', `${nombreArchivo}.csv`)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}