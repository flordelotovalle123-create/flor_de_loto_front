import jsPDF from 'jspdf'
import type { FacturaDetalle } from './../services/facturas.service'

interface DatosFactura {
  id: number
  fecha: string
  total: number
  detalles: FacturaDetalle[]
}

export const generarFacturaPDF = (factura: DatosFactura) => {
  const doc = new jsPDF()
  let y = 20

  doc.setFontSize(16)
  doc.text(`factura #${factura.id}`, 14, y)
  y += 8

  doc.setFontSize(10)
  doc.text(`fecha: ${factura.fecha}`, 14, y)
  y += 6
  doc.text(`total: $${factura.total.toFixed(2)}`, 14, y)
  y += 10

  doc.setFontSize(11)
  doc.text('detalle de productos', 14, y)
  y += 8

  factura.detalles.forEach(d => {
    if (y > 270) {
      doc.addPage()
      y = 20
    }

    doc.text(
      `${d.nombre_producto} | cant: ${d.cantidad} | $${d.subtotal.toFixed(2)}`,
      14,
      y
    )
    y += 6
  })

  doc.save(`factura_${factura.id}.pdf`)
}
