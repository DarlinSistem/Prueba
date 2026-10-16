import React, { useState } from 'react';
import { Usuario, RolUsuario } from './types';
import { Users, Plus, X, Shield, Smartphone, Monitor, CheckCircle, Trash2, Edit2, Key, Mail, Phone, Lock } from 'lucide-react';

interface Props {
  usuarios: Usuario[];
  onGuardarUsuario: (usuario: Usuario) => void;
  onEliminarUsuario: (id: string | number) => void;
  onClose: () => void;
}

export const AdminUsersModal: React.FC<Props> = ({
  usuarios,
  onGuardarUsuario,
  onEliminarUsuario,
  onClose,
}) => {
  const [modalFormulario, setModalFormulario] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState<Usuario | null>(null);

  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [telefono, setTelefono] = useState('');
  const [rol, setRol] = useState<RolUsuario>('vendedor');

  const abrirNuevo = () => {
    setUsuarioEditando(null);
    setNombre('');
    setEmail('');
    setPassword('123456');
    setTelefono('');
    setRol('vendedor');
    setModalFormulario(true);
  };

  const abrirEditar = (u: Usuario) => {
    setUsuarioEditando(u);
    setNombre(u.nombre);
    setEmail(u.email);
    setPassword(u.password || '');
    setTelefono(u.telefono || '');
    setRol(u.rol);
    setModalFormulario(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !email.trim()) return;

    const uFinal: Usuario = {
      id: usuarioEditando ? usuarioEditando.id : Date.now(),
      nombre: nombre.trim(),
      email: email.trim().toLowerCase(),
      password: password.trim() || '123456',
      telefono: telefono.trim() || undefined,
      rol,
      activo: true,
      creadoEn: usuarioEditando?.creadoEn || new Date().toISOString(),
    };

    onGuardarUsuario(uFinal);
    setModalFormulario(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Cabecera */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-emerald-950 text-white">
          <div className="flex items-center gap-2.5">
            <Users className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-bold text-base">Gestión de Usuarios y Vendedores</h3>
              <p className="text-xs text-emerald-200">
                Administra quiénes tienen acceso al panel de PC y quiénes a la app móvil
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-emerald-300 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Usuarios Registrados ({usuarios.length})
            </span>
            <button
              onClick={abrirNuevo}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" /> + Crear Vendedor / Usuario
            </button>
          </div>

          {/* Tabla de Usuarios */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
            {usuarios.map((u) => {
              const esAdmin = u.rol === 'admin';
              return (
                <div key={u.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl font-bold flex items-center justify-center text-sm ${
                        esAdmin ? 'bg-emerald-950 text-emerald-300' : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {esAdmin ? 'AD' : u.nombre.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                        <span>{u.nombre}</span>
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.2 rounded-full flex items-center gap-1 ${
                            esAdmin ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {esAdmin ? <Monitor className="w-3 h-3" /> : <Smartphone className="w-3 h-3" />}
                          {esAdmin ? 'Admin (PC)' : 'Vendedor (Móvil)'}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" /> {u.email}
                        </span>
                        {u.password && (
                          <span className="flex items-center gap-1 font-mono text-[11px] text-slate-500">
                            <Key className="w-3 h-3" /> clave: {u.password}
                          </span>
                        )}
                        {u.telefono && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" /> {u.telefono}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => abrirEditar(u)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
                      title="Editar usuario"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {usuarios.length > 1 && (
                      <button
                        onClick={() => {
                          if (confirm(`¿Eliminar al usuario "${u.nombre}"?`)) {
                            onEliminarUsuario(u.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
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

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-1">
            <strong>Cómo funciona el acceso automático:</strong>
            <p>
              • Al ingresar un usuario con rol <strong>Administrador</strong>, la aplicación abrirá automáticamente la versión completa de <strong>PC</strong>.
            </p>
            <p>
              • Al ingresar un usuario con rol <strong>Vendedor</strong>, la aplicación abrirá automáticamente la versión de <strong>Móvil</strong> con solo Venta, Clientes, Facturas y Cobranzas.
            </p>
          </div>
        </div>

        {/* Modal de Crear / Editar Usuario */}
        {modalFormulario && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="w-full max-w-md bg-white rounded-2xl p-5 shadow-2xl border border-slate-200 space-y-3.5 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <h4 className="font-bold text-sm text-slate-800">
                  {usuarioEditando ? 'Editar Usuario' : 'Crear Nuevo Usuario o Vendedor'}
                </h4>
                <button onClick={() => setModalFormulario(false)} className="text-slate-400">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nombre Completo *</label>
                  <input
                    type="text"
                    required
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Ej: Juan Vendedor"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Correo o Usuario de Ingreso *</label>
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vendedor1@rodriguezperalta.com"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Contraseña de Acceso</label>
                  <input
                    type="text"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="123456"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Teléfono (Opcional)</label>
                  <input
                    type="text"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    placeholder="809-555-0100"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Rol de Acceso e Interfaz</label>
                  <select
                    value={rol}
                    onChange={(e) => setRol(e.target.value as RolUsuario)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold bg-white"
                  >
                    <option value="vendedor">Vendedor (Abre interfaz Móvil: Venta, Clientes, Facturas y Cobros)</option>
                    <option value="admin">Administrador (Abre interfaz PC: Control Total, Inventario, Créditos)</option>
                  </select>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setModalFormulario(false)}
                    className="flex-1 py-2 text-slate-500 font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl"
                  >
                    {usuarioEditando ? 'Guardar Cambios' : 'Crear Usuario'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
