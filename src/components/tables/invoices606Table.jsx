import React, { Component } from "react";
import Table from "../common/table";
import { formatNumber } from "../../utils/custom";

class Invoices606Table extends Component {
  columns = [
    { path: "creationDate", label: "Fecha (m/d/a)" },
    { path: "ncf", label: "NCF" },
    {
      path: "discount",
      label: "Descuento",
      align: "text-right",
      content: item => (
        <div className="text-right">
          <span>{formatNumber(item.discount)}</span>
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

  deleteColumn = {
    key: "delete",
    content: invoice => (
      <div className="text-center">
        <button
          onClick={() => this.props.onDelete(invoice)}
          className="fa fa-trash"
          style={{ color: "red", fontSize: "16px" }}
        ></button>
      </div>
    )
  };

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
