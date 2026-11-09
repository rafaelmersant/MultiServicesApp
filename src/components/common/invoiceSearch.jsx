import React, { useEffect, useRef, useState } from "react";
import { ReactSearchAutocomplete } from "react-search-autocomplete";
import "./invoiceSearch.css";
import { getCustomersByName } from "../../services/customerService";
import { getProductsByDescription } from "../../services/productService";
import { formatNumber } from "../../utils/custom";

function InvoiceSearch({ kind, companyId, value = "", label, onSelect, onClear, onFocus }) {
  const [items, setItems] = useState([]);
  const [focused, setFocused] = useState(false);
  const [revision, setRevision] = useState(0);
  const [text, setText] = useState(value || "");
  const [message, setMessage] = useState("");
  const latest = useRef(0);
  const typed = useRef(value || "");
  const selected = useRef(value || null);
  const mounted = useRef(true);
  const product = kind === "product";

  useEffect(() => {
    latest.current += 1;
    typed.current = value || "";
    selected.current = value || null;
    setText(value || "");
    setItems([]);
    setMessage("");
  }, [value, companyId]);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; latest.current += 1; }; }, []);

  const search = async keyword => {
    if (!mounted.current || keyword !== typed.current || keyword === selected.current) return;
    const request = ++latest.current;
    setText(keyword);
    if (keyword.trim().length < (product ? 3 : 1)) { setItems([]); setMessage(product ? "Escribe al menos 3 caracteres." : "Escribe el nombre del cliente."); return; }
    setMessage("Buscando…");
    try {
      const query = encodeURIComponent(product ? keyword.trim().toUpperCase() : keyword.trim());
      const { data } = await (product ? getProductsByDescription(companyId, query) : getCustomersByName(companyId, query));
      if (request !== latest.current || keyword !== typed.current) return;
      const rows = Array.isArray(data) ? data : (data.results || []);
      const results = rows.map(item => ({ ...item, name: product ? item.description : `${item.firstName || ""} ${item.lastName || ""}`.trim() }));
      if (product) results.sort((a, b) => Number(b.ocurrences || 0) - Number(a.ocurrences || 0));
      setItems(results.length ? results : [{ id: 0, name: keyword, description: "No existe el producto, ¿deseas crearlo?", firstName: "No existe el cliente", lastName: "¿deseas crearlo?" }]);
      // This library expects local items when opening results. Remount with
      // the completed server result so initially empty searches also populate.
      setRevision(current => current + 1);
      setMessage("Sin resultados.");
    } catch (error) {
      if (request === latest.current) { setItems([]); setMessage("No se pudo buscar. Vuelve a intentarlo."); }
    }
  };

  const clear = () => { typed.current = ""; selected.current = null; latest.current += 1; setText(""); setItems([]); if (onClear) onClear(); };
  const select = item => { typed.current = item.name; selected.current = item.name; latest.current += 1; setText(item.name); setItems([]); onSelect(item); };
  const formatResult = item => product && item.id !== 0 ? <div className="invoice-search-product-result">
    <span className="invoice-search-product-name"><span className="invoice-search-product-description" title={item.name}>{item.name}</span><small className="text-muted">(${formatNumber(item.price)})</small></span>
    {item.category && item.category.description && <em className="invoice-search-product-category">{item.category.description}</em>}
  </div> : item.id !== 0 ? <div className="invoice-search-customer-result">
    <span className="invoice-search-customer-name"><span className="d-block">{item.name}</span>
      {item.identification && <em className="invoice-search-customer-id d-block">{item.identificationType === "R" ? "RNC" : item.identificationType === "C" ? "Cédula" : "ID"}: {item.identification}</em>}
      {item.email && <small className="text-muted">{item.email}</small>}
    </span>
  </div> : <div style={{ cursor: "pointer" }}>{product ? item.description : `${item.firstName}, ${item.lastName}`}</div>;

  return <div className={product ? "invoice-search invoice-search-products" : "invoice-search"} style={{ position: "relative", zIndex: focused ? 1001 : 1 }} onFocusCapture={() => setFocused(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }} onChangeCapture={event => { typed.current = event.target.value; selected.current = null; }} onKeyDownCapture={event => { if (event.key === "Enter") event.preventDefault(); }}>
    <label>{label}</label>
    <ReactSearchAutocomplete key={revision} autoFocus={revision > 0} items={items} onSearch={search} inputDebounce={300} onSelect={select} onClear={clear} onFocus={onFocus}
      inputSearchString={!product && selected.current === text ? "" : text} formatResult={formatResult} fuseOptions={{ keys: product ? ["name", "barcode"] : ["name", "phoneNumber"], threshold: 0.6, ignoreLocation: true, shouldSort: false }}
      resultStringKeyName="name" placeholder={product ? "Buscar producto…" : (selected.current || "Buscar cliente…")} showIcon={false} showNoResultsText={message}
      styling={{ height: "30px", borderRadius: "4px", backgroundColor: "white", boxShadow: "none", hoverBackgroundColor: "#f6f6f6", color: "#495057", fontFamily: "inherit", fontSize: "14px", clearIconMargin: "-2px 3px 0 0", zIndex: 999 }} />
  </div>;
}

export const InvoiceCustomerSearch = props => <InvoiceSearch {...props} kind="customer" />;
export const InvoiceProductSearch = props => <InvoiceSearch {...props} kind="product" />;
