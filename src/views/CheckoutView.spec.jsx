
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import CheckoutView from './CheckoutView.jsx';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

describe('formulario de compra', () => {
  let host;
  let root;

  const cart = [
    {
      codigo: 'PI001',
      nombre: 'Mousse de chocolate',
      precio: 5000,
      imagen: 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=',
      cantidad: 2
    }
  ];

  beforeEach(() => {
    host = document.createElement('div');
    document.body.appendChild(host);
    root = createRoot(host);
  });

  afterEach(() => {
    act(() => root.unmount());
    host.remove();
  });

  // Helper para completar los campos
  const setInput = (name, value) => {
    const input = host.querySelector(`[name="${name}"]`);

    Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      'value'
    ).set.call(input, value);

    act(() => {
      input.dispatchEvent(
        new Event('input', { bubbles: true })
      );
    });
  };

  // Helper para completar el formulario
  const completarFormulario = () => {
    setInput('name', 'Ana Pérez');
    setInput('email', 'ana@gmail.com');
    setInput('phone', '+56912345678');
    setInput('address', 'Av. Siempre Viva 123');
  };

  // 1. Resumen de productos
  it('muestra el resumen de productos y el costo de despacho', () => {
    act(() => {
      root.render(
        <CheckoutView cart={cart} onPay={() => {}} />
      );
    });

    expect(host.textContent).toContain('Mousse de chocolate');
    expect(host.textContent).toContain('12.990');
    expect(host.querySelector('[name="name"]')).not.toBeNull();
  });

  // 2. Datos de contacto incompletos
  it('muestra un error y no crea una orden si faltan datos de contacto', () => {
    const onPay = jasmine.createSpy('onPay');

    act(() => {
      root.render(
        <CheckoutView cart={cart} onPay={onPay} />
      );
    });

    act(() => {
      host.querySelector('form').dispatchEvent(
        new Event('submit', {
          bubbles: true,
          cancelable: true
        })
      );
    });

    expect(host.querySelector('[role="alert"]').textContent)
      .toContain('Completa tu nombre');

    expect(onPay).not.toHaveBeenCalled();
  });

  // 3. Envío correcto y pago rechazado
  it('envía el formulario con los datos del usuario y el resultado de pago seleccionado', () => {
    const onPay = jasmine.createSpy('onPay');

    act(() => {
      root.render(
        <CheckoutView
          cart={cart}
          onPay={onPay}
          currentUser={{
            nombre: 'Ana Pérez',
            email: 'ana@example.com'
          }}
        />
      );
    });

    setInput('phone', '+56912345678');
    setInput('address', 'Av. Siempre Viva 123');

    act(() => {
      host.querySelector('button[type="button"]').click();
    });

    expect(onPay).toHaveBeenCalledWith(
      jasmine.objectContaining({
        name: 'Ana Pérez',
        email: 'ana@example.com',
        phone: '+56912345678',
        address: 'Av. Siempre Viva 123'
      }),
      'rejected'
    );
  });

  // 4. Celular inválido
  it('rechaza el celular incompleto y quita cualquier letra que se intente ingresar', () => {
    const onPay = jasmine.createSpy('onPay');

    act(() => {
      root.render(
        <CheckoutView cart={cart} onPay={onPay} />
      );
    });

    completarFormulario();
    setInput('phone', '+5691234abcd');

    act(() => {
      host.querySelector('button[type="submit"]').click();
    });

    expect(host.querySelector('[role="alert"]').textContent)
      .toContain('+569 y 8 dígitos');

    expect(onPay).not.toHaveBeenCalled();
  });

  // 5. Fecha de nacimiento
  it('muestra la fecha registrada como dato de cuenta y no como campo editable', () => {
    act(() => {
      root.render(
        <CheckoutView
          cart={cart}
          onPay={() => {}}
          currentUser={{
            nombre: 'Ana Pérez',
            email: 'ana@gmail.com',
            fechaNacimiento: '1970-10-22'
          }}
        />
      );
    });

    expect(host.querySelector('[name="birthDate"]')).toBeNull();
    expect(host.textContent).toContain('22 de octubre de 1970');
  });

  // 6. Carrito vacío
  it('muestra el mensaje cuando el carrito está vacío', () => {
    act(() => {
      root.render(
        <CheckoutView cart={[]} onPay={() => {}} />
      );
    });

    expect(host.textContent).toContain('Tu carrito está vacío');
    expect(host.querySelector('form')).toBeNull();
    expect(host.textContent).toContain('Ir al catálogo');
  });

  // 7. Nombre inválido
  it('rechaza nombres que contienen números', () => {
    const onPay = jasmine.createSpy('onPay');

    act(() => {
      root.render(
        <CheckoutView cart={cart} onPay={onPay} />
      );
    });

    completarFormulario();
    setInput('name', 'Ana123');

    act(() => {
      host.querySelector('button[type="submit"]').click();
    });

    expect(host.querySelector('[role="alert"]').textContent)
      .toContain('solo letras y espacios');

    expect(onPay).not.toHaveBeenCalled();
  });

  // 8. Correo inválido
  it('rechaza un correo electrónico inválido', () => {
    const onPay = jasmine.createSpy('onPay');

    act(() => {
      root.render(
        <CheckoutView cart={cart} onPay={onPay} />
      );
    });

    completarFormulario();
    setInput('email', 'correo-invalido');

    act(() => {
      host.querySelector('button[type="submit"]').click();
    });

    expect(host.querySelector('[role="alert"]').textContent)
      .toContain('correo electrónico con formato válido');

    expect(onPay).not.toHaveBeenCalled();
  });

  // 9. Dirección vacía
  it('rechaza una dirección vacía', () => {
    const onPay = jasmine.createSpy('onPay');

    act(() => {
      root.render(
        <CheckoutView cart={cart} onPay={onPay} />
      );
    });

    completarFormulario();
    setInput('address', '   ');

    act(() => {
      host.querySelector('button[type="submit"]').click();
    });

    expect(host.querySelector('[role="alert"]').textContent)
      .toContain('Completa tu dirección');

    expect(onPay).not.toHaveBeenCalled();
  });

  // 10. Código promocional inválido
  it('rechaza un código promocional incorrecto', () => {
    const onPay = jasmine.createSpy('onPay');

    act(() => {
      root.render(
        <CheckoutView cart={cart} onPay={onPay} />
      );
    });

    completarFormulario();
    setInput('promoCode', 'INVALIDO');

    act(() => {
      host.querySelector('button[type="submit"]').click();
    });

    expect(host.querySelector('[role="alert"]').textContent)
      .toContain('código promocional ingresado no es válido');

    expect(onPay).not.toHaveBeenCalled();
  });

  // 11. Error devuelto por el procesamiento del pago
  it('muestra el error devuelto por el procesamiento del pago', async () => {
    const onPay = jasmine.createSpy('onPay')
      .and.returnValue(
        Promise.resolve('No se pudo registrar la compra')
      );

    act(() => {
      root.render(
        <CheckoutView cart={cart} onPay={onPay} />
      );
    });

    completarFormulario();

    await act(async () => {
      host.querySelector('button[type="submit"]').click();
    });

    expect(host.querySelector('[role="alert"]').textContent)
      .toContain('No se pudo registrar la compra');
  });

  // 12. Error inesperado durante el pago
  it('muestra un mensaje cuando ocurre un error al procesar el pago', async () => {
    const onPay = jasmine.createSpy('onPay')
      .and.returnValue(
        Promise.reject(new Error('Error de conexión'))
      );

    act(() => {
      root.render(
        <CheckoutView cart={cart} onPay={onPay} />
      );
    });

    completarFormulario();

    await act(async () => {
      host.querySelector('button[type="submit"]').click();
    });

    expect(host.querySelector('[role="alert"]').textContent)
      .toContain('No fue posible procesar la compra');
  });

  // 13. Cambio de región
  it('actualiza la comuna cuando se selecciona otra región', () => {
    act(() => {
      root.render(
        <CheckoutView cart={cart} onPay={() => {}} />
      );
    });

    const region = host.querySelector('[name="region"]');

    Object.getOwnPropertyDescriptor(
      window.HTMLSelectElement.prototype,
      'value'
    ).set.call(region, 'Valparaíso');

    act(() => {
      region.dispatchEvent(
        new Event('change', { bubbles: true })
      );
    });

    expect(host.querySelector('[name="commune"]').value)
      .toBe('Valparaíso');
  });

  // 14. Código promocional en mayúsculas
  it('convierte el código promocional a mayúsculas', () => {
    act(() => {
      root.render(
        <CheckoutView cart={cart} onPay={() => {}} />
      );
    });

    setInput('promoCode', 'felices50');

    expect(host.querySelector('[name="promoCode"]').value)
      .toBe('FELICES50');
  });

  // 15. Retiro gratuito
  it('muestra entrega gratis cuando se selecciona retiro en tienda', () => {
    act(() => {
      root.render(
        <CheckoutView cart={cart} onPay={() => {}} />
      );
    });

    const retiro = host.querySelector(
      'input[name="delivery"][value="retiro"]'
    );

    act(() => {
      retiro.click();
    });

    expect(host.textContent).toContain('Gratis');
  });

  // 16. Fecha alternativa del usuario
  it('utiliza la fecha alternativa cuando no existe fechaNacimiento', () => {
    act(() => {
      root.render(
        <CheckoutView
          cart={cart}
          onPay={() => {}}
          currentUser={{
            nombre: 'Ana Pérez',
            email: 'ana@gmail.com',
            fecha: '1985-05-15'
          }}
        />
      );
    });

    expect(host.textContent).toContain('15 de mayo de 1985');
  });

});
