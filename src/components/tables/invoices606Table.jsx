import React, { Component } from "react";
import Table from "../common/table";
import { formatNumber } from "../../utils/custom";

class Invoices606Table extends Component {
  columns = [
    { path: "creationDate", label: "Fecha de Retención(m/d/a)" },
    {
      path: "rnc",
      label: "RNC/Cédula"
    },
    { path: "ncf", label: "NCF" },
    {
      path: "amount",
      label: "Monto",
      align: "text-right",
      content: item => (
        <div className="text-right">
          <span>{formatNumber(item.amount)}</span>
        </div>
      )
    },
    {
      path: "itbis",
      label: "ITBIS",
      align: "text-right",
      content: item => (
        <div className="text-right">
          <span>{formatNumber(item.itbis)}</span>
        </div>
      )
    },
    {
      path: "subtotal",
      label: "Total",
      align: "text-right",
      content: item => (
        <div className="text-right">
          <span>{formatNumber(item.subtotal)}</span>
        </div>
      )
    }
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

export default Invoices606Table;
