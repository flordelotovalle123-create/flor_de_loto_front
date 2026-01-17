import api from './api'

export const descargarFacturaPDF = async (facturaId: number) => {
  const response = await api.get(
    `/facturas/${facturaId}/pdf`,
    { responseType: 'blob' }
  )

  const url = window.URL.createObjectURL(response.data)
  const a = document.createElement('a')
  a.href = url
  a.download = `factura_${facturaId}.pdf`
  a.click()
  window.URL.revokeObjectURL(url)
}
