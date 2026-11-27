
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import ProductDetailView from './ProductDetailView.jsx';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

describe('detalle del producto', () => {
  let host;
  let root;

  const product = {
    codigo: 'TC001',
    categoria: 'Tortas cuadradas',
    nombre: 'Torta de chocolate',
    descripcion: 'Torta artesanal de chocolate.',
    precio: 20000,
    stock: 8,
    imagen: '/img/TC001.jpg',
  };

  beforeEach(() => {
    host = document.createElement('div');
    document.body.appendChild(host);
    root = createRoot(host);
  });

  afterEach(() => {
    act(() => root.unmount());
    host.remove();
  });

  const renderProduct = (props = {}) => {
    act(() => {
      root.render(
        <ProductDetailView
          product={product}
          onAdd={() => {}}
          {...props}
        />
      );
    });
  };

  const setInput = (input, value) => {
    const descriptor = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      'value'
    );

    act(() => {
      descriptor.set.call(input, value);
      input.dispatchEvent(
        new Event('input', { bubbles: true })
      );
    });
  };

  // 1. Vista de vendedor
  it('muestra la información del producto en modo vendedor', () => {
    const onAdd = jasmine.createSpy('onAdd');

    renderProduct({
      onAdd,
      canPurchase: false
    });

    expect(host.textContent).toContain('Torta de chocolate');
    expect(host.textContent).toContain('Stock disponible: 8');
    expect(host.textContent).toContain('Vista de vendedor');

    expect(host.querySelector('input')).toBeNull();
    expect(host.querySelector('button')).toBeNull();

    expect(onAdd).not.toHaveBeenCalled();
  });

  // 2. Producto inexistente
  it('muestra un mensaje cuando el producto no existe', () => {
    renderProduct({
      product: null
    });

    expect(host.textContent).toContain('Producto no encontrado');
    expect(host.textContent).toContain('Volver al catálogo');
  });

  // 3. Producto agotado
  it('deshabilita la compra cuando el producto no tiene stock', () => {
    renderProduct({
      product: {
        ...product,
        stock: 0
      }
    });

    const button = host.querySelector('button');

    expect(button.disabled).toBeTrue();
    expect(button.textContent).toContain('Producto agotado');
    expect(host.textContent).toContain('Stock disponible: 0');
  });

  // 4. Producto disponible
  it('permite agregar un producto que tiene stock', () => {
    renderProduct();

    const button = host.querySelector('button');

    expect(button.disabled).toBeFalse();
    expect(button.textContent).toContain('Agregar al carrito');
  });

  // 5. Producto en oferta
  it('muestra el precio original cuando el producto está en oferta', () => {
    renderProduct({
      product: {
        ...product,
        isOffer: true
      }
    });

    expect(host.querySelector('del')).not.toBeNull();
    expect(host.querySelector('del').textContent).toContain('20.000');
  });

  // 6. Producto sin oferta
  it('no muestra precio original cuando el producto no está en oferta', () => {
    renderProduct({
      product: {
        ...product,
        isOffer: false
      }
    });

    expect(host.querySelector('del')).toBeNull();
  });

  // 7. Mensaje especial para tortas
  it('muestra el campo de mensaje especial para tortas', () => {
    renderProduct();

    expect(host.textContent).toContain('Mensaje especial para la torta');
    expect(host.querySelector('input[placeholder*="Feliz cumpleaños"]'))
      .not.toBeNull();
  });

  // 8. Producto que no es torta
  it('no muestra mensaje especial para productos que no son tortas', () => {
    renderProduct({
      product: {
        ...product,
        categoria: 'Bebidas'
      }
    });

    expect(host.textContent).not.toContain(
      'Mensaje especial para la torta'
    );
  });

  // 9. Agregar producto al carrito
  it('envía el producto, la cantidad y el mensaje al carrito', () => {
    const onAdd = jasmine.createSpy('onAdd');

    renderProduct({ onAdd });

    const inputs = host.querySelectorAll('input');
    const messageInput = inputs[0];
    const quantityInput = inputs[1];

    setInput(messageInput, 'Feliz cumpleaños Ana');
    setInput(quantityInput, '3');

    act(() => {
      host.querySelector('button').click();
    });

    expect(onAdd).toHaveBeenCalledWith(
      product,
      3,
      'Feliz cumpleaños Ana'
    );
  });

  // 10. Cantidad mínima
  it('mantiene la cantidad mínima en una unidad', () => {
    renderProduct();

    const quantityInput = host.querySelector(
      '.quantity-input'
    );

    setInput(quantityInput, '0');

    expect(quantityInput.value).toBe('1');
  });

  // 11. Cantidad máxima según stock
  it('limita la cantidad seleccionada al stock disponible', () => {
    renderProduct();

    const quantityInput = host.querySelector(
      '.quantity-input'
    );

    setInput(quantityInput, '15');

    expect(quantityInput.value).toBe('8');
  });

  // 12. Límite máximo de 20 unidades
  it('limita la cantidad máxima a 20 unidades', () => {
    renderProduct({
      product: {
        ...product,
        stock: 50
      }
    });

    const quantityInput = host.querySelector(
      '.quantity-input'
    );

    expect(quantityInput.max).toBe('20');

    setInput(quantityInput, '25');

    expect(quantityInput.value).toBe('20');
  });

});
