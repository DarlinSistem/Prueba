import React, { useState } from 'react';
import { Usuario, RolUsuario } from '../../types';
import { LOGO_BASE64 } from '../../services/storageService';
import { supabaseService } from '../../services/supabaseService';
import {
  Lock,
  Mail,
  User,
  Monitor,
  Smartphone,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  KeyRound,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';

interface Props {
  usuarios: Usuario[];
  onLoginExitoso: (usuario: Usuario) => void;
}

export const LoginScreen: React.FC<Props> = ({ usuarios, onLoginExitoso }) => {
  const [emailOUser, setEmailOUser] = useState('');
  const [password, setPassword] = useState('');
  const [mostrarPass, setMostrarPass] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [tabLogin, setTabLogin] = useState<'formulario' | 'rapido'>('formulario');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setCargando(true);

    const inputIdentificador = emailOUser.trim().toLowerCase();
    const inputPassword = password.trim();

    try {
      // 1. Primero verificar si coincide con un usuario registrado en el sistema local/sincronizado
      const usuarioEncontrado = usuarios.find(
        (u) =>
          u.activo &&
          (u.email.toLowerCase() === inputIdentificador ||
            u.nombre.toLowerCase() === inputIdentificador)
      );

      if (usuarioEncontrado) {
        if (!usuarioEncontrado.password || usuarioEncontrado.password === inputPassword) {
          setCargando(false);
          onLoginExitoso(usuarioEncontrado);
          return;
        }
      }

      // 2. Intentar autenticar contra Supabase Auth si es un correo
      if (inputIdentificador.includes('@')) {
        const { session, error } = await supabaseService.login(inputIdentificador, inputPassword);
        if (!error && session) {
          // Determinar rol: si el email contiene "admin" o el usuario local está marcado como admin
          const metadata = (session.user as any)?.user_metadata || {};
          const rolDetectado: RolUsuario =
            usuarioEncontrado?.rol ||
            metadata?.role ||
            (inputIdentificador.includes('admin') || inputIdentificador === 'basiliodarlin0@gmail.com' ? 'admin' : 'vendedor');

          const usuarioSupabase: Usuario = {
            id: session.user.id,
            nombre: metadata?.full_name || metadata?.name || usuarioEncontrado?.nombre || (rolDetectado === 'admin' ? 'Administrador' : 'Vendedor'),
            email: session.user.email || inputIdentificador,
            rol: rolDetectado,
            activo: true,
          };

          setCargando(false);
          onLoginExitoso(usuarioSupabase);
          return;
        }
      }

      // 3. Si no coincide con ninguno
      setErrorMsg('Usuario o contraseña incorrectos. Revisa tus datos o usa los accesos rápidos abajo.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Error de autenticación.');
    } finally {
      setCargando(false);
    }
  };

  const handleAccesoRapido = (usuario: Usuario) => {
    onLoginExitoso(usuario);
  };

  const adminUsuarios = usuarios.filter((u) => u.rol === 'admin' && u.activo);
  const vendedorUsuarios = usuarios.filter((u) => u.rol === 'vendedor' && u.activo);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 selection:bg-emerald-500 selection:text-white">
      {/* Fondo con brillo sutil */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-950 via-slate-950 to-slate-950 pointer-events-none opacity-90"></div>

      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* Encabezado con Logo Oficial */}
        <div className="bg-emerald-950 pt-8 pb-6 px-6 text-center text-white relative">
          <img
            src={LOGO_BASE64}
            alt="Logo Rodríguez Peralta"
            className="w-24 h-20 object-contain mx-auto mb-2 drop-shadow-md"
          />
          <h1 className="text-2xl font-black tracking-wider text-white">
            RODRIGUEZ PERALTA
          </h1>
          <p className="text-xs text-emerald-300 font-semibold uppercase tracking-widest mt-0.5">
            Sistema Comercial Integrado
          </p>
        </div>

        {/* Selector de tipo de ingreso: Formulario vs Acceso Directo */}
        <div className="flex border-b border-slate-100 bg-slate-50 text-xs font-bold text-slate-500">
          <button
            type="button"
            onClick={() => setTabLogin('formulario')}
            className={`flex-1 py-3 text-center transition-colors border-b-2 ${
              tabLogin === 'formulario'
                ? 'border-emerald-600 text-emerald-900 bg-white'
                : 'border-transparent hover:text-slate-800'
            }`}
          >
            Iniciar con Contraseña
          </button>
          <button
            type="button"
            onClick={() => setTabLogin('rapido')}
            className={`flex-1 py-3 text-center transition-colors border-b-2 flex items-center justify-center gap-1.5 ${
              tabLogin === 'rapido'
                ? 'border-emerald-600 text-emerald-900 bg-white'
                : 'border-transparent hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Acceso Rápido por Rol
          </button>
        </div>

        {/* Contenido de la Pantalla */}
        <div className="p-6">
          {tabLogin === 'formulario' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="text-center mb-1">
                <h2 className="text-base font-extrabold text-slate-800">
                  Iniciar Sesión
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  El sistema detectará tu rol y abrirá automáticamente tu pantalla correspondiente.
                </p>
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Input Correo / Usuario */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Correo o Nombre de Usuario
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={emailOUser}
                    onChange={(e) => setEmailOUser(e.target.value)}
                    placeholder="admin@rodriguezperalta.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-hidden transition-colors"
                  />
                </div>
              </div>

              {/* Input Contraseña */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={mostrarPass ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-hidden transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarPass(!mostrarPass)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {mostrarPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Botón Ingresar */}
              <button
                type="submit"
                disabled={cargando}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2"
              >
                {cargando ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Validando usuario...</span>
                  </>
                ) : (
                  <>
                    <span>Entrar al Sistema</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Indicador de qué pantalla abrirá */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-[11px] text-slate-600 space-y-1">
                <div className="flex items-center gap-2 font-bold text-slate-800">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Detección automática de interfaz:</span>
                </div>
                <div className="flex items-center gap-2 pl-5">
                  <Monitor className="w-3 h-3 text-emerald-700" />
                  <span>Si eres <strong>Administrador</strong>: abre la versión <strong>PC</strong>.</span>
                </div>
                <div className="flex items-center gap-2 pl-5">
                  <Smartphone className="w-3 h-3 text-blue-700" />
                  <span>Si eres <strong>Vendedor</strong>: abre la versión <strong>Móvil</strong>.</span>
                </div>
              </div>
            </form>
          ) : (
            /* TAB DE ACCESO RÁPIDO / PERFILES LISTOS */
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-base font-extrabold text-slate-800">
                  Selecciona tu Usuario
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Toca tu cuenta para ingresar inmediatamente con tu rol configurado.
                </p>
              </div>

              {/* Sección Administrador */}
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Monitor className="w-3.5 h-3.5 text-emerald-600" /> Cuenta de Administrador (Vista PC)
                </div>
                {adminUsuarios.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => handleAccesoRapido(u)}
                    className="w-full p-3 rounded-2xl border-2 border-emerald-600/30 hover:border-emerald-600 bg-emerald-50/50 hover:bg-emerald-50 text-left transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-950 text-emerald-300 font-bold flex items-center justify-center text-sm">
                        AD
                      </div>
                      <div>
                        <div className="font-extrabold text-slate-900 text-sm group-hover:text-emerald-950">
                          {u.nombre}
                        </div>
                        <div className="text-[11px] text-emerald-800 font-medium">
                          {u.email} • Administrador
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-lg">
                      Entrar PC →
                    </span>
                  </button>
                ))}
              </div>

              {/* Sección Vendedores */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-blue-600" /> Cuentas de Vendedores (Vista Móvil)
                </div>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-0.5">
                  {vendedorUsuarios.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => handleAccesoRapido(u)}
                      className="w-full p-3 rounded-2xl border border-slate-200 hover:border-blue-500 bg-white hover:bg-blue-50/40 text-left transition-all flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-sm">
                          {u.nombre.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-sm group-hover:text-blue-900">
                            {u.nombre}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {u.email} • Venta y Cobros
                          </div>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-blue-800 bg-blue-50 px-2.5 py-1 rounded-lg">
                        Móvil →
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Pie con soporte de sincronización */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 text-center text-[11px] text-slate-400">
          Sincronizado con Supabase • Netlify Cloud Hosting
        </div>
      </div>
    </div>
  );
};
