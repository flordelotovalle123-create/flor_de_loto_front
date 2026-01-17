import type { Producto } from '../types/index';

interface ProductosResponse {
  ok: boolean;
  data: Producto[];
  message?: string;
}

export const getProductos = async (): Promise<ProductosResponse> => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('Token no proporcionado');

  const res = await fetch('http://localhost:3000/api/productos', {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  if (!res.ok) throw new Error('Error al obtener productos');

  const data: ProductosResponse = await res.json();
  return data;
};
