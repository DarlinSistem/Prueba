export type TipoPrecio = 'mayorista' | 'detalle';
export type FormaPago = 'contado' | 'credito';
export type EstadoFactura = 'emitida' | 'anulada';
export type RolUsuario = 'admin' | 'vendedor';
export type ModoVista = 'pc' | 'mobile';

export interface Usuario {
  id: string | number;
  nombre: string;
  email: string;
  password?: string;
  pin?: string;
  rol: RolUsuario;
  telefono?: string;
  activo: boolean;
  creadoEn?: string;
}

export interface SesionActiva {
  usuario: Usuario;
  timestamp: string;
}

export interface Cliente {
  id: number | string;
  nombre: string;
  telefono?: string;
  direccion?: string;
  limiteCredito?: number;
  saldoPendiente?: number;
  creadoEn?: string;
}

export interface Producto {
  id: number | string;
  nombre: string;
  codigo?: string;
  precioMayorista: number;
  precioDetalle: number;
  costo?: number;
  stock: number;
  stockMinimo?: number;
  categoria?: string;
  activo?: boolean;
}

export interface ItemCarrito {
  id: number | string;
  nombre: string;
  precio: number;
  tipoPrecio: TipoPrecio;
  cantidad: number;
  costo?: number;
}

export interface FacturaCliente {
  id?: number | string;
  nombre: string;
  telefono?: string;
  direccion?: string;
}

export interface Factura {
  id: number | string;
  numero: string;
  fecha: string;
  cliente: FacturaCliente;
  productos: ItemCarrito[];
  vendedor: string;
  vendedorId?: string;
  total: number;
  formaPago: FormaPago;
  montoRecibido: number;
  cambio: number;
  saldoCredito?: number;
  estado?: EstadoFactura;
  abonos?: AbonoCredito[];
}

export interface AbonoCredito {
  id: number | string;
  facturaId: number | string;
  facturaNumero: string;
  clienteNombre: string;
  fecha: string;
  monto: number;
  vendedor: string;
  nota?: string;
  saldoRestante: number;
}

export interface ConfigEmpresa {
  nombreComercial: string;
  telefono: string;
  rnc?: string;
  direccion?: string;
  nombreVendedorDefecto: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
}

export interface EstadoSincronizacion {
  conectado: boolean;
  sincronizando: boolean;
  ultimoCambio: string;
  pendientesLocales: boolean;
  mensaje: string;
  esError: boolean;
}

export interface ResumenVentas {
  hoy: number;
  semana: number;
  quincena: number;
  mes: number;
  contadoHoy: number;
  creditoHoy: number;
  cobrosHoy: number;
  cantidadFacturasHoy: number;
  deudaTotalPendiente: number;
  productosBajoStock: number;
}
