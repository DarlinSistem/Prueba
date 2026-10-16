import React from 'react';
import { ModoVista, EstadoSincronizacion, Usuario } from './types';
import { LOGO_BASE64 } from './storageService';
import { supabaseService } from './supabaseService';
import { 
  Monitor, 
  Smartphone, 
  RefreshCw, 
  Wifi, 
  WifiOff, 
  LogOut, 
  Edit3,
  ShieldAlert,
  Database,
  Settings2,
  User,
  Shield
} from 'lucide-react';

interface Props {
  modoVista: ModoVista;
  onCambiarModo: (modo: ModoVista) => void;
  syncState: EstadoSincronizacion;
  onSincronizarManual: () => void;
  onAbrirConfigSupabase: () => void;
  vendedorActual: string;
  onEditarVendedor: () => void;
  usuarioActivo?: Usuario | null;
  onLogout: () => void;
}

export const Navbar: React.FC<Props> = ({
  modoVista,
  onCambiarModo,
  syncState,
  onSincronizarManual,
  onAbrirConfigSupabase,
  vendedorActual,
  onEditarVendedor,
  usuarioActivo,
  onLogout,
}) => {
  const esAdmin = usuarioActivo?.rol === 'admin';

  return (
    <header className="sticky top-0 z-40 bg-emerald-950 text-white border-b border-emerald-900/60 shadow-md">
      {/* Barra de sincronización e información superior rápida */}
      <div className="bg-emerald-900/80 px-3 sm:px-6 py-1.5 flex flex-wrap items-center justify-between text-xs gap-2 border-b border-emerald-800/40">
        <div className="flex items-center gap-2">
          {/* Badge de Sincronización */}
          <div
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-medium text-[11px] ${
              syncState.esError
                ? 'bg-red-500/20 text-red-200 border border-red-500/30'
                : syncState.pendientesLocales
                ? 'bg-amber-500/20 text-amber-200 border border-amber-500/30'
                : 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/30'
            }`}
          >
            {syncState.esError ? (
              <ShieldAlert className="w-3 h-3 text-red-400" />
            ) : syncState.conectado ? (
              <Wifi className="w-3 h-3 text-emerald-400" />
            ) : (
              <WifiOff className="w-3 h-3 text-amber-400" />
            )}
            <span>{syncState.mensaje}</span>
          </div>

          {/* Info Base de Datos Supabase */}
          <div className="hidden md:flex items-center gap-1 text-[11px] text-emerald-300 font-mono">
            <Database className="w-3 h-3 text-emerald-400" />
            <span>Supabase: dpkeorkmexujbtnibrbo.supabase.co</span>
          </div>

          <button
            onClick={onSincronizarManual}
            disabled={syncState.sincronizando}
            className="text-emerald-300 hover:text-white flex items-center gap-1 hover:underline transition-all ml-1"
            title="Sincronizar con Supabase"
          >
            <RefreshCw className={`w-3 h-3 ${syncState.sincronizando ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Sincronizar</span>
          </button>
          <button
            onClick={onAbrirConfigSupabase}
            className="text-emerald-300 hover:text-white p-1 transition-colors"
            title="Configurar conexión con Supabase"
            aria-label="Configurar conexión con Supabase"
          >
            <Settings2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Info Usuario Activo, Rol y Cerrar Sesión */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span
              className={`px-2 py-0.2 rounded-full font-black text-[10px] uppercase tracking-wider ${
                esAdmin
                  ? 'bg-emerald-300 text-emerald-950'
                  : 'bg-blue-300 text-blue-950'
              }`}
            >
              {esAdmin ? 'Admin (PC)' : 'Vendedor (Móvil)'}
            </span>

            <button
              onClick={onEditarVendedor}
              className="flex items-center gap-1 text-emerald-100 hover:text-white transition-colors"
              title="Cambiar nombre de vendedor para las facturas"
            >
              <User className="w-3.5 h-3.5 text-emerald-300" />
              <span className="font-bold truncate max-w-[130px] sm:max-w-[180px]">
                {usuarioActivo?.nombre || vendedorActual || 'Usuario'}
              </span>
              <Edit3 className="w-3 h-3 text-emerald-400 opacity-70" />
            </button>
          </div>

          <button
            onClick={onLogout}
            className="text-red-300 hover:text-red-100 flex items-center gap-1 px-2 py-0.5 rounded-lg hover:bg-red-950/50 transition-colors font-bold text-xs"
            title="Cerrar sesión y volver al login"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>

      {/* Barra principal con Logo y Switch de Modo PC / Móvil */}
      <div className="px-3 sm:px-6 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={LOGO_BASE64}
            alt="Logo"
            className="w-10 h-9 object-contain drop-shadow-xs"
          />
          <div>
            <h1 className="font-extrabold text-base sm:text-lg tracking-wider text-white leading-tight">
              RODRIGUEZ PERALTA
            </h1>
            <p className="text-[10px] text-emerald-300 uppercase tracking-widest font-semibold hidden xs:block">
              Distribución & Comercio
            </p>
          </div>
        </div>

        {/* Switch de Modo Vista: si es admin puede alternar ambas vistas */}
        {esAdmin ? (
          <div className="flex items-center bg-emerald-900/90 p-1 rounded-xl border border-emerald-800 shadow-inner">
            <button
              onClick={() => onCambiarModo('pc')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                modoVista === 'pc'
                  ? 'bg-emerald-500 text-emerald-950 shadow-sm'
                  : 'text-emerald-200 hover:text-white hover:bg-emerald-800/50'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>PC / Admin</span>
            </button>

            <button
              onClick={() => onCambiarModo('mobile')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                modoVista === 'mobile'
                  ? 'bg-emerald-500 text-emerald-950 shadow-sm'
                  : 'text-emerald-200 hover:text-white hover:bg-emerald-800/50'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Móvil / Vendedor</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-900/80 border border-emerald-800 text-emerald-200 text-xs font-bold">
            <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
            <span>Versión Móvil Vendedor</span>
          </div>
        )}
      </div>
    </header>
  );
};
