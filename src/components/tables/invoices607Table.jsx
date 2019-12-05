import React, { Component } from "react";
import Table from "../common/table";
import { formatNumber } from "../../utils/custom";

class Invoices607Table extends Component {
  columns = [
    {
      path: "subtotal",
      label: "RNC/Cédula",
      content: item => (
        <div className="text-right">
          <span>{item.customer.identification}</span>
        </div>
      )
    },
    { path: "ncf", label: "NCF" },
    {
      path: "subtotal",
      label: "Monto Facturado",
      align: "text-right",
      content: item => (
        <div className="text-right">
          <span>{formatNumber(item.subtotal)}</span>
        </div>
      )
    },
    { path: "creationDate", label: "Fecha de Retención(m/d/a)" }
  ];

  render() {
    const { invoices, sortColumn, onSort } = this.props;

    return (
      <Table
        columns={this.columns}
        data={invoices}
        sortColumn={sortColumn}
        onSort={onSort}
      />
    );
  }
}

export default Invoices607Table;
