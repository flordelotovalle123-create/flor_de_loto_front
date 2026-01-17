// pages/admin/Facturas.tsx
import { useEffect, useState } from 'react'
import { getFacturasPorFecha } from '../../services/facturas.service'
import { generarTicketPDF } from '../../services/ticket-pdf.service'
import '../../styles/pages/Facturas.scss'

// Usa la interfaz del servicio para consistencia
import type { Factura } from '../../services/facturas.service'

export default function Facturas() {
  const [facturas, setFacturas] = useState<Factura[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [descargandoId, setDescargandoId] = useState<string | null>(null)

  useEffect(() => {
    const cargarFacturasDelDia = async () => {
      try {
        setCargando(true)
        setError(null)

        const inicio = new Date()
        inicio.setHours(0, 0, 0, 0)

        const fin = new Date()
        fin.setHours(23, 59, 59, 999)

        console.log('📅 Fechas de búsqueda:', {
          inicio: inicio.toISOString(),
          fin: fin.toISOString()
        })

        const facturasData = await getFacturasPorFecha(
          inicio.toISOString(),
          fin.toISOString()
        )

        console.log('📊 Facturas recibidas (en componente):', facturasData)
        
        if (Array.isArray(facturasData)) {
          console.log(`✅ Se cargaron ${facturasData.length} facturas`)
          setFacturas(facturasData)
        } else {
          console.error('❌ Datos no son un array:', facturasData)
          setFacturas([])
          setError('Formato de datos inválido recibido del servidor')
        }
      } catch (error) {
        console.error('❌ Error cargando facturas:', error)
        setError('Error al cargar facturas. Verifica la conexión.')
        setFacturas([])
      } finally {
        setCargando(false)
      }
    }

    cargarFacturasDelDia()
  }, [])

  const handleDescargarPDF = async (factura: Factura) => {
    try {
      setDescargandoId(factura.id)
      await generarTicketPDF(factura)
    } catch (error) {
      console.error('Error generando ticket PDF:', error)
      alert('Error al generar el ticket. Intenta de nuevo.')
    } finally {
      setDescargandoId(null)
    }
  }

  return (
    <div className="facturas-page">
      <h1>Detalle de Facturas</h1>

      {error && (
        <div className="error-mensaje">
          <strong>Error:</strong> {error}
        </div>
      )}

      {cargando ? (
        <div className="cargando">
          <div className="spinner"></div>
          <p>Cargando facturas...</p>
        </div>
      ) : facturas.length === 0 ? (
        <div className="sin-facturas">
          <p>📭 No hay facturas registradas hoy</p>
        </div>
      ) : (
        <div className="tabla-wrapper">
          <table className="tabla-facturas">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Mesa</th>
                <th>Usuario</th>
                <th>Factura</th>
                <th>Total</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {facturas.map(f => {
                const fecha = new Date(f.created_at)
                const estaDescargando = descargandoId === f.id

                return (
                  <tr key={f.id}>
                    <td data-label="Fecha">
                      {fecha.toLocaleDateString('es-ES')}
                    </td>
                    <td data-label="Hora">
                      {fecha.toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td data-label="Mesa">
                      {f.mesas?.numero ?? '-'}
                    </td>
                    <td data-label="Usuario">
                      {f.usuarios?.nombre ?? '-'}
                    </td>
                    <td data-label="Factura">
                      #{f.numero_factura}
                    </td>
                    <td data-label="Total" className="total">
                      ${f.total.toLocaleString('es-ES', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </td>
                    <td data-label="Acciones">
                      <button
                        className={`btn-pdf ${estaDescargando ? 'descargando' : ''}`}
                        onClick={() => handleDescargarPDF(f)}
                        disabled={estaDescargando}
                      >
                        {estaDescargando ? (
                          <span className="spinner-btn"></span>
                        ) : (
                          '📄 PDF'
                        )}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          
          <div className="resumen">
            <p>
              <strong>Total facturas hoy:</strong> {facturas.length}
            </p>
            <p>
              <strong>Ingreso total:</strong> $
              {facturas
                .reduce((sum, f) => sum + f.total, 0)
                .toLocaleString('es-ES', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}