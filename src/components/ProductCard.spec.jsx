
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import ProductCard from './ProductCard.jsx';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

describe('tarjeta de producto', () => {
  let host;
  let root;

  const product = {
    codigo: 'TC001',
    categoria: 'Tortas cuadradas',
    nombre: 'Torta de chocolate',
    precio: 20000,
    stock: 8,
    imagen: '/img/TC001.jpg',
    isOffer: true,
    descuento: 10
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

  it('renderiza nombre, código, categoría, precio y oferta', () => {
    act(() => root.render(<ProductCard product={product} />));

    expect(host.textContent).toContain('Torta de chocolate');
    expect(host.textContent).toContain('TC001');
    expect(host.textContent).toContain('Tortas cuadradas');
    expect(host.textContent).toContain('Stock: 8');

    expect(host.querySelector('.product-badge').textContent)
      .toBe('-10%');

    expect(host.querySelector('img').alt)
      .toBe('Torta de chocolate');
  });

  it('ejecuta las funciones al ver detalle y agregar al carrito', () => {
    const onAdd = jasmine.createSpy('onAdd');
    const onView = jasmine.createSpy('onView');

    act(() => root.render(
      <ProductCard
        product={product}
        onAdd={onAdd}
        onView={onView}
      />
    ));

    act(() => host.querySelector('.btn-outline-brand').click());
    act(() => host.querySelector('.btn-brand').click());

    expect(onView).toHaveBeenCalledWith(product);
    expect(onAdd).toHaveBeenCalledWith(product);
  });

  it('abre el detalle al hacer clic en la imagen', () => {
    const onView = jasmine.createSpy('onView');

    act(() => root.render(
      <ProductCard product={product} onView={onView} />
    ));

    act(() => host.querySelector('.image-button').click());

    expect(onView).toHaveBeenCalledOnceWith(product);
  });

  it('abre el detalle al hacer clic en el nombre', () => {
    const onView = jasmine.createSpy('onView');

    act(() => root.render(
      <ProductCard product={product} onView={onView} />
    ));

    act(() => host.querySelector('.text-button').click());

    expect(onView).toHaveBeenCalledOnceWith(product);
  });

  it('oculta la compra en modo vendedor y mantiene el detalle', () => {
    const onAdd = jasmine.createSpy('onAdd');
    const onView = jasmine.createSpy('onView');

    act(() => root.render(
      <ProductCard
        product={product}
        onAdd={onAdd}
        onView={onView}
        canPurchase={false}
      />
    ));

    expect(host.querySelector('.btn-outline-brand')).not.toBeNull();
    expect(host.querySelector('.btn-brand')).toBeNull();

    act(() => host.querySelector('.btn-outline-brand').click());

    expect(onView).toHaveBeenCalledWith(product);
    expect(onAdd).not.toHaveBeenCalled();
  });

  it('muestra el precio original cuando existe una oferta', () => {
    act(() => root.render(<ProductCard product={product} />));

    expect(host.querySelector('del')).not.toBeNull();
    expect(host.querySelector('del').textContent).toContain('20.000');
  });

  it('renderiza correctamente un producto sin oferta', () => {
    const normalProduct = {
      ...product,
      isOffer: false,
      descuento: 0
    };

    act(() => root.render(
      <ProductCard product={normalProduct} />
    ));

    expect(host.querySelector('.product-badge')).toBeNull();
    expect(host.querySelector('del')).toBeNull();
    expect(host.textContent).toContain('Torta de chocolate');
  });

  it('muestra el precio normal cuando no existe descuento', () => {
    const normalProduct = {
      ...product,
      isOffer: false
    };

    act(() => root.render(
      <ProductCard product={normalProduct} />
    ));

    expect(host.querySelector('.product-price-row').textContent)
      .toContain('20.000');
  });

  it('muestra el botón agregar cuando existe stock', () => {
    act(() => root.render(<ProductCard product={product} />));

    const button = host.querySelector('.btn-brand');

    expect(button).not.toBeNull();
    expect(button.disabled).toBeFalse();
    expect(button.textContent).toContain('Agregar');
  });

  it('deshabilita la compra cuando el stock es cero', () => {
    const soldOutProduct = {
      ...product,
      stock: 0
    };

    const onAdd = jasmine.createSpy('onAdd');

    act(() => root.render(
      <ProductCard
        product={soldOutProduct}
        onAdd={onAdd}
      />
    ));

    const button = host.querySelector('.btn-brand');

    expect(button.disabled).toBeTrue();
    expect(button.textContent).toContain('Agotado');

    act(() => button.click());

    expect(onAdd).not.toHaveBeenCalled();
  });

  it('deshabilita la compra cuando el stock es negativo', () => {
    const soldOutProduct = {
      ...product,
      stock: -5
    };

    act(() => root.render(
      <ProductCard product={soldOutProduct} />
    ));

    expect(host.querySelector('.btn-brand').disabled).toBeTrue();
    expect(host.querySelector('.btn-brand').textContent)
      .toContain('Agotado');
  });

  it('oculta el botón de compra cuando canPurchase es falso', () => {
    act(() => root.render(
      <ProductCard
        product={product}
        canPurchase={false}
      />
    ));

    expect(host.querySelector('.btn-brand')).toBeNull();
  });

  it('no produce errores cuando no se reciben funciones callback', () => {
    act(() => root.render(<ProductCard product={product} />));

    expect(() => {
      act(() => host.querySelector('.image-button').click());
      act(() => host.querySelector('.text-button').click());
      act(() => host.querySelector('.btn-outline-brand').click());
      act(() => host.querySelector('.btn-brand').click());
    }).not.toThrow();
  });

  it('muestra correctamente la dirección de la imagen', () => {
    act(() => root.render(<ProductCard product={product} />));

    expect(host.querySelector('img').getAttribute('src'))
      .toBe('/img/TC001.jpg');
  });

});
