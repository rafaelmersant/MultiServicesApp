import React, { Component } from "react";
import { formatNumber } from "../../utils/custom";

class PrintInvoice extends Component {
  render() {
    const {
      invoiceHeader,
      invoiceDetail,
      itbisTotal,
      valorTotal,
      discountTotal,
      availablePoints,
      amountPoints
    } = this.props;

    if (invoiceHeader.length) {
      var _date = Date.parse(invoiceHeader[0].creationDate);
      var invoiceDate = new Date(_date);
    }

    return (
      <div className="mt-1" style={{ width: "338px" }}>
        {invoiceHeader.length && (
          <div>
            <div className="text-center">
              <img
                width="210px"
                src={process.env.PUBLIC_URL + "/images/SUPERAVIT_print.png"}
                alt="SUPERAVIT"
              />
              {/* <div
                className="font-receipt font-receipt-small-slogan"
                style={{ marginTop: "-18px" }}
              >
                <span style={{ marginRight: "-27px" }}>
                  CONSTRUYENDO CONFIANZA
                </span>
              </div> */}
            </div>

            <div className="text-center">
              <span className="font-receipt font-receipt-small-invoice">
                {invoiceHeader[0].company_address}
              </span>
            </div>
            <div className="text-center">
              <span className="font-receipt font-receipt-small-invoice">
                {invoiceHeader[0].company_phoneNumber}
              </span>
            </div>
            <div className="text-center">
              <span className="font-receipt font-receipt-small-invoice">
                {invoiceHeader[0].company_email}
              </span>
            </div>

            {invoiceHeader[0].company_rnc.length > 0 && (
              <div className="text-center">
                <span className="font-receipt font-receipt-small-invoice">
                  RNC: {invoiceHeader[0].company_rnc}
                </span>
              </div>
            )}

            <span className="font-receipt font-receipt-small-invoice d-block">
              Fecha: {invoiceDate.toLocaleDateString("en-GB")}
              <span className="ml-2">
                Hora: {invoiceDate.toLocaleTimeString()}
              </span>
            </span>

            {invoiceHeader[0].ncf.length > 0 && (
              <span className="font-receipt font-receipt-small-invoice d-block">
                NCF: {invoiceHeader[0].ncf}
              </span>
            )}

            <span className="font-receipt font-receipt-small-invoice d-block">
              Cliente: {invoiceHeader[0].customer_firstName}{" "}
              {invoiceHeader[0].customer_lastName}
            </span>

            {invoiceHeader[0].customer_identification.length > 0 && (
              <span className="font-receipt font-receipt-small-invoice d-block">
                Cédula/RNC: {invoiceHeader[0].customer_identification}
              </span>
            )}
            {invoiceHeader[0].customer_address.length > 0 && (
              <span className="font-receipt font-receipt-small-invoice d-block">
                Dirección: {invoiceHeader[0].customer_address}
              </span>
            )}
          </div>
        )}

        <div className="d-block">
          <span className="d-block">
            ----------------------------------------------------
          </span>

          <div className="text-center">
            <span className="font-receipt font-receipt-small-2-invoice">
              {invoiceHeader.length &&
                !invoiceHeader[0].ncf.includes("B01") &&
                "FACTURA PARA CONSUMIDOR FINAL"}
            </span>

            <span className="font-receipt font-receipt-small-2-invoice">
              {invoiceHeader.length &&
                invoiceHeader[0].ncf.includes("B01") &&
                "FACTURA PARA CREDITO FISCAL"}
            </span>
          </div>
        </div>

        {invoiceDetail.length && (
          <table>
            <thead>
              <tr key="h1">
                <td colSpan="3">
                  ----------------------------------------------------
                </td>
              </tr>
              <tr key="h2">
                <td style={{ cellSpacing: "10px" }}>
                  <span className="font-receipt">ITEM</span>
                </td>
                <td className="text-right" style={{ cellSpacing: "10px" }}>
                  <span className="font-receipt">ITBIS</span>
                </td>
                <td className="text-right" style={{ cellSpacing: "10px" }}>
                  <span className="font-receipt">VALOR</span>
                </td>
              </tr>
              <tr key="h3">
                <td colSpan="3">
                  ----------------------------------------------------
                </td>
              </tr>
            </thead>
            <tbody>
              {invoiceDetail.map((item) => (
                <React.Fragment key={"F" + item.id}>
                  <tr key={"M" + item.id}>
                    <td colSpan="3">
                      <span className="font-receipt font-receipt-small-invoice">
                        {item.product_description}
                      </span>
                    </td>
                  </tr>

                  <tr key={item.product_id}>
                    <td>
                      <span className="font-receipt font-receipt-small-invoice">
                        {item.quantity} x {formatNumber(item.price)}
                      </span>
                    </td>
                    <td className="text-right">
                      <span className="font-receipt font-receipt-small-invoice">
                        {formatNumber(item.itbis)}
                      </span>
                    </td>
                    <td className="text-right">
                      <span className="font-receipt font-receipt-small-invoice">
                        {formatNumber(item.quantity * item.price)}
                      </span>
                    </td>
                  </tr>

                  {item.discount > 0 && (
                    <tr key={"D" + item.product_id}>
                      <td colSpan="2">
                        <span className="font-receipt font-receipt-small-invoice">
                          {"DESCUENTO"}
                        </span>
                      </td>
                      <td className="text-right">
                        {"-"}
                        <span className="font-receipt font-receipt-small-invoice">
                          {formatNumber(item.discount)}
                        </span>
                      </td>
                    </tr>
                  )}

                  <tr>
                    <td colSpan="3">
                      <span
                        className="font-receipt font-receipt-small-invoice"
                        style={{ color: "white", fontSize: "0.6em" }}
                      >
                        |
                      </span>
                    </td>
                  </tr>
                </React.Fragment>
              ))}

              <tr key="f1">
                <td colSpan="3">
                  ----------------------------------------------------
                </td>
              </tr>
              <tr key="f2">
                <td colSpan="2">
                  <span className="font-receipt font-receipt-medium-invoice">
                    SUBTOTAL
                  </span>
                </td>
                <td className="text-right">
                  <span className="font-receipt font-receipt-medium-invoice">
                    {formatNumber(valorTotal - itbisTotal)}
                  </span>
                </td>
              </tr>

              <tr key="f4">
                <td colSpan="2">
                  <span className="font-receipt font-receipt-medium-invoice">
                    DESCUENTO
                  </span>
                </td>
                <td className="text-right">
                  <span className="font-receipt font-receipt-medium-invoice">
                    {formatNumber(discountTotal)}
                  </span>
                </td>
              </tr>

              <tr key="f3">
                <td colSpan="2">
                  <span className="font-receipt font-receipt-medium-invoice">
                    ITBIS
                  </span>
                </td>
                <td className="text-right">
                  <span className="font-receipt font-receipt-medium-invoice">
                    {formatNumber(itbisTotal)}
                  </span>
                </td>
              </tr>

              <tr key="f5">
                <td colSpan="2">
                  <span className="font-receipt font-receipt-big-invoice">
                    <b>TOTAL A PAGAR</b>
                  </span>
                </td>
                <td className="text-right">
                  <span className="font-receipt font-receipt-big-invoice">
                    <b>{formatNumber(valorTotal - discountTotal)}</b>
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        )}
        <div className="mt-4">
          <span className="font-receipt font-receipt-small-F-invoice">
            Items: {invoiceDetail.length}
          </span>
        </div>
        <div>
          <span className="font-receipt font-receipt-small-F-invoice">
            No. Factura:{" "}
          </span>
          <span className="font-receipt font-receipt-small-F-invoice">
            {invoiceHeader.length && invoiceHeader[0].sequence}
          </span>
        </div>
        <div>
          <span className="font-receipt font-receipt-small-F-invoice">
            Método de pago:{" "}
          </span>
          <span className="font-receipt font-receipt-small-F-invoice">
            {invoiceHeader.length && invoiceHeader[0].paymentMethod}
          </span>
        </div>
        <div>
          <span className="font-receipt font-receipt-small-F-invoice">
            Le atendió:{" "}
            {invoiceHeader.length && invoiceHeader[0].created_user_name}
          </span>
        </div>
        <div className="mt-4 text-center">GRACIAS POR TU COMPRA!</div>
        <div className="text-center">DIOS TE BENDIGA!</div>

        {amountPoints >= 125 && (
          <div className="mt-4 text-center">
            <span className="d-block">Puntos obtenidos en esta compra: {Math.floor(amountPoints / 125)}</span>
            <span>Total de puntos acumulados: {availablePoints}</span>
          </div>
        )}

        <div
          className="mt-5 font-receipt-small-F-invoice"
          style={{ height: "55px", fontFamily: "TimesNewRoman" }}
        >
          II
        </div>
      </div>
    );
  }
}

export default PrintInvoice;
