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

    return (
      <div>
        <p>Quotation printed</p>
      </div>
    );
  }
}

export default PrintQuotation;
