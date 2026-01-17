export interface Mesa {
  id: string
  numero: number
  estado: 'libre' | 'ocupada'
  es_temporal: boolean
}

const BASE_URL = 'https://flor-system.onrender.com/api/mesas'

const getToken = () => {
  const token = localStorage.getItem('token')
  if (!token) throw new Error('token no proporcionado')
  return token
}

export const getMesas = async (): Promise<Mesa[]> => {
  const res = await fetch(BASE_URL, {
    headers: { Authorization: `Bearer ${getToken()}` }
  })

  const json = await res.json()
  // mostrar:
  // - todas las mesas NO temporales
  // - mesas temporales SOLO si estan ocupadas
  return (json.data || []).filter((m: Mesa) => {
    if (!m.es_temporal) return true
    return m.estado === 'ocupada'
  })
}


export const crearMesa = async (data: {
  es_temporal: boolean
  numero: number
  estado?: 'libre' | 'ocupada'
}): Promise<Mesa> => {
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`
    },
    body: JSON.stringify({
      numero: data.numero,
      estado: data.estado ?? 'libre',
      es_temporal: data.es_temporal
    })
  })

  if (!res.ok) {
    const error = await res.text()
    throw new Error(error || 'error al crear la mesa')
  }

  const json = await res.json()
  return json.data
}

export const getConsumosMesa = async (mesaId: string) => {
  const res = await fetch(`${BASE_URL}/${mesaId}/consumos`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  })
  return res.json()
}

export const agregarConsumo = async (data: {
  mesa_id: string
  producto_id: string
  cantidad: number
}) => {
  const res = await fetch(`${BASE_URL}/consumos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`
    },
    body: JSON.stringify(data)
  })

  if (!res.ok) throw new Error(await res.text())
}

export const actualizarCantidad = async (
  consumoId: string,
  cantidad: number,
  comentario?: string
) => {
  await fetch(`${BASE_URL}/consumos/${consumoId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`
    },
    body: JSON.stringify({ cantidad, comentario })
  })
}

export const eliminarConsumo = async (consumoId: string) => {
  await fetch(`${BASE_URL}/consumos/${consumoId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${getToken()}` }
  })
}

export const generarFactura = async (mesaId: string) => {
  const res = await fetch(
    `https://flor-system.onrender.com/api/facturas/mesa/${mesaId}`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${getToken()}` }
    }
  )

  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export const pagarMesa = async (mesaId: string) => {
  const res = await fetch(`${BASE_URL}/pagar/${mesaId}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${getToken()}` }
  })

  if (!res.ok) throw new Error(await res.text())
  return res.json()
}
