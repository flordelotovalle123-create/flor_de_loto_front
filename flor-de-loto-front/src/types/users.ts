export type RolUsuario = 'admin' | 'mesero' | 'cocina'

export interface Usuario {
  id: number
  nombre: string
  email: string
  rol: RolUsuario
  telefono?: string
  fecha_creacion: string
  activo: boolean
}
