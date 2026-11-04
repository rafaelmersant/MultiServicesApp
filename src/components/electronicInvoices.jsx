import React, { Component } from "react";
import http from "../services/httpService";
import { environment } from "../settings";

const apiEndpoint = `${environment.apiUrl}/ecf`;
const invoiceUrl = `${apiEndpoint}/electronic-invoices`;
const sequenceUrl = `${apiEndpoint}/electronic-invoice-sequences`;
const requiredTypes = ["31", "32", "33", "34", "41", "43", "44", "45", "46", "47"];
const simulationTargets = [["31", "Crédito fiscal", 4], ["32 ≥ 250 mil", "Consumo", 2], ["33", "Nota de débito", 1], ["34", "Nota de crédito", 2], ["41", "Compras", 2], ["43", "Gastos menores", 2], ["44", "Regímenes especiales", 2], ["45", "Gubernamental", 2], ["46", "Exportación", 2], ["47", "Pagos al exterior", 2]];
const certificationSendOrder = ["31", "32", "41", "43", "44", "45", "46", "47", "33", "34"];
const certificationExpectedCounts = { "31": 4, "32": 2, "41": 2, "43": 2, "44": 2, "45": 2, "46": 2, "47": 2, "33": 1, "34": 2 };

class ElectronicInvoices extends Component {
  state = {
    invoices: [], sequences: [], sales: [], loading: true, busy: false, error: "", notice: "",
    selectedSale: "", documentType: "32", environment: "cert",
    sequenceType: "32", sequenceEnvironment: "cert", rangeStart: "", rangeEnd: "", dueDate: "",
    fiscalOverrides: "{}"
  };

  async componentDidMount() { await this.refresh(); }

  refresh = async () => {
    try {
      const [invoices, sequences, sales] = await Promise.all([
        http.get(`${invoiceUrl}/`), http.get(`${sequenceUrl}/`), http.get(`${invoiceUrl}/eligible-sales/`)
      ]);
      this.setState({ invoices: invoices.data, sequences: sequences.data, sales: sales.data, loading: false });
    } catch (error) {
      this.setState({ error: this.errorMessage(error, "No fue posible cargar el estado e-CF."), loading: false });
    }
  };

  errorMessage = (error, fallback) => {
    const data = error && error.response && error.response.data;
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
      due_date: dueDate || null, active: true
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
    return this.run("Borrador creado.", () => http.post(`${invoiceUrl}/`, {
      invoice: selectedSale ? Number(selectedSale) : null, document_type: documentType, environment, payload
    }));
  };

  act = (invoice, action, label) => this.run(label, () => http.post(`${invoiceUrl}/${invoice.id}/${action}/`, {}));

  reserve = (invoice) => {
    const sequence = this.state.sequences.find(s => s.document_type === invoice.document_type && s.environment === invoice.environment && s.active);
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
    const { invoices, sequences, sales, loading, busy, error, notice } = this.state;
    const selectedSequence = sequences.find(s => s.document_type === this.state.sequenceType && s.environment === this.state.sequenceEnvironment);
    return (
      <div className="container-fluid py-3">
        <h3>Facturación electrónica (e-CF)</h3>
        <div className="alert alert-info">
          <strong>Certificación DGII · Paso 4: Simulación.</strong> Usa operaciones reales y rangos DGII autorizados.
          Los rangos no se inventan ni se reutilizan; el sistema bloquea e-NCF ya registrados. Para tipo 32 menor de
          DOP 250,000, primero envía y obtiene aceptación del RFCE. Conserva el PDF RI asociado al XML firmado.
        </div>
        {error && <div className="alert alert-danger">{error}</div>}
        {notice && <div className="alert alert-success">{notice}</div>}
        {loading ? <p>Cargando…</p> : (
          <React.Fragment>
            <h5>Rangos autorizados DGII</h5>
            <form className="form-row align-items-end mb-3" onSubmit={this.createSequence}>
              <div className="form-group col-md-2"><label>Tipo e-CF</label><select className="form-control" value={this.state.sequenceType} onChange={e => this.setState({ sequenceType: e.target.value })}>{requiredTypes.map(t => <option key={t}>{t}</option>)}</select></div>
              <div className="form-group col-md-2"><label>Ambiente</label><select className="form-control" value={this.state.sequenceEnvironment} onChange={e => this.setState({ sequenceEnvironment: e.target.value })}><option value="cert">Certificación</option><option value="precert">Precertificación</option></select></div>
              <div className="form-group col-md-2"><label>Inicio DGII</label><input required min="1" max="10000000" type="number" className="form-control" value={this.state.rangeStart} onChange={e => this.setState({ rangeStart: e.target.value })} /></div>
              <div className="form-group col-md-2"><label>Fin DGII</label><input required min="1" max="10000000" type="number" className="form-control" value={this.state.rangeEnd} onChange={e => this.setState({ rangeEnd: e.target.value })} /></div>
              <div className="form-group col-md-2"><label>Vencimiento (si aplica)</label><input type="date" className="form-control" value={this.state.dueDate} onChange={e => this.setState({ dueDate: e.target.value })} /></div>
              <div className="form-group col-md-2"><button disabled={busy || !!selectedSequence} className="btn btn-outline-primary">Guardar rango</button></div>
            </form>
            {sequences.length ? <div className="table-responsive"><table className="table table-sm table-striped"><thead><tr><th>Tipo</th><th>Ambiente</th><th>Rango DGII</th><th>Último reservado</th><th>Activa</th></tr></thead><tbody>{sequences.map(s => <tr key={s.id}><td>{s.document_type}</td><td>{s.environment}</td><td>{s.authorized_start || "—"} – {s.authorized_end || "—"}</td><td>{s.current || "—"}</td><td>{s.active ? "Sí" : "No"}</td></tr>)}</tbody></table></div> : <p>No hay rangos configurados.</p>}

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

            <h5 className="mt-4">Preparar comprobante desde venta registrada</h5>
            <div className="form-row align-items-end mb-3">
              <div className="form-group col-md-6"><label>Factura fuente (hasta 200 recientes sin e-CF)</label><select className="form-control" value={this.state.selectedSale} onChange={e => this.setState({ selectedSale: e.target.value })}><option value="">Selecciona…</option>{sales.map(s => <option key={s.id} value={s.id}>#{s.sequence} · {new Date(s.date).toLocaleDateString()} · {s.customer} · DOP {s.total} · ID {s.customer_id || "sin ID"}</option>)}</select></div>
              <div className="form-group col-md-2"><label>Tipo e-CF</label><select className="form-control" value={this.state.documentType} onChange={e => this.setState({ documentType: e.target.value })}>{[["31", "Crédito fiscal"], ["32", "Consumo"], ["33", "Nota de débito"], ["34", "Nota de crédito"], ["41", "Compras"], ["43", "Gastos menores"], ["44", "Regímenes especiales"], ["45", "Gubernamental"], ["46", "Exportación"], ["47", "Pagos al exterior"]].map(([type, label]) => <option key={type} value={type}>{type} · {label}</option>)}</select></div>
              <div className="form-group col-md-2"><label>Ambiente</label><select className="form-control" value={this.state.environment} onChange={e => this.setState({ environment: e.target.value })}><option value="cert">Certificación</option><option value="precert">Precertificación</option></select></div>
              <div className="form-group col-md-2"><button disabled={busy} className="btn btn-primary" onClick={this.createDraft}>Crear borrador</button></div>
            </div>
            <div className="form-group"><label>Ajustes fiscales verificados (JSON opcional)</label><textarea className="form-control" rows="2" value={this.state.fiscalOverrides} onChange={e => this.setState({ fiscalOverrides: e.target.value })} /><small className="form-text text-muted">Para líneas sin ITBIS, indica explícitamente el tratamiento real, por ejemplo: {'{ "IndicadorFacturacion[1]": "3" }'} (0%) o {'{ "IndicadorFacturacion[1]": "4" }'} (exento). No se incorporan valores automáticamente.</small></div>
            <p className="small text-muted">Tipos 31 y 32 pueden derivarse de una venta real de la lista. Para otros tipos, el objeto JSON debe contener todos los datos correctos de la operación real y sus referencias; el XML debe pasar su XSD. No se inventan transacciones ni identificaciones. Facturas incompletas se detienen antes de firma.</p>

            <h5 className="mt-4">Registros e-CF y flujo</h5>
            {invoices.length ? <div className="table-responsive"><table className="table table-sm table-striped"><thead><tr><th>e-NCF</th><th>Tipo / ambiente</th><th>Factura</th><th>Estado</th><th>Track ID</th><th>Acciones</th></tr></thead><tbody>{invoices.map(invoice => (
              <tr key={invoice.id}><td>{invoice.encf || "Pendiente"}</td><td>{invoice.document_type} / {invoice.environment}</td><td>{invoice.invoice_sequence || "—"}</td><td>{invoice.dgii_status || invoice.rfce_status_text || invoice.status}</td><td>{invoice.track_id || "—"}</td><td className="text-nowrap">
                {!invoice.encf && <button disabled={busy} className="btn btn-sm btn-outline-secondary mr-1" onClick={() => this.reserve(invoice)}>Reservar</button>}
                {invoice.encf && !invoice.has_unsigned_xml && <button disabled={busy} className="btn btn-sm btn-outline-secondary mr-1" onClick={() => this.act(invoice, "build-xml", "XML generado y validado contra XSD.")}>XML</button>}
                {invoice.has_unsigned_xml && !invoice.has_signed_xml && <button disabled={busy} className="btn btn-sm btn-outline-secondary mr-1" onClick={() => this.act(invoice, "sign", "XML firmado y verificado.")}>Firmar</button>}
                {invoice.has_signed_xml && invoice.status === "ready" && invoice.document_type === "32" && Number(invoice.invoice_total) < 250000 && invoice.rfce_status === "draft" && <button disabled={busy} className="btn btn-sm btn-outline-info mr-1" onClick={() => this.act(invoice, "build-rfce", "RFCE preparado.")}>Crear RFCE</button>}
                {invoice.rfce_status === "draft" && invoice.has_rfce_xml && <button disabled={busy} className="btn btn-sm btn-outline-info mr-1" onClick={() => this.act(invoice, "sign-rfce", "RFCE firmado.")}>Firmar RFCE</button>}
                {invoice.rfce_status === "ready" && <button disabled={busy || Boolean(this.getRFCEOrderBlock(invoice))} title={this.getRFCEOrderBlock(invoice) || "Enviar RFCE según la secuencia DGII."} className="btn btn-sm btn-outline-info mr-1" onClick={() => this.act(invoice, "send-rfce", "RFCE enviado; revisa su resultado DGII.")}>Enviar RFCE</button>}
                {invoice.document_type === "32" && Number(invoice.invoice_total) < 250000 && invoice.status === "ready" && invoice.rfce_status === "accepted" && <React.Fragment><button disabled={busy} className="btn btn-sm btn-outline-info mr-1" onClick={() => this.downloadSignedXml(invoice)}>XML para portal</button><button disabled={busy} className="btn btn-sm btn-outline-primary mr-1" onClick={() => this.confirmPortalResult(invoice)}>Registrar resultado portal</button></React.Fragment>}
                {invoice.status === "ready" && !(invoice.document_type === "32" && Number(invoice.invoice_total) < 250000) && <button disabled={busy || Boolean(this.getCertificationOrderBlock(invoice))} title={this.getCertificationOrderBlock(invoice) || "Enviar e-CF según la secuencia DGII."} className="btn btn-sm btn-warning mr-1" onClick={() => this.act(invoice, "send", "e-CF enviado; TrackId registrado.")}>Enviar e-CF</button>}
                {["submitted", "processing", "uncertain"].includes(invoice.status) && <button disabled={busy} className="btn btn-sm btn-outline-primary mr-1" onClick={() => this.act(invoice, "query-result", "Estado DGII consultado.")}>Consultar</button>}
                {["accepted", "accepted_conditional"].includes(invoice.status) && invoice.environment === "cert" && invoice.representation_identity_current === false ? <span className="badge badge-warning" title="El XML firmado no coincide con los datos legales actuales; se requiere un nuevo e-CF.">RI bloqueada: identidad firmada distinta</span> : ["accepted", "accepted_conditional"].includes(invoice.status) && (invoice.has_representation_pdf ? <button className="btn btn-sm btn-success" onClick={() => this.downloadRepresentation(invoice)}>PDF RI</button> : <button disabled={busy} className="btn btn-sm btn-outline-success" onClick={() => this.buildRepresentation(invoice)}>Generar RI</button>)}
              </td></tr>
            ))}</tbody></table></div> : <p>No hay registros e-CF todavía.</p>}
          </React.Fragment>
        )}
      </div>
    );
  }
}

export default ElectronicInvoices;

