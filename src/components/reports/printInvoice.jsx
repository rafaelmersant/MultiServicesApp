import React, { Component } from "react";

class PrintInvoice extends Component {
  render() {
    console.log("header", this.props.invoiceHeader[0]);
    console.log("detail", this.props.invoiceDetail);

    const { invoiceHeader, invoiceDetail } = this.props;

    return (
      <div>
        {invoiceHeader.length && (
          <div>
            <h1 className="text-center">{invoiceHeader[0].company.name}</h1>
            <h4 className="text-center">{invoiceHeader[0].company.address}</h4>
            <h4 className="text-center">
              {invoiceHeader[0].company.phoneNumber}
            </h4>
            <h4 className="text-center">{invoiceHeader[0].company.email}</h4>
          </div>
        )}

        {invoiceDetail.length && (
          <table>
            <thead>
              <tr>
                <td>Cant.</td>
                <td>Producto</td>
                <td>itbis</td>
                <td>Precio</td>
              </tr>
            </thead>
            <tbody>
              {invoiceDetail.map(item => (
                <tr key={item.id}>
                  <td>{item.quantity} </td>
                  <td>{item.product.description}</td>
                  <td>{item.product.itbis}</td>
                  <td>{item.product.price}</td>
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
