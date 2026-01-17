// src/components/Header.tsx
import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import '../../styles/components/_header.scss'

interface HeaderProps {
  onMenuClick?: () => void
  sidebarOpen?: boolean
}

export default function Header({ onMenuClick, sidebarOpen }: HeaderProps) {
  const { usuario } = useAuth()
  const [time, setTime] = useState(new Date())

  // Actualizar la hora cada minuto
  setInterval(() => setTime(new Date()), 60000)

  return (
    <header className="header">
      {/* Menú hamburguesa para móvil */}
      <button 
        className="header__menu-toggle" 
        onClick={onMenuClick}
        aria-label={sidebarOpen ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={sidebarOpen}
      >
        <span className={`header__menu-icon ${sidebarOpen ? 'open' : ''}`}>
          <span></span>
          <span></span>
          <span></span>
        </span>
      </button>

      <div className="header__content">
        <div className="header__info">
          <h1 className="header__title">Flor de Loto</h1>
          <div className="header__details">
            {usuario && (
              <span className="header__user">
                <span className="header__user-icon" role="img" aria-label="usuario">👤</span>
                {usuario.nombre} • {usuario.rol === 'admin' ? 'Administrador' : 'Camarero'}
              </span>
            )}
            <span className="header__time">
              <span className="header__time-icon" role="img" aria-label="reloj">🕒</span>
              {time.toLocaleTimeString('es-ES', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: false 
              })}
            </span>
          </div>
        </div>

        <div className="header__actions">
          <div className="header__status">
            <div className="header__status-indicator active" aria-label="Sistema activo"></div>
            <span>Sistema activo</span>
          </div>
        </div>
      </div>
    </header>
  )
}