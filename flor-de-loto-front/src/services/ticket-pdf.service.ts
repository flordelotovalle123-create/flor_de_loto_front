// services/ticket-pdf.service.ts
import jsPDF from 'jspdf'
import { getFacturaDetalle } from './facturas.service'
import type { Factura } from './facturas.service'

const cargarImagenBase64 = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = url
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('No se pudo obtener contexto 2D'))
        return
      }
      ctx.drawImage(img, 0, 0)
      resolve(canvas.toDataURL('image/png'))
    }
    img.onerror = (err) => {
      reject(new Error(`Error cargando imagen: ${err}`))
    }
  })
}

export const generarTicketPDF = async (factura: Factura): Promise<void> => {
  try {
    const detalles = await getFacturaDetalle(factura.id)

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [80, 200]
    })

    let y = 6

    try {
      const logoBase64 = await cargarImagenBase64('/logo.png')
      const logoWidth = 36
      const logoX = (80 - logoWidth) / 2
      doc.addImage(logoBase64, 'PNG', logoX, y, logoWidth, 18)
      y += 22
    } catch {
      y += 6
    }

    doc.setFontSize(11)
    doc.text('Flor De Loto', 40, y, { align: 'center' })
    y += 5

    doc.setFontSize(8)
    doc.text('Heladeria', 40, y, { align: 'center' })
    y += 4

    doc.text('----------------------------------------------------------------', 40, y, { align: 'center' })
    y += 4

    doc.text(`Factura #${factura.numero_factura}`, 4, y)
    y += 4

    doc.text(
      `Fecha: ${new Date(factura.created_at).toLocaleDateString()}`,
      4,
      y
    )
    y += 4

    doc.text(`Número de mesa: ${factura.mesas?.numero ?? '-'}`, 4, y)
    y += 4

    doc.text(`Atendid@ por: ${factura.usuarios?.nombre ?? '-'}`, 4, y)
    y += 5

    doc.text('----------------------------------------------------------------', 40, y, { align: 'center' })
    y += 4

    doc.text('Producto', 4, y)
    doc.text('Total', 76, y, { align: 'right' })
    y += 3

    doc.text('----------------------------------------------------------------', 40, y, { align: 'center' })
    y += 4

    detalles.forEach(d => {
      doc.text(d.nombre_producto, 4, y)
      y += 3
      doc.text(`${d.cantidad} x $${d.precio_unitario}`, 6, y)
      doc.text(`$${d.subtotal}`, 76, y, { align: 'right' })
      y += 4
    })

    y += 2
    doc.text('----------------------------------------------------------------', 40, y, { align: 'center' })
    y += 5

    doc.setFontSize(10)
    doc.text(`Total: $${factura.total}`, 76, y, { align: 'right' })
    y += 8

    doc.setFontSize(8)
    doc.text('Gracias por tú compra', 40, y, { align: 'center' })
    y += 4
    doc.text('Esperamos verte de nuevo pronto', 40, y, { align: 'center' })

    doc.save(`ticket_${factura.numero_factura}.pdf`)
  } catch (error) {
    console.error('Error generando ticket PDF:', error)
    throw error
  }
}