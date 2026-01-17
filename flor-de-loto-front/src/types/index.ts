export interface Producto {
  id: string
  nombre: string
  precio: number
  categoria?: string // opcional para compatibilidad
}
export interface ConsumoItem {
  id: string
  producto: {
    id: string
    nombre: string
    precio: number
  }
  cantidad: number
  subtotal: number
  comentario?: string
}
