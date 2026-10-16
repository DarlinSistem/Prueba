import React from 'react';
import { ResumenVentas, Factura, Producto } from '../../types';
import { formatearDinero } from '../../services/storageService';
import { imprimirVentasDelDia } from '../common/PrintInvoice';
import {
  TrendingUp,
  Calendar,
  CreditCard,
  Package,
  FileText,
  DollarSign,
  Printer,
  Users,
  ShoppingCart,
  AlertTriangle,
  ArrowUpRight,
  Clock
} from 'lucide-react';

interface Props {
  resumen: ResumenVentas;
  facturas: Factura[];
  productos: Producto[];
  onNavegar: (seccion: 'dashboard' | 'inventario' | 'ventas' | 'creditos' | 'clientes' | 'vendedores') => void;
  fechaHoy: string;
}

export const AdminDashboard: React.FC<Props> = ({
  resumen,
  facturas,
  productos,
  onNavegar,
  fechaHoy,
}) => {
  const facturasHoy = facturas.filter(
    (f) => String(f.fecha || '').substring(0, 10) === fechaHoy && f.estado !== 'anulada'
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Título y Acciones Principales */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              Panel Administrativo
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
              Modo PC / Dueño
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> Métricas del negocio actualizadas en tiempo real con Supabase • Fecha: {fechaHoy}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => imprimirVentasDelDia(facturasHoy, fechaHoy)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-all"
          >
            <Printer className="w-4 h-4 text-emerald-400" />
            Imprimir Ventas del Día
          </button>

          <button
            onClick={() => onNavegar('ventas')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all"
          >
            <ShoppingCart className="w-4 h-4" />
            Nueva Venta / POS
          </button>
        </div>
      </div>

      {/* Tarjetas Principales de Períodos de Ventas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Hoy */}
        <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-xs relative overflow-hidden group hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ventas de Hoy</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-900 mt-2">
            {formatearDinero(resumen.hoy)}
          </div>
          <div className="text-xs text-slate-500 mt-1 flex items-center justify-between">
            <span>{resumen.cantidadFacturasHoy} factura(s) hoy</span>
            <span className="text-emerald-700 font-semibold">{formatearDinero(resumen.contadoHoy)} contado</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500"></div>
        </div>

        {/* Semana */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden group hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Esta Semana</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-800 mt-2">
            {formatearDinero(resumen.semana)}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Desde el inicio de semana
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500"></div>
        </div>

        {/* Quincena */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden group hover:border-indigo-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Esta Quincena</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-800 mt-2">
            {formatearDinero(resumen.quincena)}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Período quincenal en curso
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-500"></div>
        </div>

        {/* Mes */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden group hover:border-purple-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ventas del Mes</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-800 mt-2">
            {formatearDinero(resumen.mes)}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Acumulado mensual
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-purple-500"></div>
        </div>
      </div>

      {/* KPIs de Créditos, Cobranzas e Inventario */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Cuentas por Cobrar */}
        <div
          onClick={() => onNavegar('creditos')}
          className="bg-gradient-to-br from-amber-50 to-orange-50/50 p-5 rounded-2xl border border-amber-200/80 shadow-xs cursor-pointer hover:shadow-md transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-amber-700" />
              <span className="text-xs font-bold text-amber-900 uppercase">Cuentas por Cobrar</span>
            </div>
            <ArrowUpRight className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-950 mt-2">
            {formatearDinero(resumen.deudaTotalPendiente)}
          </div>
          <p className="text-xs text-amber-800 mt-1">
            Créditos pendientes de cobro a clientes
          </p>
        </div>

        {/* Cobros / Abonos Recaudados Hoy */}
        <div
          onClick={() => onNavegar('creditos')}
          className="bg-gradient-to-br from-emerald-50 to-teal-50/50 p-5 rounded-2xl border border-emerald-200/80 shadow-xs cursor-pointer hover:shadow-md transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-700" />
              <span className="text-xs font-bold text-emerald-900 uppercase">Cobros Recibidos Hoy</span>
            </div>
            <ArrowUpRight className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-950 mt-2">
            {formatearDinero(resumen.cobrosHoy)}
          </div>
          <p className="text-xs text-emerald-800 mt-1">
            Dinero ingresado por abonos a deudas hoy
          </p>
        </div>

        {/* Alerta de Stock Bajo */}
        <div
          onClick={() => onNavegar('inventario')}
          className={`p-5 rounded-2xl border shadow-xs cursor-pointer hover:shadow-md transition-all ${
            resumen.productosBajoStock > 0
              ? 'bg-rose-50/80 border-rose-200 text-rose-950'
              : 'bg-white border-slate-200 text-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className={`w-4 h-4 ${resumen.productosBajoStock > 0 ? 'text-rose-600' : 'text-slate-400'}`} />
              <span className="text-xs font-bold uppercase">Alertas de Stock</span>
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black mt-2">
            {resumen.productosBajoStock}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {resumen.productosBajoStock > 0 ? 'Productos con 5 o menos unidades' : 'Inventario en niveles óptimos'}
          </p>
        </div>
      </div>

      {/* Botones de Menú Rápido Administrativo */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
          Accesos Rápidos de Administración
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <button
            onClick={() => onNavegar('inventario')}
            className="p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 text-center transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
              <Package className="w-5 h-5" />
            </div>
            <span className="font-bold text-xs text-slate-700 group-hover:text-emerald-900 block">Inventario</span>
            <span className="text-[10px] text-slate-400">{productos.length} productos</span>
          </button>

          <button
            onClick={() => onNavegar('ventas')}
            className="p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 text-center transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <span className="font-bold text-xs text-slate-700 group-hover:text-blue-900 block">Facturas</span>
            <span className="text-[10px] text-slate-400">{facturas.length} registradas</span>
          </button>

          <button
            onClick={() => onNavegar('creditos')}
            className="p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 text-center transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
              <CreditCard className="w-5 h-5" />
            </div>
            <span className="font-bold text-xs text-slate-700 group-hover:text-amber-900 block">Créditos y Cobros</span>
            <span className="text-[10px] text-slate-400">Cobranzas</span>
          </button>

          <button
            onClick={() => onNavegar('clientes')}
            className="p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 text-center transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <span className="font-bold text-xs text-slate-700 group-hover:text-indigo-900 block">Clientes</span>
            <span className="text-[10px] text-slate-400">Directorio</span>
          </button>

          <button
            onClick={() => onNavegar('vendedores')}
            className="p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 text-center transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <span className="font-bold text-xs text-slate-700 group-hover:text-teal-900 block">Vendedores</span>
            <span className="text-[10px] text-slate-400">Cierres del día</span>
          </button>

          <button
            onClick={() => imprimirVentasDelDia(facturasHoy, fechaHoy)}
            className="p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 text-center transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
              <Printer className="w-5 h-5" />
            </div>
            <span className="font-bold text-xs text-slate-700 group-hover:text-purple-900 block">Imprimir Resumen</span>
            <span className="text-[10px] text-slate-400">Cierre de hoy</span>
          </button>
        </div>
      </div>
    </div>
  );
};
