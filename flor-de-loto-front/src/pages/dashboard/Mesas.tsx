import { useEffect, useState } from 'react'
import MesaCard from '../../components/mesa/MesaPanel'
import MesaPanelDetalle from '../../components/mesa/MesaPanelDetalle'
import { getMesas, crearMesa, type Mesa } from '../../services/mesas.service'
import '../../styles/pages/Mesas.scss'

export default function Mesas() {
  const [mesas, setMesas] = useState<Mesa[]>([])
  const [mesaActiva, setMesaActiva] = useState<Mesa | null>(null)
  const [loading, setLoading] = useState(true)
  const [creando, setCreando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const cargarMesas = async () => {
    try {
      setError(null)
      const data = await getMesas()
      setMesas(data)
    } catch (error) {
      console.error('Error al cargar mesas:', error)
      setError('Error al cargar mesas. Verifica la conexión.')
    }
  }

  useEffect(() => {
    cargarMesas().finally(() => setLoading(false))
  }, [])

  const handleAgregarMesa = async () => {
    if (creando) return
    setCreando(true)
    setError(null)

    try {
      const numeros = mesas.map(m => m.numero)
      const nuevoNumero = Math.max(0, ...numeros) + 1

      const mesa = await crearMesa({
        numero: nuevoNumero,
        estado: 'ocupada',
        es_temporal: true
      })

      await cargarMesas()
      setMesaActiva(mesa)
    } catch (error) {
      console.error('Error al crear mesa:', error)
      setError('Error al crear mesa temporal')
    } finally {
      setCreando(false)
    }
  }

  const handleRecargar = () => {
    setLoading(true)
    cargarMesas().finally(() => setLoading(false))
  }

  return (
    <div className="mesas-page">
      <div className="mesas-header">
        <div className="header-titulo">
          <h1>Gestor de Mesas</h1>
          <p className="subtitulo">Administra las mesas del restaurante Flor de Loto</p>
        </div>
        <div className="header-estadisticas">
          <div className="estadistica">
            <span className="estadistica-valor">{mesas.length}</span>
            <span className="estadistica-label">Mesas totales</span>
          </div>
          <div className="estadistica">
            <span className="estadistica-valor">
              {mesas.filter(m => m.estado === 'ocupada').length}
            </span>
            <span className="estadistica-label">Ocupadas</span>
          </div>
          <div className="estadistica">
            <span className="estadistica-valor">
              {mesas.filter(m => m.estado === 'libre').length}
            </span>
            <span className="estadistica-label">Disponibles</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="error-mensaje">
          <div className="error-contenido">
            <span className="error-icono">⚠️</span>
            <div>
              <strong>Error:</strong> {error}
            </div>
          </div>
          <button onClick={handleRecargar}>Reintentar</button>
        </div>
      )}

      {loading && (
        <div className="cargando-mesas">
          <div className="spinner"></div>
          <p>Cargando mesas...</p>
        </div>
      )}

      {!loading && !error && (
        <div className="mesas-contenedor">
          <div className="mesas-grid">
            {mesas.map(m => (
              <MesaCard
                key={m.id}
                numero={m.numero}
                ocupada={m.estado === 'ocupada'}
                activa={mesaActiva?.id === m.id}
                onClick={() => setMesaActiva(m)}
              />
            ))}

            <button
              className={`agregar-mesa-card ${creando ? 'creando' : ''}`}
              onClick={handleAgregarMesa}
              disabled={creando}
              aria-label="Agregar nueva mesa"
            >
              <div className="agregar-contenido">
                <div className="agregar-icono">+</div>
                <span className="agregar-texto">
                  {creando ? 'Creando...' : 'Nueva Mesa'}
                </span>
              </div>
              <div className="agregar-tooltip">
                Crea una nueva mesa temporal
              </div>
            </button>
          </div>

          {mesas.length === 0 && !loading && (
            <div className="sin-mesas">
              <div className="sin-mesas-icono">🪑</div>
              <h3>No hay mesas registradas</h3>
              <p>Crea la primera mesa para comenzar</p>
              <button 
                onClick={handleAgregarMesa} 
                className="btn-crear-primera"
                disabled={creando}
              >
                Crear primera mesa
              </button>
            </div>
          )}
        </div>
      )}

      {mesaActiva && (
        <MesaPanelDetalle
          mesa={mesaActiva}
          onClose={() => setMesaActiva(null)}
          onActualizarMesa={mesaActualizada => {
            setMesas(prev =>
              prev.map(m =>
                m.id === mesaActualizada.id ? mesaActualizada : m
              )
            )
            setMesaActiva(mesaActualizada)
          }}
          onPagado={async () => {
            setMesaActiva(null)
            await cargarMesas()
          }}
        />
      )}
    </div>
  )
}