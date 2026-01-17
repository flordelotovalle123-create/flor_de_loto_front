interface FechaSelectorProps {
  tipo: 'diario' | 'semanal' | 'mensual';
  fecha: Date;
  onFechaChange: (fecha: Date) => void;
  onTipoChange: (tipo: 'diario' | 'semanal' | 'mensual') => void;
}

export default function FechaSelector({ tipo, fecha, onFechaChange, onTipoChange }: FechaSelectorProps) {
  
  const getSemana = (date: Date) => {
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay());
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    return { start, end };
  };

  const getMes = (date: Date) => {
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    return { start, end };
  };

  const formatFecha = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const renderInfoFecha = () => {
    switch (tipo) {
      case 'diario':
        return <span>{formatFecha(fecha)}</span>;
      case 'semanal':
        const semana = getSemana(fecha);
        return <span>{formatFecha(semana.start)} - {formatFecha(semana.end)}</span>;
      case 'mensual':
        const mes = getMes(fecha);
        const mesNombre = fecha.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
        return <span>{mesNombre} ({formatFecha(mes.start)} - {formatFecha(mes.end)})</span>;
      default:
        return null;
    }
  };

  return (
    <div className="fecha-selector">
      <div className="fecha-selector__controls">
        <div className="fecha-selector__tipo">
          <button
            className={`fecha-selector__btn ${tipo === 'diario' ? 'active' : ''}`}
            onClick={() => onTipoChange('diario')}
          >
            Diario
          </button>
          <button
            className={`fecha-selector__btn ${tipo === 'semanal' ? 'active' : ''}`}
            onClick={() => onTipoChange('semanal')}
          >
            Semanal
          </button>
          <button
            className={`fecha-selector__btn ${tipo === 'mensual' ? 'active' : ''}`}
            onClick={() => onTipoChange('mensual')}
          >
            Mensual
          </button>
        </div>

        <div className="fecha-selector__navegacion">
          <button
            className="fecha-selector__nav-btn"
            onClick={() => {
              const nuevaFecha = new Date(fecha);
              if (tipo === 'diario') {
                nuevaFecha.setDate(nuevaFecha.getDate() - 1);
              } else if (tipo === 'semanal') {
                nuevaFecha.setDate(nuevaFecha.getDate() - 7);
              } else {
                nuevaFecha.setMonth(nuevaFecha.getMonth() - 1);
              }
              onFechaChange(nuevaFecha);
            }}
          >
            ‹ Anterior
          </button>

          <div className="fecha-selector__info">
            {renderInfoFecha()}
          </div>

          <button
            className="fecha-selector__nav-btn"
            onClick={() => {
              const nuevaFecha = new Date(fecha);
              if (tipo === 'diario') {
                nuevaFecha.setDate(nuevaFecha.getDate() + 1);
              } else if (tipo === 'semanal') {
                nuevaFecha.setDate(nuevaFecha.getDate() + 7);
              } else {
                nuevaFecha.setMonth(nuevaFecha.getMonth() + 1);
              }
              onFechaChange(nuevaFecha);
            }}
          >
            Siguiente ›
          </button>
        </div>

        <div className="fecha-selector__hoy">
          <button
            className="fecha-selector__btn-hoy"
            onClick={() => onFechaChange(new Date())}
          >
            Hoy
          </button>
        </div>
      </div>
    </div>
  );
}