import React, { useState } from 'react';
import { Producto, Cliente, ItemCarrito, TipoPrecio, FormaPago, Factura } from '../../types';
import { formatearDinero, generarNumeroFactura } from '../../services/storageService';
import {
  Search,
  ShoppingCart,
  User,
  Plus,
  ArrowRight,
  X,
  Trash2,
  DollarSign,
  AlertCircle,
  Package,
  Layers,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface Props {
  productos: Producto[];
  clientes: Cliente[];
  facturas: Factura[];
  vendedorActual: string;
  onFinalizarFactura: (factura: Factura) => void;
  onCrearClienteExpress: (cliente: Cliente) => void;
}

export const MobileSalesPOS: React.FC<Props> = ({
  productos,
  clientes,
  facturas,
  vendedorActual,
  onFinalizarFactura,
  onCrearClienteExpress,
}) => {
  const [busqueda, setBusqueda] = useState('');
  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);
  const [carritoAbierto, setCarritoAbierto] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
  const [busquedaCliente, setBusquedaCliente] = useState('');
  const [formaPago, setFormaPago] = useState<FormaPago>('contado');
  const [montoRecibido, setMontoRecibido] = useState('');

  // Modal nuevo cliente
  const [modalNuevoCliente, setModalNuevoCliente] = useState(false);
  const [nombreNuevoCliente, setNombreNuevoCliente] = useState('');
  const [telNuevoCliente, setTelNuevoCliente] = useState('');
  const [dirNuevoCliente, setDirNuevoCliente] = useState('');

  const agregarAlCarrito = (prod: Producto, tipo: TipoPrecio) => {
    const precio = tipo === 'mayorista' ? Number(prod.precioMayorista) : Number(prod.precioDetalle);
    const index = carrito.findIndex((item) => item.id === prod.id && item.tipoPrecio === tipo);

    if (index >= 0) {
      const copy = [...carrito];
      copy[index].cantidad += 1;
      setCarrito(copy);
    } else {
      setCarrito([
        ...carrito,
        {
          id: prod.id,
          nombre: prod.nombre,
          precio,
          tipoPrecio: tipo,
          cantidad: 1,
          costo: prod.costo,
        },
      ]);
    }
  };

  const modificarCantidad = (idx: number, delta: number) => {
    const copy = [...carrito];
    const nueva = copy[idx].cantidad + delta;
    if (nueva <= 0) {
      copy.splice(idx, 1);
    } else {
      copy[idx].cantidad = nueva;
    }
    setCarrito(copy);
  };

  const totalVenta = carrito.reduce(
    (acc, item) => acc + Number(item.precio || 0) * Number(item.cantidad || 0),
    0
  );
  const totalArticulos = carrito.reduce((acc, item) => acc + item.cantidad, 0);

  const cambioCalculado = Math.max(0, (Number(montoRecibido) || 0) - totalVenta);

  const handleCrearCliente = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreNuevoCliente.trim()) return;
    const nuevo: Cliente = {
      id: Date.now(),
      nombre: nombreNuevoCliente.trim(),
      telefono: telNuevoCliente.trim() || undefined,
      direccion: dirNuevoCliente.trim() || undefined,
    };
    onCrearClienteExpress(nuevo);
    setClienteSeleccionado(nuevo);
    setModalNuevoCliente(false);
    setNombreNuevoCliente('');
    setTelNuevoCliente('');
    setDirNuevoCliente('');
  };

  const handleConfirmarVenta = () => {
    if (carrito.length === 0) {
      alert('El carrito está vacío.');
      return;
    }
    if (!clienteSeleccionado) {
      alert('Por favor selecciona un cliente para la venta.');
      return;
    }

    const recibido = Number(montoRecibido) || 0;
    if (formaPago === 'contado' && recibido > 0 && recibido < totalVenta) {
      alert('El monto recibido no puede ser menor al total.');
      return;
    }

    const nueva: Factura = {
      id: Date.now(),
      numero: generarNumeroFactura(facturas),
      fecha: new Date().toISOString(),
      cliente: {
        id: clienteSeleccionado.id,
        nombre: clienteSeleccionado.nombre,
        telefono: clienteSeleccionado.telefono,
        direccion: clienteSeleccionado.direccion,
      },
      productos: JSON.parse(JSON.stringify(carrito)),
      vendedor: vendedorActual || 'Vendedor Móvil',
      total: totalVenta,
      formaPago,
      montoRecibido: formaPago === 'contado' ? (recibido || totalVenta) : 0,
      cambio: formaPago === 'contado' ? (recibido ? Math.max(0, recibido - totalVenta) : 0) : 0,
      saldoCredito: formaPago === 'credito' ? totalVenta : 0,
      estado: 'emitida',
    };

    onFinalizarFactura(nueva);

    try {
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.85 } });
    } catch {}

    setCarrito([]);
    setClienteSeleccionado(null);
    setMontoRecibido('');
    setCarritoAbierto(false);
  };

  const productosFiltrados = productos.filter((p) => {
    const q = busqueda.toLowerCase().trim();
    return (
      !q ||
      p.nombre.toLowerCase().includes(q) ||
      (p.codigo && p.codigo.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-3 pb-24 animate-in fade-in duration-150">
      {/* Buscador Rápido Móvil */}
      <div className="sticky top-14 z-20 bg-slate-50 pt-1 pb-2">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar producto a vender..."
            className="w-full pl-9 pr-8 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-semibold shadow-xs focus:border-emerald-600 focus:outline-hidden"
          />
          {busqueda && (
            <button
              onClick={() => setBusqueda('')}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Lista de Productos Táctiles */}
      <div className="space-y-2.5">
        {productosFiltrados.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
            <Package className="w-8 h-8 mx-auto text-slate-300 mb-1" />
            No hay productos que coincidan.
          </div>
        ) : (
          productosFiltrados.map((prod) => {
            const stockNum = Number(prod.stock || 0);
            const esAgotado = stockNum <= 0;

            return (
              <div
                key={prod.id}
                className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-900 text-sm leading-snug">{prod.nombre}</h4>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                      {prod.codigo && <span className="font-mono text-[11px]">Cód: {prod.codigo}</span>}
                      <span className={`font-semibold ${stockNum <= 5 ? 'text-amber-600' : 'text-slate-600'}`}>
                        Stock: {prod.stock}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Botones de Toque Rápido: Mayorista vs Detalle */}
                <div className="grid grid-cols-2 gap-2 mt-3 pt-2.5 border-t border-slate-100">
                  <button
                    onClick={() => agregarAlCarrito(prod, 'mayorista')}
                    disabled={esAgotado}
                    className="py-2 px-2.5 bg-emerald-50 active:bg-emerald-200 text-emerald-950 font-bold text-xs rounded-xl flex flex-col items-center justify-center border border-emerald-200/80 transition-colors"
                  >
                    <span className="text-[10px] uppercase font-semibold text-emerald-800">Mayorista</span>
                    <span className="text-sm font-extrabold">{formatearDinero(prod.precioMayorista)}</span>
                  </button>

                  <button
                    onClick={() => agregarAlCarrito(prod, 'detalle')}
                    disabled={esAgotado}
                    className="py-2 px-2.5 bg-blue-50 active:bg-blue-200 text-blue-950 font-bold text-xs rounded-xl flex flex-col items-center justify-center border border-blue-200/80 transition-colors"
                  >
                    <span className="text-[10px] uppercase font-semibold text-blue-800">Detalle</span>
                    <span className="text-sm font-extrabold">{formatearDinero(prod.precioDetalle)}</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Botón Flotante de Carrito Móvil */}
      {carrito.length > 0 && !carritoAbierto && (
        <div className="fixed bottom-18 left-3 right-3 z-30 animate-in slide-in-from-bottom duration-200">
          <button
            onClick={() => setCarritoAbierto(true)}
            className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-extrabold text-sm rounded-2xl shadow-xl flex items-center justify-between transition-all"
          >
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-white text-emerald-800 flex items-center justify-center text-xs font-black">
                {totalArticulos}
              </span>
              <span>Ver Carrito</span>
            </div>
            <div className="flex items-center gap-1 text-base">
              <span>{formatearDinero(totalVenta)}</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </button>
        </div>
      )}

      {/* Modal / Pantalla Completa de Carrito y Checkout Móvil */}
      {carritoAbierto && (
        <div className="fixed inset-0 z-50 flex flex-col bg-white animate-in slide-in-from-bottom duration-200">
          {/* Cabecera del Carrito */}
          <div className="p-4 bg-emerald-950 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-emerald-400" />
              <h3 className="font-extrabold text-base">Confirmar Venta</h3>
            </div>
            <button
              onClick={() => setCarritoAbierto(false)}
              className="p-1.5 text-emerald-200 hover:text-white rounded-lg"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Cuerpo Scrolleable */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Cliente */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-emerald-700" /> Cliente
                </span>
                <button
                  type="button"
                  onClick={() => setModalNuevoCliente(true)}
                  className="text-xs text-emerald-700 font-bold hover:underline"
                >
                  + Nuevo
                </button>
              </div>

              {clienteSeleccionado ? (
                <div className="flex items-center justify-between p-2.5 bg-emerald-50 rounded-xl border border-emerald-200">
                  <div>
                    <strong className="text-slate-900 text-sm block">{clienteSeleccionado.nombre}</strong>
                    {clienteSeleccionado.telefono && (
                      <span className="text-xs text-slate-500">{clienteSeleccionado.telefono}</span>
                    )}
                  </div>
                  <button
                    onClick={() => setClienteSeleccionado(null)}
                    className="text-xs text-red-600 font-semibold"
                  >
                    Cambiar
                  </button>
                </div>
              ) : (
                <div>
                  <input
                    type="text"
                    value={busquedaCliente}
                    onChange={(e) => setBusquedaCliente(e.target.value)}
                    placeholder="Buscar cliente..."
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800"
                  />
                  {busquedaCliente && (
                    <div className="max-h-32 overflow-y-auto mt-1 border border-slate-200 rounded-xl divide-y divide-slate-100 bg-white">
                      {clientes
                        .filter((c) => c.nombre.toLowerCase().includes(busquedaCliente.toLowerCase()))
                        .slice(0, 5)
                        .map((c) => (
                          <div
                            key={c.id}
                            onClick={() => {
                              setClienteSeleccionado(c);
                              setBusquedaCliente('');
                            }}
                            className="p-2 text-xs font-semibold hover:bg-emerald-50 cursor-pointer flex justify-between"
                          >
                            <span>{c.nombre}</span>
                            <span className="text-slate-400 text-[10px]">{c.telefono}</span>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Lista del Carrito */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-500 uppercase">Productos ({totalArticulos})</div>
              {carrito.map((item, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-slate-900 text-xs">{item.nombre}</span>
                    <button onClick={() => modificarCantidad(idx, -item.cantidad)} className="text-slate-400">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-medium">
                      {item.tipoPrecio === 'mayorista' ? 'Mayorista' : 'Detalle'} ({formatearDinero(item.precio)})
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => modificarCantidad(idx, -1)}
                        className="w-7 h-7 rounded-lg bg-slate-200 font-bold flex items-center justify-center"
                      >
                        -
                      </button>
                      <span className="font-bold text-sm w-5 text-center">{item.cantidad}</span>
                      <button
                        onClick={() => modificarCantidad(idx, 1)}
                        className="w-7 h-7 rounded-lg bg-slate-200 font-bold flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Opciones de Pago */}
            <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-100 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Forma de Pago</label>
                  <select
                    value={formaPago}
                    onChange={(e) => setFormaPago(e.target.value as FormaPago)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                  >
                    <option value="contado">Contado</option>
                    <option value="credito">Crédito</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    {formaPago === 'contado' ? 'Monto Recibido' : 'Crédito'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    disabled={formaPago === 'credito'}
                    value={formaPago === 'credito' ? '' : montoRecibido}
                    onChange={(e) => setMontoRecibido(e.target.value)}
                    placeholder={formaPago === 'contado' ? 'Total exacto' : 'A Crédito'}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>
              </div>

              {formaPago === 'contado' && Number(montoRecibido) > 0 && (
                <div className="flex justify-between items-center text-xs font-bold text-emerald-800">
                  <span>Devuelta / Cambio:</span>
                  <span className="text-sm">{formatearDinero(cambioCalculado)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Footer de Confirmación */}
          <div className="p-4 bg-white border-t border-slate-200 shrink-0 space-y-3">
            <div className="flex justify-between items-center text-base font-black">
              <span>TOTAL A COBRAR:</span>
              <span className="text-emerald-900 text-xl">{formatearDinero(totalVenta)}</span>
            </div>

            <button
              onClick={handleConfirmarVenta}
              className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-extrabold text-base shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <span>Emitir Factura</span>
              <Check className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Modal Express Cliente */}
      {modalNuevoCliente && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-2xl p-5 shadow-2xl space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-sm text-slate-800">Nuevo Cliente</h4>
              <button onClick={() => setModalNuevoCliente(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCrearCliente} className="space-y-2.5 text-xs">
              <input
                type="text"
                required
                placeholder="Nombre del cliente *"
                value={nombreNuevoCliente}
                onChange={(e) => setNombreNuevoCliente(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl"
              />
              <input
                type="text"
                placeholder="Teléfono (Opcional)"
                value={telNuevoCliente}
                onChange={(e) => setTelNuevoCliente(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl"
              />
              <input
                type="text"
                placeholder="Dirección (Opcional)"
                value={dirNuevoCliente}
                onChange={(e) => setDirNuevoCliente(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl"
              />
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalNuevoCliente(false)}
                  className="flex-1 py-2 text-slate-500 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-emerald-600 text-white font-bold rounded-xl"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
