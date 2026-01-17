import '../../styles/components/MesaPanel.scss'

interface MesaPanelProps {
  numero: number
  ocupada: boolean
  activa: boolean
  onClick: () => void
}

export default function MesaPanel({
  numero,
  ocupada,
  activa,
  onClick
}: MesaPanelProps) {
  const numeroFormateado = numero.toString().padStart(2, '0')

  return (
    <div
      className={`mesa-panel ${ocupada ? 'ocupada' : 'libre'} ${activa ? 'activa' : ''}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`Mesa ${numero} - ${ocupada ? 'Ocupada' : 'Disponible'}`}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
    >
      <div className="mesa-contenedor">
        {/* Representación visual de sillas */}
        <div className="sillas-container">
          <div className="silla silla-top"></div>
          <div className="silla silla-left"></div>
          <div className="silla silla-right"></div>
          <div className="silla silla-bottom"></div>
        </div>

        {/* Mesa circular central */}
        <div className="mesa-circular">
          <div className="mesa-top">
            <div className="mesa-numero">#{numeroFormateado}</div>
            {ocupada && (
              <div className="mesa-indicador-ocupada" aria-hidden="true">
                <div className="indicador-pulso"></div>
              </div>
            )}
          </div>
        </div>

        {/* Información de estado */}
        <div className="mesa-info">
          <div className="mesa-estado">
            <span className={`estado-badge ${ocupada ? 'ocupada' : 'libre'}`}>
              {ocupada ? 'OCUPADA' : 'DISPONIBLE'}
            </span>
          </div>
          <div className="mesa-accion">
            <span className="accion-texto">
              {activa ? 'Ver detalles' : 'Seleccionar'}
            </span>
            <span className="accion-icono">{activa ? '→' : '+'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}