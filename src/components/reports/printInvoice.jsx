import React, { Component } from "react";
import { formatNumber } from "../../utils/custom";

class PrintInvoice extends Component {
  render() {
    console.log("header", this.props.invoiceHeader[0]);
    console.log("detail", this.props.invoiceDetail);

    const { invoiceHeader, invoiceDetail } = this.props;

    return (
      <div className="mt-4">
        {invoiceHeader.length && (
          <div>
            <h4 className="font-receipt" style={{marginLeft: "65px"}}>
            {invoiceHeader[0].company.name.toUpperCase()}</h4>
            
            <span className="font-receipt d-block">{invoiceHeader[0].company.address}</span>
            {invoiceHeader[0].company.rnc.length > 0 
              && <span className="font-receipt d-block">RNC: {invoiceHeader[0].company.rnc} </span>}
            
            <span className="font-receipt d-block">{new Date().toLocaleDateString('en-GB')}</span>            
            {invoiceHeader[0].ncf.length > 0 
              && <span className="font-receipt d-block">NCF: {invoiceHeader[0].ncf} </span>}
          </div>
        )}

        <div className="d-block">
          {invoiceHeader.length && invoiceHeader[0].ncf.includes("B02") && "FACTURA PARA CONSUMIDOR FINAL"}
          {invoiceHeader.length && invoiceHeader[0].ncf.includes("B01") && "FACTURA PARA CREDITO FISCAL"}
        </div>

        {invoiceDetail.length && (
          <table className="mt-4">
            <thead>
              <tr>
                <td style={{cellSpacing: "10px"}}><span className="font-receipt">CANT</span></td>
                <td style={{cellSpacing: "10px"}}><span className="font-receipt">DESCRIPCION</span></td>
                <td style={{cellSpacing: "10px"}}><span className="font-receipt">ITBIS</span></td>
                <td style={{cellSpacing: "10px"}}><span className="font-receipt">VALOR</span></td>
              </tr>
            </thead>
            <tbody>
              {invoiceDetail.map(item => (
                <tr key={item.id}>
                  <td><span className="font-receipt">{item.quantity}</span> </td>
                  <td><span className="font-receipt">{item.product.description}</span></td>
                  <td><span className="font-receipt">{formatNumber(item.product.itbis)}</span></td>
                  <td><span className="font-receipt">{formatNumber(item.product.price)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  }
}

export default PrintInvoice;
