
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import Header from './Header.jsx';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

describe('navegación de la tienda', () => {
  let host;
  let root;

  beforeEach(() => {
    host = document.createElement('div');
    document.body.appendChild(host);
    root = createRoot(host);
  });

  afterEach(() => {
    act(() => root.unmount());
    host.remove();
  });

  it('muestra la identidad y los mensajes principales de la tienda', () => {
    act(() => root.render(<Header />));

    expect(host.textContent).toContain('Mil Sabores');
    expect(host.textContent).toContain('Pastelería desde 1975');
    expect(host.textContent).toContain('Hecho con cariño, fresco cada día');
    expect(host.textContent).toContain('Despacho en Santiago y retiro en tienda');
  });

  it('muestra todos los enlaces públicos para visitantes', () => {
    act(() => root.render(<Header cartCount={2} />));

    const expectedLinks = [
      'Inicio',
      'Productos',
      'Categorías',
      'Ofertas',
      'Nosotros',
      'Blog',
      'Contacto',
      'Iniciar sesión'
    ];

    expectedLinks.forEach((label) => {
      expect(host.textContent).toContain(label);
    });

    expect(host.querySelector('.cart-nav')).not.toBeNull();
    expect(host.querySelector('.cart-badge').textContent).toBe('2');
  });

  it('muestra correctamente el carrito vacío', () => {
    act(() => root.render(<Header cartCount={0} />));

    expect(host.querySelector('.cart-badge').textContent).toBe('0');

    expect(
      host.querySelector('.cart-nav').getAttribute('aria-label')
    ).toBe('Carrito, 0 productos');
  });

  it('utiliza cero como cantidad predeterminada del carrito', () => {
    act(() => root.render(<Header />));

    expect(host.querySelector('.cart-badge').textContent).toBe('0');
  });

  it('abre y cierra el menú responsive', () => {
    act(() => root.render(<Header />));

    const toggle = host.querySelector('.navbar-toggler');
    const navigation = host.querySelector('#main-navigation');

    expect(toggle.getAttribute('aria-expanded')).toBe('false');

    act(() => toggle.click());

    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(navigation.classList.contains('show')).toBeTrue();

    act(() => toggle.click());

    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(navigation.classList.contains('show')).toBeFalse();
  });

  it('cierra el menú al seleccionar un enlace de navegación', () => {
    act(() => root.render(<Header />));

    const toggle = host.querySelector('.navbar-toggler');

    act(() => toggle.click());

    expect(toggle.getAttribute('aria-expanded')).toBe('true');

    act(() => host.querySelector('a[href="#/productos"]').click());

    expect(toggle.getAttribute('aria-expanded')).toBe('false');
  });

  it('cierra el menú al seleccionar el logotipo', () => {
    act(() => root.render(<Header />));

    const toggle = host.querySelector('.navbar-toggler');

    act(() => toggle.click());

    act(() => host.querySelector('.navbar-brand').click());

    expect(toggle.getAttribute('aria-expanded')).toBe('false');
  });

  it('muestra los enlaces correspondientes al administrador', () => {
    act(() => root.render(
      <Header
        currentUser={{
          nombre: 'Administrador',
          role: 'admin'
        }}
        cartCount={3}
      />
    ));

    expect(host.textContent).toContain('Panel admin');
    expect(host.textContent).toContain('Salir');

    expect(host.querySelector('a[href="#/admin"]')).not.toBeNull();
    expect(host.querySelector('a[href="#/login"]')).toBeNull();
    expect(host.querySelector('a[href="#/mis-compras"]')).toBeNull();

    expect(host.querySelector('.cart-nav')).not.toBeNull();
  });

  it('permite cerrar la sesión del administrador', () => {
    const onLogout = jasmine.createSpy('onLogout');

    act(() => root.render(
      <Header
        currentUser={{ nombre: 'Admin', role: 'admin' }}
        onLogout={onLogout}
      />
    ));

    const logoutButton = [...host.querySelectorAll('button')]
      .find(button => button.textContent.trim() === 'Salir');

    act(() => logoutButton.click());

    expect(onLogout).toHaveBeenCalledTimes(1);
  });

  it('muestra únicamente la navegación permitida al vendedor', () => {
    act(() => root.render(
      <Header
        cartCount={3}
        currentUser={{
          nombre: 'Vendedor',
          role: 'vendedor'
        }}
      />
    ));

    expect(host.querySelector('a[href="#/"]')).not.toBeNull();
    expect(host.querySelector('a[href="#/productos"]')).not.toBeNull();
    expect(host.querySelector('a[href="#/vendedor"]')).not.toBeNull();

    expect(host.querySelector('.cart-nav')).toBeNull();
    expect(host.querySelector('a[href="#/categorias"]')).toBeNull();
    expect(host.querySelector('a[href="#/ofertas"]')).toBeNull();
    expect(host.querySelector('a[href="#/nosotros"]')).toBeNull();
    expect(host.querySelector('a[href="#/blog"]')).toBeNull();
    expect(host.querySelector('a[href="#/contacto"]')).toBeNull();

    expect(host.textContent).toContain('Panel vendedor');
    expect(host.textContent).toContain('Salir');
  });

  it('permite cerrar la sesión del vendedor', () => {
    const onLogout = jasmine.createSpy('onLogout');

    act(() => root.render(
      <Header
        currentUser={{ nombre: 'Vendedor', role: 'vendedor' }}
        onLogout={onLogout}
      />
    ));

    const logoutButton = [...host.querySelectorAll('button')]
      .find(button => button.textContent.trim() === 'Salir');

    act(() => logoutButton.click());

    expect(onLogout).toHaveBeenCalledTimes(1);
  });

  it('muestra el saludo y los enlaces correspondientes al cliente', () => {
    act(() => root.render(
      <Header
        currentUser={{
          nombre: 'Ana Pérez',
          role: 'customer'
        }}
        cartCount={4}
      />
    ));

    expect(host.textContent).toContain('Hola, Ana Pérez');
    expect(host.querySelector('a[href="#/mis-compras"]')).not.toBeNull();
    expect(host.querySelector('.cart-nav')).not.toBeNull();
    expect(host.querySelector('a[href="#/login"]')).toBeNull();
  });

  it('utiliza el nombre alternativo cuando no existe nombre', () => {
    act(() => root.render(
      <Header
        currentUser={{
          name: 'Carlos González'
        }}
      />
    ));

    expect(host.textContent).toContain('Hola, Carlos González');
  });

  it('permite cerrar la sesión del cliente', () => {
    const onLogout = jasmine.createSpy('onLogout');

    act(() => root.render(
      <Header
        currentUser={{
          nombre: 'Ana Pérez',
          role: 'customer'
        }}
        onLogout={onLogout}
      />
    ));

    const logoutButton = [...host.querySelectorAll('button')]
      .find(button => button.textContent.trim() === 'Salir');

    act(() => logoutButton.click());

    expect(onLogout).toHaveBeenCalledTimes(1);
  });

  it('permite cerrar sesión aunque no se entregue onLogout', () => {
    act(() => root.render(
      <Header
        currentUser={{
          nombre: 'Ana Pérez',
          role: 'customer'
        }}
      />
    ));

    const logoutButton = [...host.querySelectorAll('button')]
      .find(button => button.textContent.trim() === 'Salir');

    expect(() => {
      act(() => logoutButton.click());
    }).not.toThrow();
  });

});
