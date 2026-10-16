import React, { useState } from 'react';
import { Cliente, Factura } from './types';
import { formatearDinero } from './storageService';
import { Search, Phone, MapPin, Plus, User, MessageCircle, X } from 'lucide-react';

interface Props {
  clientes: Cliente[];
  facturas: Factura[];
  onGuardarCliente: (cliente: Cliente) => void;
}

export const MobileCustomers: React.FC<Props> = ({
  clientes,
  facturas,
  onGuardarCliente,
}) => {
  const [busqueda, setBusqueda] = useState('');
  const [modalNuevo, setModalNuevo] = useState(false);
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');

  const handleCrear = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;
    onGuardarCliente({
      id: Date.now(),
      nombre: nombre.trim(),
      telefono: telefono.trim() || undefined,
      direccion: direccion.trim() || undefined,
    });
    setModalNuevo(false);
    setNombre('');
    setTelefono('');
    setDireccion('');
  };

  const filtrados = clientes.filter((c) => {
    const q = busqueda.toLowerCase().trim();
    return !q || c.nombre.toLowerCase().includes(q) || (c.telefono && c.telefono.includes(q));
  });

  return (
    <div className="space-y-3 pb-24 animate-in fade-in duration-150">
      {/* Barra de búsqueda y botón nuevo */}
      <div className="sticky top-14 z-20 bg-slate-50 pt-1 pb-2 flex gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar cliente por nombre o teléfono..."
            className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-semibold shadow-xs focus:border-emerald-600 focus:outline-hidden"
          />
        </div>
        <button
          onClick={() => setModalNuevo(true)}
          className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-xs shrink-0 flex items-center justify-center"
          title="Agregar cliente"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Lista de Clientes */}
      <div className="space-y-2.5">
        {filtrados.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
            <User className="w-8 h-8 mx-auto text-slate-300 mb-1" />
            No se encontraron clientes.
          </div>
        ) : (
          filtrados.map((cliente) => {
            const deuda = facturas
              .filter((f) => String(f.cliente?.id) === String(cliente.id) && f.formaPago === 'credito' && f.estado !== 'anulada')
              .reduce((acc, f) => acc + (f.saldoCredito !== undefined ? Number(f.saldoCredito) : Number(f.total || 0)), 0);

            const telLimpio = String(cliente.telefono || '').replace(/\D/g, '');

            return (
              <div
                key={cliente.id}
                className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm leading-snug">{cliente.nombre}</h4>
                    {cliente.direccion && (
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                        <MapPin className="w-3 h-3 shrink-0" /> {cliente.direccion}
                      </p>
                    )}
                  </div>
                  {deuda > 0 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 shrink-0">
                      Debe {formatearDinero(deuda)}
                    </span>
                  )}
                </div>

                {cliente.telefono && (
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-mono">{cliente.telefono}</span>
                    <div className="flex items-center gap-1.5">
                      <a
                        href={`https://wa.me/1${telLimpio}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-semibold"
                      >
                        <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                      </a>
                      <a
                        href={`tel:${cliente.telefono}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold"
                      >
                        <Phone className="w-3.5 h-3.5" /> Llamar
                      </a>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modal Nuevo Cliente */}
      {modalNuevo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-2xl p-5 shadow-2xl space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-sm text-slate-800">Registrar Cliente</h4>
              <button onClick={() => setModalNuevo(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCrear} className="space-y-2.5 text-xs">
              <input
                type="text"
                required
                placeholder="Nombre del cliente *"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl"
              />
              <input
                type="text"
                placeholder="Teléfono"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl"
              />
              <input
                type="text"
                placeholder="Dirección"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl"
              />
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalNuevo(false)}
                  className="flex-1 py-2 text-slate-500 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-emerald-600 text-white font-bold rounded-xl"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
