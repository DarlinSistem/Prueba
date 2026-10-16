import React, { useState } from 'react';
import { Cliente, Factura } from '../../types';
import { formatearDinero, formatearFechaHora, escapeHtml, LOGO_BASE64 } from '../../services/storageService';
import { Users, Plus, Search, Phone, MapPin, Edit2, Trash2, Printer, CreditCard, X } from 'lucide-react';

interface Props {
  clientes: Cliente[];
  facturas: Factura[];
  onGuardarCliente: (cliente: Cliente) => void;
  onEliminarCliente: (id: string | number) => void;
}

export const AdminCustomers: React.FC<Props> = ({
  clientes,
  facturas,
  onGuardarCliente,
  onEliminarCliente,
}) => {
  const [busqueda, setBusqueda] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [clienteEditando, setClienteEditando] = useState<Cliente | null>(null);

  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [limiteCredito, setLimiteCredito] = useState('');

  const abrirModalNuevo = () => {
    setClienteEditando(null);
    setNombre('');
    setTelefono('');
    setDireccion('');
    setLimiteCredito('');
    setModalAbierto(true);
  };

  const abrirModalEditar = (c: Cliente) => {
    setClienteEditando(c);
    setNombre(c.nombre);
    setTelefono(c.telefono || '');
    setDireccion(c.direccion || '');
    setLimiteCredito(c.limiteCredito ? String(c.limiteCredito) : '');
    setModalAbierto(true);
  };

  const handleGuardar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;

    const cliente: Cliente = {
      id: clienteEditando ? clienteEditando.id : Date.now(),
      nombre: nombre.trim(),
      telefono: telefono.trim() || undefined,
      direccion: direccion.trim() || undefined,
      limiteCredito: limiteCredito ? Number(limiteCredito) : undefined,
    };

    onGuardarCliente(cliente);
    setModalAbierto(false);
  };

  // Imprimir estado de cuenta por cliente
  const imprimirEstadoCuenta = (cliente: Cliente) => {
    const printArea = document.getElementById('printArea');
    if (!printArea) return;

    const facturasCliente = facturas.filter(
      (f) => String(f.cliente?.id) === String(cliente.id) && f.estado !== 'anulada'
    );

    let totalFacturado = 0;
    let totalPendiente = 0;

    facturasCliente.forEach((f) => {
      totalFacturado += Number(f.total || 0);
      if (f.formaPago === 'credito') {
        const saldo = f.saldoCredito !== undefined ? Number(f.saldoCredito) : Number(f.total || 0);
        totalPendiente += saldo;
      }
    });

    let html = `
      <div style="font-family:Arial,sans-serif;color:#000;padding:10px;">
        <div style="text-align:center;margin-bottom:12px;">
          <img class="company-logo" src="${LOGO_BASE64}" alt="Logo" style="display:block;width:130px;height:95px;object-fit:contain;margin:0 auto 4px;" />
          <h2 style="margin:2px 0;font-size:20px;">RODRIGUEZ PERALTA</h2>
          <h3 style="margin:4px 0;font-size:15px;color:#123b2a;">Estado de Cuenta de Cliente</h3>
        </div>
        <div style="font-size:12px;line-height:1.6;margin-bottom:14px;border:1px solid #cbd5e1;padding:8px;border-radius:6px;">
          <div><strong>Cliente:</strong> ${escapeHtml(cliente.nombre)}</div>
          <div><strong>Teléfono:</strong> ${escapeHtml(cliente.telefono || 'No registrado')}</div>
          <div><strong>Dirección:</strong> ${escapeHtml(cliente.direccion || 'No registrada')}</div>
          <div><strong>Total facturas registradas:</strong> ${facturasCliente.length}</div>
        </div>
        <table style="width:100%;border-collapse:collapse;font-size:11px;">
          <thead>
            <tr style="background:#f1f5f9;border-bottom:1px solid #333;">
              <th style="border:1px solid #cbd5e1;padding:6px;text-align:left;">Fecha</th>
              <th style="border:1px solid #cbd5e1;padding:6px;text-align:left;">Factura</th>
              <th style="border:1px solid #cbd5e1;padding:6px;text-align:center;">Pago</th>
              <th style="border:1px solid #cbd5e1;padding:6px;text-align:right;">Total</th>
              <th style="border:1px solid #cbd5e1;padding:6px;text-align:right;">Saldo</th>
            </tr>
          </thead>
          <tbody>
    `;

    facturasCliente.forEach((f) => {
      const saldo = f.saldoCredito !== undefined ? Number(f.saldoCredito) : (f.formaPago === 'credito' ? Number(f.total || 0) : 0);
      html += `
        <tr>
          <td style="border:1px solid #cbd5e1;padding:5px;">${formatearFechaHora(f.fecha).fecha}</td>
          <td style="border:1px solid #cbd5e1;padding:5px;font-weight:bold;">${escapeHtml(f.numero)}</td>
          <td style="border:1px solid #cbd5e1;padding:5px;text-align:center;text-transform:uppercase;">${f.formaPago}</td>
          <td style="border:1px solid #cbd5e1;padding:5px;text-align:right;">${formatearDinero(f.total)}</td>
          <td style="border:1px solid #cbd5e1;padding:5px;text-align:right;font-weight:bold;color:${saldo > 0 ? '#991b1b' : '#166534'};">${formatearDinero(saldo)}</td>
        </tr>
      `;
    });

    html += `
          </tbody>
        </table>
        <div style="margin-top:16px;text-align:right;font-size:13px;line-height:1.7;">
          <div>Total histórico comprado: <strong>${formatearDinero(totalFacturado)}</strong></div>
          <div style="font-size:16px;font-weight:bold;color:#991b1b;margin-top:4px;">DEUDA PENDIENTE: ${formatearDinero(totalPendiente)}</div>
        </div>
      </div>
    `;

    printArea.innerHTML = html;
    document.body.classList.remove('print-thermal');
    setTimeout(() => window.print(), 150);
  };

  const clientesFiltrados = clientes.filter((c) => {
    const q = busqueda.toLowerCase().trim();
    return !q || c.nombre.toLowerCase().includes(q) || (c.telefono && c.telefono.includes(q)) || (c.direccion && c.direccion.toLowerCase().includes(q));
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Cabecera */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-900">Cartera de Clientes</h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-900">
              Directorio Comercial
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Gestiona la información de contacto, límites y consulta el estado de cuenta de cada cliente.
          </p>
        </div>

        <button
          onClick={abrirModalNuevo}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-bold text-white text-xs shadow-md transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          + Agregar Nuevo Cliente
        </button>
      </div>

      {/* Buscador */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre, teléfono o dirección..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
          />
        </div>
        <span className="text-xs text-slate-400">{clientesFiltrados.length} clientes encontrados</span>
      </div>

      {/* Lista / Grid de Clientes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clientesFiltrados.map((cliente) => {
          // Deuda acumulada de este cliente
          const deuda = facturas
            .filter((f) => String(f.cliente?.id) === String(cliente.id) && f.formaPago === 'credito' && f.estado !== 'anulada')
            .reduce((acc, f) => acc + (f.saldoCredito !== undefined ? Number(f.saldoCredito) : Number(f.total || 0)), 0);

          return (
            <div
              key={cliente.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="font-bold text-slate-900 text-sm">{cliente.nombre}</h4>
                  {deuda > 0 ? (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 shrink-0">
                      Debe {formatearDinero(deuda)}
                    </span>
                  ) : (
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 shrink-0">
                      Al día
                    </span>
                  )}
                </div>

                <div className="space-y-1.5 text-xs text-slate-500">
                  {cliente.telefono ? (
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <a href={`tel:${cliente.telefono}`} className="hover:text-emerald-700 font-medium">
                        {cliente.telefono}
                      </a>
                    </div>
                  ) : (
                    <div className="text-slate-400 italic">Sin teléfono</div>
                  )}

                  {cliente.direccion ? (
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{cliente.direccion}</span>
                    </div>
                  ) : (
                    <div className="text-slate-400 italic">Sin dirección</div>
                  )}
                </div>
              </div>

              <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => imprimirEstadoCuenta(cliente)}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
                  title="Imprimir estado de cuenta"
                >
                  <Printer className="w-3.5 h-3.5" /> Estado Cuenta
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => abrirModalEditar(cliente)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
                    title="Editar cliente"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`¿Eliminar al cliente "${cliente.nombre}"?`)) {
                        onEliminarCliente(cliente.id);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg"
                    title="Eliminar cliente"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Crear / Editar Cliente */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-base text-slate-800">
                {clienteEditando ? 'Editar Cliente' : 'Registrar Nuevo Cliente'}
              </h3>
              <button onClick={() => setModalAbierto(false)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGuardar} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej: Colmado El Progreso, Juan Pérez"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Teléfono</label>
                <input
                  type="text"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="Ej: 809-555-0199"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Dirección</label>
                <input
                  type="text"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  placeholder="Ej: Calle Principal #14, Santiago"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Límite de Crédito (RD$ - Opcional)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={limiteCredito}
                  onChange={(e) => setLimiteCredito(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setModalAbierto(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-bold text-white shadow-md transition-colors"
                >
                  {clienteEditando ? 'Guardar Cambios' : '+ Agregar Cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
