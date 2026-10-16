import React, { useState } from 'react';
import { Factura, AbonoCredito, Usuario, RolUsuario } from './types';
import { formatearDinero, fechaHoyYMD } from './storageService';
import {
  Users,
  DollarSign,
  FileText,
  CheckCircle2,
  TrendingUp,
  Calendar,
  Printer,
  UserPlus,
  ShieldCheck,
  Smartphone,
  Monitor,
  Lock,
  Mail,
  Trash2,
  X,
  Phone,
  Check
} from 'lucide-react';

interface Props {
  facturas: Factura[];
  abonos: AbonoCredito[];
  usuarios: Usuario[];
  onGuardarUsuario: (u: Usuario) => void;
  onEliminarUsuario: (id: string | number) => void;
}

export const AdminSellersReport: React.FC<Props> = ({
  facturas,
  abonos,
  usuarios,
  onGuardarUsuario,
  onEliminarUsuario,
}) => {
  const hoyYMD = fechaHoyYMD();
  const [pestaña, setPestaña] = useState<'ventas' | 'usuarios'>('ventas');
  const [modalNuevoUsuario, setModalNuevoUsuario] = useState(false);

  // Formulario nuevo usuario
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [telefono, setTelefono] = useState('');
  const [rol, setRol] = useState<RolUsuario>('vendedor');

  const vendedoresConVentas = [...new Set(facturas.map((f) => f.vendedor).filter(Boolean))];

  const handleCrearUsuario = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !email.trim()) return;

    const nuevo: Usuario = {
      id: Date.now(),
      nombre: nombre.trim(),
      email: email.trim().toLowerCase(),
      password: password.trim() || '123456',
      rol,
      telefono: telefono.trim() || undefined,
      activo: true,
      creadoEn: new Date().toISOString(),
    };

    onGuardarUsuario(nuevo);
    setModalNuevoUsuario(false);
    setNombre('');
    setEmail('');
    setPassword('');
    setTelefono('');
    setRol('vendedor');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Cabecera */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-900">
              Vendedores & Usuarios del Sistema
            </h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800">
              Control de Accesos & Rutas
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Administra los usuarios del sistema, asigna quién es Vendedor (Móvil) y quién es Administrador (PC), y audita los cierres diarios.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Switch de pestañas */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center text-xs font-bold">
            <button
              onClick={() => setPestaña('ventas')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                pestaña === 'ventas' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Ventas por Vendedor
            </button>
            <button
              onClick={() => setPestaña('usuarios')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                pestaña === 'usuarios' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Lista de Usuarios ({usuarios.length})
            </button>
          </div>

          {pestaña === 'usuarios' && (
            <button
              onClick={() => setModalNuevoUsuario(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Nuevo Usuario</span>
            </button>
          )}
        </div>
      </div>

      {pestaña === 'ventas' ? (
        /* PESTAÑA 1: REPORTE DE VENTAS POR VENDEDOR */
        vendedoresConVentas.length === 0 ? (
          <div className="bg-white p-12 text-center text-slate-400 text-sm rounded-2xl border border-slate-200">
            <Users className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            No se registran ventas con vendedor asignado aún.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {vendedoresConVentas.map((vendedor) => {
              const facturasVend = facturas.filter(
                (f) => f.vendedor === vendedor && f.estado !== 'anulada'
              );
              const facturasHoy = facturasVend.filter(
                (f) => String(f.fecha).substring(0, 10) === hoyYMD
              );

              const totalHoy = facturasHoy.reduce((acc, f) => acc + Number(f.total || 0), 0);
              const contadoHoy = facturasHoy
                .filter((f) => f.formaPago === 'contado')
                .reduce((acc, f) => acc + Number(f.total || 0), 0);
              const creditoHoy = facturasHoy
                .filter((f) => f.formaPago === 'credito')
                .reduce((acc, f) => acc + Number(f.total || 0), 0);

              const totalHistorico = facturasVend.reduce((acc, f) => acc + Number(f.total || 0), 0);

              // Cobros recaudados por este vendedor hoy
              const cobrosHoy = abonos
                .filter(
                  (ab) =>
                    ab.vendedor === vendedor && String(ab.fecha).substring(0, 10) === hoyYMD
                )
                .reduce((acc, ab) => acc + Number(ab.monto || 0), 0);

              return (
                <div
                  key={vendedor}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 hover:border-emerald-300 transition-all"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm">
                        {vendedor.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-sm">{vendedor}</h4>
                        <span className="text-[11px] text-slate-400">Vendedor móvil / ruta</span>
                      </div>
                    </div>
                  </div>

                  {/* Resumen de Hoy */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs text-slate-500">
                      <span>Ventas de hoy ({facturasHoy.length} facturas):</span>
                      <strong className="text-emerald-900 font-extrabold text-sm">
                        {formatearDinero(totalHoy)}
                      </strong>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] p-2 bg-slate-50 rounded-xl">
                      <div>
                        <span className="text-slate-400">Contado hoy:</span>
                        <div className="font-bold text-slate-700">{formatearDinero(contadoHoy)}</div>
                      </div>
                      <div>
                        <span className="text-slate-400">A crédito hoy:</span>
                        <div className="font-bold text-amber-700">{formatearDinero(creditoHoy)}</div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-xs pt-1 text-slate-600">
                      <span>Cobros recaudados hoy:</span>
                      <strong className="text-emerald-700">{formatearDinero(cobrosHoy)}</strong>
                    </div>

                    <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-100 text-slate-400">
                      <span>Total histórico vendido:</span>
                      <span className="font-semibold text-slate-700">{formatearDinero(totalHistorico)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* PESTAÑA 2: LISTA Y CONTROL DE USUARIOS Y ROLES */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700 uppercase tracking-wider">
              Usuarios con Permiso de Acceso
            </span>
            <span className="text-slate-500">
              El rol define si la app abre la versión <strong>PC</strong> o <strong>Móvil</strong> al iniciar sesión.
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {usuarios.map((u) => {
              const esAdmin = u.rol === 'admin';
              return (
                <div
                  key={u.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-2xl font-black text-sm flex items-center justify-center shrink-0 ${
                        esAdmin
                          ? 'bg-emerald-950 text-emerald-300'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {esAdmin ? 'AD' : u.nombre.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 text-sm">{u.nombre}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            esAdmin
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                              : 'bg-blue-100 text-blue-900 border border-blue-200'
                          }`}
                        >
                          {esAdmin ? 'Administrador (PC)' : 'Vendedor (Móvil)'}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5 flex flex-wrap gap-2 items-center">
                        <span className="font-mono">{u.email}</span>
                        {u.password && <span>• Clave: <span className="font-mono text-slate-600">{u.password}</span></span>}
                        {u.telefono && <span>• Tel: {u.telefono}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <div className="text-xs text-slate-500 flex items-center gap-1.5">
                      {esAdmin ? (
                        <Monitor className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Smartphone className="w-4 h-4 text-blue-600" />
                      )}
                      <span>Abre en {esAdmin ? 'PC / Escritorio' : 'Celular Móvil'}</span>
                    </div>

                    {usuarios.length > 1 && (
                      <button
                        onClick={() => {
                          if (confirm(`¿Eliminar al usuario "${u.nombre}"?`)) {
                            onEliminarUsuario(u.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg"
                        title="Eliminar usuario"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal para Crear Nuevo Usuario */}
      {modalNuevoUsuario && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-emerald-950 text-white">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base">Crear Usuario / Vendedor</h3>
              </div>
              <button
                onClick={() => setModalNuevoUsuario(false)}
                className="p-1.5 text-emerald-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCrearUsuario} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej: Carlos Peralta"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Correo o Identificador de Acceso *
                </label>
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vendedor2@rodriguezperalta.com"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Contraseña / PIN *
                  </label>
                  <input
                    type="text"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="123456"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Teléfono
                  </label>
                  <input
                    type="text"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    placeholder="849-000-0000"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Rol y Pantalla que le abrirá:
                </label>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setRol('vendedor')}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      rol === 'vendedor'
                        ? 'border-blue-500 bg-blue-50 text-blue-900 font-bold'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    <Smartphone className="w-5 h-5 mx-auto mb-1 text-blue-600" />
                    <div>Vendedor</div>
                    <div className="text-[10px] text-slate-400">Abre versión Móvil</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRol('admin')}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      rol === 'admin'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    <Monitor className="w-5 h-5 mx-auto mb-1 text-emerald-700" />
                    <div>Administrador</div>
                    <div className="text-[10px] text-slate-400">Abre versión PC</div>
                  </button>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setModalNuevoUsuario(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 font-semibold text-slate-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  Crear Usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
