import React, { useState } from 'react';
import {
  Producto,
  Cliente,
  Factura,
  AbonoCredito,
  ResumenVentas,
  EstadoSincronizacion,
  Usuario,
} from '../../types';
import { AdminDashboard } from './AdminDashboard';
import { AdminInventory } from './AdminInventory';
import { AdminBilling } from './AdminBilling';
import { AdminCredits } from './AdminCredits';
import { AdminCustomers } from './AdminCustomers';
import { AdminSellersReport } from './AdminSellersReport';
import {
  LayoutDashboard,
  Package,
  FileText,
  CreditCard,
  Users,
  UserCheck,
  TrendingUp,
  AlertTriangle,
  Smartphone,
  ChevronRight
} from 'lucide-react';

interface Props {
  resumen: ResumenVentas;
  productos: Producto[];
  clientes: Cliente[];
  facturas: Factura[];
  abonos: AbonoCredito[];
  usuarios: Usuario[];
  vendedorActual: string;
  fechaHoy: string;
  onGuardarProducto: (prod: Producto) => void;
  onEliminarProducto: (id: string | number) => void;
  onGuardarFactura: (factura: Factura) => void;
  onAnularFactura: (id: string | number) => void;
  onGuardarCliente: (cliente: Cliente) => void;
  onEliminarCliente: (id: string | number) => void;
  onRegistrarAbono: (abono: AbonoCredito) => void;
  onGuardarUsuario: (usuario: Usuario) => void;
  onEliminarUsuario: (id: string | number) => void;
  onCambiarModoMovil: () => void;
}

export type SeccionAdmin = 'dashboard' | 'inventario' | 'ventas' | 'creditos' | 'clientes' | 'vendedores';

export const AdminLayout: React.FC<Props> = ({
  resumen,
  productos,
  clientes,
  facturas,
  abonos,
  usuarios,
  vendedorActual,
  fechaHoy,
  onGuardarProducto,
  onEliminarProducto,
  onGuardarFactura,
  onAnularFactura,
  onGuardarCliente,
  onEliminarCliente,
  onRegistrarAbono,
  onGuardarUsuario,
  onEliminarUsuario,
  onCambiarModoMovil,
}) => {
  const [seccion, setSeccion] = useState<SeccionAdmin>('dashboard');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Barra Lateral de Navegación PC */}
        <aside className="lg:col-span-3 space-y-4">
          <nav className="bg-white rounded-2xl border border-slate-200 p-3 shadow-xs space-y-1">
            <button
              onClick={() => setSeccion('dashboard')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                seccion === 'dashboard'
                  ? 'bg-emerald-950 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <LayoutDashboard className="w-4 h-4 text-emerald-400" />
                <span>Panel Principal</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            </button>

            <button
              onClick={() => setSeccion('inventario')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                seccion === 'inventario'
                  ? 'bg-emerald-950 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Package className="w-4 h-4 text-emerald-400" />
                <span>Inventario & Stock</span>
              </div>
              {resumen.productosBajoStock > 0 ? (
                <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center font-black">
                  {resumen.productosBajoStock}
                </span>
              ) : (
                <span className="text-[11px] text-slate-400">{productos.length}</span>
              )}
            </button>

            <button
              onClick={() => setSeccion('ventas')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                seccion === 'ventas'
                  ? 'bg-emerald-950 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>Facturas & POS</span>
              </div>
              <span className="text-[11px] text-slate-400">{facturas.length}</span>
            </button>

            <button
              onClick={() => setSeccion('creditos')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                seccion === 'creditos'
                  ? 'bg-emerald-950 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <CreditCard className="w-4 h-4 text-emerald-400" />
                <span>Créditos & Cobros</span>
              </div>
              {resumen.deudaTotalPendiente > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-red-100 text-red-700 text-[10px] font-bold">
                  Cobrar
                </span>
              )}
            </button>

            <button
              onClick={() => setSeccion('clientes')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                seccion === 'clientes'
                  ? 'bg-emerald-950 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4 text-emerald-400" />
                <span>Clientes</span>
              </div>
              <span className="text-[11px] text-slate-400">{clientes.length}</span>
            </button>

            <button
              onClick={() => setSeccion('vendedores')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                seccion === 'vendedores'
                  ? 'bg-emerald-950 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <UserCheck className="w-4 h-4 text-emerald-400" />
                <span>Vendedores & Cierres</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            </button>
          </nav>

          {/* Tarjeta de Acceso Móvil */}
          <div className="bg-gradient-to-br from-emerald-900 to-emerald-950 text-white p-4 rounded-2xl shadow-sm space-y-2.5">
            <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold">
              <Smartphone className="w-4 h-4" />
              <span>Vista de Vendedores en Calle</span>
            </div>
            <p className="text-xs text-emerald-100/80 leading-relaxed">
              Tus vendedores acceden en sus celulares a la versión simplificada (solo Venta, Clientes, Facturas y Cobros).
            </p>
            <button
              onClick={onCambiarModoMovil}
              className="w-full py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-extrabold text-xs transition-colors"
            >
              Abrir Vista Móvil de Vendedores
            </button>
          </div>
        </aside>

        {/* Área de Contenido Principal PC */}
        <main className="lg:col-span-9">
          {seccion === 'dashboard' && (
            <AdminDashboard
              resumen={resumen}
              facturas={facturas}
              productos={productos}
              onNavegar={(s) => setSeccion(s)}
              fechaHoy={fechaHoy}
            />
          )}

          {seccion === 'inventario' && (
            <AdminInventory
              productos={productos}
              onGuardarProducto={onGuardarProducto}
              onEliminarProducto={onEliminarProducto}
            />
          )}

          {seccion === 'ventas' && (
            <AdminBilling
              facturas={facturas}
              productos={productos}
              clientes={clientes}
              vendedorActual={vendedorActual}
              onGuardarFactura={onGuardarFactura}
              onAnularFactura={onAnularFactura}
              onGuardarCliente={onGuardarCliente}
            />
          )}

          {seccion === 'creditos' && (
            <AdminCredits
              facturas={facturas}
              abonos={abonos}
              clientes={clientes}
              vendedorActual={vendedorActual}
              onRegistrarAbono={onRegistrarAbono}
            />
          )}

          {seccion === 'clientes' && (
            <AdminCustomers
              clientes={clientes}
              facturas={facturas}
              onGuardarCliente={onGuardarCliente}
              onEliminarCliente={onEliminarCliente}
            />
          )}

          {seccion === 'vendedores' && (
            <AdminSellersReport
              facturas={facturas}
              abonos={abonos}
              usuarios={usuarios}
              onGuardarUsuario={onGuardarUsuario}
              onEliminarUsuario={onEliminarUsuario}
            />
          )}
        </main>
      </div>
    </div>
  );
};
