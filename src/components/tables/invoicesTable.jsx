import React, { Component } from "react";
import { Link } from "react-router-dom";
import Table from "../common/table";
import auth from "../../services/authService";
import { formatNumber } from "../../utils/custom";

class InvoicesTable extends Component {
  columns = [
    {
      path: "sequence",
      label: "No. Factura",
      content: invoice => (
        <div className="text-center">
          <Link to={`/invoice/${invoice.sequence}`}>{invoice.sequence}</Link>
        </div>
      )
    },
    { path: "creationDate", label: "Fecha (m/d/a)" },
    {
      path: "customer.firstName",
      label: "Cliente",
      content: invoice => (
        <span>
          {`${invoice.customer.firstName} ${invoice.customer.lastName}`}
        </span>
      )
    },
    {
      path: "discount",
      label: "Descuento",
      content: item => (
        <div className="text-right">
          <span>{formatNumber(item.discount)}</span>
        </div>
      )
    },
    {
      path: "itbis",
      label: "ITBIS",
      content: item => (
        <div className="text-right">
          <span>{formatNumber(item.itbis)}</span>
        </div>
      )
    },
    {
      path: "subtotal",
      label: "Total",
      content: item => (
        <div className="text-right">
          <span>{formatNumber(item.subtotal)}</span>
        </div>
      )
    },
    {
      path: "paid",
      label: "Estatus",
      content: invoice => (
        <span>
          {invoice.paid
            .toString()
            .replace(true, "Pagada")
            .replace(false, "Pendiente")}
        </span>
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

  constructor() {
    super();
    const user = auth.getCurrentUser().email;
    const role = auth.getCurrentUser().role;

    if (user && (role === "Admin" || role === "Owner"))
      this.columns.push(this.deleteColumn);
  }

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

export default InvoicesTable;
