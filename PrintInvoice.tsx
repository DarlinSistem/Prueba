import { Factura, AbonoCredito } from '../../types';
import { LOGO_BASE64, formatearDinero, formatearFechaHora, escapeHtml } from '../../services/storageService';

export function generarHTMLFactura(f: Factura): string {
  const { fecha, hora } = formatearFechaHora(f.fecha);
  const vendedor = f.vendedor || 'Usuario no identificado';
  const cliente = f.cliente || { nombre: 'Cliente General' };
  const esCredito = String(f.formaPago || '').toLowerCase().includes('credito') || String(f.formaPago || '').toLowerCase().includes('crédito');

  let html = `
    <div class="invoice-company" style="text-align:center;border-bottom:1px solid #111;padding-bottom:8px;margin-bottom:10px;">
      <img class="company-logo" src="${LOGO_BASE64}" alt="Logo RODRIGUEZ PERALTA" style="display:block;width:140px;height:110px;object-fit:contain;margin:0 auto 4px;" />
      <h2 style="margin:0 0 2px;font-size:20px;letter-spacing:0.5px;font-weight:bold;color:#000;">RODRIGUEZ PERALTA</h2>
      <div class="company-phone" style="font-size:12px;margin-bottom:2px;color:#333;">Tel.: 849-206-9126</div>
      <div style="font-size:13px;font-weight:bold;color:#123b2a;margin-top:2px;">FACTURA ${escapeHtml(f.numero || '')}</div>
    </div>
    <div class="invoice-header-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px;font-size:11px;line-height:1.45;">
      <div style="text-align:left;min-width:0;overflow-wrap:anywhere;">
        <strong>Vendedor:</strong> ${escapeHtml(vendedor)}<br>
        <strong>Fecha:</strong> ${escapeHtml(fecha)}<br>
        <strong>Hora:</strong> ${escapeHtml(hora)}
      </div>
      <div style="text-align:right;min-width:0;overflow-wrap:anywhere;">
        <strong>Cliente:</strong> ${escapeHtml(cliente.nombre || 'Sin cliente')}<br>
        <strong>Teléfono:</strong> ${escapeHtml(cliente.telefono || 'No especificado')}<br>
        <strong>Dirección:</strong> ${escapeHtml(cliente.direccion || 'No especificada')}
      </div>
    </div>
    <table style="width:100%;border-collapse:collapse;table-layout:fixed;margin-bottom:8px;">
      <thead>
        <tr style="border-bottom:1px solid #333;font-size:10px;background:#f0f0f0;">
          <th style="width:42%;padding:4px;text-align:left;">Producto</th>
          <th style="width:20%;padding:4px;text-align:right;">Precio</th>
          <th style="width:14%;padding:4px;text-align:center;">Cant.</th>
          <th style="width:24%;padding:4px;text-align:right;">Total</th>
        </tr>
      </thead>
      <tbody style="font-size:10px;">
  `;

  (f.productos || []).forEach((item) => {
    const subtotal = Number(item.precio || 0) * Number(item.cantidad || 0);
    html += `
      <tr style="border-bottom:1px dashed #bbb;">
        <td style="padding:4px;overflow-wrap:anywhere;">
          <strong>${escapeHtml(item.nombre)}</strong><br>
          <span style="font-size:9px;color:#555;">(${item.tipoPrecio === 'mayorista' ? 'Mayorista' : 'Detalle'})</span>
        </td>
        <td style="padding:4px;text-align:right;">${formatearDinero(item.precio)}</td>
        <td style="padding:4px;text-align:center;">${item.cantidad}</td>
        <td style="padding:4px;text-align:right;font-weight:600;">${formatearDinero(subtotal)}</td>
      </tr>
    `;
  });

  html += `
      </tbody>
    </table>
    <div class="invoice-footer" style="margin-top:8px;border-top:1px solid #222;padding-top:6px;font-size:11px;">
      <div class="total-line" style="font-size:15px;font-weight:bold;text-align:right;margin-bottom:6px;">
        TOTAL: ${formatearDinero(f.total)}
      </div>
      <div style="display:flex;justify-content:space-between;margin-bottom:3px;">
        <span>Forma de pago:</span>
        <strong style="text-transform:uppercase;">${escapeHtml(f.formaPago || 'contado')}</strong>
      </div>
  `;

  if (!esCredito) {
    html += `
      <div style="display:flex;justify-content:space-between;margin-bottom:3px;">
        <span>Monto recibido:</span>
        <span>${formatearDinero(f.montoRecibido)}</span>
      </div>
      <div style="display:flex;justify-content:space-between;margin-bottom:3px;font-weight:600;">
        <span>Cambio:</span>
        <span>${formatearDinero(f.cambio)}</span>
      </div>
    `;
  } else {
    const saldo = f.saldoCredito !== undefined ? Number(f.saldoCredito) : Number(f.total || 0);
    html += `
      <div style="display:flex;justify-content:space-between;margin-bottom:3px;color:#991b1b;font-weight:bold;">
        <span>Saldo pendiente:</span>
        <span>${formatearDinero(saldo)}</span>
      </div>
    `;
  }

  if (esCredito) {
    const nombreFirma = escapeHtml(cliente.nombre || 'Cliente');
    html += `
      <div class="credit-signature" style="margin:26px auto 10px;text-align:center;width:85%;page-break-inside:avoid;break-inside:avoid;">
        <div style="border-top:1px solid #222;margin:0 auto 4px;"></div>
        <div style="font-size:11px;font-weight:bold;">${nombreFirma}</div>
        <div style="font-size:9px;color:#555;">Firma del cliente (Aceptación de crédito)</div>
      </div>
    `;
  }

  html += `
      <div style="text-align:center;font-size:10px;margin-top:10px;color:#444;">
        ¡Gracias por su preferencia!<br>
        Dios le bendiga.
      </div>
    </div>
  `;

  return html;
}

export function generarHTMLAbono(abono: AbonoCredito): string {
  const { fecha, hora } = formatearFechaHora(abono.fecha);
  return `
    <div class="invoice-company" style="text-align:center;border-bottom:1px solid #111;padding-bottom:8px;margin-bottom:10px;">
      <img class="company-logo" src="${LOGO_BASE64}" alt="Logo RODRIGUEZ PERALTA" style="display:block;width:130px;height:100px;object-fit:contain;margin:0 auto 4px;" />
      <h2 style="margin:0 0 2px;font-size:18px;font-weight:bold;">RODRIGUEZ PERALTA</h2>
      <div class="company-phone" style="font-size:11px;">Tel.: 849-206-9126</div>
      <div style="font-size:13px;font-weight:bold;color:#047857;margin-top:4px;">COMPROBANTE DE ABONO</div>
    </div>
    <div style="font-size:11px;line-height:1.6;margin-bottom:12px;">
      <div><strong>Factura relacionada:</strong> ${escapeHtml(abono.facturaNumero)}</div>
      <div><strong>Cliente:</strong> ${escapeHtml(abono.clienteNombre)}</div>
      <div><strong>Recibido por:</strong> ${escapeHtml(abono.vendedor)}</div>
      <div><strong>Fecha y hora:</strong> ${escapeHtml(fecha)} ${escapeHtml(hora)}</div>
      ${abono.nota ? `<div><strong>Nota:</strong> ${escapeHtml(abono.nota)}</div>` : ''}
    </div>
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;padding:10px;border-radius:6px;margin-bottom:12px;">
      <div style="font-size:16px;font-weight:bold;color:#166534;text-align:right;">MONTO ABONADO: ${formatearDinero(abono.monto)}</div>
      <div style="font-size:12px;font-weight:bold;color:#991b1b;text-align:right;margin-top:4px;">NUEVO SALDO: ${formatearDinero(abono.saldoRestante)}</div>
    </div>
    <div style="margin:24px auto 8px;text-align:center;width:80%;">
      <div style="border-top:1px solid #333;margin:0 auto 4px;"></div>
      <div style="font-size:10px;">Firma de quien recibe</div>
    </div>
  `;
}

export function imprimirFacturaFormato(factura: Factura, formato: 'hoja' | 'termica' = 'termica') {
  const printArea = document.getElementById('printArea');
  if (!printArea) return;

  printArea.innerHTML = generarHTMLFactura(factura);
  document.body.classList.toggle('print-thermal', formato === 'termica');

  const ejecutarImpresion = () => {
    window.print();
    setTimeout(() => {
      document.body.classList.remove('print-thermal');
    }, 1200);
  };

  const logo = printArea.querySelector('img');
  if (logo && !logo.complete) {
    logo.onload = ejecutarImpresion;
    logo.onerror = ejecutarImpresion;
    setTimeout(ejecutarImpresion, 1000);
  } else {
    requestAnimationFrame(() => requestAnimationFrame(ejecutarImpresion));
  }
}

export function imprimirAbonoFormato(abono: AbonoCredito, formato: 'hoja' | 'termica' = 'termica') {
  const printArea = document.getElementById('printArea');
  if (!printArea) return;

  printArea.innerHTML = generarHTMLAbono(abono);
  document.body.classList.toggle('print-thermal', formato === 'termica');

  const ejecutarImpresion = () => {
    window.print();
    setTimeout(() => {
      document.body.classList.remove('print-thermal');
    }, 1200);
  };

  setTimeout(ejecutarImpresion, 150);
}

export function imprimirVentasDelDia(facturasDelDia: Factura[], fechaYMD: string) {
  const printArea = document.getElementById('printArea');
  if (!printArea) return;

  const agrupados = new Map<string, { nombre: string; precios: Set<number>; cantidad: number; subtotal: number }>();
  let totalDinero = 0;
  let totalUnidades = 0;

  facturasDelDia.forEach((f) => {
    if (f.estado === 'anulada') return;
    totalDinero += Number(f.total || 0);
    (f.productos || []).forEach((item) => {
      const clave = item.nombre.toLowerCase().trim();
      if (!agrupados.has(clave)) {
        agrupados.set(clave, { nombre: item.nombre, precios: new Set(), cantidad: 0, subtotal: 0 });
      }
      const p = agrupados.get(clave)!;
      p.cantidad += Number(item.cantidad || 0);
      p.subtotal += Number(item.precio || 0) * Number(item.cantidad || 0);
      p.precios.add(Number(item.precio || 0));
      totalUnidades += Number(item.cantidad || 0);
    });
  });

  const filas = [...agrupados.values()].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));

  let html = `
    <div style="font-family:Arial,sans-serif;color:#000;padding:8px;">
      <div style="text-align:center;margin-bottom:12px;">
        <img class="company-logo" src="${LOGO_BASE64}" alt="Logo RODRIGUEZ PERALTA" style="display:block;width:140px;height:100px;object-fit:contain;margin:0 auto 4px;" />
        <h2 style="margin:2px 0;font-size:20px;font-weight:bold;">RODRIGUEZ PERALTA</h2>
        <h3 style="margin:4px 0;font-size:16px;color:#123b2a;">Reporte de Ventas por Producto</h3>
        <p style="margin:2px 0;font-size:13px;">Fecha: <strong>${escapeHtml(fechaYMD)}</strong></p>
      </div>
      <table style="width:100%;border-collapse:collapse;margin-top:10px;font-size:12px;">
        <thead>
          <tr style="background:#f1f5f9;border-bottom:2px solid #334155;">
            <th style="border:1px solid #cbd5e1;padding:6px;text-align:left;">Producto</th>
            <th style="border:1px solid #cbd5e1;padding:6px;text-align:center;">Cant.</th>
            <th style="border:1px solid #cbd5e1;padding:6px;text-align:right;">Precio</th>
            <th style="border:1px solid #cbd5e1;padding:6px;text-align:right;">Subtotal</th>
          </tr>
        </thead>
        <tbody>
  `;

  filas.forEach((f) => {
    const precioStr = f.precios.size === 1 ? formatearDinero([...f.precios][0]) : 'Varios';
    html += `
      <tr style="border-bottom:1px solid #e2e8f0;">
        <td style="border:1px solid #cbd5e1;padding:6px;"><strong>${escapeHtml(f.nombre)}</strong></td>
        <td style="border:1px solid #cbd5e1;padding:6px;text-align:center;">${f.cantidad}</td>
        <td style="border:1px solid #cbd5e1;padding:6px;text-align:right;">${precioStr}</td>
        <td style="border:1px solid #cbd5e1;padding:6px;text-align:right;font-weight:600;">${formatearDinero(f.subtotal)}</td>
      </tr>
    `;
  });

  html += `
        </tbody>
      </table>
      <div style="margin-top:16px;text-align:right;font-size:14px;line-height:1.7;">
        <div>Total de unidades vendidas: <strong>${totalUnidades}</strong></div>
        <div>Facturas emitidas: <strong>${facturasDelDia.length}</strong></div>
        <div style="font-size:18px;font-weight:bold;color:#123b2a;margin-top:6px;">TOTAL VENDIDO: ${formatearDinero(totalDinero)}</div>
      </div>
    </div>
  `;

  printArea.innerHTML = html;
  document.body.classList.remove('print-thermal');
  setTimeout(() => window.print(), 150);
}
