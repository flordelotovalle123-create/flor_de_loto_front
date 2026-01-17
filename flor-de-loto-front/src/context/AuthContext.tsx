import { createContext, useContext, useEffect, useState } from 'react'
import { loginRequest } from '../services/auth.service'
import type { Usuario } from './../types/users'

interface AuthContextType {
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  token: string | null
  usuario: Usuario | null
  cargando: boolean
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null)
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [cargando, setCargando] = useState(true)

  // 🔁 rehidratar sesion
  useEffect(() => {
    const tokenStorage = localStorage.getItem('token')
    const usuarioStorage = localStorage.getItem('usuario')

    if (tokenStorage && usuarioStorage) {
      setToken(tokenStorage)
      setUsuario(JSON.parse(usuarioStorage))
    }

    setCargando(false)
  }, [])

  const login = async (email: string, password: string) => {
    const data = await loginRequest(email, password)

    setToken(data.token)
    setUsuario(data.usuario as unknown as Usuario)

    localStorage.setItem('token', data.token)
    localStorage.setItem('usuario', JSON.stringify(data.usuario))
  }

  const logout = () => {
    localStorage.clear()
    setToken(null)
    setUsuario(null)
  }

  return (
    <AuthContext.Provider value={{ login, logout, token, usuario, cargando }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
