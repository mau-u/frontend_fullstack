
import React, { useState } from 'react';
import { formatDate, formatPrice } from '../utils/format.js';

export default function MyOrdersView({ orders }) {
  const [selectedId, setSelectedId] = useState(null);

  const selected = orders.find(
    (order) => order.id === selectedId
  );

  // Productos de la boleta.
  const items = selected?.items || [];

  // Total bruto de los productos, con IVA incluido.
  const subtotalProductos = items.reduce(
    (sum, line) =>
      sum + Number(
        line.subtotal ??
        (Number(line.precio || 0) * Number(line.cantidad || 0))
      ),
    0
  );

  // Descuentos aplicados a la compra.
  const descuentosTotal = (selected?.discounts || []).reduce(
    (sum, discount) =>
      sum + Number(discount.amount || 0),
    0
  );

  // Total de productos después de descuentos.
  const productosConDescuento = Math.max(
    0,
    subtotalProductos - descuentosTotal
  );

  // Desglose del IVA incluido en el precio final.
  const ivaIncluido = Math.round(
    productosConDescuento * 19 / 119
  );

  const netoProductos =
    productosConDescuento - ivaIncluido;

  // Diferencia entre el total de la boleta y los productos.
  // Corresponde al despacho u otros cargos registrados.
  const otrosCargos = Math.max(
    0,
    Number(selected?.total || 0) - productosConDescuento
  );

  return (
    <main className="container content-section">

      <div className="checkout-heading">
        <p className="eyebrow">Tu cuenta</p>
        <h1>Mis compras</h1>
        <p>Boletas y detalles de tus pedidos.</p>
      </div>

      {!orders.length ? (
        <div className="empty-state">
          <h2>Aún no tienes compras</h2>
          <p>
            Cuando confirmes un pedido, aparecerá aquí.
          </p>
          <a
            className="btn btn-brand"
            href="#/productos"
          >
            Explorar productos
          </a>
        </div>
      ) : (
        <section className="admin-panel">

          <div className="admin-table-wrap">
            <table className="admin-table">

              <thead>
                <tr>
                  <th>Boleta</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                  <th>Total</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>

                    <td>{order.id}</td>

                    <td>
                      {formatDate(order.createdAt)}
                    </td>

                    <td>
                      {order.status === 'cancelled'
                        ? 'Anulada'
                        : 'Emitida'}
                    </td>

                    <td>
                      {formatPrice(order.total)}
                    </td>

                    <td>
                      <button
                        className="table-action"
                        onClick={() =>
                          setSelectedId(
                            selectedId === order.id
                              ? null
                              : order.id
                          )
                        }
                      >
                        {selectedId === order.id
                          ? 'Cerrar detalle'
                          : 'Ver detalle'}
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>

            </table>
          </div>

        </section>
      )}

      {selected && (
        <section className="admin-panel">

          <div className="admin-panel-heading">

            <div>
              <p className="eyebrow">
                Boleta {selected.id}
              </p>

              <h2>
                {formatDate(selected.createdAt)}
              </h2>
            </div>

            <span
              className={`status-chip ${selected.status}`}
            >
              {selected.status === 'cancelled'
                ? 'Anulada'
                : 'Emitida'}
            </span>

          </div>

          {/* Detalle de productos */}
          <div className="admin-table-wrap">

            <table className="admin-table">

              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Cantidad</th>
                  <th>Precio unitario</th>
                  <th>Subtotal</th>
                </tr>
              </thead>

              <tbody>
                {items.map((line) => (
                  <tr key={line.codigo}>

                    <td>
                      {line.nombre}
                    </td>

                    <td>
                      {line.cantidad}
                    </td>

                    <td>
                      {formatPrice(line.precio)}
                      <small className="d-block text-muted">
                        IVA incluido
                      </small>
                    </td>

                    <td>
                      {formatPrice(
                        line.subtotal ??
                        (Number(line.precio || 0) *
                         Number(line.cantidad || 0))
                      )}
                    </td>

                  </tr>
                ))}
              </tbody>

            </table>

          </div>

          {/* Resumen tributario */}
          <div className="invoice-summary mt-4">

            <h3>Resumen de la compra</h3>

            <div className="d-flex justify-content-between py-2">
              <span>Subtotal productos</span>
              <strong>
                {formatPrice(subtotalProductos)}
              </strong>
            </div>

            {selected.discounts?.map((discount) => (
              <div
                key={discount.code}
                className="d-flex justify-content-between py-2"
              >
                <span>{discount.label}</span>
                <strong>
                  −{formatPrice(discount.amount)}
                </strong>
              </div>
            ))}

            <div className="d-flex justify-content-between py-2">
              <span>Neto de productos</span>
              <strong>
                {formatPrice(netoProductos)}
              </strong>
            </div>

            <div className="d-flex justify-content-between py-2">
              <span>IVA incluido (19%)</span>
              <strong>
                {formatPrice(ivaIncluido)}
              </strong>
            </div>

            {otrosCargos > 0 && (
              <div className="d-flex justify-content-between py-2">
                <span>Despacho y otros cargos</span>
                <strong>
                  {formatPrice(otrosCargos)}
                </strong>
              </div>
            )}

            <hr />

            <p className="invoice-total d-flex justify-content-between">
              <strong>Total pagado:</strong>
              <strong>
                {formatPrice(selected.total)}
              </strong>
            </p>

            <small className="text-muted">
              Los precios de los productos incluyen IVA.
              El impuesto se muestra desglosado y no se
              agrega nuevamente al total.
            </small>

          </div>

        </section>
      )}

    </main>
  );
}
