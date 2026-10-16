import React, { useState } from 'react';
import { Factura, AbonoCredito, EstadoSincronizacion } from '../../types';
import { formatearDinero, fechaHoyYMD, LOGO_BASE64 } from '../../services/storageService';
import { User, DollarSign, FileText, RefreshCw, Smartphone, Monitor, Edit3, CheckCircle2, ShieldCheck } from 'lucide-react';

interface Props {
  vendedorActual: string;
  onEditarVendedor: () => void;
  facturas: Factura[];
  abonos: AbonoCredito[];
  syncState: EstadoSincronizacion;
  onSincronizarManual: () => void;
  onCambiarModoPC: () => void;
}

export const MobileProfile: React.FC<Props> = ({
  vendedorActual,
  onEditarVendedor,
  facturas,
  abonos,
  syncState,
  onSincronizarManual,
  onCambiarModoPC,
}) => {
  const hoyYMD = fechaHoyYMD();

  const facturasHoy = facturas.filter(
    (f) =>
      f.estado !== 'anulada' &&
      f.vendedor === vendedorActual &&
      String(f.fecha).substring(0, 10) === hoyYMD
  );

  const totalVendidoHoy = facturasHoy.reduce((acc, f) => acc + Number(f.total || 0), 0);
  const totalContado = facturasHoy
    .filter((f) => f.formaPago === 'contado')
    .reduce((acc, f) => acc + Number(f.total || 0), 0);
  const totalCredito = facturasHoy
    .filter((f) => f.formaPago === 'credito')
    .reduce((acc, f) => acc + Number(f.total || 0), 0);

  const totalCobradoHoy = abonos
    .filter((ab) => ab.vendedor === vendedorActual && String(ab.fecha).substring(0, 10) === hoyYMD)
    .reduce((acc, ab) => acc + Number(ab.monto || 0), 0);

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-150">
      {/* Tarjeta de Vendedor */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs text-center space-y-3">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 font-black text-2xl flex items-center justify-center mx-auto shadow-inner">
          {vendedorActual ? vendedorActual.charAt(0).toUpperCase() : 'V'}
        </div>
        <div>
          <h3 className="font-extrabold text-base text-slate-900">{vendedorActual}</h3>
          <span className="text-xs text-slate-400 font-medium">Vendedor Autorizado • RODRIGUEZ PERALTA</span>
        </div>

        <button
          onClick={onEditarVendedor}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
        >
          <Edit3 className="w-3.5 h-3.5" /> Cambiar Nombre de Factura
        </button>
      </div>

      {/* Cierre Personal de Hoy */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex justify-between items-center border-b border-slate-100 pb-2">
          <span className="text-xs font-bold text-slate-600 uppercase">Tu Cierre de Hoy ({hoyYMD})</span>
          <span className="text-xs text-emerald-700 font-bold">{facturasHoy.length} ventas</span>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between items-center p-2.5 bg-emerald-50 rounded-xl">
            <span className="text-emerald-900 font-medium">Total vendido hoy:</span>
            <strong className="text-emerald-950 font-black text-sm">{formatearDinero(totalVendidoHoy)}</strong>
          </div>
          <div className="flex justify-between items-center py-1 text-slate-600">
            <span>• Ventas al contado:</span>
            <span className="font-bold">{formatearDinero(totalContado)}</span>
          </div>
          <div className="flex justify-between items-center py-1 text-slate-600">
            <span>• Ventas a crédito:</span>
            <span className="font-bold text-amber-700">{formatearDinero(totalCredito)}</span>
          </div>
          <div className="flex justify-between items-center py-1.5 border-t border-slate-100 text-slate-700 font-medium">
            <span>Cobros / Abonos recaudados:</span>
            <strong className="text-emerald-700 font-bold">{formatearDinero(totalCobradoHoy)}</strong>
          </div>
        </div>
      </div>

      {/* Estado y Sincronización */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700">Estado de la Base de Datos</span>
          <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full">
            Supabase Conectado
          </span>
        </div>
        <p className="text-xs text-slate-500">
          {syncState.mensaje}
        </p>
        <button
          onClick={onSincronizarManual}
          disabled={syncState.sincronizando}
          className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${syncState.sincronizando ? 'animate-spin' : ''}`} />
          <span>Sincronizar Datos Ahora</span>
        </button>
      </div>

      {/* Cambio a Vista PC */}
      <button
        onClick={onCambiarModoPC}
        className="w-full py-3 px-4 rounded-2xl border-2 border-emerald-600 text-emerald-800 font-bold text-xs flex items-center justify-center gap-2 hover:bg-emerald-50 transition-colors"
      >
        <Monitor className="w-4 h-4" />
        <span>Cambiar a Vista de PC / Administrador</span>
      </button>
    </div>
  );
};
