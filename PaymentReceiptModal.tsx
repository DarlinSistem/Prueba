import React, { useState } from 'react';
import { Factura, AbonoCredito } from '../../types';
import { formatearDinero } from '../../services/storageService';
import { imprimirAbonoFormato } from './PrintInvoice';
import { X, CheckCircle, Receipt, DollarSign, Printer, MessageCircle } from 'lucide-react';

interface Props {
  factura: Factura | null;
  vendedorActual: string;
  onClose: () => void;
  onConfirmarAbono: (abono: AbonoCredito) => void;
}

export const PaymentReceiptModal: React.FC<Props> = ({
  factura,
  vendedorActual,
  onClose,
  onConfirmarAbono,
}) => {
  if (!factura) return null;

  const saldoActual = factura.saldoCredito !== undefined ? Number(factura.saldoCredito) : Number(factura.total || 0);
  const [monto, setMonto] = useState<string>(saldoActual > 0 ? String(saldoActual) : '');
  const [nota, setNota] = useState('');
  const [abonoExitoso, setAbonoExitoso] = useState<AbonoCredito | null>(null);

  const handleGuardar = (e: React.FormEvent) => {
    e.preventDefault();
    const montoNum = Number(monto);
    if (!montoNum || isNaN(montoNum) || montoNum <= 0) {
      alert('Ingresa un monto de abono válido mayor a 0.');
      return;
    }

    if (montoNum > saldoActual) {
      if (!confirm(`El monto ingresado (${formatearDinero(montoNum)}) es mayor al saldo pendiente (${formatearDinero(saldoActual)}). ¿Deseas registrarlo como saldo saldado?`)) {
        return;
      }
    }

    const nuevoSaldo = Math.max(0, saldoActual - montoNum);
    const nuevoAbono: AbonoCredito = {
      id: Date.now(),
      facturaId: factura.id,
      facturaNumero: factura.numero,
      clienteNombre: factura.cliente?.nombre || 'Cliente General',
      fecha: new Date().toISOString(),
      monto: montoNum,
      vendedor: vendedorActual || 'Cobrador',
      nota: nota.trim(),
      saldoRestante: nuevoSaldo,
    };

    onConfirmarAbono(nuevoAbono);
    setAbonoExitoso(nuevoAbono);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Cabecera */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-emerald-950 text-white">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-base">Cobro / Abono a Crédito</h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-emerald-200 hover:text-white rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {!abonoExitoso ? (
          <form onSubmit={handleGuardar} className="p-5 space-y-4 text-sm">
            {/* Info Factura */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Factura:</span>
                <strong className="text-slate-800 font-bold">{factura.numero}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Cliente:</span>
                <strong className="text-slate-800">{factura.cliente?.nombre}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total original:</span>
                <span>{formatearDinero(factura.total)}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200 text-amber-900 font-bold text-sm">
                <span>Saldo pendiente:</span>
                <span className="text-red-600">{formatearDinero(saldoActual)}</span>
              </div>
            </div>

            {/* Monto Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Monto a Abonar (RD$)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-bold">
                  $
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={monto}
                  onChange={(e) => setMonto(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-8 pr-4 py-2.5 bg-white border-2 border-slate-200 rounded-xl font-bold text-base text-slate-900 focus:border-emerald-600 focus:outline-hidden transition-colors"
                />
              </div>
              {/* Botón rápido saldo total */}
              <button
                type="button"
                onClick={() => setMonto(String(saldoActual))}
                className="mt-1 text-xs text-emerald-700 font-semibold hover:underline"
              >
                Pagar la totalidad ({formatearDinero(saldoActual)})
              </button>
            </div>

            {/* Nota opcional */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Nota o Detalle (Opcional)
              </label>
              <input
                type="text"
                value={nota}
                onChange={(e) => setNota(e.target.value)}
                placeholder="Ej: Pago en efectivo en la ruta, cheque o transferencia"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-emerald-600 focus:outline-hidden"
              />
            </div>

            {/* Botones acción */}
            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-bold text-white shadow-md transition-colors flex items-center justify-center gap-1.5"
              >
                <DollarSign className="w-4 h-4" /> Registrar Cobro
              </button>
            </div>
          </form>
        ) : (
          /* Vista de éxito con comprobante */
          <div className="p-5 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-800">¡Abono registrado con éxito!</h4>
              <p className="text-xs text-slate-500 mt-1">El saldo se ha actualizado en tiempo real con Supabase.</p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-left space-y-1">
              <div className="flex justify-between">
                <span>Monto recibido:</span>
                <strong className="text-emerald-700 font-bold text-sm">{formatearDinero(abonoExitoso.monto)}</strong>
              </div>
              <div className="flex justify-between">
                <span>Nuevo saldo restante:</span>
                <strong className="text-red-600 font-bold">{formatearDinero(abonoExitoso.saldoRestante)}</strong>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Cobrado por:</span>
                <span>{abonoExitoso.vendedor}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => imprimirAbonoFormato(abonoExitoso, 'termica')}
                className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
              >
                <Printer className="w-4 h-4 text-emerald-400" /> Imprimir Recibo
              </button>
              <button
                onClick={onClose}
                className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-xs"
              >
                Listo / Cerrar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
