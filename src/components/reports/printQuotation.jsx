import React, { Component } from "react";
import { formatNumber } from "../../utils/custom";

class PrintQuotation extends Component {
  render() {
    const {
      quotationHeader,
      quotationDetail,
      itbisTotal,
      valorTotal,
      discountTotal,
    } = this.props;

    if (quotationHeader && quotationHeader.length) {
      var _date = Date.parse(quotationHeader[0].creationDate);
      var quotationDate = new Date(_date);
    }

    console.log('quotationHeader', quotationHeader)
    console.log('quotationDetail', quotationDetail)

    return (
        <div className="mt-1" style={{ width: "338px" }}>
        {quotationHeader.length && (
          <div>
            <div className="text-center">
              <span
                style={{
                  fontFamily: "Calisto MT",
                  fontSize: "2.4em",
                  fontWeight: "bold",
                }}
              >
                FERRIN
              </span>
              <span
                style={{
                  fontFamily: "Calisto MT",
                  fontSize: "3em",
                  fontWeight: "bold",
                }}
              >
                M
              </span>
              <span
                style={{
                  fontFamily: "Calisto MT",
                  fontSize: "2.4em",
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
              <div
                className="font-receipt font-receipt-small-slogan"
                style={{ marginTop: "-18px" }}
              >
                <span style={{ marginRight: "-27px" }}>
                  CONSTRUYENDO CONFIANZA
                </span>
              </div>
            </div>

            <div className="text-center">
              <span className="font-receipt font-receipt-small-invoice">
                {quotationHeader[0].company.address}
              </span>
            </div>
            <div className="text-center">
              <span className="font-receipt font-receipt-small-invoice">
                {quotationHeader[0].company.phoneNumber}
              </span>
            </div>
            <div className="text-center">
              <span className="font-receipt font-receipt-small-invoice">
                {quotationHeader[0].company.email}
              </span>
            </div>

            {quotationHeader[0].company.rnc.length > 0 && (
              <div className="text-center">
                <span className="font-receipt font-receipt-small-invoice">
                  RNC: {quotationHeader[0].company.rnc}
                </span>
              </div>
            )}

            <span className="font-receipt font-receipt-small-invoice d-block">
              Fecha: {quotationDate.toLocaleDateString("en-GB")}
              <span className="ml-2">
                Hora: {quotationDate.toLocaleTimeString()}
              </span>
            </span>

            <span className="font-receipt font-receipt-small-invoice d-block">
              Cliente: {quotationHeader[0].customer.firstName}{" "}
              {quotationHeader[0].customer.lastName}
            </span>

            {quotationHeader[0].customer.identification.length > 0 && (
              <span className="font-receipt font-receipt-small-invoice d-block">
                Cédula/RNC: {quotationHeader[0].customer.identification}
              </span>
            )}
            {quotationHeader[0].customer.address.length > 0 && (
              <span className="font-receipt font-receipt-small-invoice d-block">
                Dirección: {quotationHeader[0].customer.address}
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
              {quotationHeader.length &&
                "COTIZACION" }
            </span>
          </div>
        </div>

        {quotationDetail.length && (
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
              {quotationDetail.map((item) => (
                <React.Fragment key={"F" + item.id}>
                  <tr key={"M" + item.id}>
                    <td colSpan="3">
                      <span className="font-receipt font-receipt-small-invoice">
                        {item.product.description}
                      </span>
                    </td>
                  </tr>

                  <tr key={item.product.id}>
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
                    <tr key={"D" + item.product.id}>
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
            Items: {quotationDetail.length}
          </span>
        </div>
        <div>
          <span className="font-receipt font-receipt-small-F-invoice">
            No. Cotización:{" "}
          </span>
          <span className="font-receipt font-receipt-small-F-invoice">
            {quotationHeader.length && quotationHeader[0].id}
          </span>
        </div>
        <div>
          <span className="font-receipt font-receipt-small-F-invoice">
            Creada por: {quotationHeader.length && quotationHeader[0].createdUser}
          </span>
        </div>

      </div>
    );
  }
}

export default PrintQuotation;
