import React, { useState } from 'react';
import { Producto } from './types';
import { formatearDinero } from './storageService';
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  AlertTriangle,
  ArrowUpDown,
  TrendingUp,
  Tag,
  CheckCircle2,
  X,
  Layers,
  Sparkles
} from 'lucide-react';

interface Props {
  productos: Producto[];
  onGuardarProducto: (prod: Producto) => void;
  onEliminarProducto: (id: string | number) => void;
}

export const AdminInventory: React.FC<Props> = ({
  productos,
  onGuardarProducto,
  onEliminarProducto,
}) => {
  const [busqueda, setBusqueda] = useState('');
  const [filtroStock, setFiltroStock] = useState<'todos' | 'bajo' | 'agotado'>('todos');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [productoEditando, setProductoEditando] = useState<Producto | null>(null);

  // Formulario fields
  const [nombre, setNombre] = useState('');
  const [codigo, setCodigo] = useState('');
  const [precioMayorista, setPrecioMayorista] = useState('');
  const [precioDetalle, setPrecioDetalle] = useState('');
  const [costo, setCosto] = useState('');
  const [stock, setStock] = useState('');
  const [stockMinimo, setStockMinimo] = useState('5');
  const [categoria, setCategoria] = useState('');

  const abrirModalNuevo = () => {
    setProductoEditando(null);
    setNombre('');
    setCodigo('');
    setPrecioMayorista('');
    setPrecioDetalle('');
    setCosto('');
    setStock('');
    setStockMinimo('5');
    setCategoria('');
    setModalAbierto(true);
  };

  const abrirModalEditar = (prod: Producto) => {
    setProductoEditando(prod);
    setNombre(prod.nombre);
    setCodigo(prod.codigo || '');
    setPrecioMayorista(String(prod.precioMayorista));
    setPrecioDetalle(String(prod.precioDetalle));
    setCosto(prod.costo ? String(prod.costo) : '');
    setStock(String(prod.stock));
    setStockMinimo(prod.stockMinimo !== undefined ? String(prod.stockMinimo) : '5');
    setCategoria(prod.categoria || '');
    setModalAbierto(true);
  };

  const handleGuardar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) {
      alert('Por favor escribe el nombre del producto.');
      return;
    }

    const pm = Number(precioMayorista) || 0;
    const pd = Number(precioDetalle) || 0;
    const st = Number(stock) || 0;
    const co = costo ? Number(costo) : undefined;
    const sm = stockMinimo ? Number(stockMinimo) : 5;

    const productoFinal: Producto = {
      id: productoEditando ? productoEditando.id : Date.now(),
      nombre: nombre.trim(),
      codigo: codigo.trim() || undefined,
      precioMayorista: pm,
      precioDetalle: pd,
      costo: co,
      stock: st,
      stockMinimo: sm,
      categoria: categoria.trim() || undefined,
      activo: true,
    };

    onGuardarProducto(productoFinal);
    setModalAbierto(false);
  };

  // Filtrado de inventario
  const productosFiltrados = productos.filter((p) => {
    const q = busqueda.toLowerCase().trim();
    const coincideTexto =
      !q ||
      p.nombre.toLowerCase().includes(q) ||
      (p.codigo && p.codigo.toLowerCase().includes(q)) ||
      (p.categoria && p.categoria.toLowerCase().includes(q));

    if (!coincideTexto) return false;

    if (filtroStock === 'agotado') return Number(p.stock || 0) <= 0;
    if (filtroStock === 'bajo') return Number(p.stock || 0) > 0 && Number(p.stock || 0) <= Number(p.stockMinimo ?? 5);
    return true;
  });

  // Métricas de inventario
  const totalArticulos = productos.length;
  const unidadesTotales = productos.reduce((acc, p) => acc + Number(p.stock || 0), 0);
  const valorInventario = productos.reduce(
    (acc, p) => acc + Number(p.precioDetalle || 0) * Number(p.stock || 0),
    0
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Cabecera y Resumen de Inventario */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-900">Control de Inventario</h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              Sincronizado con Vendedores
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Cualquier producto que agregues o modifiques aquí estará disponible de inmediato en la app móvil del vendedor.
          </p>
        </div>

        <button
          onClick={abrirModalNuevo}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-bold text-white text-xs shadow-md transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          + Agregar Nuevo Producto
        </button>
      </div>

      {/* Mini KPIs de Almacén */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-slate-500">Productos Registrados</span>
            <div className="text-2xl font-black text-slate-800 mt-0.5">{totalArticulos}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-slate-500">Unidades en Almacén</span>
            <div className="text-2xl font-black text-slate-800 mt-0.5">{unidadesTotales}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-slate-500">Valor Estimado (Detalle)</span>
            <div className="text-2xl font-black text-emerald-900 mt-0.5">{formatearDinero(valorInventario)}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre, código o categoría..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-emerald-600 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setFiltroStock('todos')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filtroStock === 'todos' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todos ({productos.length})
          </button>
          <button
            onClick={() => setFiltroStock('bajo')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filtroStock === 'bajo' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Bajo Stock
          </button>
          <button
            onClick={() => setFiltroStock('agotado')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filtroStock === 'agotado' ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Agotados
          </button>
        </div>
      </div>

      {/* Tabla de Productos */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {productosFiltrados.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            <Package className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            No se encontraron productos con los criterios de búsqueda.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase tracking-wider font-bold">
                <tr>
                  <th className="py-3 px-4">Producto</th>
                  <th className="py-3 px-3">Código</th>
                  <th className="py-3 px-3 text-right">Precio Mayorista</th>
                  <th className="py-3 px-3 text-right">Precio Detalle</th>
                  <th className="py-3 px-3 text-center">Stock Actual</th>
                  <th className="py-3 px-3 text-center">Estado</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {productosFiltrados.map((p) => {
                  const stockNum = Number(p.stock || 0);
                  const minNum = Number(p.stockMinimo ?? 5);
                  const esAgotado = stockNum <= 0;
                  const esBajo = !esAgotado && stockNum <= minNum;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {p.nombre}
                        {p.categoria && (
                          <span className="block text-[11px] font-normal text-slate-400 mt-0.5">
                            {p.categoria}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-500">
                        {p.codigo || '—'}
                      </td>
                      <td className="py-3 px-3 text-right font-semibold text-emerald-800">
                        {formatearDinero(p.precioMayorista)}
                      </td>
                      <td className="py-3 px-3 text-right font-semibold text-slate-900">
                        {formatearDinero(p.precioDetalle)}
                      </td>
                      <td className="py-3 px-3 text-center font-bold">
                        <span className={`px-2 py-0.5 rounded-full ${esAgotado ? 'bg-rose-100 text-rose-800' : esBajo ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-800'}`}>
                          {stockNum}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        {esAgotado ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                            Agotado
                          </span>
                        ) : esBajo ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                            <AlertTriangle className="w-3 h-3" /> Bajo Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                            Disponible
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => abrirModalEditar(p)}
                            className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Editar producto"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`¿Eliminar el producto "${p.nombre}"?`)) {
                                onEliminarProducto(p.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Eliminar producto"
                          >
                            <Trash2 className="w-4 h-4" />
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

      {/* Modal para Crear o Editar Producto */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-base text-slate-800">
                  {productoEditando ? 'Editar Producto' : 'Registrar Nuevo Producto'}
                </h3>
              </div>
              <button
                onClick={() => setModalAbierto(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGuardar} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nombre del Producto *
                </label>
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej: Arroz Selecto 10 lb, Aceite de Soya 1 Galón"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">
                    Código de Barra / SKU
                  </label>
                  <input
                    type="text"
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value)}
                    placeholder="Ej: 001 o código de barra"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">
                    Categoría (Opcional)
                  </label>
                  <input
                    type="text"
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                    placeholder="Ej: Granos, Aceites, Enlatados"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block font-bold text-emerald-800 uppercase tracking-wider mb-1">
                    Precio 1 / Mayorista (RD$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={precioMayorista}
                    onChange={(e) => setPrecioMayorista(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3 py-2 bg-emerald-50/50 border border-emerald-200 rounded-xl text-sm font-bold text-emerald-950 focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 uppercase tracking-wider mb-1">
                    Precio 2 / Detalle (RD$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={precioDetalle}
                    onChange={(e) => setPrecioDetalle(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">
                    Costo (RD$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={costo}
                    onChange={(e) => setCosto(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Stock en Almacén *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">
                    Alerta Stock Mínimo
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={stockMinimo}
                    onChange={(e) => setStockMinimo(e.target.value)}
                    placeholder="5"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setModalAbierto(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-bold text-white shadow-md transition-colors"
                >
                  {productoEditando ? 'Guardar Cambios' : '+ Agregar a Inventario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
