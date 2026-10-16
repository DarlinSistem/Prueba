import { createClient, SupabaseClient, Session } from '@supabase/supabase-js';
import { Cliente, Producto, Factura, AbonoCredito, Usuario } from './types';

export const DEFAULT_SB_URL = 'https://dpkeorkmexujbtnibrbo.supabase.co';
export const DEFAULT_SB_KEY = 'sb_publishable_ZlcBnCtL7W-w8t5yK7aOLQ_7Jk-yg8U';
export const DEFAULT_SB_ROW = 'principal';

export interface AppSnapshot {
  clientes: Cliente[];
  productos: Producto[];
  facturas: Factura[];
  abonos?: AbonoCredito[];
  usuarios?: Usuario[];
  actualizadoEn?: string;
}

class SupabaseService {
  private client: SupabaseClient | null = null;
  private session: Session | null = null;
  private url: string = DEFAULT_SB_URL;
  private key: string = DEFAULT_SB_KEY;
  private rowId: string = DEFAULT_SB_ROW;
  private lastRemoteUpdate: string = '';
  private syncTimer: any = null;

  constructor() {
    this.initFromLocalStorage();
  }

  private initFromLocalStorage() {
    const savedUrl = localStorage.getItem('rp_supabase_url') || DEFAULT_SB_URL;
    const savedKey = localStorage.getItem('rp_supabase_key') || DEFAULT_SB_KEY;
    this.url = savedUrl;
    this.key = savedKey;

    try {
      this.client = createClient(this.url, this.key, {
        auth: {
          persistSession: true,
          storage: window.localStorage,
          autoRefreshToken: true,
        },
      });

      const rawSession = localStorage.getItem('distribuidoraSupabaseSession') || localStorage.getItem('rp_session');
      if (rawSession) {
        const parsed = JSON.parse(rawSession);
        if (parsed?.access_token) {
          this.session = parsed;
        }
      }
    } catch (e) {
      console.warn('Error inicializando Supabase Client:', e);
    }
  }

  public getSession(): Session | null {
    return this.session;
  }

  public updateCredentials(url: string, key: string) {
    this.url = url.trim();
    this.key = key.trim();
    localStorage.setItem('rp_supabase_url', this.url);
    localStorage.setItem('rp_supabase_key', this.key);
    this.initFromLocalStorage();
  }

  public getUrl(): string {
    return this.url;
  }

  public getKey(): string {
    return this.key;
  }

  public async login(email: string, password: string): Promise<{ error?: string; session?: any }> {
    const cleanEmail = email.trim();
    try {
      // 1. Probar con endpoint REST nativo de Supabase Auth (compatible con publishable y anon keys)
      const res = await fetch(`${this.url}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          apikey: this.key,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: cleanEmail, password }),
      });

      const data = await res.json();
      if (res.ok && (data.access_token || data.session?.access_token)) {
        const sessionObj = data.session || data;
        this.session = sessionObj;
        localStorage.setItem('distribuidoraSupabaseSession', JSON.stringify(sessionObj));
        localStorage.setItem('rp_session', JSON.stringify(sessionObj));
        return { session: sessionObj };
      }

      // 2. Fallback a cliente supabase-js
      if (this.client) {
        const { data: clientData, error: clientErr } = await this.client.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (!clientErr && clientData.session) {
          this.session = clientData.session;
          localStorage.setItem('distribuidoraSupabaseSession', JSON.stringify(clientData.session));
          localStorage.setItem('rp_session', JSON.stringify(clientData.session));
          return { session: clientData.session };
        }
      }

      return {
        error:
          data?.message ||
          data?.msg ||
          data?.error_description ||
          'No se pudo autenticar con Supabase. Revisa correo y contraseña.',
      };
    } catch (err: any) {
      return { error: err.message || 'Error de conexión con Supabase' };
    }
  }

  public async logout() {
    try {
      if (this.client) {
        await this.client.auth.signOut();
      }
    } catch (e) {
      console.warn(e);
    }
    this.session = null;
    localStorage.removeItem('distribuidoraSupabaseSession');
    localStorage.removeItem('rp_session');
  }

  public mergeRows<T extends { id?: number | string; numero?: string; codigo?: string }>(
    remoteRows: T[] = [],
    localRows: T[] = []
  ): T[] {
    const out: T[] = [...remoteRows];
    for (const item of localRows) {
      const key = item.id ?? item.numero ?? item.codigo;
      const index = key != null ? out.findIndex((x) => String(x.id ?? x.numero ?? x.codigo) === String(key)) : -1;
      if (index >= 0) {
        out[index] = { ...out[index], ...item };
      } else {
        out.push(item);
      }
    }
    return out;
  }

  public mergeSnapshots(remote: Partial<AppSnapshot>, local: AppSnapshot): AppSnapshot {
    return {
      clientes: this.mergeRows(remote.clientes || [], local.clientes || []),
      productos: this.mergeRows(remote.productos || [], local.productos || []),
      facturas: this.mergeRows(remote.facturas || [], local.facturas || []),
      abonos: this.mergeRows(remote.abonos || [], local.abonos || []),
      usuarios: this.mergeRows(remote.usuarios || [], local.usuarios || []),
      actualizadoEn: new Date().toISOString(),
    };
  }

  public async loadFromCloud(): Promise<{ data?: AppSnapshot; error?: string }> {
    try {
      if (!navigator.onLine) {
        return { error: 'Sin conexión a internet' };
      }

      // Consulta a la tabla distribuidora_estado
      const headers: Record<string, string> = {
        apikey: this.key,
        'Content-Type': 'application/json',
      };
      if (this.session?.access_token) {
        headers['Authorization'] = `Bearer ${this.session.access_token}`;
      }

      const res = await fetch(`${this.url}/rest/v1/distribuidora_estado?select=id,datos,actualizado_en&id=eq.${encodeURIComponent(this.rowId)}`, {
        headers,
      });

      if (!res.ok) {
        const text = await res.text();
        return { error: text || `HTTP ${res.status}` };
      }

      const rows = await res.json();
      if (rows && rows.length > 0) {
        this.lastRemoteUpdate = rows[0].actualizado_en || '';
        const datos = rows[0].datos as AppSnapshot;
        return { data: datos };
      }

      return { data: undefined };
    } catch (err: any) {
      return { error: err.message || 'Error al conectar con la base de datos de Supabase' };
    }
  }

  public async saveToCloud(snapshot: AppSnapshot): Promise<{ success: boolean; error?: string }> {
    if (!navigator.onLine) {
      localStorage.setItem('distribuidoraPendienteSync', '1');
      return { success: false, error: 'Guardado localmente. Se sincronizará al conectar.' };
    }

    try {
      const headers: Record<string, string> = {
        apikey: this.key,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates,return=minimal',
      };
      if (this.session?.access_token) {
        headers['Authorization'] = `Bearer ${this.session.access_token}`;
      }

      const now = new Date().toISOString();
      const payload = {
        id: this.rowId,
        datos: snapshot,
        actualizado_en: now,
      };

      const res = await fetch(`${this.url}/rest/v1/distribuidora_estado?on_conflict=id`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errText = await res.text();
        localStorage.setItem('distribuidoraPendienteSync', '1');
        const isRls = errText.includes('row-level security') || errText.includes('42501');
        const errorFinal = isRls
          ? 'RLS en Supabase: Inicia sesión con tu cuenta de Supabase para sincronizar (o añade política pública a distribuidora_estado).'
          : errText || 'Error al guardar en Supabase';
        return { success: false, error: errorFinal };
      }

      this.lastRemoteUpdate = now;
      localStorage.removeItem('distribuidoraPendienteSync');
      return { success: true };
    } catch (err: any) {
      localStorage.setItem('distribuidoraPendienteSync', '1');
      return { success: false, error: err.message };
    }
  }

  public async testConnection(): Promise<{ ok: boolean; statusText: string; statusCode?: number }> {
    try {
      const headers: Record<string, string> = {
        apikey: this.key,
        'Content-Type': 'application/json',
      };
      if (this.session?.access_token) {
        headers['Authorization'] = `Bearer ${this.session.access_token}`;
      }
      const res = await fetch(`${this.url}/rest/v1/distribuidora_estado?select=id,actualizado_en&id=eq.${encodeURIComponent(this.rowId)}`, {
        headers,
      });

      if (res.ok) {
        return { ok: true, statusText: 'Conexión verificada con Supabase (HTTP 200 OK)', statusCode: res.status };
      }
      return { ok: false, statusText: `HTTP ${res.status}: ${res.statusText}`, statusCode: res.status };
    } catch (err: any) {
      return { ok: false, statusText: err.message || 'No se pudo contactar a Supabase' };
    }
  }

  public async pollCheck(): Promise<{ hasChanges: boolean; data?: AppSnapshot }> {
    if (!navigator.onLine || document.visibilityState === 'hidden') {
      return { hasChanges: false };
    }
    try {
      const headers: Record<string, string> = {
        apikey: this.key,
        'Content-Type': 'application/json',
      };
      if (this.session?.access_token) {
        headers['Authorization'] = `Bearer ${this.session.access_token}`;
      }

      const res = await fetch(`${this.url}/rest/v1/distribuidora_estado?select=actualizado_en,datos&id=eq.${encodeURIComponent(this.rowId)}`, {
        headers,
      });

      if (!res.ok) return { hasChanges: false };
      const rows = await res.json();
      if (rows && rows.length > 0) {
        const remoteTime = rows[0].actualizado_en || '';
        if (remoteTime && remoteTime !== this.lastRemoteUpdate) {
          this.lastRemoteUpdate = remoteTime;
          return { hasChanges: true, data: rows[0].datos as AppSnapshot };
        }
      }
      return { hasChanges: false };
    } catch {
      return { hasChanges: false };
    }
  }
}

export const supabaseService = new SupabaseService();
