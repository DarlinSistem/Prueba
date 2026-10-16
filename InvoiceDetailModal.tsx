import React, { useState } from 'react';
import { Factura, AbonoCredito } from '../../types';
import { formatearDinero, formatearFechaHora } from '../../services/storageService';
import { imprimirFacturaFormato } from './PrintInvoice';
import { X, Printer, Receipt, MessageCircle, AlertTriangle, CheckCircle2, User, Phone, MapPin, Calendar, Clock } from 'lucide-react';

interface Props {
  factura: Factura | null;
  onClose: () => void;
  onAnular?: (id: string | number) => void;
  onEditarCliente?: (factura: Factura) => void;
  onAbonar?: (factura: Factura) => void;
}

export const InvoiceDetailModal: React.FC<Props> = ({
  factura,
  onClose,
  onAnular,
  onEditarCliente,
  onAbonar,
}) => {
  const [imprimiendo, setImprimiendo] = useState(false);

  if (!factura) return null;

  const { fecha, hora } = formatearFechaHora(factura.fecha);
  const esCredito = String(factura.formaPago || '').toLowerCase().includes('credito') || String(factura.formaPago || '').toLowerCase().includes('crédito');
  const saldoPendiente = factura.saldoCredito !== undefined ? Number(factura.saldoCredito) : Number(factura.total || 0);

  const handlePrint = (formato: 'hoja' | 'termica') => {
    setImprimiendo(true);
    imprimirFacturaFormato(factura, formato);
    setTimeout(() => setImprimiendo(false), 1000);
  };

  const handleCompartirWhatsApp = () => {
    const tel = String(factura.cliente?.telefono || '').replace(/\D/g, '');
    let mensaje = `*RODRIGUEZ PERALTA*\nFactura: *${factura.numero}*\nFecha: ${fecha} ${hora}\nCliente: ${factura.cliente?.nombre}\nVendedor: ${factura.vendedor}\n------------------\n`;
    (factura.productos || []).forEach((p) => {
      mensaje += `• ${p.cantidad}x ${p.nombre} (${p.tipoPrecio}) = ${formatearDinero(p.precio * p.cantidad)}\n`;
    });
    mensaje += `------------------\n*TOTAL: ${formatearDinero(factura.total)}*\nForma de pago: ${factura.formaPago.toUpperCase()}\n`;
    if (esCredito) {
      mensaje += `*Saldo pendiente:* ${formatearDinero(saldoPendiente)}\n`;
    }
    mensaje += `\n¡Gracias por su compra! Tel.: 849-206-9126`;

    const url = tel ? `https://wa.me/1${tel}?text=${encodeURIComponent(mensaje)}` : `https://api.whatsapp.com/send?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[92vh] flex flex-col bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Cabecera */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                {factura.numero}
              </span>
              {factura.estado === 'anulada' && (
                <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                  Anulada
                </span>
              )}
            </div>
            <h3 className="text-base font-bold text-slate-800 mt-1">Detalle de Factura</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors"
            title="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido scrolleable */}
        <div className="p-5 overflow-y-auto space-y-4 text-sm">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600">
            <div>
              <div className="flex items-center gap-1.5 text-slate-400 mb-0.5 font-medium">
                <User className="w-3.5 h-3.5" /> Cliente
              </div>
              <div className="font-semibold text-slate-800 text-sm truncate">{factura.cliente?.nombre || 'Sin cliente'}</div>
              {factura.cliente?.telefono && (
                <div className="flex items-center gap-1 mt-0.5 text-slate-500">
                  <Phone className="w-3 h-3" /> {factura.cliente.telefono}
                </div>
              )}
              {factura.cliente?.direccion && (
                <div className="flex items-center gap-1 text-slate-500 truncate">
                  <MapPin className="w-3 h-3" /> {factura.cliente.direccion}
                </div>
              )}
            </div>

            <div className="text-right">
              <div className="flex items-center justify-end gap-1.5 text-slate-400 mb-0.5 font-medium">
                <Calendar className="w-3.5 h-3.5" /> Fecha & Vendedor
              </div>
              <div className="font-semibold text-slate-800">{fecha}</div>
              <div className="flex items-center justify-end gap-1 text-slate-500 mt-0.5">
                <Clock className="w-3 h-3" /> {hora}
              </div>
              <div className="text-emerald-700 font-medium truncate mt-0.5">Vendedor: {factura.vendedor}</div>
            </div>
          </div>

          {/* Tabla de Productos */}
          <div>
            <div className="font-bold text-slate-800 mb-2 flex items-center justify-between text-xs">
              <span>ARTÍCULOS VENDIDOS ({factura.productos?.length || 0})</span>
              <span className="text-slate-500 uppercase">Tipo de Precio</span>
            </div>
            <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
              {(factura.productos || []).map((item, idx) => {
                const sub = Number(item.precio || 0) * Number(item.cantidad || 0);
                return (
                  <div key={idx} className="p-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="min-w-0 pr-3">
                      <div className="font-semibold text-slate-800 truncate">{item.nombre}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                        <span className="bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-medium text-[11px]">
                          {item.tipoPrecio === 'mayorista' ? 'Mayorista' : 'Detalle'}
                        </span>
                        <span>{item.cantidad} x {formatearDinero(item.precio)}</span>
                      </div>
                    </div>
                    <div className="font-bold text-slate-900 text-right shrink-0">
                      {formatearDinero(sub)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Desglose de Totales */}
          <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-100/80 space-y-1.5">
            <div className="flex justify-between items-center text-slate-600 text-xs">
              <span>Forma de Pago:</span>
              <span className={`font-bold uppercase px-2 py-0.5 rounded text-xs ${esCredito ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'}`}>
                {factura.formaPago}
              </span>
            </div>

            {!esCredito ? (
              <>
                <div className="flex justify-between items-center text-slate-600 text-xs">
                  <span>Monto recibido:</span>
                  <span>{formatearDinero(factura.montoRecibido)}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600 text-xs">
                  <span>Cambio devuelto:</span>
                  <span className="font-semibold text-emerald-700">{formatearDinero(factura.cambio)}</span>
                </div>
              </>
            ) : (
              <div className="flex justify-between items-center text-amber-900 font-semibold text-xs pt-1 border-t border-amber-200/60">
                <span>Saldo pendiente actual:</span>
                <span className="text-sm font-bold text-red-600">{formatearDinero(saldoPendiente)}</span>
              </div>
            )}

            <div className="flex justify-between items-center pt-2 border-t border-emerald-200/70 text-slate-900 font-extrabold text-base">
              <span>TOTAL FACTURA:</span>
              <span className="text-emerald-900 text-lg">{formatearDinero(factura.total)}</span>
            </div>
          </div>

          {/* Abonos registrados si es crédito */}
          {esCredito && (factura.abonos && factura.abonos.length > 0) && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-xs font-bold text-slate-700 mb-1.5">Historial de Abonos / Pagos</div>
              <div className="space-y-1 text-xs text-slate-600">
                {factura.abonos.map((ab, i) => (
                  <div key={i} className="flex justify-between items-center py-1 border-b border-slate-100 last:border-0">
                    <span>{formatearFechaHora(ab.fecha).fecha} ({ab.vendedor})</span>
                    <strong className="text-emerald-700">+{formatearDinero(ab.monto)}</strong>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Barra de Acciones */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/70 flex flex-wrap gap-2 items-center justify-between">
          <div className="flex items-center gap-2">
            {esCredito && saldoPendiente > 0 && onAbonar && (
              <button
                onClick={() => onAbonar(factura)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-white shadow-xs transition-colors"
              >
                <Receipt className="w-4 h-4" /> Registrar Abono
              </button>
            )}

            {onAnular && factura.estado !== 'anulada' && (
              <button
                onClick={() => onAnular(factura.id)}
                className="inline-flex items-center gap-1 px-2.5 py-2 text-xs font-semibold rounded-xl text-red-600 hover:bg-red-50 transition-colors"
                title="Anular factura"
              >
                <AlertTriangle className="w-3.5 h-3.5" /> Anular
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCompartirWhatsApp}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
            >
              <MessageCircle className="w-4 h-4" /> WhatsApp
            </button>
            <button
              onClick={() => handlePrint('termica')}
              disabled={imprimiendo}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition-colors"
            >
              <Printer className="w-4 h-4 text-emerald-400" /> JACL-P280 (80mm)
            </button>
            <button
              onClick={() => handlePrint('hoja')}
              disabled={imprimiendo}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" /> Hoja A4
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
