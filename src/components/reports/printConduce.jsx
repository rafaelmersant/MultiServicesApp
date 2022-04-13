import React, { Component } from "react";
import { formatNumber } from "../../utils/custom";

class PrintConduce extends Component {
  render() {
    let {
      invoiceHeader,
      invoiceDetail,
      invoiceLeadDetail,
      totalToDeliver,
      createdUserName,
    } = this.props;

    console.log("serializer ConduceDetail:", invoiceLeadDetail);
    console.log("serializer InvoiceHeader:", invoiceHeader);
    console.log("serializer InvoiceDetail:", invoiceDetail);

    invoiceHeader = invoiceHeader.results;
    var conduceDate = new Date();

    if (invoiceLeadDetail.length && invoiceLeadDetail[0]) {
      var _date = Date.parse(invoiceLeadDetail[0].header.creationDate);
      conduceDate = new Date(_date);
    }

    return (
      <div className="mt-1" style={{ width: "408px" }}>
        {invoiceHeader && (
          <div>
            <div className="text-center">
              <span
                style={{
                  fontFamily: "Calisto MT",
                  fontSize: "1.9em",
                  fontWeight: "bold",
                }}
              >
                FERRIN
              </span>
              <span
                style={{
                  fontFamily: "Calisto MT",
                  fontSize: "2.5em",
                  fontWeight: "bold",
                }}
              >
                M
              </span>
              <span
                style={{
                  fontFamily: "Calisto MT",
                  fontSize: "1.9em",
                  fontWeight: "bold",
                }}
              >
                AS
              </span>
              {/* <img
                width="210px"
                src={process.env.PUBLIC_URL + "/images/FERRINMAS_small.jpg"}
                alt="FERRINMAS"
              /> */}
            </div>
            <div className="text-center">
              <span className="font-receipt font-receipt-small">
                {invoiceHeader[0].company_address}
              </span>
            </div>
            <div className="text-center">
              <span className="font-receipt font-receipt-small">
                {invoiceHeader[0].company_phoneNumber}
              </span>
            </div>
            <div className="text-center">
              <span className="font-receipt font-receipt-small">
                {invoiceHeader[0].company_email}
              </span>
            </div>

            {invoiceHeader[0].company_rnc.length > 0 && (
              <div className="text-center">
                <span className="font-receipt font-receipt-small">
                  RNC: {invoiceHeader[0].company_rnc}
                </span>
              </div>
            )}

            <span className="font-receipt font-receipt-small d-block">
              Fecha: {conduceDate.toLocaleDateString("en-GB")}
              <span className="ml-2">
                Hora: {conduceDate.toLocaleTimeString()}
              </span>
            </span>

            {invoiceHeader[0].ncf.length > 0 && (
              <span className="font-receipt font-receipt-small d-block">
                NCF: {invoiceHeader[0].ncf}
              </span>
            )}

            <span className="font-receipt font-receipt-small d-block">
              Cliente: {invoiceHeader[0].customer_firstName}{" "}
              {invoiceHeader[0].customer_lastName}
            </span>

            {invoiceHeader[0].customer_identification.length > 0 && (
              <span className="font-receipt font-receipt-small d-block">
                Cédula/RNC: {invoiceHeader[0].customer_identification}
              </span>
            )}
            
            {invoiceHeader[0].customer_address.length > 0 && (
              <span className="font-receipt font-receipt-small d-block">
                Dirección: {invoiceHeader[0].customer_address}
              </span>
            )}
          </div>
        )}

        <div className="d-block">
          <span className="d-block">
            ---------------------------------------------------------------
          </span>

          <div className="text-center">
            <span className="font-receipt font-receipt-medium">
              {invoiceLeadDetail.length && "CONDUCE"}
            </span>
          </div>
        </div>

        {invoiceLeadDetail.length && (
          <table>
            <thead>
              <tr key="h1">
                <td colSpan="3">
                  ---------------------------------------------------------------
                </td>
              </tr>
              <tr key="h2">
                <td style={{ cellSpacing: "10px" }}>
                  <span className="font-receipt">CANTIDAD / ITEM</span>
                </td>
                <td className="text-right" style={{ cellSpacing: "10px" }}>
                  {/* <span className="font-receipt">ITEM</span> */}
                </td>
              </tr>
              <tr key="h3">
                <td colSpan="3">
                  ---------------------------------------------------------------
                </td>
              </tr>
            </thead>
            <tbody>
              {invoiceLeadDetail.map(
                (item) =>
                  item.quantity > 0 && (
                    <React.Fragment key={"I" + item.id}>
                      <tr key={item.product.id}>
                        <td className="text-left">
                          <span className="font-receipt font-receipt-small">
                            {formatNumber(item.quantity)}
                          </span>
                        </td>
                      </tr>
                      <tr key={"D" + item.id}>
                        <td colSpan="3">
                          <span className="font-receipt font-receipt-small">
                            {item.product.description}
                          </span>
                        </td>
                      </tr>
                    </React.Fragment>
                  )
              )}

              <tr key="f1">
                <td colSpan="3">
                  ---------------------------------------------------------------
                </td>
              </tr>
              <tr key="f2">
                <td colSpan="2">
                  <span className="font-receipt font-receipt-medium">
                    TOTAL A ENTREGAR
                  </span>
                </td>
                <td className="text-right">
                  <span className="font-receipt font-receipt-medium">
                    {formatNumber(totalToDeliver)}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        )}
        <div className="mt-4">
          <span className="font-receipt font-receipt-small-F">
            Items: {invoiceLeadDetail.length}
          </span>
        </div>
        <div>
          <span className="font-receipt font-receipt-small-F">
            No. Factura:{" "}
          </span>
          <span className="font-receipt font-receipt-small-F">
            {invoiceHeader && invoiceHeader[0].sequence}
          </span>
        </div>
        <div>
          <span className="font-receipt font-receipt-small-F">Conduce: </span>
          <span className="font-receipt font-receipt-small-F">
            {invoiceLeadDetail.length && invoiceLeadDetail[0].header.id}
          </span>
        </div>
        <div className="mb-2">
          <span className="font-receipt font-receipt-small-F">
            Le atendió: {createdUserName}
          </span>
        </div>

        <div className="text-center mb-4" style={{ marginTop: "50px" }}>
          <span className="d-block">
            -----------------------------------------------
          </span>
          <span className="font-receipt font-receipt-small-F">Recibido</span>
        </div>
        <div
          className="mt-5 font-receipt-small-F"
          style={{ height: "55px", fontFamily: "TimesNewRoman" }}
        >
          II
        </div>
      </div>
    );
  }
}

export default PrintConduce;
