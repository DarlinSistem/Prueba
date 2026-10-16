import React, { useState } from 'react';
import { Factura, AbonoCredito, Cliente } from '../../types';
import { formatearDinero, formatearFechaHora } from '../../services/storageService';
import { PaymentReceiptModal } from '../common/PaymentReceiptModal';
import { Search, DollarSign, CreditCard, Receipt, Phone, User, CheckCircle } from 'lucide-react';

interface Props {
  facturas: Factura[];
  abonos: AbonoCredito[];
  clientes: Cliente[];
  vendedorActual: string;
  onRegistrarAbono: (abono: AbonoCredito) => void;
}

export const MobileCollections: React.FC<Props> = ({
  facturas,
  abonos,
  clientes,
  vendedorActual,
  onRegistrarAbono,
}) => {
  const [busqueda, setBusqueda] = useState('');
  const [facturaSeleccionada, setFacturaSeleccionada] = useState<Factura | null>(null);

  // Filtrar facturas a crédito pendientes
  const facturasPendientes = facturas.filter((f) => {
    if (f.estado === 'anulada') return false;
    const esCredito =
      String(f.formaPago).toLowerCase().includes('credito') ||
      String(f.formaPago).toLowerCase().includes('crédito');
    if (!esCredito) return false;

    const saldo = f.saldoCredito !== undefined ? Number(f.saldoCredito) : Number(f.total || 0);
    if (saldo <= 0) return false;

    if (busqueda) {
      const q = busqueda.toLowerCase().trim();
      const matchCli = f.cliente?.nombre?.toLowerCase().includes(q);
      const matchNum = f.numero.toLowerCase().includes(q);
      if (!matchCli && !matchNum) return false;
    }
    return true;
  });

  const deudaTotal = facturasPendientes.reduce((acc, f) => {
    const s = f.saldoCredito !== undefined ? Number(f.saldoCredito) : Number(f.total || 0);
    return acc + Math.max(0, s);
  }, 0);

  return (
    <div className="space-y-3 pb-24 animate-in fade-in duration-150">
      {/* Banner de Total por Cobrar en la Calle */}
      <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-white p-4 rounded-2xl shadow-sm space-y-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-amber-100 flex items-center gap-1.5">
          <CreditCard className="w-4 h-4" /> Cobranzas en Ruta
        </span>
        <div className="text-2xl font-black">{formatearDinero(deudaTotal)}</div>
        <div className="text-xs text-amber-100/90">
          {facturasPendientes.length} crédito(s) pendiente(s) de cobro
        </div>
      </div>

      {/* Buscador */}
      <div className="sticky top-14 z-20 bg-slate-50 pt-1 pb-2">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por cliente o factura..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-semibold shadow-xs focus:border-emerald-600 focus:outline-hidden"
          />
        </div>
      </div>

      {/* Lista de Cuentas por Cobrar */}
      <div className="space-y-2.5">
        {facturasPendientes.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
            <CheckCircle className="w-8 h-8 mx-auto text-emerald-500 mb-1" />
            ¡No hay créditos pendientes por cobrar!
          </div>
        ) : (
          facturasPendientes.map((f) => {
            const saldo = f.saldoCredito !== undefined ? Number(f.saldoCredito) : Number(f.total || 0);
            const { fecha } = formatearFechaHora(f.fecha);

            return (
              <div
                key={f.id}
                className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-xs font-bold text-slate-400">{f.numero} • {fecha}</span>
                    <h4 className="font-extrabold text-slate-900 text-sm mt-0.5">{f.cliente?.nombre}</h4>
                    {f.cliente?.telefono && (
                      <a
                        href={`tel:${f.cliente.telefono}`}
                        className="text-xs text-slate-500 hover:text-emerald-700 flex items-center gap-1 mt-0.5"
                      >
                        <Phone className="w-3 h-3" /> {f.cliente.telefono}
                      </a>
                    )}
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] font-bold text-slate-400 block">Debe</span>
                    <span className="text-base font-black text-red-600">{formatearDinero(saldo)}</span>
                    <span className="text-[10px] text-slate-400 block">Total: {formatearDinero(f.total)}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-400">{f.vendedor}</span>

                  <button
                    onClick={() => setFacturaSeleccionada(f)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-extrabold text-xs shadow-sm transition-all"
                  >
                    <DollarSign className="w-4 h-4" /> Cobrar / Abonar
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {facturaSeleccionada && (
        <PaymentReceiptModal
          factura={facturaSeleccionada}
          vendedorActual={vendedorActual}
          onClose={() => setFacturaSeleccionada(null)}
          onConfirmarAbono={(abono) => {
            onRegistrarAbono(abono);
            setFacturaSeleccionada(null);
          }}
        />
      )}
    </div>
  );
};
