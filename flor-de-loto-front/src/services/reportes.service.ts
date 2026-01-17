import api from './api'

export const descargarReporteDiario = async () => {
  const response = await api.get('/reportes/diario', {
    responseType: 'blob'
  })
  descargarArchivo(response.data, 'reporte_diario.pdf')
}

export const descargarReporteSemanal = async (
  inicio: string,
  fin: string
) => {
  const response = await api.get(
    `/reportes/semanal?inicio=${inicio}&fin=${fin}`,
    { responseType: 'blob' }
  )
  descargarArchivo(response.data, 'reporte_semanal.pdf')
}

export const descargarReporteMensual = async () => {
  const response = await api.get('/reportes/mensual', {
    responseType: 'blob'
  })
  descargarArchivo(response.data, 'reporte_mensual.pdf')
}

const descargarArchivo = (data: Blob, nombre: string) => {
  const url = window.URL.createObjectURL(data)
  const a = document.createElement('a')
  a.href = url
  a.download = nombre
  a.click()
  window.URL.revokeObjectURL(url)
}
