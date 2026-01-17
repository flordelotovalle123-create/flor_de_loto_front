// services/usuarios.service.ts
import api from './api'

export interface Usuario {
  id: string
  nombre: string
  email: string
  rol: 'admin' | 'camarero'
  activo: boolean
  created_at: string
}

export const listarUsuarios = async (): Promise<Usuario[]> => {
  try {
    const response = await api.get('/usuarios')
    
    if (response.data?.ok && Array.isArray(response.data.data)) {
      return response.data.data
    }
    
    return []
    
  } catch (error: any) {
    console.error('Error al listar usuarios:', error)
    return []
  }
}

export const crearUsuario = async (data: {
  nombre: string
  email: string
  password: string
  rol: 'admin' | 'camarero'
}) => {
  const res = await api.post('/usuarios', data)
  return res.data
}

export const actualizarUsuario = async (
  id: string,
  data: Partial<{
    nombre: string
    email: string
    password: string
    rol: 'admin' | 'camarero'
  }>
) => {
  const res = await api.put(`/usuarios/${id}`, data)
  return res.data
}

export const eliminarUsuario = async (id: string) => {
  const res = await api.delete(`/usuarios/${id}`)
  return res.data
}