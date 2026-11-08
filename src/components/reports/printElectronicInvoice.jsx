import React from "react";

const money = value => Number(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 });

export default function PrintElectronicInvoice({ data }) {
  if (!data) return null;
  const row = { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", columnGap: "2mm", alignItems: "start" };
  const rule = { borderTop: "1px dashed #000", margin: "3mm 0" };
  return <div className="ecf-thermal-receipt" style={{ width: "72mm", maxWidth: "100%", color: "#000", background: "#fff", fontFamily: "'Courier New', monospace", fontSize: "10pt", lineHeight: 1.3, overflowWrap: "anywhere" }}>
    <div style={{ textAlign: "center" }}>
      <img src={process.env.PUBLIC_URL + "/images/CASAMINAYA_print.png"} alt="Logo de la empresa" style={{ width: "40mm", maxWidth: "100%" }} />
      <div><strong>{data.issuer.name}</strong></div>
      {data.issuer.trade_name && <div>{data.issuer.trade_name}</div>}
      {data.issuer.branch && <div>{data.issuer.branch}</div>}
      <div>Dirección: {data.issuer.address}</div>
      <div>RNC: {data.issuer.rnc}</div>
      {data.issuer.phone && <div>{data.issuer.phone}</div>}
      {data.issuer.email && <div>{data.issuer.email}</div>}
    </div>
    <div style={rule} />
    <div><strong>{data.title}</strong></div>
    <div><strong>e-NCF:</strong> {data.encf}</div>
    {data.expiry && <div><strong>Fecha Vencimiento:</strong> {data.expiry}</div>}
    <div style={rule} />
    <div><strong>Fecha Emisión:</strong> {data.emission_date}</div>
    {data.buyer && <div style={{ marginTop: "2mm" }}><div><strong>Razón Social Cliente:</strong> {data.buyer.name}</div><div><strong>RNC Cliente:</strong> {data.buyer.rnc}</div></div>}
    <div style={rule} />
    <div style={row}><span>Cantidad</span><span>Descripción</span><span>Unidad de Medida</span></div>
    <div style={row}><span>Precio</span><span>ITBIS</span><span>Valor</span></div>
    <div style={rule} />
    {data.items.map((item, index) => <div key={index} style={{ breakInside: "avoid", pageBreakInside: "avoid", marginBottom: "3mm" }}>
      <div style={row}><span>{item.quantity}</span><span>{item.description}</span><span>{item.unit || "—"}</span></div>
      <div style={row}><span>{money(item.price)}</span><span>{money(item.tax)}</span><span>{money(item.amount)}</span></div>
      {item.discount && Number(item.discount) !== 0 && <div>Desc.: {money(item.discount)}</div>}
      {item.surcharge && Number(item.surcharge) !== 0 && <div>Rec.: {money(item.surcharge)}</div>}
    </div>)}
    <div style={rule} />
    <div style={{ breakInside: "avoid", pageBreakInside: "avoid" }}>{data.totals.map(total => <div key={total.label} style={{ display: "flex", justifyContent: "space-between", gap: "2mm" }}><strong>{total.label}</strong><span>{money(total.value)}</span></div>)}</div>
    <div style={rule} />
    <div style={{ textAlign: "center", breakInside: "avoid", pageBreakInside: "avoid", paddingBottom: "4mm" }}>
      <img src={data.qr_image} alt="QR de consulta DGII" style={{ width: "32mm", height: "32mm", padding: "3mm", boxSizing: "content-box", imageRendering: "pixelated" }} />
      <div><strong>Código de Seguridad:</strong> {data.security_code}</div>
      <div><strong>Fecha Firma:</strong> {data.signed_date}</div>
    </div>
  </div>;
}
