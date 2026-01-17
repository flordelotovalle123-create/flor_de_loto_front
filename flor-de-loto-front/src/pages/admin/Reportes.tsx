import { useEffect, useState } from 'react'
import jsPDF from 'jspdf'
import {
  getFacturasPorFecha
} from '../../services/facturas.service'
import { generarTicketPDF } from '../../services/ticket-pdf.service'
import '../../styles/pages/Reportes.scss'

// Usa la interfaz del servicio para consistencia
import type { Factura } from '../../services/facturas.service'

type ModoReporte = 'diario' | 'semanal' | 'mensual'

export default function Reportes() {
  const [modo, setModo] = useState<ModoReporte>('diario')
  const [fechaInicio, setFechaInicio] = useState<string | null>(null)
  const [fechaFin, setFechaFin] = useState<string | null>(null)

  const [facturas, setFacturas] = useState<Factura[]>([])
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totalVentas, setTotalVentas] = useState(0)
  const [descargandoFacturaId, setDescargandoFacturaId] = useState<string | null>(null)

  const calcularFechas = () => {
    const hoy = new Date()

    if (modo === 'diario') {
      const inicio = new Date()
      inicio.setHours(0, 0, 0, 0)

      const fin = new Date()
      fin.setHours(23, 59, 59, 999)

      return {
        inicio: inicio.toISOString(),
        fin: fin.toISOString()
      }
    }

    if (modo === 'mensual') {
      const inicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1)
      const fin = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0, 23, 59, 59)

      return {
        inicio: inicio.toISOString(),
        fin: fin.toISOString()
      }
    }

    if (modo === 'semanal' && fechaInicio && fechaFin) {
      return {
        inicio: new Date(fechaInicio).toISOString(),
        fin: new Date(fechaFin).toISOString()
      }
    }

    return null
  }

  const cargarFacturas = async () => {
    const fechas = calcularFechas()
    if (!fechas) {
      setFacturas([])
      setTotalVentas(0)
      return
    }

    try {
      setCargando(true)
      setError(null)

      const facturasData = await getFacturasPorFecha(fechas.inicio, fechas.fin)
      
      if (Array.isArray(facturasData)) {
        setFacturas(facturasData)
        
        const total = facturasData.reduce(
          (acc: number, f: Factura) => acc + f.total,
          0
        )
        setTotalVentas(total)
      } else {
        console.error('❌ Datos no son un array:', facturasData)
        setFacturas([])
        setTotalVentas(0)
        setError('Formato de datos inválido')
      }
    } catch (error) {
      console.error('❌ Error cargando facturas:', error)
      setError('Error al cargar facturas. Verifica la conexión.')
      setFacturas([])
      setTotalVentas(0)
    } finally {
      setCargando(false)
    }
  }

  /* =========================
     REPORTE GENERAL PDF
     ========================= */
  const descargarReportePDF = () => {
    const doc = new jsPDF()
    let y = 20

    // Encabezado
    doc.setFontSize(20)
    doc.setTextColor(146, 84, 164) // Color lila
    doc.text('Reporte de Ventas', 14, y)
    doc.setFontSize(12)
    doc.setTextColor(128, 128, 128)
    doc.text('Flor de Loto Restaurante', 14, y + 7)
    y += 20

    // Información del período
    doc.setFontSize(12)
    doc.setTextColor(0, 0, 0)
    doc.text(`Período: ${modo.charAt(0).toUpperCase() + modo.slice(1)}`, 14, y)
    y += 6
    
    if (modo === 'semanal' && fechaInicio && fechaFin) {
      doc.text(`Desde: ${new Date(fechaInicio).toLocaleDateString('es-ES')}`, 14, y)
      y += 6
      doc.text(`Hasta: ${new Date(fechaFin).toLocaleDateString('es-ES')}`, 14, y)
      y += 6
    } else {
      doc.text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, 14, y)
      y += 6
    }
    
    // Resumen
    doc.setFontSize(11)
    doc.setTextColor(255, 107, 159) // Color rosa
    doc.text('Resumen del Período', 14, y)
    y += 8
    
    doc.setFontSize(10)
    doc.setTextColor(0, 0, 0)
    doc.text(`Total ventas: $${totalVentas.toLocaleString('es-ES', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`, 14, y)
    y += 6
    doc.text(`Cantidad de facturas: ${facturas.length}`, 14, y)
    y += 6
    doc.text(`Ticket promedio: $${facturas.length > 0 ? 
      (totalVentas / facturas.length).toLocaleString('es-ES', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }) : '0.00'}`, 14, y)
    y += 12

    // Tabla de facturas
    doc.setFontSize(11)
    doc.setTextColor(146, 84, 164)
    doc.text('Detalle de Facturas', 14, y)
    y += 8

    // Encabezados de tabla
    doc.setFontSize(9)
    doc.setTextColor(255, 255, 255)
    doc.setFillColor(146, 84, 164)
    doc.rect(14, y, 182, 8, 'F')
    doc.text('# Factura', 16, y + 5.5)
    doc.text('Fecha', 50, y + 5.5)
    doc.text('Hora', 80, y + 5.5)
    doc.text('Mesa', 100, y + 5.5)
    doc.text('Total', 150, y + 5.5)
    y += 10

    // Filas de facturas
    doc.setTextColor(0, 0, 0)
    facturas.forEach((f, index) => {
      if (y > 270) {
        doc.addPage()
        y = 20
      }

      const fecha = new Date(f.created_at)
      
      // Fondo alternado para filas
      if (index % 2 === 0) {
        doc.setFillColor(245, 245, 245)
        doc.rect(14, y - 2, 182, 8, 'F')
      }

      doc.text(`#${f.numero_factura}`, 16, y + 5.5)
      doc.text(fecha.toLocaleDateString('es-ES'), 50, y + 5.5)
      doc.text(fecha.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      }), 80, y + 5.5)
      doc.text(f.mesas?.numero?.toString() || '-', 100, y + 5.5)
      doc.text(`$${f.total.toLocaleString('es-ES', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`, 150, y + 5.5)
      
      y += 10
    })

    // Pie de página
    doc.setFontSize(8)
    doc.setTextColor(128, 128, 128)
    doc.text(
      `Generado el ${new Date().toLocaleString('es-ES')} | Flor de Loto Sistema`,
      14,
      285
    )

    doc.save(`reporte_${modo}_${new Date().toISOString().slice(0, 10)}.pdf`)
  }

  /* =========================
     TICKET FACTURA PDF (usando el servicio compartido)
     ========================= */
  const descargarFacturaPDF = async (factura: Factura) => {
    try {
      setDescargandoFacturaId(factura.id)
      await generarTicketPDF(factura)
    } catch (error) {
      console.error('Error generando ticket PDF:', error)
      alert('Error al generar el ticket. Intenta de nuevo.')
    } finally {
      setDescargandoFacturaId(null)
    }
  }

  useEffect(() => {
    if (modo === 'semanal') {
      if (!fechaInicio || !fechaFin) {
        setFacturas([])
        setTotalVentas(0)
        return
      }
    }

    cargarFacturas()
  }, [modo, fechaInicio, fechaFin])

  return (
    <div className="reportes-page">
      <div className="reportes-header">
        <h1>Reportes de Ventas</h1>
        <div className="header-subtitulo">
          <p>Análisis detallado de las ventas del sistema</p>
        </div>
      </div>

      {error && (
        <div className="error-mensaje">
          <strong>Error:</strong> {error}
          <button onClick={cargarFacturas}>Reintentar</button>
        </div>
      )}

      <div className="controles-reporte">
        <div className="modos-reporte">
          <button
            className={modo === 'diario' ? 'activo' : ''}
            onClick={() => setModo('diario')}
          >
            Cuadre Diario
          </button>

          <button
            className={modo === 'semanal' ? 'activo' : ''}
            onClick={() => setModo('semanal')}
          >
            Semanal
          </button>

          <button
            className={modo === 'mensual' ? 'activo' : ''}
            onClick={() => setModo('mensual')}
          >
            Mensual
          </button>
        </div>

        {modo === 'semanal' && (
          <div className="rango-fechas">
            <div className="fecha-input">
              <label>Desde:</label>
              <input
                type="date"
                value={fechaInicio ?? ''}
                onChange={e => setFechaInicio(e.target.value)}
              />
            </div>
            <div className="fecha-input">
              <label>Hasta:</label>
              <input
                type="date"
                value={fechaFin ?? ''}
                onChange={e => setFechaFin(e.target.value)}
              />
            </div>
          </div>
        )}
      </div>

      <div className="acciones-reporte">
        <button 
          className="btn-pdf" 
          onClick={descargarReportePDF}
          disabled={cargando || facturas.length === 0}
        >
          {cargando ? 'Cargando...' : 'Descargar Reporte PDF'}
        </button>
      </div>

      {cargando ? (
        <div className="cargando">
          <div className="spinner"></div>
          <p>Cargando reporte...</p>
        </div>
      ) : (
        <>
          <div className="resumen">
            <div className="card">
              <p>Total Ventas</p>
              <h2>${totalVentas.toLocaleString('es-ES', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}</h2>
            </div>

            <div className="card">
              <p>Facturas</p>
              <h2>{facturas.length}</h2>
            </div>

            <div className="card">
              <p>Ticket Promedio</p>
              <h2>
                $
                {facturas.length > 0
                  ? (totalVentas / facturas.length).toLocaleString('es-ES', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })
                  : '0.00'}
              </h2>
            </div>
          </div>

          <div className="detalle-facturas">
            <div className="detalle-header">
              <h2>Detalle de Facturas ({facturas.length})</h2>
              <p className="subtitulo">
                {modo === 'diario' && 'Facturas del día de hoy'}
                {modo === 'semanal' && 'Facturas del período seleccionado'}
                {modo === 'mensual' && 'Facturas del mes actual'}
              </p>
            </div>

            {facturas.length === 0 ? (
              <div className="sin-facturas">
                <p>No hay facturas en este período</p>
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
                      const estaDescargando = descargandoFacturaId === f.id

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
                              onClick={() => descargarFacturaPDF(f)}
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
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}