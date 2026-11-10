import React, { Component } from "react";
import http from "../services/httpService";
import { getCurrentUser } from "../services/authService";
import { environment } from "../settings";

const apiEndpoint = `${environment.apiUrl}/ecf`;
const invoiceUrl = `${apiEndpoint}/electronic-invoices`;
const sequenceUrl = `${apiEndpoint}/electronic-invoice-sequences`;
const requiredTypes = ["31", "32", "33", "34", "41", "43", "44", "45", "46", "47"];
const simulationTargets = [["31", "Crédito fiscal", 4], ["32 ≥ 250 mil", "Consumo", 2], ["33", "Nota de débito", 1], ["34", "Nota de crédito", 2], ["41", "Compras", 2], ["43", "Gastos menores", 2], ["44", "Regímenes especiales", 2], ["45", "Gubernamental", 2], ["46", "Exportación", 2], ["47", "Pagos al exterior", 2]];
const certificationSendOrder = ["31", "32", "41", "43", "44", "45", "46", "47", "33", "34"];
const certificationExpectedCounts = { "31": 4, "32": 2, "41": 2, "43": 2, "44": 2, "45": 2, "46": 2, "47": 2, "33": 1, "34": 2 };

export function invoicePage(records, environment, requestedPage) {
  const ordered = records.filter(item => item.environment === environment).sort((a, b) =>
    (Date.parse(b.creation_date) || 0) - (Date.parse(a.creation_date) || 0) || Number(b.id) - Number(a.id));
  const pages = Math.max(1, Math.ceil(ordered.length / 30));
  const page = Math.max(1, Math.min(requestedPage, pages));
  return { records: ordered.slice((page - 1) * 30, page * 30), total: ordered.length, pages, page };
}

class ElectronicInvoices extends Component {
  state = {
    invoices: [], sequences: [], sales: [], loading: true, busy: false, error: "", notice: "",
    salesStartDate: "2026-11-09", selectedSale: "", documentType: "32", environment: "cert",
    sequenceType: "32", sequenceEnvironment: "cert", rangeStart: "", rangeEnd: "", dueDate: "",
    recordsPage: 1, fiscalOverrides: "{}", authorizationReference: "", zeroTaxTreatment: "", configuredEnvironment: "", viewEnvironment: "prod"
  };

  async componentDidMount() {
    getCurrentUser();
    try {
      const { data } = await http.get(`${invoiceUrl}/configuration/`);
      const mode = data.environment;
      this.setState({ configuredEnvironment: mode, environment: mode, sequenceEnvironment: mode, viewEnvironment: mode }, this.refresh);
    } catch (error) {
      this.setState({ error: this.errorMessage(error, "No se pudo leer la configuración e-CF."), loading: false });
    }
  }

  refresh = async () => {
    try {
      const [invoices, sequences, sales] = await Promise.all([
        http.get(`${invoiceUrl}/`), http.get(`${sequenceUrl}/`), http.get(`${invoiceUrl}/eligible-sales/`, { params: { environment: this.state.environment, start_date: this.state.salesStartDate || undefined } })
      ]);
      this.setState({ invoices: invoices.data, sequences: sequences.data, sales: sales.data, loading: false });
    } catch (error) {
      this.setState({ error: this.errorMessage(error, "No fue posible cargar el estado e-CF."), loading: false });
    }
  };

  errorMessage = (error, fallback) => {
    const data = error && error.response && error.response.data;
    if (data && data.detail && /credentials|sesión|Token/.test(data.detail)) return "Cierra sesión y vuelve a entrar para acceder al módulo e-CF con un token vigente.";
    if (data && typeof data === "object") return Object.values(data).flat().join(" ");
    return fallback;
  };

  run = async (label, action) => {
    this.setState({ busy: true, error: "", notice: "" });
    try {
      await action();
      await this.refresh();
      this.setState({ notice: label, busy: false });
    } catch (error) {
      this.setState({ error: this.errorMessage(error, "La acción no pudo completarse."), busy: false });
    }
  };

  createSequence = (event) => {
    event.preventDefault();
    const { sequenceType, sequenceEnvironment, rangeStart, rangeEnd, dueDate } = this.state;
    return this.run("Secuencia guardada. Verifica el rango contra la autorización DGII.", () => http.post(`${sequenceUrl}/`, {
      document_type: sequenceType, environment: sequenceEnvironment,
      authorized_start: Number(rangeStart), authorized_end: Number(rangeEnd),
      due_date: dueDate || null, active: true, authorization_reference: this.state.authorizationReference.trim()
    }));
  };

  createDraft = () => {
    const { selectedSale, documentType, environment } = this.state;
    let payload;
    try { payload = JSON.parse(this.state.fiscalOverrides || "{}"); }
    catch (error) { return this.setState({ error: "Los ajustes fiscales deben ser JSON válido." }); }
    if (!payload || Array.isArray(payload) || typeof payload !== "object") {
      return this.setState({ error: "Los ajustes fiscales deben ser un objeto JSON." });
    }
    if (["31", "32"].includes(documentType) && !selectedSale && Object.keys(payload).length === 0) {
      return this.setState({ error: "Selecciona una factura fuente o incluye los datos fiscales completos de la operación." });
    }
    if (this.state.zeroTaxTreatment) payload.zero_tax_treatment = this.state.zeroTaxTreatment;
    return this.run("Borrador creado; no se ha reservado e-NCF ni enviado a DGII.", () => http.post(`${invoiceUrl}/`, {
      invoice: selectedSale ? Number(selectedSale) : null, document_type: documentType, environment, payload
    }));
  };

  act = (invoice, action, label) => this.run(label, () => http.post(`${invoiceUrl}/${invoice.id}/${action}/`, {}));

  localDate = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  };

  updateDraft = invoice => {
    let payload;
    try { payload = JSON.parse(this.state.fiscalOverrides || "{}"); }
    catch (error) { return this.setState({ error: "Los ajustes fiscales deben ser JSON válido." }); }
    if (!payload || Array.isArray(payload) || typeof payload !== "object") return this.setState({ error: "Los ajustes fiscales deben ser un objeto JSON." });
    if (this.state.zeroTaxTreatment) payload.zero_tax_treatment = this.state.zeroTaxTreatment;
    return this.run("Ajustes del borrador actualizados.", () => http.post(`${invoiceUrl}/${invoice.id}/update-draft/`, { payload }));
  };

  reserve = (invoice) => {
    const sequence = [...this.state.sequences].sort((a, b) => Number(a.authorized_start) - Number(b.authorized_start) || Number(a.id) - Number(b.id)).find(s => s.document_type === invoice.document_type && s.environment === invoice.environment && s.active && (s.current === null || Number(s.current) < Number(s.authorized_end)) && (!s.due_date || s.due_date >= this.localDate()));
    if (!sequence) return this.setState({ error: `No hay una secuencia activa ${invoice.document_type} en ${invoice.environment}.` });
    return this.run("e-NCF reservado de forma única.", () => http.post(`${invoiceUrl}/${invoice.id}/reserve-encf/`, { sequence: sequence.id }));
  };

  buildRepresentation = (invoice) => this.run("Representación impresa generada.", () => http.post(`${invoiceUrl}/${invoice.id}/build-representation/`, {}));

  getCurrentCertificationAttempt = () => {
    const records = this.state.invoices.filter(
      item => item.environment === "cert" && item.certification_attempt
    );
    if (!records.length) return "";
    return records.reduce((latest, item) => (
      !latest || Date.parse(item.creation_date) > Date.parse(latest.creation_date) ? item : latest
    ), null).certification_attempt;
  };

  countAccepted = (type, predicate = () => true) => {
    const attempt = this.getCurrentCertificationAttempt();
    return this.state.invoices.filter(item => (
      item.environment === "cert" && (!attempt || item.certification_attempt === attempt) &&
      item.document_type === type && item.status === "accepted" && predicate(item)
    )).length;
  };

  countAttemptAccepted = (attempt, type) => this.state.invoices.filter(item => (
    item.environment === "cert" && item.certification_attempt === attempt && item.document_type === type &&
    item.status === "accepted" && (type !== "32" || Number(item.invoice_total) >= 250000)
  )).length;

  getCertificationOrderBlock = (invoice) => {
    const attempt = invoice.certification_attempt;
    if (invoice.environment !== "cert" || !attempt) return "";
    const index = certificationSendOrder.indexOf(invoice.document_type);
    if (index < 0) return "Este tipo e-CF no forma parte del orden de simulación DGII.";
    for (const type of certificationSendOrder.slice(0, index)) {
      const accepted = this.countAttemptAccepted(attempt, type);
      const expected = certificationExpectedCounts[type];
      if (accepted !== expected) return `Orden DGII: completa tipo ${type} (${accepted}/${expected}) antes de enviar tipo ${invoice.document_type}.`;
    }
    const accepted = this.countAttemptAccepted(attempt, invoice.document_type);
    const expected = certificationExpectedCounts[invoice.document_type];
    if (accepted >= expected) return `Límite DGII: el tipo ${invoice.document_type} ya tiene ${accepted}/${expected} aceptados.`;
    return "";
  };

  getRFCEOrderBlock = (invoice) => {
    const attempt = invoice.certification_attempt;
    if (invoice.environment !== "cert" || !attempt) return "";
    for (const type of certificationSendOrder) {
      const accepted = this.countAttemptAccepted(attempt, type);
      const expected = certificationExpectedCounts[type];
      if (accepted !== expected) return `Orden DGII: completa tipo ${type} (${accepted}/${expected}) antes de enviar RFCE.`;
    }
    return "";
  };

  downloadSignedXml = async (invoice) => {
    try {
      const response = await http.get(`${invoiceUrl}/${invoice.id}/xml/`, { responseType: "blob" });
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = `eCF-${invoice.encf}.xml`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      this.setState({ error: this.errorMessage(error, "No se pudo descargar el XML firmado.") });
    }
  };

  confirmPortalResult = (invoice) => {
    if (!window.confirm("Confirma que cargaste este XML en el portal DGII y ya observaste su resultado.")) return;
    const entered = window.prompt("Resultado mostrado por DGII: escribe Aceptado o Rechazado.");
    const result = (entered || "").trim().toLowerCase();
    if (!["aceptado", "accepted", "rechazado", "rejected"].includes(result)) {
      return this.setState({ error: "No se registró el resultado. Indica Aceptado o Rechazado." });
    }
    const confirmation = window.prompt("Anota el mensaje o referencia visible en DGII.");
    if (!confirmation || !confirmation.trim()) return this.setState({ error: "La referencia de confirmación es requerida." });
    const normalized = ["aceptado", "accepted"].includes(result) ? "accepted" : "rejected";
    return this.run("Resultado del portal registrado; la confirmación queda identificada como manual.", () => http.post(`${invoiceUrl}/${invoice.id}/portal-result/`, { result: normalized, confirmation: confirmation.trim() }));
  };

  downloadRepresentation = async (invoice) => {
    try {
      const response = await http.get(`${invoiceUrl}/${invoice.id}/representation/`, { responseType: "blob" });
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = `RI-${invoice.encf}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      this.setState({ error: this.errorMessage(error, "No se pudo descargar la RI.") });
    }
  };

  render() {
    const { sequences, sales, loading, busy, error, notice } = this.state;
    const canConfigure = ["Admin", "Owner"].includes((getCurrentUser() || {}).role);
    const listing = invoicePage(this.state.invoices, this.state.viewEnvironment, this.state.recordsPage);
    const invoices = listing.records;
    const sequenceAvailable = invoice => sequences.some(s => s.document_type === invoice.document_type && s.environment === invoice.environment && s.active && (s.current === null || Number(s.current) < Number(s.authorized_end)) && s.authorized_start && s.authorized_end && (!s.due_date || s.due_date >= this.localDate()));
    const maxRange = this.state.sequenceEnvironment === "prod" ? "9999999999" : "10000000";
    return (
      <div className="container-fluid py-3">
        <h3>Facturación electrónica (e-CF)</h3>
        <div className="alert alert-info">
          <strong>Ambiente del servidor: {this.state.configuredEnvironment || "cargando"}.</strong> Puedes preparar borradores antes de obtener rangos.
          La reserva y emisión requieren un rango DGII autorizado, vigente y del mismo ambiente. No se emiten comprobantes sin autorización.
          Para consumo menor de RD$250,000 se envía el RFCE; en producción no se carga el XML al portal de certificación.
          Conserva el XML firmado y su representación impresa.
        </div>
        {error && <div className="alert alert-danger">{error}</div>}
        {notice && <div className="alert alert-success">{notice}</div>}
        {loading ? <p>Cargando…</p> : (
          <React.Fragment>
            <h5>Rangos autorizados DGII</h5>
            <form className="form-row align-items-end mb-3" onSubmit={this.createSequence}>
              <div className="form-group col-md-2"><label>Tipo e-CF</label><select className="form-control" value={this.state.sequenceType} onChange={e => this.setState({ sequenceType: e.target.value })}>{requiredTypes.map(t => <option key={t}>{t}</option>)}</select></div>
              <div className="form-group col-md-2"><label>Ambiente</label><select className="form-control" value={this.state.sequenceEnvironment} onChange={e => this.setState({ sequenceEnvironment: e.target.value })}><option value="prod">Producción</option><option value="cert">Certificación</option><option value="precert">Precertificación</option></select></div>
              <div className="form-group col-md-2"><label>Inicio DGII</label><input required min="1" max={maxRange} type="number" className="form-control" value={this.state.rangeStart} onChange={e => this.setState({ rangeStart: e.target.value })} /></div>
              <div className="form-group col-md-2"><label>Fin DGII</label><input required min="1" max={maxRange} type="number" className="form-control" value={this.state.rangeEnd} onChange={e => this.setState({ rangeEnd: e.target.value })} /></div>
              <div className="form-group col-md-2"><label>Vencimiento (si aplica)</label><input type="date" className="form-control" value={this.state.dueDate} onChange={e => this.setState({ dueDate: e.target.value })} /></div>
              {this.state.sequenceEnvironment === "prod" && <div className="form-group col-md-6"><label>Referencia de autorización DGII</label><input required maxLength="200" className="form-control" value={this.state.authorizationReference} onChange={e => this.setState({ authorizationReference: e.target.value })} /></div>}
              <div className="form-group col-md-2"><button disabled={busy || !canConfigure} className="btn btn-outline-primary">Guardar rango</button></div>
              {this.state.sequenceEnvironment === "prod" && <div className="col-12 mb-2"><small>Puedes agregar próximos rangos autorizados antes de agotar el actual. Se consume primero el rango vigente disponible con menor inicio y luego el siguiente. No se permiten rangos solapados.</small></div>}
            </form>
            {sequences.length ? <div className="table-responsive"><table className="table table-sm table-striped"><thead><tr><th>Tipo</th><th>Ambiente</th><th>Rango DGII</th><th>Último reservado</th><th>Activa</th></tr></thead><tbody>{sequences.map(s => <tr key={s.id}><td>{s.document_type}</td><td>{s.environment}</td><td>{s.authorized_start || "—"} – {s.authorized_end || "—"}</td><td>{s.current || "—"}</td><td>{s.active ? "Sí" : "No"}</td></tr>)}</tbody></table></div> : <p>No hay rangos configurados.</p>}

            {this.state.viewEnvironment === "cert" && <React.Fragment>
            <h5 className="mt-4">Objetivos Paso 4 · resultados locales de certificación</h5>
            <div className="row">
              {simulationTargets.map(([type, label, target]) => {
                const count = type === "32 ≥ 250 mil"
                  ? this.countAccepted("32", item => Number(item.invoice_total) >= 250000)
                  : this.countAccepted(type);
                return <div className="col-sm-6 col-lg-4 mb-2" key={type}><div className="border rounded p-2"><strong>{count}/{target}</strong> {label} ({type})</div></div>;
              })}
              <div className="col-sm-6 col-lg-4 mb-2"><div className="border rounded p-2"><strong>{this.countAccepted("32", item => Number(item.invoice_total) < 250000 && item.portal_result === "accepted" && item.rfce_status === "accepted")}/4</strong> RFCE + e-CF tipo 32 menor de DOP 250 mil</div></div>
            </div>
            <p className="small text-muted">Estos conteos reflejan registros aceptados en esta aplicación; el estatus del portal DGII sigue siendo la referencia de certificación.</p>

            </React.Fragment>}
            <details className="border rounded p-2 mt-3">
              <summary className="text-primary" style={{ cursor: "pointer" }}>Mostrar / ocultar preparación manual (opcional)</summary>
              <small className="d-block text-muted mt-2 mb-2">Úsala para preparar un e-CF desde una venta sin NCF. Si ya existe un borrador, continúa su emisión en el listado inferior.</small>
            <p>Para E31/E32, guarda la venta con NCF «No usar» y selecciónala aquí. Las ventas con NCF tradicional quedan excluidas de producción. No entregues el borrador como comprobante fiscal.</p>
            <div className="form-group" style={{ maxWidth: "240px" }}>
              <label>Facturas desde</label>
              <input type="date" className="form-control" value={this.state.salesStartDate} disabled={busy}
                onChange={e => this.setState({ salesStartDate: e.target.value, selectedSale: "" }, this.refresh)} />
            </div>
            <div className="form-row align-items-end mb-3">
              <div className="form-group col-md-6"><label>Factura fuente (hasta 200 recientes sin e-CF)</label><select className="form-control" value={this.state.selectedSale} onChange={e => this.setState({ selectedSale: e.target.value })}><option value="">Selecciona…</option>{sales.map(s => <option key={s.id} value={s.id}>#{s.sequence} · {new Date(s.date).toLocaleDateString()} · {s.customer} · DOP {s.total} · ID {s.customer_id || "sin ID"}</option>)}</select></div>
              <div className="form-group col-md-2"><label>Tipo e-CF</label><select className="form-control" value={this.state.documentType} onChange={e => this.setState({ documentType: e.target.value })}>{[["31", "Crédito fiscal"], ["32", "Consumo"], ["33", "Nota de débito"], ["34", "Nota de crédito"], ["41", "Compras"], ["43", "Gastos menores"], ["44", "Regímenes especiales"], ["45", "Gubernamental"], ["46", "Exportación"], ["47", "Pagos al exterior"]].map(([type, label]) => <option key={type} value={type}>{type} · {label}</option>)}</select></div>
              <div className="form-group col-md-2"><label>Ambiente</label><select className="form-control" value={this.state.environment} onChange={e => this.setState({ environment: e.target.value, selectedSale: "", viewEnvironment: e.target.value, recordsPage: 1 }, this.refresh)}><option value="prod">Producción</option><option value="cert">Certificación</option><option value="precert">Precertificación</option></select></div>
              <div className="form-group col-md-2"><button disabled={busy || !canConfigure} className="btn btn-primary" onClick={this.createDraft}>Crear borrador</button></div>
            </div>
            <div className="form-group"><label>Tratamiento de líneas sin ITBIS (si aplica)</label><select className="form-control" value={this.state.zeroTaxTreatment} onChange={e => this.setState({ zeroTaxTreatment: e.target.value })}><option value="">Selecciona si la venta incluye líneas sin ITBIS…</option><option value="3">Gravadas a tasa 0%</option><option value="4">Exentas</option></select><small>Si mezcla exentas y tasa 0%, especifica el indicador de cada línea en los ajustes fiscales.</small></div>
            <div className="form-group"><label>Ajustes fiscales verificados (JSON opcional)</label><textarea className="form-control" rows="2" value={this.state.fiscalOverrides} onChange={e => this.setState({ fiscalOverrides: e.target.value })} /><small className="form-text text-muted">Para líneas sin ITBIS, indica explícitamente el tratamiento real, por ejemplo: {'{ "IndicadorFacturacion[1]": "3" }'} (0%) o {'{ "IndicadorFacturacion[1]": "4" }'} (exento). No se incorporan valores automáticamente.</small></div>
            <p className="small text-muted">Tipos 31 y 32 pueden derivarse de una venta real de la lista. Para otros tipos, el objeto JSON debe contener todos los datos correctos de la operación real y sus referencias; el XML debe pasar su XSD. No se inventan transacciones ni identificaciones. Facturas incompletas se detienen antes de firma.</p>

            </details>

            <h5 className="mt-4">Registros e-CF y flujo</h5>
            <select className="form-control mb-3" value={this.state.viewEnvironment} onChange={e => this.setState({ viewEnvironment: e.target.value, recordsPage: 1 })}><option value="prod">Producción</option><option value="cert">Certificación</option><option value="precert">Precertificación</option></select>
            {invoices.length ? <div className="table-responsive"><table className="table table-sm table-striped"><thead><tr><th>Fecha y hora</th><th>e-NCF</th><th>Tipo / ambiente</th><th>Factura</th><th>Estado</th><th>Track ID</th><th>Acciones</th></tr></thead><tbody>{invoices.map(invoice => (
              <tr key={invoice.id}><td className="text-nowrap">{invoice.creation_date ? new Date(invoice.creation_date).toLocaleString("es-DO", { timeZone: "America/Santo_Domingo" }) : "—"}</td><td>{invoice.encf || "Pendiente"}</td><td>{invoice.document_type} / {invoice.environment}</td><td>{invoice.invoice_sequence || "—"}</td><td>{invoice.dgii_status || invoice.rfce_status_text || invoice.status}</td><td>{invoice.track_id || "—"}</td><td className="text-nowrap">
                {!invoice.encf && <button disabled={busy} className="btn btn-sm btn-outline-secondary mr-1" onClick={() => this.updateDraft(invoice)}>Aplicar ajustes fiscales</button>}
                {!invoice.encf && !sequenceAvailable(invoice) && <span className="badge badge-secondary mr-2">Pendiente de rango autorizado</span>}
                {!invoice.encf && <button title="Requiere un rango autorizado vigente" disabled={busy || !sequenceAvailable(invoice)} className="btn btn-sm btn-outline-secondary mr-1" onClick={() => this.reserve(invoice)}>Reservar</button>}
                {invoice.encf && !invoice.has_unsigned_xml && <button disabled={busy} className="btn btn-sm btn-outline-secondary mr-1" onClick={() => this.act(invoice, "build-xml", "XML generado y validado contra XSD.")}>XML</button>}
                {invoice.has_signed_xml && <button disabled={busy} className="btn btn-sm btn-outline-secondary mr-1" onClick={() => this.downloadSignedXml(invoice)}>Descargar XML</button>}
                {invoice.has_unsigned_xml && !invoice.has_signed_xml && <button disabled={busy} className="btn btn-sm btn-outline-secondary mr-1" onClick={() => this.act(invoice, "sign", "XML firmado y verificado.")}>Firmar</button>}
                {invoice.has_signed_xml && invoice.status === "ready" && invoice.document_type === "32" && Number(invoice.invoice_total) < 250000 && invoice.rfce_status === "draft" && <button disabled={busy} className="btn btn-sm btn-outline-info mr-1" onClick={() => this.act(invoice, "build-rfce", "RFCE preparado.")}>Crear RFCE</button>}
                {invoice.rfce_status === "draft" && invoice.has_rfce_xml && <button disabled={busy} className="btn btn-sm btn-outline-info mr-1" onClick={() => this.act(invoice, "sign-rfce", "RFCE firmado.")}>Firmar RFCE</button>}
                {invoice.rfce_status === "ready" && <button disabled={busy || Boolean(this.getRFCEOrderBlock(invoice))} title={this.getRFCEOrderBlock(invoice) || "Enviar RFCE según la secuencia DGII."} className="btn btn-sm btn-outline-info mr-1" onClick={() => this.act(invoice, "send-rfce", "RFCE enviado; revisa su resultado DGII.")}>Enviar RFCE</button>}
                {invoice.environment === "cert" && invoice.document_type === "32" && Number(invoice.invoice_total) < 250000 && invoice.status === "ready" && invoice.rfce_status === "accepted" && <React.Fragment><button disabled={busy} className="btn btn-sm btn-outline-info mr-1" onClick={() => this.downloadSignedXml(invoice)}>XML para portal</button><button disabled={busy} className="btn btn-sm btn-outline-primary mr-1" onClick={() => this.confirmPortalResult(invoice)}>Registrar resultado portal</button></React.Fragment>}
                {invoice.status === "ready" && !(invoice.document_type === "32" && Number(invoice.invoice_total) < 250000) && <button disabled={busy || Boolean(this.getCertificationOrderBlock(invoice))} title={this.getCertificationOrderBlock(invoice) || "Enviar e-CF según la secuencia DGII."} className="btn btn-sm btn-warning mr-1" onClick={() => this.act(invoice, "send", "e-CF enviado; TrackId registrado.")}>Enviar e-CF</button>}
                {invoice.track_id && ["submitted", "processing", "uncertain"].includes(invoice.status) && <button disabled={busy} className="btn btn-sm btn-outline-primary mr-1" onClick={() => this.act(invoice, "query-result", "Estado DGII consultado.")}>Consultar</button>}
                {["accepted", "accepted_conditional"].includes(invoice.status) && invoice.environment === "cert" && invoice.representation_identity_current === false ? <span className="badge badge-warning" title="El XML firmado no coincide con los datos legales actuales; se requiere un nuevo e-CF.">RI bloqueada: identidad firmada distinta</span> : ["accepted", "accepted_conditional"].includes(invoice.status) && (invoice.has_representation_pdf ? <button className="btn btn-sm btn-success" onClick={() => this.downloadRepresentation(invoice)}>PDF RI</button> : <button disabled={busy} className="btn btn-sm btn-outline-success" onClick={() => this.buildRepresentation(invoice)}>Generar RI</button>)}
              </td></tr>
            ))}</tbody></table></div> : <p>No hay registros e-CF todavía.</p>}
            {listing.total > 0 && <div className="d-flex align-items-center justify-content-between mb-3">
              <small>{(listing.page - 1) * 30 + 1}–{Math.min(listing.page * 30, listing.total)} de {listing.total} registros</small>
              <div>
                <button type="button" className="btn btn-sm btn-outline-secondary mr-2" disabled={listing.page === 1}
                  onClick={() => this.setState({ recordsPage: listing.page - 1 })}>Anterior</button>
                <span>Página {listing.page} de {listing.pages}</span>
                <button type="button" className="btn btn-sm btn-outline-secondary ml-2" disabled={listing.page === listing.pages}
                  onClick={() => this.setState({ recordsPage: listing.page + 1 })}>Siguiente</button>
              </div>
            </div>}
          </React.Fragment>
        )}
      </div>
    );
  }
}

export default ElectronicInvoices;

