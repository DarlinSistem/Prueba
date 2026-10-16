import React, { useState } from 'react';
import { Factura, AbonoCredito, Cliente } from './types';
import { formatearDinero, formatearFechaHora } from './storageService';
import { PaymentReceiptModal } from './PaymentReceiptModal';
import { imprimirAbonoFormato } from './PrintInvoice';
import {
  CreditCard,
  DollarSign,
  Search,
  User,
  Calendar,
  Receipt,
  Printer,
  CheckCircle2,
  AlertCircle,
  FileText
} from 'lucide-react';

interface Props {
  facturas: Factura[];
  abonos: AbonoCredito[];
  clientes: Cliente[];
  vendedorActual: string;
  onRegistrarAbono: (abono: AbonoCredito) => void;
}

export const AdminCredits: React.FC<Props> = ({
  facturas,
  abonos,
  clientes,
  vendedorActual,
  onRegistrarAbono,
}) => {
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<'pendientes' | 'saldadas' | 'todos'>('pendientes');
  const [facturaParaAbonar, setFacturaParaAbonar] = useState<Factura | null>(null);
  const [abonoSeleccionado, setAbonoSeleccionado] = useState<AbonoCredito | null>(null);

  // Solo facturas a crédito
  const facturasCredito = facturas.filter(
    (f) =>
      f.estado !== 'anulada' &&
      (String(f.formaPago).toLowerCase().includes('credito') ||
        String(f.formaPago).toLowerCase().includes('crédito'))
  );

  const facturasFiltradas = facturasCredito.filter((f) => {
    const saldo = f.saldoCredito !== undefined ? Number(f.saldoCredito) : Number(f.total || 0);
    const estaSaldada = saldo <= 0;

    if (filtroEstado === 'pendientes' && estaSaldada) return false;
    if (filtroEstado === 'saldadas' && !estaSaldada) return false;

    if (busqueda) {
      const q = busqueda.toLowerCase().trim();
      const matchNum = f.numero.toLowerCase().includes(q);
      const matchCli = f.cliente?.nombre?.toLowerCase().includes(q);
      if (!matchNum && !matchCli) return false;
    }
    return true;
  });

  const deudaTotal = facturasCredito.reduce((acc, f) => {
    const s = f.saldoCredito !== undefined ? Number(f.saldoCredito) : Number(f.total || 0);
    return acc + Math.max(0, s);
  }, 0);

  const totalAbonado = abonos.reduce((acc, ab) => acc + Number(ab.monto || 0), 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Cabecera */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-900">Créditos y Cuentas por Cobrar</h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900">
              Gestión de Cobranzas
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Supervisa las deudas de clientes a crédito y registra abonos o pagos recibidos en tiempo real.
          </p>
        </div>

        {/* Resumen de Deuda */}
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-right">
            <div className="text-[11px] font-bold text-amber-800 uppercase">Total Pendiente</div>
            <div className="text-xl font-black text-amber-950">{formatearDinero(deudaTotal)}</div>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-right">
            <div className="text-[11px] font-bold text-emerald-800 uppercase">Total Recaudado</div>
            <div className="text-xl font-black text-emerald-950">{formatearDinero(totalAbonado)}</div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por cliente o número de factura..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setFiltroEstado('pendientes')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filtroEstado === 'pendientes'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Pendientes
          </button>
          <button
            onClick={() => setFiltroEstado('saldadas')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filtroEstado === 'saldadas'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Saldadas
          </button>
          <button
            onClick={() => setFiltroEstado('todos')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filtroEstado === 'todos'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todos
          </button>
        </div>
      </div>

      {/* Tabla de Facturas a Crédito */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {facturasFiltradas.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            <CreditCard className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            No hay facturas a crédito con los criterios seleccionados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-bold tracking-wider">
                <tr>
                  <th className="py-3 px-4">Factura</th>
                  <th className="py-3 px-3">Fecha</th>
                  <th className="py-3 px-3">Cliente</th>
                  <th className="py-3 px-3 text-right">Total Factura</th>
                  <th className="py-3 px-3 text-right">Saldo Pendiente</th>
                  <th className="py-3 px-3 text-center">Estado</th>
                  <th className="py-3 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {facturasFiltradas.map((f) => {
                  const saldo = f.saldoCredito !== undefined ? Number(f.saldoCredito) : Number(f.total || 0);
                  const saldada = saldo <= 0;
                  const { fecha } = formatearFechaHora(f.fecha);

                  return (
                    <tr key={f.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        <span className="font-mono text-emerald-800">{f.numero}</span>
                      </td>
                      <td className="py-3 px-3 text-slate-500">{fecha}</td>
                      <td className="py-3 px-3 font-semibold text-slate-800">
                        {f.cliente?.nombre || 'Sin cliente'}
                        {f.cliente?.telefono && (
                          <div className="text-[11px] text-slate-400 font-normal">{f.cliente.telefono}</div>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right font-medium text-slate-800">
                        {formatearDinero(f.total)}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-sm">
                        <span className={saldada ? 'text-emerald-700' : 'text-red-600'}>
                          {formatearDinero(saldo)}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        {saldada ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Saldada
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full">
                            Pendiente
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {!saldada ? (
                          <button
                            onClick={() => setFacturaParaAbonar(f)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition-colors"
                          >
                            <DollarSign className="w-3.5 h-3.5" /> Abonar
                          </button>
                        ) : (
                          <span className="text-slate-400 text-xs italic">Completada</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Historial Reciente de Abonos */}
      {abonos.length > 0 && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-emerald-600" /> Historial de Cobros y Abonos ({abonos.length})
            </h3>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 max-h-60 overflow-y-auto">
            {abonos.map((ab) => (
              <div key={ab.id} className="p-3 flex items-center justify-between hover:bg-slate-50 transition-colors text-xs">
                <div>
                  <div className="font-bold text-slate-800">
                    Abono a {ab.facturaNumero} - {ab.clienteNombre}
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                    <span>{formatearFechaHora(ab.fecha).fecha}</span>
                    <span>• Recibido por: {ab.vendedor}</span>
                    {ab.nota && <span>• Nota: {ab.nota}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="font-bold text-emerald-700 text-sm">+{formatearDinero(ab.monto)}</div>
                    <div className="text-[10px] text-slate-400">Resta: {formatearDinero(ab.saldoRestante)}</div>
                  </div>
                  <button
                    onClick={() => imprimirAbonoFormato(ab, 'termica')}
                    className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg"
                    title="Reimprimir comprobante"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal para Registrar Abono */}
      {facturaParaAbonar && (
        <PaymentReceiptModal
          factura={facturaParaAbonar}
          vendedorActual={vendedorActual}
          onClose={() => setFacturaParaAbonar(null)}
          onConfirmarAbono={(abono) => {
            onRegistrarAbono(abono);
            setFacturaParaAbonar(null);
          }}
        />
      )}
    </div>
  );
};
