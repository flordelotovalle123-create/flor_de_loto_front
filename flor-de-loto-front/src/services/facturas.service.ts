// services/facturas.service.ts
import api from './api';

/* =========================
   interfaces alineadas al back
========================= */

export interface FacturaDetalle {
  id: string;
  factura_id: string;
  producto_id: number;
  nombre_producto: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

export interface Factura {
  id: string;  // ← CAMBIADO: era number, ahora string (UUID)
  numero_factura: number;  // ← CAMBIADO: era string, ahora number
  total: number;
  created_at: string;
  mesas?: {
    numero: number;
  };
  usuarios?: {
    nombre: string;
  };
}

/* =========================
   obtener facturas (con o sin rango de fechas)
   backend: GET /facturas?fechaInicio=&fechaFin=
========================= */
export const getFacturasPorFecha = async (
  fechaInicio?: string,
  fechaFin?: string
): Promise<Factura[]> => {
  try {
    let url = '/facturas'

    if (fechaInicio && fechaFin) {
      url += `?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`
    }
    
    console.log('🔵 Petición GET a:', url)
    
    const response = await api.get(url)
    
    console.log('🟢 Respuesta completa:', response)
    console.log('📊 Status:', response.status)
    console.log('📦 Data:', response.data)
    
    // IMPORTANTE: Tu backend devuelve { ok: true, data: [...] }
    if (response.data?.ok && Array.isArray(response.data.data)) {
      console.log(`🎉 Se recibieron ${response.data.data.length} facturas`)
      return response.data.data
    }
    
    console.warn('⚠️ Formato inesperado:', response.data)
    return []
    
  } catch (error: any) {
    console.error('🔥 Error en getFacturasPorFecha:')
    console.error('Mensaje:', error.message)
    console.error('Respuesta:', error.response?.data)
    console.error('Status:', error.response?.status)
    return []
  }
}


/* =========================
   obtener detalle de una factura
   backend: GET /facturas/:id
========================= */
export const getFacturaDetalle = async (
  facturaId: string
): Promise<FacturaDetalle[]> => {
  try {
    const response = await api.get(`/facturas/${facturaId}`)
    
    console.log('🔍 Respuesta detalle factura:', response)
    
    // Tu backend devuelve { ok: true, data: [...] }
    if (response.data?.ok && Array.isArray(response.data.data)) {
      return response.data.data
    }
    
    console.warn('⚠️ Formato inesperado en detalle:', response.data)
    return []
    
  } catch (error) {
    console.error(`error al obtener detalle de factura ${facturaId}:`, error)
    throw error
  }
}


/* =========================
   crear factura desde una mesa
   backend: POST /facturas/mesa/:mesaId
========================= */
export const crearFactura = async (mesaId: string) => {
  try {
    const response = await api.post(`/facturas/mesa/${mesaId}`);
    return response;
  } catch (error) {
    console.error(`error al crear factura para mesa ${mesaId}:`, error);
    throw error;
  }
};