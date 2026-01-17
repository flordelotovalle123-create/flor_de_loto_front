import { useState, useEffect } from 'react'
import type { Mesa } from '../../services/mesas.service'
import type { Producto, ConsumoItem } from '../../types'
import { getProductos } from '../../services/productos.service'
import {
  agregarConsumo,
  getConsumosMesa,
  actualizarCantidad,
  eliminarConsumo,
  generarFactura,
  pagarMesa
} from '../../services/mesas.service'

interface Props {
  mesa: Mesa
  onClose: () => void
  onActualizarMesa: (mesaActualizada: Mesa) => void
  onPagado?: () => void
}

export default function MesaPanelDetalle({
  mesa,
  onClose,
  onActualizarMesa,
  onPagado
}: Props) {
  const [productos, setProductos] = useState<Producto[]>([])
  const [consumos, setConsumos] = useState<ConsumoItem[]>([])
  const [total, setTotal] = useState(0)
  const [showPopup, setShowPopup] = useState(false)
  const [categoriaActiva, setCategoriaActiva] = useState('todas')
  const [categorias, setCategorias] = useState<string[]>([])
  const [comentarioEstado, setComentarioEstado] = useState<
    Record<string, 'guardando' | 'guardado' | 'error' | ''>
  >({})
  const [procesandoPago, setProcesandoPago] = useState(false)

  /* =========================
     cargar consumos
  ========================= */
  const cargarConsumos = async () => {
    try {
      const res = await getConsumosMesa(mesa.id)
      setConsumos(res.data.consumos)
      setTotal(res.data.total)
    } catch (err) {
      console.error('error al obtener consumos', err)
    }
  }

  useEffect(() => {
    cargarConsumos()
  }, [mesa.id])

  /* =========================
     cargar productos
  ========================= */
  useEffect(() => {
    const fetchProductos = async () => {
      const res = await getProductos()
      const data = Array.isArray(res.data) ? res.data : []
      setProductos(data)

      const categoriasUnicas = [
        'todas',
        ...Array.from(new Set(data.map(p => p.categoria).filter(Boolean)))
      ]
      setCategorias(categoriasUnicas as string[])
    }

    fetchProductos()
  }, [])

  /* =========================
     helpers
  ========================= */
  const productosFiltrados =
    categoriaActiva === 'todas'
      ? productos
      : productos.filter(
          p =>
            (p.categoria ?? '').toLowerCase() ===
            categoriaActiva.toLowerCase()
        )

  /* =========================
     acciones consumo
  ========================= */
  const handleAgregarProducto = async (producto: Producto) => {
    try {
      await agregarConsumo({
        mesa_id: mesa.id,
        producto_id: producto.id,
        cantidad: 1
      })

      await cargarConsumos()

      onActualizarMesa({ ...mesa, estado: 'ocupada' })
      setShowPopup(false)
    } catch (err) {
      console.error('error al agregar producto:', err)
    }
  }

  const handleSumar = async (consumo: ConsumoItem) => {
    try {
      await actualizarCantidad(
        consumo.id,
        consumo.cantidad + 1,
        consumo.comentario
      )
      await cargarConsumos()
    } catch (err) {
      console.error('error al sumar cantidad:', err)
    }
  }

  const handleRestar = async (consumo: ConsumoItem) => {
    const nuevaCantidad = consumo.cantidad - 1

    try {
      if (nuevaCantidad <= 0) {
        await eliminarConsumo(consumo.id)
        const nuevosConsumos = consumos.filter(c => c.id !== consumo.id)

        if (nuevosConsumos.length === 0 && !mesa.es_temporal) {
          onActualizarMesa({ ...mesa, estado: 'libre' })
        }
      } else {
        await actualizarCantidad(
          consumo.id,
          nuevaCantidad,
          consumo.comentario
        )
      }

      await cargarConsumos()
    } catch (err) {
      console.error('error al restar cantidad:', err)
    }
  }

  const handleGuardarComentario = async (
    consumo: ConsumoItem,
    comentario: string
  ) => {
    try {
      setComentarioEstado(prev => ({ ...prev, [consumo.id]: 'guardando' }))

      await actualizarCantidad(consumo.id, consumo.cantidad, comentario)

      setComentarioEstado(prev => ({ ...prev, [consumo.id]: 'guardado' }))

      setConsumos(prev =>
        prev.map(item =>
          item.id === consumo.id ? { ...item, comentario } : item
        )
      )

      setTimeout(() => {
        setComentarioEstado(prev => ({ ...prev, [consumo.id]: '' }))
      }, 2000)
    } catch (err) {
      console.error('error al guardar comentario:', err)
      setComentarioEstado(prev => ({ ...prev, [consumo.id]: 'error' }))

      setTimeout(() => {
        setComentarioEstado(prev => ({ ...prev, [consumo.id]: '' }))
      }, 3000)
    }
  }

  const handleLimpiarComentario = async (consumo: ConsumoItem) => {
    await handleGuardarComentario(consumo, '')
  }

  const handleEliminar = async (consumo: ConsumoItem) => {
    try {
      await eliminarConsumo(consumo.id)
      const nuevosConsumos = consumos.filter(c => c.id !== consumo.id)

      if (nuevosConsumos.length === 0 && !mesa.es_temporal) {
        onActualizarMesa({ ...mesa, estado: 'libre' })
      }

      await cargarConsumos()
    } catch (err) {
      console.error('error al eliminar producto:', err)
    }
  }

  /* =========================
     pago con factura
  ========================= */
  const handlePagar = async () => {
    if (consumos.length === 0 || procesandoPago) return

    try {
      setProcesandoPago(true)

      await generarFactura(mesa.id)
      await pagarMesa(mesa.id)

      alert(
        `factura generada\n` +
        `total: $${total.toLocaleString()}`
      )

      if (mesa.es_temporal) {
        onPagado?.()
      } else {
        onActualizarMesa({ ...mesa, estado: 'libre' })
      }

      onClose()
    } catch (e) {
      alert('error al procesar el pago')
    } finally {
      setProcesandoPago(false)
    }
  }

  /* =========================
     render
  ========================= */
  return (
    <>
      <div className="modal-overlay-mesa" onClick={onClose}></div>

      <div className="mesa-panel-detalle activo">
        <div className="header-panel">
          <div className="header-info">
            <h2>mesa {mesa.numero}</h2>
            <span className={`badge-estado ${mesa.estado}`}>
              {mesa.estado}
            </span>
          </div>
          <button className="cerrar-btn" onClick={onClose}>✕</button>
        </div>

        <div className="panel-contenido">
          <div className="tabla-panel">
            {consumos.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📦</div>
                <p className="empty-text">no hay productos en esta mesa</p>
                <button
                  className="empty-btn"
                  onClick={() => setShowPopup(true)}
                >
                  agregar producto
                </button>
              </div>
            ) : (
              <>
                <div className="tabla-header-fijo">
                  <div className="tabla-header">
                    <div className="header-col header-producto">producto</div>
                    <div className="header-col header-precio">precio unit.</div>
                    <div className="header-col header-cantidad">cantidad</div>
                    <div className="header-col header-comentario">comentario</div>
                    <div className="header-col header-subtotal">subtotal</div>
                    <div className="header-col header-acciones">acciones</div>
                  </div>
                </div>

                <div className="productos-contenedor-scroll">
                  <div className="productos-lista">
                    {consumos.map(c => (
                      <div key={c.id} className="producto-item">
                        <div className="producto-nombre">
                          <strong>{c.producto.nombre}</strong>
                        </div>

                        <div className="producto-precio">
                          ${c.producto.precio.toLocaleString()}
                        </div>

                        <div className="producto-cantidad">
                          <button
                            className="cantidad-btn decremento"
                            onClick={() => handleRestar(c)}
                          >
                            -
                          </button>
                          <span className="cantidad-valor">{c.cantidad}</span>
                          <button
                            className="cantidad-btn incremento"
                            onClick={() => handleSumar(c)}
                          >
                            +
                          </button>
                        </div>

                        <div className="producto-comentario-col">
                          <div className="comentario-container">
                            <textarea
                              className="comentario-input"
                              placeholder="escribe un comentario..."
                              value={c.comentario || ''}
                              rows={1}
                              onChange={e =>
                                setConsumos(prev =>
                                  prev.map(item =>
                                    item.id === c.id
                                      ? { ...item, comentario: e.target.value }
                                      : item
                                  )
                                )
                              }
                              onKeyDown={e => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault()
                                  handleGuardarComentario(
                                    c,
                                    e.currentTarget.value
                                  )
                                }
                              }}
                              onBlur={e => {
                                if (c.comentario !== e.target.value) {
                                  handleGuardarComentario(
                                    c,
                                    e.target.value
                                  )
                                }
                              }}
                            />

                            <div className="comentario-acciones">
                              {c.comentario?.trim() && (
                                <button
                                  className="comentario-btn limpiar-btn"
                                  onClick={() => handleLimpiarComentario(c)}
                                  type="button"
                                >
                                  ×
                                </button>
                              )}
                              <button
                                className="comentario-btn guardar-btn"
                                onClick={() =>
                                  handleGuardarComentario(
                                    c,
                                    c.comentario || ''
                                  )
                                }
                                type="button"
                              >
                                ✓
                              </button>
                            </div>

                            <div className={`comentario-estado ${comentarioEstado[c.id] || ''}`}>
                              {comentarioEstado[c.id] === 'guardando' && 'guardando...'}
                              {comentarioEstado[c.id] === 'guardado' && '✓ guardado'}
                              {comentarioEstado[c.id] === 'error' && '✗ error'}
                            </div>
                          </div>
                        </div>

                        <div className="producto-subtotal">
                          ${c.subtotal.toLocaleString()}
                        </div>

                        <div className="producto-acciones">
                          <button
                            className="eliminar-btn"
                            onClick={() => handleEliminar(c)}
                            type="button"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="tabla-footer-fijo">
                  <div className="total-fila">
                    <div className="total-label">total</div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div className="total-valor">${total.toLocaleString()}</div>
                    <div></div>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="acciones-panel">
            <button
              className="btn-agregar"
              onClick={() => setShowPopup(true)}
              type="button"
            >
              + agregar producto
            </button>

            <button
              className={`btn-pagar ${procesandoPago ? 'procesando' : ''}`}
              disabled={consumos.length === 0 || procesandoPago}
              onClick={handlePagar}
              type="button"
            >
              {procesandoPago
                ? 'procesando...'
                : `pagar $${total.toLocaleString()}`}
            </button>
          </div>
        </div>

        {showPopup && (
          <div className="modal-overlay" onClick={() => setShowPopup(false)}>
            <div className="modal-productos" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3>seleccionar producto</h3>
                <button
                  className="cerrar-modal"
                  onClick={() => setShowPopup(false)}
                  type="button"
                >
                  ✕
                </button>
              </div>

              <div className="modal-content">
                <div className="filtros-categoria">
                  {categorias.map(cat => (
                    <button
                      key={cat}
                      className={`filtro-btn ${categoriaActiva === cat ? 'activo' : ''}`}
                      onClick={() => setCategoriaActiva(cat)}
                      type="button"
                    >
                      {cat === 'todas' ? 'todos' : cat}
                    </button>
                  ))}
                </div>

                <div className="productos-grid">
                  {productosFiltrados.length === 0 ? (
                    <div className="no-productos">
                      <div className="icono-vacio">📦</div>
                      <p className="texto-vacio">
                        no hay productos en esta categoria
                      </p>
                    </div>
                  ) : (
                    productosFiltrados.map(p => (
                      <button
                        key={p.id}
                        className="producto-item"
                        onClick={() => handleAgregarProducto(p)}
                        type="button"
                      >
                        {p.categoria && (
                          <span className="producto-categoria">
                            {p.categoria.substring(0, 10)}
                          </span>
                        )}
                        <span className="producto-nombre">{p.nombre}</span>
                        <span className="producto-precio">
                          ${p.precio.toLocaleString()}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}