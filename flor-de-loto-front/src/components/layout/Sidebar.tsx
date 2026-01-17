// src/components/Sidebar.tsx
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import '../../styles/components/Sidebar.scss'

export default function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { usuario, logout } = useAuth()

  const isActive = (path: string) => {
    return location.pathname === path ? 'active' : ''
  }

  const esAdmin = usuario?.rol === 'admin'
  const esMesero = usuario?.rol === 'mesero' // Cambié 'mesero' a 'camarero' para coincidir con tu sistema

  return (
    <aside className="sidebar">
      <img
        src= "/logo/Flor_de_loto.jpg"
        alt="Flor de Loto"
        className="sidebar__logo"
        onClick={() => navigate('/mesas')}
      />

      <div className="sidebar__welcome">
        <h2 className="sidebar__welcome-title">¡Bienvenid@!</h2>
        {usuario && (
          <p className="sidebar__welcome-user">
            {usuario.nombre}
          </p>
        )}
      </div>

      <nav className="sidebar__nav">
        {/* Dashboard: todos */}
        <button
          className={`sidebar__nav-item ${isActive('/mesas')}`}
          onClick={() => navigate('/mesas')}
          aria-label="Dashboard"
        >
          <span className="sidebar__nav-icon" role="img" aria-label="hogar">🏠</span>
          <span className="sidebar__nav-text">Dashboard</span>
        </button>

        {/* Facturas: admin y mesero */}
        {(esAdmin || esMesero) && (
          <button
            className={`sidebar__nav-item ${isActive('/facturas')}`}
            onClick={() => navigate('/facturas')}
            aria-label="Facturas"
          >
            <span className="sidebar__nav-icon" role="img" aria-label="facturas">🧾</span>
            <span className="sidebar__nav-text">Facturas</span>
          </button>
        )}

        {/* Reportes: solo admin */}
        {esAdmin && (
          <button
            className={`sidebar__nav-item ${isActive('/reportes')}`}
            onClick={() => navigate('/reportes')}
            aria-label="Reportes"
          >
            <span className="sidebar__nav-icon" role="img" aria-label="gráficos">📊</span>
            <span className="sidebar__nav-text">Reportes</span>
          </button>
        )}

        {/* Usuarios: solo admin */}
        {esAdmin && (
          <button
            className={`sidebar__nav-item ${isActive('/usuarios')}`}
            onClick={() => navigate('/usuarios')}
            aria-label="Usuarios"
          >
            <span className="sidebar__nav-icon" role="img" aria-label="usuarios">👥</span>
            <span className="sidebar__nav-text">Usuarios</span>
          </button>
        )}
      </nav>

      <button 
        className="sidebar__logout"
        onClick={logout}
        aria-label="Cerrar sesión"
      >
        <span className="sidebar__logout-icon" role="img" aria-label="salir">🚪</span>
        <span className="sidebar__logout-text">Cerrar sesión</span>
      </button>
    </aside>
  )
}
