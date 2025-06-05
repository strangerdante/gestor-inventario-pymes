/**
 * Formatea un número como moneda en formato Pesos Colombianos (COP)
 * Ejemplo: 3500 => "$ 3.500,00"
 */
export function formatCurrency(value: number): string {
  const formatter = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  })
  
  return formatter.format(value)
}

/**
 * Formatea una fecha ISO a formato legible en español
 */
export function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Convierte una cadena a formato de título (primera letra de cada palabra en mayúscula)
 */
export function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}