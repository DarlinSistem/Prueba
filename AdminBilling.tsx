import React, { useState } from 'react';
import { Factura, Producto, Cliente, ItemCarrito, TipoPrecio, FormaPago } from './types';
import { formatearDinero, formatearFechaHora, generarNumeroFactura, fechaHoyYMD } from './storageService';
import { imprimirFacturaFormato, imprimirVentasDelDia } from './PrintInvoice';
import { InvoiceDetailModal } from './InvoiceDetailModal';
import {
  FileText,
  Printer,
  Search,
  Calendar,
  Filter,
  Eye,
  Trash2,
  Edit,
  ShoppingCart,
  Plus,
  User,
  CheckCircle,
  AlertCircle,
  Clock,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface Props {
  facturas: Factura[];
  productos: Producto[];
  clientes: Cliente[];
  vendedorActual: string;
  onGuardarFactura: (factura: Factura) => void;
  onAnularFactura: (id: string | number) => void;
  onGuardarCliente: (cliente: Cliente) => void;
}

export const AdminBilling: React.FC<Props> = ({
  facturas,
  productos,
  clientes,
  vendedorActual,
  onGuardarFactura,
  onAnularFactura,
  onGuardarCliente,
}) => {
  const [pestaña, setPestaña] = useState<'facturas' | 'pos'>('facturas');
  const [facturaSeleccionada, setFacturaSeleccionada] = useState<Factura | null>(null);

  // Filtros de facturas
  const [filtroFecha, setFiltroFecha] = useState(fechaHoyYMD());
  const [filtroCliente, setFiltroCliente] = useState('');
  const [filtroFormaPago, setFiltroFormaPago] = useState('');
  const [filtroVendedor, setFiltroVendedor] = useState('');
  const [busquedaTexto, setBusquedaTexto] = useState('');

  // POS State
  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
  const [busquedaCliente, setBusquedaCliente] = useState('');
  const [busquedaProducto, setBusquedaProducto] = useState('');
  const [formaPago, setFormaPago] = useState<FormaPago>('contado');
  const [montoRecibido, setMontoRecibido] = useState<string>('');
  const [mostrarNuevoCliente, setMostrarNuevoCliente] = useState(false);
  const [nuevoNombreCliente, setNuevoNombreCliente] = useState('');
  const [nuevoTelCliente, setNuevoTelCliente] = useState('');

  // Carrito helpers
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

  const modificarCantidad = (index: number, delta: number) => {
    const copy = [...carrito];
    const nueva = copy[index].cantidad + delta;
    if (nueva <= 0) {
      copy.splice(index, 1);
    } else {
      copy[index].cantidad = nueva;
    }
    setCarrito(copy);
  };

  const cambiarTipoPrecioItem = (index: number, nuevoTipo: TipoPrecio) => {
    const item = carrito[index];
    const prod = productos.find((p) => p.id === item.id);
    if (!prod) return;

    const nuevoPrecio = nuevoTipo === 'mayorista' ? Number(prod.precioMayorista) : Number(prod.precioDetalle);
    const copy = [...carrito];
    copy[index].tipoPrecio = nuevoTipo;
    copy[index].precio = nuevoPrecio;
    setCarrito(copy);
  };

  const totalVenta = carrito.reduce(
    (acc, item) => acc + Number(item.precio || 0) * Number(item.cantidad || 0),
    0
  );

  const cambioCalculado = Math.max(0, (Number(montoRecibido) || 0) - totalVenta);

  const handleCrearClienteExpress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoNombreCliente.trim()) return;
    const nuevo: Cliente = {
      id: Date.now(),
      nombre: nuevoNombreCliente.trim(),
      telefono: nuevoTelCliente.trim() || undefined,
    };
    onGuardarCliente(nuevo);
    setClienteSeleccionado(nuevo);
    setMostrarNuevoCliente(false);
    setNuevoNombreCliente('');
    setNuevoTelCliente('');
  };

  const handleFinalizarVenta = () => {
    if (carrito.length === 0) {
      alert('Agrega al menos un producto al carrito.');
      return;
    }

    if (!clienteSeleccionado) {
      alert('Selecciona un cliente antes de finalizar la venta.');
      return;
    }

    const recibido = Number(montoRecibido) || 0;
    if (formaPago === 'contado' && recibido < totalVenta && recibido !== 0) {
      alert('El monto recibido no puede ser menor al total en ventas al contado.');
      return;
    }

    // Verificar stock
    for (const item of carrito) {
      const prod = productos.find((p) => p.id === item.id);
      if (prod && Number(prod.stock || 0) < Number(item.cantidad || 0)) {
        if (!confirm(`El producto "${prod.nombre}" solo tiene ${prod.stock} unidades en stock (solicitas ${item.cantidad}). ¿Deseas continuar de todos modos?`)) {
          return;
        }
      }
    }

    const nuevaFactura: Factura = {
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
      vendedor: vendedorActual || 'Administrador',
      total: totalVenta,
      formaPago,
      montoRecibido: formaPago === 'contado' ? (recibido || totalVenta) : 0,
      cambio: formaPago === 'contado' ? (recibido ? Math.max(0, recibido - totalVenta) : 0) : 0,
      saldoCredito: formaPago === 'credito' ? totalVenta : 0,
      estado: 'emitida',
    };

    onGuardarFactura(nuevaFactura);

    // Animación de éxito
    try {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
    } catch {}

    // Limpiar POS
    setCarrito([]);
    setClienteSeleccionado(null);
    setMontoRecibido('');
    setBusquedaCliente('');
    setBusquedaProducto('');

    // Abrir detalle para imprimir
    setFacturaSeleccionada(nuevaFactura);
    setPestaña('facturas');
  };

  // Filtrado de lista de facturas
  const facturasFiltradas = facturas.filter((f) => {
    if (filtroFecha && String(f.fecha).substring(0, 10) !== filtroFecha) {
      return false;
    }
    if (filtroCliente && String(f.cliente?.id) !== filtroCliente) {
      return false;
    }
    if (filtroFormaPago && f.formaPago !== filtroFormaPago) {
      return false;
    }
    if (filtroVendedor && f.vendedor !== filtroVendedor) {
      return false;
    }
    if (busquedaTexto) {
      const q = busquedaTexto.toLowerCase();
      const matchNum = f.numero.toLowerCase().includes(q);
      const matchCli = f.cliente?.nombre?.toLowerCase().includes(q);
      const matchProd = f.productos?.some((p) => p.nombre.toLowerCase().includes(q));
      if (!matchNum && !matchCli && !matchProd) return false;
    }
    return true;
  }).sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

  // Lista de vendedores únicos para el filtro
  const vendedoresUnicos = [...new Set(facturas.map((f) => f.vendedor).filter(Boolean))];

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Switch entre Lista de Facturas y Nuevo POS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">Ventas & Facturas</h2>
            <p className="text-xs text-slate-500">
              Historial centralizado y punto de venta para la computadora de la administración
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-slate-100 p-1 rounded-xl flex items-center">
            <button
              onClick={() => setPestaña('facturas')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                pestaña === 'facturas' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Historial de Facturas
            </button>
            <button
              onClick={() => setPestaña('pos')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                pestaña === 'pos' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              + Crear Factura / POS
            </button>
          </div>

          <button
            onClick={() => imprimirVentasDelDia(facturasFiltradas, filtroFecha || fechaHoyYMD())}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Imprimir Ventas</span>
          </button>
        </div>
      </div>

      {pestaña === 'facturas' ? (
        /* PESTAÑA: HISTORIAL Y FILTROS */
        <div className="space-y-4">
          {/* Barra de Filtros */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Filtrar por Fecha</label>
              <input
                type="date"
                value={filtroFecha}
                onChange={(e) => setFiltroFecha(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">Cliente</label>
              <select
                value={filtroCliente}
                onChange={(e) => setFiltroCliente(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
              >
                <option value="">Todos los clientes</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">Forma de Pago</label>
              <select
                value={filtroFormaPago}
                onChange={(e) => setFiltroFormaPago(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
              >
                <option value="">Todas</option>
                <option value="contado">Contado</option>
                <option value="credito">Crédito</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">Vendedor</label>
              <select
                value={filtroVendedor}
                onChange={(e) => setFiltroVendedor(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
              >
                <option value="">Todos los vendedores</option>
                {vendedoresUnicos.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">Buscar Número o Texto</label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={busquedaTexto}
                  onChange={(e) => setBusquedaTexto(e.target.value)}
                  placeholder="FAC-0001..."
                  className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Tabla de Facturas */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            {facturasFiltradas.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-sm">
                <FileText className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                No se encontraron facturas con los filtros seleccionados.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600 border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-bold tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Factura</th>
                      <th className="py-3 px-3">Fecha & Hora</th>
                      <th className="py-3 px-3">Cliente</th>
                      <th className="py-3 px-3">Vendedor</th>
                      <th className="py-3 px-3">Pago</th>
                      <th className="py-3 px-3 text-center">Artículos</th>
                      <th className="py-3 px-3 text-right">Total</th>
                      <th className="py-3 px-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {facturasFiltradas.map((f) => {
                      const { fecha, hora } = formatearFechaHora(f.fecha);
                      const esCredito = String(f.formaPago || '').toLowerCase().includes('credito') || String(f.formaPago || '').toLowerCase().includes('crédito');
                      const saldo = f.saldoCredito !== undefined ? Number(f.saldoCredito) : Number(f.total || 0);

                      return (
                        <tr key={f.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4 font-bold text-slate-900">
                            <span className="font-mono text-emerald-800">{f.numero}</span>
                            {f.estado === 'anulada' && (
                              <span className="block text-[10px] text-red-600 font-bold">Anulada</span>
                            )}
                          </td>
                          <td className="py-3 px-3">
                            <div className="font-medium text-slate-800">{fecha}</div>
                            <div className="text-[11px] text-slate-400">{hora}</div>
                          </td>
                          <td className="py-3 px-3 font-semibold text-slate-800">
                            {f.cliente?.nombre || 'Sin cliente'}
                          </td>
                          <td className="py-3 px-3 text-slate-500">
                            {f.vendedor || '—'}
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`px-2 py-0.5 rounded-full font-bold text-[11px] uppercase ${
                                esCredito ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'
                              }`}
                            >
                              {f.formaPago}
                            </span>
                            {esCredito && saldo > 0 && (
                              <div className="text-[10px] text-red-600 font-bold mt-0.5">
                                Debe {formatearDinero(saldo)}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-3 text-center">
                            {f.productos?.length || 0}
                          </td>
                          <td className="py-3 px-3 text-right font-extrabold text-slate-900 text-sm">
                            {formatearDinero(f.total)}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="inline-flex items-center gap-1">
                              <button
                                onClick={() => setFacturaSeleccionada(f)}
                                className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                                title="Ver detalles y opciones de impresión"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => imprimirFacturaFormato(f, 'termica')}
                                className="p-1.5 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                                title="Imprimir ticket térmico JACL-P280"
                              >
                                <Printer className="w-4 h-4 text-emerald-700" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* PESTAÑA: POS / NUEVA VENTA DE ESCRITORIO */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Catálogo de Productos y Selector de Cliente */}
          <div className="lg:col-span-7 space-y-4">
            {/* Selector de Cliente */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-4 h-4 text-emerald-600" /> Seleccionar Cliente
                </label>
                <button
                  type="button"
                  onClick={() => setMostrarNuevoCliente(!mostrarNuevoCliente)}
                  className="text-xs text-emerald-700 font-bold hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> + Registrar Nuevo Cliente
                </button>
              </div>

              {mostrarNuevoCliente ? (
                <form onSubmit={handleCrearClienteExpress} className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 mb-3 space-y-2">
                  <div className="text-xs font-bold text-emerald-950">Registro Rápido de Cliente</div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Nombre del cliente *"
                      value={nuevoNombreCliente}
                      onChange={(e) => setNuevoNombreCliente(e.target.value)}
                      className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Teléfono (Opcional)"
                      value={nuevoTelCliente}
                      onChange={(e) => setNuevoTelCliente(e.target.value)}
                      className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setMostrarNuevoCliente(false)}
                      className="px-3 py-1 text-xs text-slate-500"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 bg-emerald-700 text-white font-bold rounded-lg text-xs"
                    >
                      Guardar y Seleccionar
                    </button>
                  </div>
                </form>
              ) : null}

              {clienteSeleccionado ? (
                <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                  <div>
                    <span className="text-xs text-emerald-700 font-medium">Cliente seleccionado:</span>
                    <div className="font-bold text-slate-900 text-sm">{clienteSeleccionado.nombre}</div>
                    {clienteSeleccionado.telefono && (
                      <div className="text-xs text-slate-500">Tel: {clienteSeleccionado.telefono}</div>
                    )}
                  </div>
                  <button
                    onClick={() => setClienteSeleccionado(null)}
                    className="text-xs text-red-600 font-bold hover:underline"
                  >
                    Cambiar
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={busquedaCliente}
                    onChange={(e) => setBusquedaCliente(e.target.value)}
                    placeholder="Escribe el nombre del cliente para buscar..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  />
                  {busquedaCliente && (
                    <div className="max-h-36 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 bg-white">
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
                            className="p-2 text-xs font-semibold hover:bg-emerald-50 cursor-pointer flex justify-between items-center"
                          >
                            <span>{c.nombre}</span>
                            <span className="text-slate-400 text-[11px]">{c.telefono || 'Sin tel.'}</span>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Búsqueda y Catálogo de Productos */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Catálogo de Productos
                </span>
                <span className="text-xs text-slate-400">{productos.length} disponibles</span>
              </div>

              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={busquedaProducto}
                  onChange={(e) => setBusquedaProducto(e.target.value)}
                  placeholder="Buscar producto por nombre o código..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[380px] overflow-y-auto pr-1">
                {productos
                  .filter(
                    (p) =>
                      !busquedaProducto ||
                      p.nombre.toLowerCase().includes(busquedaProducto.toLowerCase()) ||
                      (p.codigo && p.codigo.toLowerCase().includes(busquedaProducto.toLowerCase()))
                  )
                  .map((prod) => (
                    <div
                      key={prod.id}
                      className="p-3 rounded-xl border border-slate-200 hover:border-emerald-500 bg-white flex flex-col justify-between transition-all"
                    >
                      <div>
                        <div className="font-bold text-slate-900 text-xs truncate">{prod.nombre}</div>
                        <div className="text-[11px] text-slate-500 flex justify-between mt-0.5">
                          <span>Cód: {prod.codigo || '—'}</span>
                          <span className={`font-semibold ${Number(prod.stock || 0) <= 5 ? 'text-amber-600' : 'text-slate-600'}`}>
                            Stock: {prod.stock}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-1.5 mt-2.5 pt-2 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => agregarAlCarrito(prod, 'mayorista')}
                          className="py-1.5 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold text-[11px] rounded-lg text-center transition-colors"
                        >
                          Mayorista<br />
                          {formatearDinero(prod.precioMayorista)}
                        </button>
                        <button
                          type="button"
                          onClick={() => agregarAlCarrito(prod, 'detalle')}
                          className="py-1.5 px-2 bg-blue-50 hover:bg-blue-100 text-blue-900 font-bold text-[11px] rounded-lg text-center transition-colors"
                        >
                          Detalle<br />
                          {formatearDinero(prod.precioDetalle)}
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Carrito y Cobro */}
          <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-emerald-600" /> Carrito de Venta
                </h3>
                {carrito.length > 0 && (
                  <button
                    onClick={() => setCarrito([])}
                    className="text-xs text-red-500 hover:underline"
                  >
                    Vaciar
                  </button>
                )}
              </div>

              {carrito.length === 0 ? (
                <div className="py-10 text-center text-slate-400 text-xs">
                  Agrega productos desde el catálogo para iniciar la venta.
                </div>
              ) : (
                <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                  {carrito.map((item, idx) => (
                    <div key={idx} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                      <div className="flex justify-between items-start">
                        <strong className="text-slate-800 font-semibold truncate max-w-[180px]">
                          {item.nombre}
                        </strong>
                        <button
                          onClick={() => modificarCantidad(idx, -item.cantidad)}
                          className="text-slate-400 hover:text-red-500"
                        >
                          ×
                        </button>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <select
                          value={item.tipoPrecio}
                          onChange={(e) => cambiarTipoPrecioItem(idx, e.target.value as TipoPrecio)}
                          className="px-1.5 py-1 bg-white border border-slate-200 rounded text-[11px]"
                        >
                          <option value="mayorista">Mayorista</option>
                          <option value="detalle">Detalle</option>
                        </select>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => modificarCantidad(idx, -1)}
                            className="w-6 h-6 rounded bg-slate-200 font-bold flex items-center justify-center hover:bg-slate-300"
                          >
                            -
                          </button>
                          <span className="font-bold w-6 text-center">{item.cantidad}</span>
                          <button
                            onClick={() => modificarCantidad(idx, 1)}
                            className="w-6 h-6 rounded bg-slate-200 font-bold flex items-center justify-center hover:bg-slate-300"
                          >
                            +
                          </button>
                        </div>

                        <span className="font-bold text-slate-900 text-right">
                          {formatearDinero(item.precio * item.cantidad)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Panel de Pago y Cierre */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div className="flex justify-between items-center text-lg font-black text-slate-900">
                <span>TOTAL:</span>
                <span className="text-emerald-900 text-xl">{formatearDinero(totalVenta)}</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Forma de Pago</label>
                  <select
                    value={formaPago}
                    onChange={(e) => setFormaPago(e.target.value as FormaPago)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  >
                    <option value="contado">Contado</option>
                    <option value="credito">Crédito</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    {formaPago === 'contado' ? 'Monto Recibido' : 'Saldo Inicial'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    disabled={formaPago === 'credito'}
                    value={formaPago === 'credito' ? '' : montoRecibido}
                    onChange={(e) => setMontoRecibido(e.target.value)}
                    placeholder={formaPago === 'contado' ? formatearDinero(totalVenta) : 'A Crédito'}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  />
                </div>
              </div>

              {formaPago === 'contado' && Number(montoRecibido) > 0 && (
                <div className="flex justify-between items-center text-xs p-2 bg-emerald-50 rounded-lg text-emerald-900 font-bold">
                  <span>Cambio / Devuelta:</span>
                  <span>{formatearDinero(cambioCalculado)}</span>
                </div>
              )}

              <button
                onClick={handleFinalizarVenta}
                disabled={carrito.length === 0}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2"
              >
                <span>Finalizar y Emitir Factura</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Detalle de Factura */}
      {facturaSeleccionada && (
        <InvoiceDetailModal
          factura={facturaSeleccionada}
          onClose={() => setFacturaSeleccionada(null)}
          onAnular={(id) => {
            if (confirm('¿Seguro que deseas anular esta factura?')) {
              onAnularFactura(id);
              setFacturaSeleccionada(null);
            }
          }}
        />
      )}
    </div>
  );
};
