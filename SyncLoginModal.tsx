import React, { useState } from 'react';
import { supabaseService, DEFAULT_SB_URL, DEFAULT_SB_KEY } from '../services/supabaseService';
import { LOGO_BASE64 } from '../services/storageService';
import { Lock, Mail, Server, WifiOff, X, Check, Settings2, ShieldCheck, AlertCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  vendedorActual: string;
  onActualizarVendedor: (nuevoNombre: string) => void;
}

export const SyncLoginModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSuccess,
  vendedorActual,
  onActualizarVendedor,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [nombreVendedor, setNombreVendedor] = useState(vendedorActual);
  const [mostrarConfigAvanzada, setMostrarConfigAvanzada] = useState(false);
  const [sbUrl, setSbUrl] = useState(localStorage.getItem('rp_supabase_url') || DEFAULT_SB_URL);
  const [sbKey, setSbKey] = useState(localStorage.getItem('rp_supabase_key') || DEFAULT_SB_KEY);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setCargando(true);

    try {
      const { error } = await supabaseService.login(email, password);
      if (error) {
        setErrorMsg(error);
      } else {
        if (nombreVendedor.trim()) {
          onActualizarVendedor(nombreVendedor.trim());
        }
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al conectar con Supabase');
    } finally {
      setCargando(false);
    }
  };

  const handleGuardarConfigAvanzada = () => {
    supabaseService.updateCredentials(sbUrl, sbKey);
    alert('Configuración de Supabase actualizada.');
    setMostrarConfigAvanzada(false);
  };

  const handleContinuarOffline = () => {
    if (nombreVendedor.trim()) {
      onActualizarVendedor(nombreVendedor.trim());
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Cabecera */}
        <div className="bg-emerald-950 px-6 pt-6 pb-5 text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-emerald-300 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
          <img
            src={LOGO_BASE64}
            alt="Logo"
            className="w-20 h-16 object-contain mx-auto mb-2 drop-shadow-md"
          />
          <h2 className="text-xl font-extrabold tracking-wide text-white">RODRIGUEZ PERALTA</h2>
          <p className="text-xs text-emerald-200 mt-1">
            Sincronización en tiempo real con Supabase
          </p>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-4">
          <form onSubmit={handleLogin} className="space-y-3.5">
            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Correo de Supabase
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@ejemplo.com"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nombre de Vendedor / Admin (para facturas)
              </label>
              <input
                type="text"
                value={nombreVendedor}
                onChange={(e) => setNombreVendedor(e.target.value)}
                placeholder="Ej: Basilio Rodríguez"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-600 focus:outline-hidden"
              />
            </div>

            <button
              type="submit"
              disabled={cargando}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-colors flex items-center justify-center gap-2"
            >
              {cargando ? 'Conectando con Supabase...' : 'Iniciar Sesión y Sincronizar'}
            </button>
          </form>

          <div className="relative flex py-1 items-center">
            <div className="grow border-t border-slate-200"></div>
            <span className="shrink mx-3 text-xs text-slate-400">o continuar</span>
            <div className="grow border-t border-slate-200"></div>
          </div>

          <button
            type="button"
            onClick={handleContinuarOffline}
            className="w-full py-2 px-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <WifiOff className="w-4 h-4 text-slate-500" />
            Continuar en Modo Local / Sin Conexión
          </button>

          {/* Configuración avanzada de Supabase */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setMostrarConfigAvanzada(!mostrarConfigAvanzada)}
              className="text-xs text-slate-500 hover:text-emerald-700 flex items-center gap-1 mx-auto"
            >
              <Settings2 className="w-3.5 h-3.5" />
              {mostrarConfigAvanzada ? 'Ocultar ajustes de conexión' : 'Ver ajustes de conexión Supabase'}
            </button>

            {mostrarConfigAvanzada && (
              <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div>
                  <label className="text-slate-600 font-medium">Supabase URL:</label>
                  <input
                    type="text"
                    value={sbUrl}
                    onChange={(e) => setSbUrl(e.target.value)}
                    className="w-full px-2 py-1 mt-0.5 border border-slate-200 rounded bg-white text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-600 font-medium">Supabase Anon Key:</label>
                  <input
                    type="text"
                    value={sbKey}
                    onChange={(e) => setSbKey(e.target.value)}
                    className="w-full px-2 py-1 mt-0.5 border border-slate-200 rounded bg-white text-xs font-mono"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleGuardarConfigAvanzada}
                  className="w-full py-1.5 bg-slate-800 text-white rounded text-xs font-semibold"
                >
                  Guardar Nuevas Credenciales
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
