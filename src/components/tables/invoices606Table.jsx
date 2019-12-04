import React, { Component } from "react";
import { Link } from "react-router-dom";
import Table from "../common/table";
import auth from "../../services/authService";
import { formatNumber } from "../../utils/custom";

class Invoices606Table extends Component {
  columns = [
    { path: "creationDate", label: "Fecha (m/d/a)" },
    { path: "ncf", label: "NCF" },
    {
      path: "discount",
      label: "Descuento",
      content: item => <span>{formatNumber(item.discount)}</span>
    },
    {
      path: "itbis",
      label: "ITBIS",
      content: item => <span>{formatNumber(item.itbis)}</span>
    },
    {
      path: "subtotal",
      label: "Total",
      content: item => <span>{formatNumber(item.subtotal)}</span>
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
