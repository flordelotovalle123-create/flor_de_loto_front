import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from '../pages/auth/Login'
import Mesas from '../pages/dashboard/Mesas'
import Usuarios from '../pages/admin/Usuarios'
import Reportes from '../pages/admin/Reportes'
import Facturas from '../pages/admin/Facturas'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/layout/Layout' // ← USA EL LAYOUT ORIGINAL
import type { JSX } from 'react'

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const { usuario, cargando } = useAuth()
  if (cargando) return null
  if (!usuario) return <Navigate to="/" />

  return children
}


const AdminRoute = ({ children }: { children: JSX.Element }) => {
  const { usuario } = useAuth()
  if (usuario?.rol !== 'admin') return <Navigate to="/mesas" />
  return children
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        
        {/* TODAS las rutas usan el MISMO Layout */}
        <Route
          path="/mesas"
          element={
            <PrivateRoute>
              <Layout>
                <Mesas /> {/* ← Mesas ya tiene su propio Layout */}
              </Layout>
            </PrivateRoute>
          }
        />
        
        <Route
          path="/usuarios"
          element={
            <AdminRoute>
              <Layout>
                <Usuarios />
              </Layout>
            </AdminRoute>
          }
        />
        
        <Route
          path="/facturas"
          element={
            <AdminRoute>
              <Layout>
                <Facturas />
              </Layout>
            </AdminRoute>
          }
        />
        
        <Route
          path="/reportes"
          element={
            <AdminRoute>
              <Layout>
                <Reportes />
              </Layout>
            </AdminRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}