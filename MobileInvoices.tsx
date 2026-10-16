import React, { useState } from 'react';
import { Factura } from './types';
import { formatearDinero, formatearFechaHora, fechaHoyYMD } from './storageService';
import { imprimirFacturaFormato } from './PrintInvoice';
import { InvoiceDetailModal } from './InvoiceDetailModal';
import { Search, Printer, Eye, MessageCircle, FileText, CheckCircle2, Clock, Filter } from 'lucide-react';

interface Props {
  facturas: Factura[];
  vendedorActual: string;
}

export const MobileInvoices: React.FC<Props> = ({ facturas, vendedorActual }) => {
  const [busqueda, setBusqueda] = useState('');
  const [filtro, setFiltro] = useState<'hoy' | 'todas' | 'credito'>('hoy');
  const [facturaSeleccionada, setFacturaSeleccionada] = useState<Factura | null>(null);

  const hoyYMD = fechaHoyYMD();

  const filtradas = facturas.filter((f) => {
    if (f.estado === 'anulada') return false;

    if (filtro === 'hoy' && String(f.fecha).substring(0, 10) !== hoyYMD) {
      return false;
    }

    if (filtro === 'credito' && f.formaPago !== 'credito') {
      return false;
    }

    if (busqueda) {
      const q = busqueda.toLowerCase().trim();
      const matchNum = f.numero.toLowerCase().includes(q);
      const matchCli = f.cliente?.nombre?.toLowerCase().includes(q);
      if (!matchNum && !matchCli) return false;
    }

    return true;
  }).sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

  return (
    <div className="space-y-3 pb-24 animate-in fade-in duration-150">
      {/* Barra de Búsqueda y Filtros */}
      <div className="sticky top-14 z-20 bg-slate-50 pt-1 pb-2 space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar factura o cliente..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-semibold shadow-xs focus:border-emerald-600 focus:outline-hidden"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-0.5">
          <button
            onClick={() => setFiltro('hoy')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              filtro === 'hoy' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            Facturas de Hoy
          </button>
          <button
            onClick={() => setFiltro('credito')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              filtro === 'credito' ? 'bg-amber-500 text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            A Crédito
          </button>
          <button
            onClick={() => setFiltro('todas')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              filtro === 'todas' ? 'bg-slate-900 text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            Todas
          </button>
        </div>
      </div>

      {/* Lista de Facturas */}
      <div className="space-y-2.5">
        {filtradas.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
            <FileText className="w-8 h-8 mx-auto text-slate-300 mb-1" />
            No hay facturas con este filtro.
          </div>
        ) : (
          filtradas.map((f) => {
            const { fecha, hora } = formatearFechaHora(f.fecha);
            const esCredito = f.formaPago === 'credito';
            const saldo = f.saldoCredito !== undefined ? Number(f.saldoCredito) : Number(f.total || 0);

            return (
              <div
                key={f.id}
                className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-2.5"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-emerald-900 text-sm">{f.numero}</span>
                      <span
                        className={`text-[10px] font-bold uppercase px-1.5 py-0.2 rounded ${
                          esCredito ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'
                        }`}
                      >
                        {f.formaPago}
                      </span>
                    </div>
                    <div className="font-bold text-slate-800 text-sm mt-0.5">{f.cliente?.nombre}</div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <Clock className="w-3 h-3" /> {fecha} {hora}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-black text-slate-900 text-base">{formatearDinero(f.total)}</div>
                    {esCredito && saldo > 0 && (
                      <div className="text-[10px] font-bold text-red-600">Debe {formatearDinero(saldo)}</div>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400 text-[11px]">
                    {f.productos?.length || 0} artículo(s)
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setFacturaSeleccionada(f)}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" /> Ver
                    </button>
                    <button
                      onClick={() => imprimirFacturaFormato(f, 'termica')}
                      className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl flex items-center gap-1 shadow-xs"
                    >
                      <Printer className="w-3.5 h-3.5 text-emerald-400" /> Imprimir
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {facturaSeleccionada && (
        <InvoiceDetailModal
          factura={facturaSeleccionada}
          onClose={() => setFacturaSeleccionada(null)}
        />
      )}
    </div>
  );
};
