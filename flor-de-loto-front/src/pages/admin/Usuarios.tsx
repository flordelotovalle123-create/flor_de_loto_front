// pages/admin/Usuarios.tsx
import { useEffect, useState } from 'react'
import {
  listarUsuarios,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
  type Usuario
} from '../../services/usuarios.service'
import './../../styles/pages/Usuarios.scss'

type PanelAccion = 'crear' | 'editar' | 'eliminar' | null

// Colores fijos para usar en JSX (deben coincidir con los de SCSS)
const COLORES = {
  lila: '#9c27b0',
  rosa: '#f06292',
  lilaClaro: '#e1bee7'
}

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<Usuario | null>(null)
  const [panel, setPanel] = useState<PanelAccion>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: 'camarero' as 'admin' | 'camarero'
  })

  const cargarUsuarios = async () => {
    try {
      setCargando(true)
      setError(null)
      
      const data = await listarUsuarios()
      
      if (data && Array.isArray(data)) {
        setUsuarios(data)
        if (data.length > 0 && !usuarioSeleccionado) {
          setUsuarioSeleccionado(data[0])
          setForm({
            nombre: data[0].nombre,
            email: data[0].email,
            password: '',
            rol: data[0].rol
          })
        }
      } else {
        setUsuarios([])
        setError('Formato de datos inválido recibido del servidor')
      }
    } catch (error) {
      setError('Error al cargar usuarios. Verifica la conexión.')
      setUsuarios([])
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarUsuarios()
  }, [])

  const seleccionarUsuario = (u: Usuario) => {
    setUsuarioSeleccionado(u)
    setForm({
      nombre: u.nombre,
      email: u.email,
      password: '',
      rol: u.rol
    })
  }

  const handleCrear = async () => {
    try {
      await crearUsuario(form)
      setPanel(null)
      setForm({ nombre: '', email: '', password: '', rol: 'camarero' })
      await cargarUsuarios()
    } catch (error) {
      console.error('Error creando usuario:', error)
    }
  }

  const handleActualizar = async () => {
    if (!usuarioSeleccionado) return

    try {
      await actualizarUsuario(usuarioSeleccionado.id, {
        nombre: form.nombre,
        email: form.email,
        password: form.password || undefined,
        rol: form.rol
      })

      setPanel(null)
      await cargarUsuarios()
    } catch (error) {
      console.error('Error actualizando usuario:', error)
    }
  }

  const handleEliminar = async () => {
    if (!usuarioSeleccionado) return
    
    try {
      await eliminarUsuario(usuarioSeleccionado.id)
      setPanel(null)
      setUsuarioSeleccionado(null)
      setForm({ nombre: '', email: '', password: '', rol: 'camarero' })
      await cargarUsuarios()
    } catch (error) {
      console.error('Error eliminando usuario:', error)
    }
  }

  return (
    <div className="usuarios-page">
      <div className="usuarios-header">
        <div className="header-titulo">
          <h1>Gestión de Usuarios</h1>
          <p className="subtitulo">Administra los usuarios del sistema Flor de Loto</p>
        </div>
        <button 
          className="btn-nuevo-usuario"
          onClick={() => setPanel('crear')}
        >
          <span className="icono-mas">+</span>
          Nuevo Usuario
        </button>
      </div>

      {error && (
        <div className="error-mensaje">
          <div className="error-contenido">
            <span className="error-icono">⚠️</span>
            <div>
              <strong>Error:</strong> {error}
            </div>
          </div>
          <button onClick={cargarUsuarios}>Reintentar</button>
        </div>
      )}

      {cargando && (
        <div className="cargando">
          <div className="spinner"></div>
          <p>Cargando usuarios...</p>
        </div>
      )}

      {!cargando && !error && usuarios.length === 0 && (
        <div className="sin-usuarios">
          <div className="sin-usuarios-icono">👤</div>
          <h3>No hay usuarios registrados</h3>
          <p>Comienza creando el primer usuario del sistema.</p>
          <button onClick={() => setPanel('crear')} className="btn-crear-primero">
            Crear primer usuario
          </button>
        </div>
      )}

      {!cargando && !error && usuarios.length > 0 && (
        <div className="usuarios-contenedor">
          <div className="usuarios-tabla-contenedor">
            <div className="tabla-header">
              <div>
                <h2>Lista de Usuarios</h2>
                <p className="tabla-subtitulo">Selecciona un usuario para ver detalles</p>
              </div>
              <span className="contador-usuarios">{usuarios.length} usuarios</span>
            </div>
            
            <div className="tabla-wrapper">
              <table className="tabla-usuarios">
                <thead>
                  <tr>
                    <th>Usuario</th>
                    <th>Email</th>
                    <th>Rol</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map(u => (
                    <tr
                      key={u.id}
                      className={usuarioSeleccionado?.id === u.id ? 'fila-activa' : ''}
                      onClick={() => seleccionarUsuario(u)}
                    >
                      <td data-label="Usuario">
                        <div className="usuario-info">
                          <div className="avatar" style={{ 
                            backgroundColor: usuarioSeleccionado?.id === u.id ? COLORES.lila : COLORES.lilaClaro
                          }}>
                            {u.nombre.charAt(0)}
                          </div>
                          <div className="usuario-datos">
                            <strong>{u.nombre}</strong>
                            <span className="fecha-creacion">
                              Creado: {new Date(u.created_at).toLocaleDateString('es-ES')}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td data-label="Email">{u.email}</td>
                      <td data-label="Rol">
                        <span className={`badge rol-${u.rol}`}>
                          {u.rol === 'admin' ? 'Administrador' : 'Camarero'}
                        </span>
                      </td>
                      <td data-label="Estado">
                        <span className={`estado ${u.activo ? 'activo' : 'inactivo'}`}>
                          {u.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="panel-detalles">
            <div className="detalles-header">
              <h2>Detalles del Usuario</h2>
              {usuarioSeleccionado && (
                <span className="detalles-subtitulo">
                  Información completa del usuario seleccionado
                </span>
              )}
            </div>
            
            {usuarioSeleccionado ? (
              <div className="detalles-contenido">
                <div className="usuario-card">
                  <div className="usuario-encabezado">
                    <div className="avatar-grande" style={{ 
                      background: `linear-gradient(135deg, ${COLORES.rosa}, ${COLORES.lila})` 
                    }}>
                      {usuarioSeleccionado.nombre.charAt(0)}
                    </div>
                    <div className="usuario-titulo">
                      <h3>{usuarioSeleccionado.nombre}</h3>
                      <div className="usuario-metadata">
                        <span className={`badge rol-${usuarioSeleccionado.rol}`}>
                          {usuarioSeleccionado.rol === 'admin' ? 'Administrador' : 'Camarero'}
                        </span>
                        <span className="fecha-detalle">
                          Creado el {new Date(usuarioSeleccionado.created_at).toLocaleDateString('es-ES')}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="usuario-info-grid">
                    <div className="info-item">
                      <div className="info-icono">📧</div>
                      <div>
                        <label>Email</label>
                        <p>{usuarioSeleccionado.email}</p>
                      </div>
                    </div>
                    <div className="info-item">
                      <div className="info-icono">🔒</div>
                      <div>
                        <label>Estado</label>
                        <p>
                          <span className={`estado-detalle ${usuarioSeleccionado.activo ? 'activo' : 'inactivo'}`}>
                            {usuarioSeleccionado.activo ? 'Activo' : 'Inactivo'}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="info-item">
                      <div className="info-icono">📅</div>
                      <div>
                        <label>Última actualización</label>
                        <p>{new Date(usuarioSeleccionado.created_at).toLocaleString('es-ES')}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="acciones-usuario">
                    <button 
                      className="btn-accion btn-editar"
                      onClick={() => setPanel('editar')}
                    >
                      <span className="accion-icono">✏️</span>
                      <span className="accion-texto">Editar Usuario</span>
                    </button>
                    <button 
                      className="btn-accion btn-eliminar"
                      onClick={() => setPanel('eliminar')}
                    >
                      <span className="accion-icono">🗑️</span>
                      <span className="accion-texto">Eliminar</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="sin-seleccion">
                <div className="icono-seleccion">👈</div>
                <h3>Selecciona un usuario</h3>
                <p>Haz clic en un usuario de la lista para ver sus detalles</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Panel flotante para CRUD */}
      {panel && (
        <div className="panel-flotante">
          <div className="panel-overlay" onClick={() => setPanel(null)}></div>
          <div className="panel-contenido">
            <div className="panel-header">
              <h2>
                {panel === 'crear' && 'Crear Nuevo Usuario'}
                {panel === 'editar' && 'Editar Usuario'}
                {panel === 'eliminar' && 'Eliminar Usuario'}
              </h2>
              <button className="btn-cerrar" onClick={() => setPanel(null)}>✕</button>
            </div>

            {panel !== 'eliminar' ? (
              <div className="panel-form">
                <div className="form-group">
                  <label>Nombre completo</label>
                  <input
                    type="text"
                    placeholder="Ej: Juan Pérez"
                    value={form.nombre}
                    onChange={e => setForm({ ...form, nombre: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    placeholder="Ej: usuario@ejemplo.com"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>
                    Contraseña {panel === 'editar' && '(dejar vacío para no cambiar)'}
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Rol</label>
                  <select
                    value={form.rol}
                    onChange={e => setForm({ ...form, rol: e.target.value as 'admin' | 'camarero' })}
                  >
                    <option value="camarero">Camarero</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
              </div>
            ) : (
              <div className="panel-eliminar">
                <div className="icono-eliminar">⚠️</div>
                <h3>¿Eliminar usuario?</h3>
                <p>
                  Estás a punto de eliminar al usuario <strong>{usuarioSeleccionado?.nombre}</strong>.
                </p>
                <p className="advertencia">
                  Esta acción marcará al usuario como inactivo y no podrá acceder al sistema.
                </p>
              </div>
            )}

            <div className="panel-acciones">
              <button className="btn-cancelar" onClick={() => setPanel(null)}>
                Cancelar
              </button>
              {panel === 'crear' && (
                <button className="btn-confirmar" onClick={handleCrear}>
                  Crear Usuario
                </button>
              )}
              {panel === 'editar' && (
                <button className="btn-confirmar" onClick={handleActualizar}>
                  Guardar Cambios
                </button>
              )}
              {panel === 'eliminar' && (
                <button className="btn-eliminar-confirmar" onClick={handleEliminar}>
                  Confirmar Eliminación
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}