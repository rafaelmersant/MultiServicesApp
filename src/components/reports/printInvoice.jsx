import React, { Component } from "react";
import { formatNumber } from "../../utils/custom";

class PrintInvoice extends Component {
  render() {
    //console.log("header", this.props.invoiceHeader[0]);
    //console.log("detail", this.props.invoiceDetail);

    const { invoiceHeader, invoiceDetail, itbisTotal, valorTotal, discountTotal } = this.props;

    return (
      <div className="mt-1" style={{ width: "408px" }}>
        {invoiceHeader.length && (
          <div>
            <div className="text-center">
              <img src={require("./FERRINMAS.jpg")} />
            </div>


            {/* <h3 className="font-receipt text-center">
              {invoiceHeader[0].company.name.toUpperCase()}</h3>
            <span class="font-receipt d-block" style={{ marginLeft: "215px", marginTop: "-13px" }}>Ferreteria</span> */}

            <div className="text-center"><span className="font-receipt">{invoiceHeader[0].company.address}</span> </div>

            {invoiceHeader[0].company.rnc.length > 0
              && <span className="font-receipt font-receipt-small">RNC: {invoiceHeader[0].company.rnc} </span>}

            <span className="font-receipt font-receipt-small d-block">
              {new Date().toLocaleDateString('en-GB')} {new Date().toLocaleTimeString()}
            </span>

            {invoiceHeader[0].ncf.length > 0
              && <span className="font-receipt font-receipt-small d-block">NCF: {invoiceHeader[0].ncf} </span>}

            <span className="font-receipt font-receipt-small d-block">
              Cliente: {invoiceHeader[0].customer.firstName} {invoiceHeader[0].customer.lastName}
            </span>
          </div>
        )}

        <div className="d-block">
          <span className="d-block">---------------------------------------------------------------</span>

          <span class="font-receipt font-receipt-small" style={{ marginLeft: "45px" }}>
            {invoiceHeader.length && invoiceHeader[0].ncf.includes("B02") && "FACTURA PARA CONSUMIDOR FINAL"}
          </span>

          <span class="font-receipt font-receipt-small" style={{ marginLeft: "25px" }}>
            {invoiceHeader.length && invoiceHeader[0].ncf.includes("B01") && "FACTURA PARA CREDITO FISCAL"}
          </span>

          {/* <span className="d-block">---------------------------------------------------------------</span> */}
        </div>

        {invoiceDetail.length && (
          <table>
            <thead>
              <tr key="h1">
                <td colSpan="3">---------------------------------------------------------------</td>
              </tr>
              <tr key="h2">
                {/* <td style={{cellSpacing: "5px"}}><span className="font-receipt">CANT</span></td> */}
                <td style={{ cellSpacing: "10px" }}><span className="font-receipt">DESCRIPCION</span></td>
                <td className="text-right" style={{ cellSpacing: "10px" }}><span className="font-receipt">ITBIS</span></td>
                <td className="text-right" style={{ cellSpacing: "10px" }}><span className="font-receipt">VALOR</span></td>
              </tr>
              <tr key="h3">
                <td colSpan="3">---------------------------------------------------------------</td>
              </tr>
            </thead>
            <tbody>
              {invoiceDetail.map(item => (
                <React.Fragment>
                  <tr key={item.id}>
                    <td><span className="font-receipt font-receipt-small">{item.product.description}</span></td>
                    <td className="text-right"><span className="font-receipt font-receipt-small">{formatNumber(item.quantity * item.product.itbis)}</span></td>
                    <td className="text-right"><span className="font-receipt font-receipt-small">{formatNumber(item.quantity * item.product.price)}</span></td>
                  </tr>
                  <tr key={item.product.id}>
                    <td colSpan="3"><span className="font-receipt font-receipt-small">{item.quantity} x {formatNumber(item.product.price)} </span></td>
                  </tr>
                </React.Fragment>
              ))}

              <tr key="f1">
                <td colSpan="3">---------------------------------------------------------------</td>
              </tr>
              <tr key="f2">
                <td><span className="font-receipt font-receipt-medium">SUBTOTAL</span></td>
                <td><span className="font-receipt font-receipt-medium">{formatNumber(itbisTotal)}</span></td>
                <td className="text-right"><span className="font-receipt font-receipt-medium">{formatNumber(valorTotal - itbisTotal)}</span></td>
              </tr>
              <tr key="f3">
                <td colSpan="2"><span className="font-receipt font-receipt-medium">DESCUENTO</span></td>
                <td className="text-right"><span className="font-receipt font-receipt-medium">{formatNumber(discountTotal)}</span></td>
              </tr>
              <tr key="f4">
                <td colSpan="2"><span className="font-receipt font-receipt-big"><b>TOTAL A PAGAR</b></span></td>
                <td className="text-right"><span className="font-receipt font-receipt-big">
                  <b>{formatNumber(valorTotal - discountTotal)}</b></span>
                </td>
              </tr>
            </tbody>
          </table>
        )}
        <div className="mt-4">No. Factura: {invoiceHeader.length && invoiceHeader[0].sequence}</div>
        <div>Método de pago: {invoiceHeader.length && invoiceHeader[0].paymentMethod}</div>
        <div>Le atendió: {invoiceHeader.length && invoiceHeader[0].createdUser}</div>
        <div className="mt-4" style={{ marginLeft: "115px" }}>GRACIAS POR SU COMPRA!</div>
        <div className="mt-4" style={{ height: "55px" }}>II</div>
      </div>
    );
  }
}

export default PrintInvoice;
