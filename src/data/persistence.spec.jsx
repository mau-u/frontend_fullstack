
import {
  addCartItem,
  cartQuantity,
  cartTotal,
  createRepository,
  decreaseStock,
  getProductPrice,
  getStockChanges
} from './persistence.js';

function makeMemoryStorage(initial = {}) {
  const values = new Map(Object.entries(initial));

  return {
    getItem: (key) => values.has(key) ? values.get(key) : null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
  };
}

describe('repositorio local con operaciones CRUD', () => {
  let storage;
  let repository;

  beforeEach(() => {
    storage = makeMemoryStorage();

    repository = createRepository({
      key: 'productos-prueba',
      idField: 'codigo',
      initialData: [
        { codigo: 'A1', nombre: 'Torta inicial' }
      ],
      storage
    });
  });

  it('lee los datos iniciales y los persiste la primera vez', () => {
    expect(repository.list()).toEqual([
      { codigo: 'A1', nombre: 'Torta inicial' }
    ]);

    expect(JSON.parse(storage.getItem('productos-prueba'))[0].codigo)
      .toBe('A1');
  });

  it('crea un registro y permite consultarlo por su identificador', () => {
    repository.create({ codigo: 'B2', nombre: 'Brownie' });

    expect(repository.getById('B2').nombre).toBe('Brownie');
    expect(repository.list().length).toBe(2);
  });

  it('rechaza identificadores duplicados sin alterar los datos', () => {
    expect(() => repository.create({
      codigo: 'A1',
      nombre: 'Duplicado'
    })).toThrowError(/Ya existe/);

    expect(repository.list().length).toBe(1);
  });

  it('rechaza identificadores duplicados aunque cambien las mayúsculas', () => {
    expect(() => repository.create({
      codigo: 'a1',
      nombre: 'Duplicado'
    })).toThrowError(/Ya existe/);
  });

  it('actualiza campos y mantiene el identificador original', () => {
    const updated = repository.update('A1', {
      nombre: 'Torta renovada',
      precio: 12000
    });

    expect(updated).toEqual({
      codigo: 'A1',
      nombre: 'Torta renovada',
      precio: 12000
    });

    expect(repository.update('no-existe', {
      nombre: 'Nada'
    })).toBeNull();
  });

  it('elimina registros y avisa cuando el identificador no existe', () => {
    expect(repository.remove('A1')).toBeTrue();
    expect(repository.remove('A1')).toBeFalse();
    expect(repository.list()).toEqual([]);
  });

  it('reemplaza la colección y devuelve copias independientes', () => {
    const saved = repository.replace([
      { codigo: 'C3', nombre: 'Cheesecake' }
    ]);

    saved[0].nombre = 'Cambio externo';

    expect(repository.getById('C3').nombre).toBe('Cheesecake');
  });

  it('devuelve null al consultar un identificador inexistente', () => {
    expect(repository.getById('NOEXISTE')).toBeNull();
  });

  it('inicializa una colección vacía sin datos almacenados', () => {
    const repo = createRepository({
      key: 'vacio',
      storage
    });

    expect(repo.list()).toEqual([]);
  });

  it('genera un identificador automático cuando no se proporciona', () => {
    const created = repository.create({
      nombre: 'Brownie'
    });

    expect(created.codigo).toMatch(/^ms-/);
  });

  it('convierte los identificadores a texto para las consultas', () => {
    const repo = createRepository({
      key: 'numeros',
      idField: 'id',
      initialData: [{ id: 10, nombre: 'Producto' }],
      storage
    });

    expect(repo.getById('10').nombre).toBe('Producto');
  });

  it('devuelve una copia independiente de los datos consultados', () => {
    const result = repository.list();

    result[0].nombre = 'Modificado externamente';

    expect(repository.list()[0].nombre).toBe('Torta inicial');
  });

  it('devuelve los datos iniciales cuando el JSON almacenado está corrupto', () => {
    storage.setItem('productos-prueba', '{json-invalido');

    expect(repository.list()).toEqual([
      { codigo: 'A1', nombre: 'Torta inicial' }
    ]);
  });

  it('devuelve los datos iniciales cuando el almacenamiento contiene un objeto y no una lista', () => {
    storage.setItem(
      'productos-prueba',
      JSON.stringify({ codigo: 'A2' })
    );

    expect(repository.list()).toEqual([
      { codigo: 'A1', nombre: 'Torta inicial' }
    ]);
  });

  it('rechaza guardar valores que no sean listas', () => {
    expect(() => repository.replace({ codigo: 'A1' }))
      .toThrowError(TypeError, 'El repositorio solo guarda listas.');
  });

  it('permite leer datos cuando el almacenamiento no está disponible', () => {
    const repo = createRepository({
      key: 'sin-storage',
      initialData: [{ id: 1 }],
      storage: null
    });

    expect(repo.list()).toEqual([{ id: 1 }]);
  });

  it('maneja errores al leer el almacenamiento', () => {
    const brokenStorage = {
      getItem: () => {
        throw new Error('Error de lectura');
      }
    };

    const repo = createRepository({
      key: 'error',
      initialData: [{ id: 1 }],
      storage: brokenStorage
    });

    expect(repo.list()).toEqual([{ id: 1 }]);
  });

  it('devuelve datos normalizados cuando falla la persistencia de una migración', () => {
    const readOnlyStorage = {
      getItem: () => JSON.stringify([
        { id: 1, nombre: 'Producto', imagen: '/img/torta.jpg' }
      ]),
      setItem: () => {
        throw new Error('Almacenamiento de solo lectura');
      }
    };

    const repo = createRepository({
      key: 'migracion',
      storage: readOnlyStorage,
      normalize: (items) => items.map((item) => ({
        ...item,
        imagen: '/nueva/' + item.imagen
      }))
    });

    expect(repo.list()[0].imagen).toBe('/nueva//img/torta.jpg');
  });

  it('mantiene el identificador original cuando se intenta cambiar mediante update', () => {
    repository.update('A1', {
      codigo: 'B2',
      nombre: 'Nuevo nombre'
    });

    expect(repository.getById('A1').nombre).toBe('Nuevo nombre');
    expect(repository.getById('B2')).toBeNull();
  });

  it('devuelve false cuando se elimina un registro inexistente', () => {
    expect(repository.remove('NOEXISTE')).toBeFalse();
  });
});

describe('cálculo de precios y promociones', () => {
  it('calcula el precio normal cuando no hay oferta', () => {
    expect(getProductPrice({
      precio: 10000,
      isOffer: false
    })).toBe(10000);
  });

  it('calcula correctamente el precio con descuento', () => {
    expect(getProductPrice({
      precio: 10000,
      isOffer: true,
      descuento: 20
    })).toBe(8000);
  });

  it('utiliza cero cuando el descuento no es numérico', () => {
    expect(getProductPrice({
      precio: 10000,
      isOffer: true,
      descuento: 'invalido'
    })).toBe(10000);
  });

  it('permite calcular una oferta sin descuento informado', () => {
    expect(getProductPrice({
      precio: 5000,
      isOffer: true
    })).toBe(5000);
  });
});

describe('lógica del carrito', () => {
  const product = {
    codigo: 'TC001',
    nombre: 'Torta de chocolate',
    precio: 10000,
    isOffer: true,
    descuento: 10,
    imagen: '/img/TC001.jpg'
  };

  it('suma productos iguales y calcula cantidad y total con el precio de oferta', () => {
    const cart = addCartItem(
      addCartItem([], product),
      product,
      2
    );

    expect(cart.length).toBe(1);
    expect(cart[0].cantidad).toBe(3);
    expect(cart[0].precio).toBe(9000);
    expect(cartQuantity(cart)).toBe(3);
    expect(cartTotal(cart)).toBe(27000);
  });

  it('mantiene separadas las tortas con mensajes distintos', () => {
    const cart = addCartItem(
      addCartItem([], product, 1, 'Feliz cumple'),
      product,
      1,
      'Te queremos'
    );

    expect(cart.length).toBe(2);
  });

  it('permite agregar productos con el mismo código y mensaje vacío', () => {
    const cart = addCartItem(
      addCartItem([], product),
      product,
      2
    );

    expect(cart.length).toBe(1);
    expect(cart[0].cantidad).toBe(3);
  });

  it('no agrega un producto inexistente', () => {
    const cart = addCartItem([], null);

    expect(cart).toEqual([]);
  });

  it('no agrega cantidades inferiores a una unidad', () => {
    expect(addCartItem([], product, 0)).toEqual([]);
    expect(addCartItem([], product, -2)).toEqual([]);
  });

  it('mantiene el carrito original al agregar un producto', () => {
    const original = [];

    const result = addCartItem(original, product);

    expect(original.length).toBe(0);
    expect(result.length).toBe(1);
  });

  it('calcula correctamente un carrito vacío', () => {
    expect(cartQuantity([])).toBe(0);
    expect(cartTotal([])).toBe(0);
  });

  it('mantiene separados productos con códigos diferentes', () => {
    const anotherProduct = {
      ...product,
      codigo: 'TC002',
      nombre: 'Torta de vainilla'
    };

    const cart = addCartItem(
      addCartItem([], product),
      anotherProduct
    );

    expect(cart.length).toBe(2);
  });

  it('calcula el total de productos diferentes', () => {
    const anotherProduct = {
      ...product,
      codigo: 'TC002',
      precio: 5000,
      isOffer: false
    };

    const cart = addCartItem(
      addCartItem([], product, 2),
      anotherProduct,
      3
    );

    expect(cartQuantity(cart)).toBe(5);
    expect(cartTotal(cart)).toBe(33000);
  });
});

describe('control de inventario', () => {
  it('calcula el descuento de stock correctamente', () => {
    const products = [
      { codigo: 'TC001', nombre: 'Torta de chocolate', stock: 3 }
    ];

    const cart = [
      { codigo: 'TC001', cantidad: 2 },
      { codigo: 'TC001', cantidad: 1 }
    ];

    const inventory = getStockChanges(cart, products);

    expect(inventory.error).toBe('');
    expect(inventory.changes[0]).toEqual(
      jasmine.objectContaining({
        stockBefore: 3,
        stockAfter: 0,
        quantity: 3
      })
    );
  });

  it('rechaza productos que no existen', () => {
    const result = getStockChanges(
      [{ codigo: 'NOEXISTE', cantidad: 1 }],
      []
    );

    expect(result.error).toContain('ya no está disponible');
    expect(result.changes).toEqual([]);
  });

  it('rechaza compras superiores al stock disponible', () => {
    const products = [
      { codigo: 'TC001', nombre: 'Torta', stock: 3 }
    ];

    const result = getStockChanges(
      [{ codigo: 'TC001', cantidad: 4 }],
      products
    );

    expect(result.error).toContain('Stock insuficiente');
  });

  it('rechaza cantidades decimales', () => {
    const products = [
      { codigo: 'TC001', nombre: 'Torta', stock: 5 }
    ];

    const result = getStockChanges(
      [{ codigo: 'TC001', cantidad: 1.5 }],
      products
    );

    expect(result.error).toContain('Stock insuficiente');
  });

  it('rechaza cantidades inferiores a una unidad', () => {
    const products = [
      { codigo: 'TC001', nombre: 'Torta', stock: 5 }
    ];

    const result = getStockChanges(
      [{ codigo: 'TC001', cantidad: 0 }],
      products
    );

    expect(result.error).toContain('Stock insuficiente');
  });

  it('considera el stock negativo como cero', () => {
    const products = [
      { codigo: 'TC001', nombre: 'Torta', stock: -5 }
    ];

    const result = getStockChanges(
      [{ codigo: 'TC001', cantidad: 1 }],
      products
    );

    expect(result.error).toContain('Disponible: 0');
  });

  it('aplica el nuevo stock al repositorio', () => {
    const storage = makeMemoryStorage();

    const products = createRepository({
      key: 'stock-prueba',
      idField: 'codigo',
      initialData: [
        { codigo: 'TC001', stock: 4 }
      ],
      storage
    });

    const inventory = getStockChanges(
      [{ codigo: 'TC001', cantidad: 2 }],
      products.list()
    );

    decreaseStock(inventory.changes, products);

    expect(products.getById('TC001').stock).toBe(2);
  });

  it('no modifica el stock cuando no hay cambios', () => {
    const storage = makeMemoryStorage();

    const products = createRepository({
      key: 'stock-vacio',
      idField: 'codigo',
      initialData: [
        { codigo: 'TC001', stock: 4 }
      ],
      storage
    });

    decreaseStock([], products);

    expect(products.getById('TC001').stock).toBe(4);
  });
});
