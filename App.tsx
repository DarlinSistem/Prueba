import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Cliente,
  Producto,
  Factura,
  AbonoCredito,
  Usuario,
  ModoVista,
  EstadoSincronizacion,
} from './types';
import {
  supabaseService,
  AppSnapshot,
  DEFAULT_SB_URL,
  DEFAULT_SB_KEY,
} from './services/supabaseService';
import {
  calcularResumen,
  fechaHoyYMD,
} from './services/storageService';
import { Navbar } from './components/common/Navbar';
import { AdminLayout } from './components/admin/AdminLayout';
import { MobileLayout } from './components/mobile/MobileLayout';
import { LoginScreen } from './components/auth/LoginScreen';
import { SyncLoginModal } from './components/SyncLoginModal';
import { Sparkles, Database, X } from 'lucide-react';

const SEED_CLIENTES: Cliente[] = [
  { id: 1, nombre: 'Cliente General', telefono: '', direccion: '' },
  { id: 2, nombre: 'Colmado Central', telefono: '809-555-0101', direccion: 'Santiago de los Caballeros' },
  { id: 3, nombre: 'Supermercado Los Prados', telefono: '849-206-9126', direccion: 'Av. Las Carreras #22' },
];

const SEED_PRODUCTOS: Producto[] = [
  {
    id: 101,
    nombre: 'Arroz Selecto 10 lb',
    codigo: '001',
    precioMayorista: 450,
    precioDetalle: 500,
    costo: 380,
    stock: 50,
    stockMinimo: 10,
    categoria: 'Granos',
    activo: true,
  },
  {
    id: 102,
    nombre: 'Aceite de Soya 1 Galón',
    codigo: '002',
    precioMayorista: 350,
    precioDetalle: 400,
    costo: 300,
    stock: 30,
    stockMinimo: 5,
    categoria: 'Aceites',
    activo: true,
  },
  {
    id: 103,
    nombre: 'Azúcar Crema 5 lb',
    codigo: '003',
    precioMayorista: 250,
    precioDetalle: 300,
    costo: 210,
    stock: 40,
    stockMinimo: 8,
    categoria: 'Granos',
    activo: true,
  },
  {
    id: 104,
    nombre: 'Habichuelas Rojas 2 lb',
    codigo: '004',
    precioMayorista: 180,
    precioDetalle: 220,
    costo: 150,
    stock: 4,
    stockMinimo: 5,
    categoria: 'Granos',
    activo: true,
  },
];

const SEED_USUARIOS: Usuario[] = [
  {
    id: 'usr_admin_1',
    nombre: 'Basilio Rodríguez (Admin)',
    email: 'admin@rodriguezperalta.com',
    password: 'admin',
    rol: 'admin',
    telefono: '849-206-9126',
    activo: true,
    creadoEn: new Date().toISOString(),
  },
  {
    id: 'usr_vend_1',
    nombre: 'Darlin Vendedor (Ruta)',
    email: 'vendedor1@rodriguezperalta.com',
    password: '123',
    rol: 'vendedor',
    telefono: '809-555-0199',
    activo: true,
    creadoEn: new Date().toISOString(),
  },
  {
    id: 'usr_vend_2',
    nombre: 'Peralta Móvil (Tienda)',
    email: 'vendedor2@rodriguezperalta.com',
    password: '123',
    rol: 'vendedor',
    telefono: '809-555-0288',
    activo: true,
    creadoEn: new Date().toISOString(),
  },
];

export default function App() {
  // Lista de usuarios y roles
  const [usuarios, setUsuarios] = useState<Usuario[]>(() => {
    const local = localStorage.getItem('rp_usuarios');
    return local ? JSON.parse(local) : SEED_USUARIOS;
  });

  // Usuario actualmente autenticado
  const [usuarioActivo, setUsuarioActivo] = useState<Usuario | null>(() => {
    const local = localStorage.getItem('rp_usuario_activo');
    return local ? JSON.parse(local) : null;
  });

  // Modo de vista: 'pc' para Administrador, 'mobile' para Vendedores
  const [modoVista, setModoVista] = useState<ModoVista>(() => {
    const saved = localStorage.getItem('rp_modo_vista');
    if (saved === 'pc' || saved === 'mobile') return saved;
    return window.innerWidth < 768 ? 'mobile' : 'pc';
  });

  // Datos comerciales principales
  const [clientes, setClientes] = useState<Cliente[]>(() => {
    const local = localStorage.getItem('clientesDistribuidora');
    return local ? JSON.parse(local) : SEED_CLIENTES;
  });

  const [productos, setProductos] = useState<Producto[]>(() => {
    const local = localStorage.getItem('productosDistribuidora');
    return local ? JSON.parse(local) : SEED_PRODUCTOS;
  });

  const [facturas, setFacturas] = useState<Factura[]>(() => {
    const local = localStorage.getItem('facturasDistribuidora');
    return local ? JSON.parse(local) : [];
  });

  const [abonos, setAbonos] = useState<AbonoCredito[]>(() => {
    const local = localStorage.getItem('abonosDistribuidora');
    return local ? JSON.parse(local) : [];
  });

  // Nombre de vendedor actual (asignado por la sesión)
  const [vendedorActual, setVendedorActual] = useState<string>(() => {
    return localStorage.getItem('nombreVendedorFactura') || 'Administrador';
  });

  // Estado de sincronización en vivo con Supabase
  const [syncState, setSyncState] = useState<EstadoSincronizacion>({
    conectado: navigator.onLine,
    sincronizando: false,
    ultimoCambio: '',
    pendientesLocales: localStorage.getItem('distribuidoraPendienteSync') === '1',
    mensaje: navigator.onLine ? 'Supabase Conectado' : 'Modo local (Sin conexión)',
    esError: false,
  });

  const [modalConfigAbierto, setModalConfigAbierto] = useState(false);
  const [bannerExplicativo, setBannerExplicativo] = useState(() => {
    return localStorage.getItem('rp_banner_oculto') !== '1';
  });

  const saveTimeoutRef = useRef<any>(null);

  // Persistencia local
  useEffect(() => {
    localStorage.setItem('rp_usuarios', JSON.stringify(usuarios));
  }, [usuarios]);

  useEffect(() => {
    if (usuarioActivo) {
      localStorage.setItem('rp_usuario_activo', JSON.stringify(usuarioActivo));
    } else {
      localStorage.removeItem('rp_usuario_activo');
    }
  }, [usuarioActivo]);

  useEffect(() => {
    localStorage.setItem('clientesDistribuidora', JSON.stringify(clientes));
  }, [clientes]);

  useEffect(() => {
    localStorage.setItem('productosDistribuidora', JSON.stringify(productos));
  }, [productos]);

  useEffect(() => {
    localStorage.setItem('facturasDistribuidora', JSON.stringify(facturas));
  }, [facturas]);

  useEffect(() => {
    localStorage.setItem('abonosDistribuidora', JSON.stringify(abonos));
  }, [abonos]);

  useEffect(() => {
    localStorage.setItem('rp_modo_vista', modoVista);
  }, [modoVista]);

  // Snapshot actual de la app para Supabase
  const getSnapshot = useCallback((): AppSnapshot => {
    return {
      clientes,
      productos,
      facturas,
      abonos,
      usuarios,
      actualizadoEn: new Date().toISOString(),
    };
  }, [clientes, productos, facturas, abonos, usuarios]);

  // Sincronizar datos hacia Supabase en la tabla distribuidora_estado
  const sincronizarHaciaNube = useCallback(
    (nuevoSnapshot?: AppSnapshot) => {
      const snap = nuevoSnapshot || getSnapshot();
      if (!navigator.onLine) {
        setSyncState((prev) => ({
          ...prev,
          pendientesLocales: true,
          mensaje: 'Guardado local (Sin conexión)',
          esError: false,
        }));
        return;
      }

      setSyncState((prev) => ({
        ...prev,
        sincronizando: true,
        mensaje: 'Guardando en Supabase...',
        esError: false,
      }));

      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(async () => {
        const res = await supabaseService.saveToCloud(snap);
        if (res.success) {
          setSyncState({
            conectado: true,
            sincronizando: false,
            ultimoCambio: new Date().toLocaleTimeString(),
            pendientesLocales: false,
            mensaje: 'Sincronizado con Supabase ✓',
            esError: false,
          });
        } else {
          setSyncState({
            conectado: navigator.onLine,
            sincronizando: false,
            ultimoCambio: '',
            pendientesLocales: true,
            mensaje: res.error || 'Error al conectar con Supabase',
            esError: true,
          });
        }
      }, 700);
    },
    [getSnapshot]
  );

  // Carga inicial desde Supabase
  useEffect(() => {
    const cargarDatosNube = async () => {
      if (!navigator.onLine) return;
      const { data, error } = await supabaseService.loadFromCloud();
      if (data) {
        const pendientes = localStorage.getItem('distribuidoraPendienteSync') === '1';
        if (pendientes) {
          const unificado = supabaseService.mergeSnapshots(data, getSnapshot());
          setClientes(unificado.clientes);
          setProductos(unificado.productos);
          setFacturas(unificado.facturas);
          if (unificado.abonos) setAbonos(unificado.abonos);
          if (unificado.usuarios && unificado.usuarios.length > 0) setUsuarios(unificado.usuarios);
          sincronizarHaciaNube(unificado);
        } else {
          if (Array.isArray(data.clientes) && data.clientes.length > 0) setClientes(data.clientes);
          if (Array.isArray(data.productos) && data.productos.length > 0) setProductos(data.productos);
          if (Array.isArray(data.facturas)) setFacturas(data.facturas);
          if (Array.isArray(data.abonos)) setAbonos(data.abonos);
          if (Array.isArray(data.usuarios) && data.usuarios.length > 0) setUsuarios(data.usuarios);
          setSyncState((prev) => ({
            ...prev,
            conectado: true,
            mensaje: 'Datos cargados desde Supabase ✓',
            esError: false,
          }));
        }
      } else if (error) {
        console.warn('Supabase:', error);
      }
    };

    cargarDatosNube();
  }, []);

  // Polling cada 12 segundos para que lo que haga el vendedor o el admin se actualice en el otro dispositivo
  useEffect(() => {
    const timer = setInterval(async () => {
      if (!navigator.onLine || syncState.sincronizando || syncState.pendientesLocales) return;
      const { hasChanges, data } = await supabaseService.pollCheck();
      if (hasChanges && data) {
        if (Array.isArray(data.clientes)) setClientes(data.clientes);
        if (Array.isArray(data.productos)) setProductos(data.productos);
        if (Array.isArray(data.facturas)) setFacturas(data.facturas);
        if (Array.isArray(data.abonos)) setAbonos(data.abonos);
        if (Array.isArray(data.usuarios) && data.usuarios.length > 0) setUsuarios(data.usuarios);
        setSyncState((prev) => ({
          ...prev,
          mensaje: 'Actualizado en tiempo real desde Supabase ✓',
          ultimoCambio: new Date().toLocaleTimeString(),
        }));
      }
    }, 12000);

    return () => clearInterval(timer);
  }, [syncState.sincronizando, syncState.pendientesLocales]);

  // Manejo de eventos de red
  useEffect(() => {
    const handleOnline = () => {
      setSyncState((prev) => ({ ...prev, conectado: true, mensaje: 'Conexión recuperada con Supabase' }));
      sincronizarHaciaNube();
    };
    const handleOffline = () => {
      setSyncState((prev) => ({ ...prev, conectado: false, mensaje: 'Sin conexión a internet (Guardando local)', esError: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [sincronizarHaciaNube]);

  // Manejador del Inicio de Sesión
  const handleLoginExitoso = (usuario: Usuario) => {
    setUsuarioActivo(usuario);
    setVendedorActual(usuario.nombre);
    localStorage.setItem('nombreVendedorFactura', usuario.nombre);

    // REQUERIMIENTO PRINCIPAL:
    // Si entra el admin -> sale el index de PC.
    // Si entra el vendedor -> sale el index de móvil.
    if (usuario.rol === 'admin') {
      setModoVista('pc');
    } else {
      setModoVista('mobile');
    }

    sincronizarHaciaNube();
  };

  const handleLogout = async () => {
    setUsuarioActivo(null);
    localStorage.removeItem('rp_usuario_activo');
    await supabaseService.logout();
    setSyncState((prev) => ({ ...prev, mensaje: 'Sesión cerrada', esError: false }));
  };

  // Handlers de Guardado de datos
  const handleGuardarProducto = (prod: Producto) => {
    const index = productos.findIndex((p) => String(p.id) === String(prod.id));
    let nuevos: Producto[];
    if (index >= 0) {
      nuevos = [...productos];
      nuevos[index] = prod;
    } else {
      nuevos = [prod, ...productos];
    }
    setProductos(nuevos);
    const snap = { ...getSnapshot(), productos: nuevos };
    sincronizarHaciaNube(snap);
  };

  const handleEliminarProducto = (id: string | number) => {
    const nuevos = productos.filter((p) => String(p.id) !== String(id));
    setProductos(nuevos);
    const snap = { ...getSnapshot(), productos: nuevos };
    sincronizarHaciaNube(snap);
  };

  const handleGuardarFactura = (factura: Factura) => {
    const productosActualizados = productos.map((p) => {
      const itemVendido = factura.productos.find((item) => String(item.id) === String(p.id));
      if (itemVendido) {
        return {
          ...p,
          stock: Math.max(0, Number(p.stock || 0) - Number(itemVendido.cantidad || 0)),
        };
      }
      return p;
    });

    const nuevasFacturas = [factura, ...facturas];
    setProductos(productosActualizados);
    setFacturas(nuevasFacturas);

    const snap = {
      ...getSnapshot(),
      productos: productosActualizados,
      facturas: nuevasFacturas,
    };
    sincronizarHaciaNube(snap);
  };

  const handleAnularFactura = (id: string | number) => {
    const factura = facturas.find((f) => String(f.id) === String(id));
    if (!factura) return;

    const productosRestaurados = productos.map((p) => {
      const item = factura.productos.find((it) => String(it.id) === String(p.id));
      if (item) {
        return {
          ...p,
          stock: Number(p.stock || 0) + Number(item.cantidad || 0),
        };
      }
      return p;
    });

    const facturasMod = facturas.map((f) => {
      if (String(f.id) === String(id)) {
        return { ...f, estado: 'anulada' as const, saldoCredito: 0 };
      }
      return f;
    });

    setProductos(productosRestaurados);
    setFacturas(facturasMod);

    const snap = {
      ...getSnapshot(),
      productos: productosRestaurados,
      facturas: facturasMod,
    };
    sincronizarHaciaNube(snap);
  };

  const handleGuardarCliente = (cliente: Cliente) => {
    const index = clientes.findIndex((c) => String(c.id) === String(cliente.id));
    let nuevos: Cliente[];
    if (index >= 0) {
      nuevos = [...clientes];
      nuevos[index] = cliente;
    } else {
      nuevos = [cliente, ...clientes];
    }
    setClientes(nuevos);
    const snap = { ...getSnapshot(), clientes: nuevos };
    sincronizarHaciaNube(snap);
  };

  const handleEliminarCliente = (id: string | number) => {
    const nuevos = clientes.filter((c) => String(c.id) !== String(id));
    setClientes(nuevos);
    const snap = { ...getSnapshot(), clientes: nuevos };
    sincronizarHaciaNube(snap);
  };

  const handleRegistrarAbono = (abono: AbonoCredito) => {
    const nuevosAbonos = [abono, ...abonos];

    const facturasActualizadas = facturas.map((f) => {
      if (String(f.id) === String(abono.facturaId)) {
        const saldoActual = f.saldoCredito !== undefined ? Number(f.saldoCredito) : Number(f.total || 0);
        const nuevoSaldo = Math.max(0, saldoActual - abono.monto);
        const historial = f.abonos ? [...f.abonos, abono] : [abono];
        return {
          ...f,
          saldoCredito: nuevoSaldo,
          abonos: historial,
        };
      }
      return f;
    });

    setAbonos(nuevosAbonos);
    setFacturas(facturasActualizadas);

    const snap = {
      ...getSnapshot(),
      abonos: nuevosAbonos,
      facturas: facturasActualizadas,
    };
    sincronizarHaciaNube(snap);
  };

  const handleGuardarUsuario = (u: Usuario) => {
    const idx = usuarios.findIndex((usr) => String(usr.id) === String(u.id));
    let nuevos: Usuario[];
    if (idx >= 0) {
      nuevos = [...usuarios];
      nuevos[idx] = u;
    } else {
      nuevos = [...usuarios, u];
    }
    setUsuarios(nuevos);
    const snap = { ...getSnapshot(), usuarios: nuevos };
    sincronizarHaciaNube(snap);
  };

  const handleEliminarUsuario = (id: string | number) => {
    const nuevos = usuarios.filter((usr) => String(usr.id) !== String(id));
    setUsuarios(nuevos);
    const snap = { ...getSnapshot(), usuarios: nuevos };
    sincronizarHaciaNube(snap);
  };

  const handleEditarVendedorPrompt = () => {
    const nuevo = prompt(
      'Escribe el nombre que aparecerá como vendedor en las facturas:',
      vendedorActual
    );
    if (nuevo !== null && nuevo.trim()) {
      setVendedorActual(nuevo.trim());
      localStorage.setItem('nombreVendedorFactura', nuevo.trim());
    }
  };

  // 1. SI NO HAY SESIÓN INICIADA: MOSTRAR PANTALLA DE LOGIN
  if (!usuarioActivo) {
    return (
      <LoginScreen
        usuarios={usuarios}
        onLoginExitoso={handleLoginExitoso}
      />
    );
  }

  // 2. CON SESIÓN INICIADA: MOSTRAR INTERFAZ CORRESPONDIENTE
  const resumen = calcularResumen(facturas, productos, abonos);
  const fechaHoy = fechaHoyYMD();

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Barra de Navegación Superior */}
      <Navbar
        modoVista={modoVista}
        onCambiarModo={(m) => setModoVista(m)}
        syncState={syncState}
        onSincronizarManual={() => sincronizarHaciaNube()}
        vendedorActual={vendedorActual}
        onEditarVendedor={handleEditarVendedorPrompt}
        usuarioActivo={usuarioActivo}
        onLogout={handleLogout}
      />

      {/* Banner Informativo con estado de Supabase y Rol */}
      {bannerExplicativo && (
        <div className="bg-emerald-950 text-white px-4 py-2 text-xs flex items-center justify-between border-b border-emerald-900 shadow-xs">
          <div className="flex items-center gap-2 max-w-5xl">
            <Database className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>
              <strong>Base de Datos Supabase Conectada:</strong> <code>dpkeorkmexujbtnibrbo.supabase.co</code> • Sesión activa:{' '}
              <strong>{usuarioActivo.nombre}</strong> (
              {usuarioActivo.rol === 'admin' ? 'Administrador - Vista PC' : 'Vendedor - Vista Móvil'}).
            </span>
          </div>
          <button
            onClick={() => {
              setBannerExplicativo(false);
              localStorage.setItem('rp_banner_oculto', '1');
            }}
            className="p-1 text-emerald-400 hover:text-white shrink-0 ml-2"
            title="Cerrar aviso"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Contenedor Principal según Rol y Modo */}
      <div className="flex-1">
        {modoVista === 'pc' ? (
          /* =====================================================
             VISTA PC / ADMINISTRADOR
             ===================================================== */
          <AdminLayout
            resumen={resumen}
            productos={productos}
            clientes={clientes}
            facturas={facturas}
            abonos={abonos}
            usuarios={usuarios}
            vendedorActual={vendedorActual}
            fechaHoy={fechaHoy}
            onGuardarProducto={handleGuardarProducto}
            onEliminarProducto={handleEliminarProducto}
            onGuardarFactura={handleGuardarFactura}
            onAnularFactura={handleAnularFactura}
            onGuardarCliente={handleGuardarCliente}
            onEliminarCliente={handleEliminarCliente}
            onRegistrarAbono={handleRegistrarAbono}
            onGuardarUsuario={handleGuardarUsuario}
            onEliminarUsuario={handleEliminarUsuario}
            onCambiarModoMovil={() => setModoVista('mobile')}
          />
        ) : (
          /* =====================================================
             VISTA MÓVIL / VENDEDORES
             ===================================================== */
          <MobileLayout
            productos={productos}
            clientes={clientes}
            facturas={facturas}
            abonos={abonos}
            vendedorActual={vendedorActual}
            syncState={syncState}
            onGuardarFactura={handleGuardarFactura}
            onGuardarCliente={handleGuardarCliente}
            onRegistrarAbono={handleRegistrarAbono}
            onEditarVendedor={handleEditarVendedorPrompt}
            onSincronizarManual={() => sincronizarHaciaNube()}
            onCambiarModoPC={() => setModoVista('pc')}
          />
        )}
      </div>

      {/* Modal de Configuración de Credenciales */}
      <SyncLoginModal
        isOpen={modalConfigAbierto}
        onClose={() => setModalConfigAbierto(false)}
        onSuccess={() => {
          sincronizarHaciaNube();
        }}
        vendedorActual={vendedorActual}
        onActualizarVendedor={(nom) => {
          setVendedorActual(nom);
          localStorage.setItem('nombreVendedorFactura', nom);
        }}
      />
    </div>
  );
}
