import React, { useState } from 'react';
import { Producto, Cliente, Factura, AbonoCredito, EstadoSincronizacion } from '../../types';
import { MobileSalesPOS } from './MobileSalesPOS';
import { MobileCustomers } from './MobileCustomers';
import { MobileInvoices } from './MobileInvoices';
import { MobileCollections } from './MobileCollections';
import { MobileProfile } from './MobileProfile';
import { ShoppingCart, Users, FileText, CreditCard, User } from 'lucide-react';

interface Props {
  productos: Producto[];
  clientes: Cliente[];
  facturas: Factura[];
  abonos: AbonoCredito[];
  vendedorActual: string;
  syncState: EstadoSincronizacion;
  onGuardarFactura: (factura: Factura) => void;
  onGuardarCliente: (cliente: Cliente) => void;
  onRegistrarAbono: (abono: AbonoCredito) => void;
  onEditarVendedor: () => void;
  onSincronizarManual: () => void;
  onCambiarModoPC: () => void;
}

export type TabMovil = 'venta' | 'clientes' | 'facturas' | 'cobros' | 'perfil';

export const MobileLayout: React.FC<Props> = ({
  productos,
  clientes,
  facturas,
  abonos,
  vendedorActual,
  syncState,
  onGuardarFactura,
  onGuardarCliente,
  onRegistrarAbono,
  onEditarVendedor,
  onSincronizarManual,
  onCambiarModoPC,
}) => {
  const [tabActiva, setTabActiva] = useState<TabMovil>('venta');

  // Deuda total pendiente para badge de cobros
  const cantidadPendientes = facturas.filter(
    (f) =>
      f.estado !== 'anulada' &&
      f.formaPago === 'credito' &&
      (f.saldoCredito !== undefined ? Number(f.saldoCredito) > 0 : Number(f.total || 0) > 0)
  ).length;

  return (
    <div className="max-w-md mx-auto min-h-[calc(100vh-80px)] flex flex-col justify-between px-3 pt-2">
      {/* Contenido de la Pantalla Activa */}
      <main className="flex-1">
        {tabActiva === 'venta' && (
          <MobileSalesPOS
            productos={productos}
            clientes={clientes}
            facturas={facturas}
            vendedorActual={vendedorActual}
            onFinalizarFactura={onGuardarFactura}
            onCrearClienteExpress={onGuardarCliente}
          />
        )}

        {tabActiva === 'clientes' && (
          <MobileCustomers
            clientes={clientes}
            facturas={facturas}
            onGuardarCliente={onGuardarCliente}
          />
        )}

        {tabActiva === 'facturas' && (
          <MobileInvoices
            facturas={facturas}
            vendedorActual={vendedorActual}
          />
        )}

        {tabActiva === 'cobros' && (
          <MobileCollections
            facturas={facturas}
            abonos={abonos}
            clientes={clientes}
            vendedorActual={vendedorActual}
            onRegistrarAbono={onRegistrarAbono}
          />
        )}

        {tabActiva === 'perfil' && (
          <MobileProfile
            vendedorActual={vendedorActual}
            onEditarVendedor={onEditarVendedor}
            facturas={facturas}
            abonos={abonos}
            syncState={syncState}
            onSincronizarManual={onSincronizarManual}
            onCambiarModoPC={onCambiarModoPC}
          />
        )}
      </main>

      {/* Barra de Navegación Inferior Fija para Móviles (Bottom Bar) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 shadow-lg">
        <div className="max-w-md mx-auto grid grid-cols-5 gap-1 text-center">
          <button
            onClick={() => setTabActiva('venta')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all ${
              tabActiva === 'venta' ? 'text-emerald-700 font-extrabold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <ShoppingCart className={`w-5 h-5 ${tabActiva === 'venta' ? 'scale-110 text-emerald-600' : ''}`} />
            <span className="text-[10px] mt-0.5">Venta</span>
          </button>

          <button
            onClick={() => setTabActiva('clientes')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all ${
              tabActiva === 'clientes' ? 'text-emerald-700 font-extrabold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Users className={`w-5 h-5 ${tabActiva === 'clientes' ? 'scale-110 text-emerald-600' : ''}`} />
            <span className="text-[10px] mt-0.5">Clientes</span>
          </button>

          <button
            onClick={() => setTabActiva('facturas')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all ${
              tabActiva === 'facturas' ? 'text-emerald-700 font-extrabold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <FileText className={`w-5 h-5 ${tabActiva === 'facturas' ? 'scale-110 text-emerald-600' : ''}`} />
            <span className="text-[10px] mt-0.5">Facturas</span>
          </button>

          <button
            onClick={() => setTabActiva('cobros')}
            className={`relative flex flex-col items-center justify-center py-1.5 rounded-xl transition-all ${
              tabActiva === 'cobros' ? 'text-emerald-700 font-extrabold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <CreditCard className={`w-5 h-5 ${tabActiva === 'cobros' ? 'scale-110 text-emerald-600' : ''}`} />
            <span className="text-[10px] mt-0.5">Cobros</span>
            {cantidadPendientes > 0 && (
              <span className="absolute top-0.5 right-3 w-4 h-4 rounded-full bg-amber-500 text-white text-[9px] font-black flex items-center justify-center shadow-xs">
                {cantidadPendientes}
              </span>
            )}
          </button>

          <button
            onClick={() => setTabActiva('perfil')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all ${
              tabActiva === 'perfil' ? 'text-emerald-700 font-extrabold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <User className={`w-5 h-5 ${tabActiva === 'perfil' ? 'scale-110 text-emerald-600' : ''}`} />
            <span className="text-[10px] mt-0.5">Cierre</span>
          </button>
        </div>
      </nav>
    </div>
  );
};
