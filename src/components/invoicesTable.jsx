import React, { Component } from "react";
import { Link } from "react-router-dom";
import Table from "./common/table";
import auth from "../services/authService";

class InvoicesTable extends Component {
  columns = [
    {
      path: "sequence",
      label: "No. Factura",
      content: invoice => (
        <Link to={`/invoice/${invoice.id}`}>{invoice.sequence}</Link>
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
    { path: "ncf", label: "NCF" },
    { path: "paymentMethod", label: "Metodo de Pago" },
    {
      path: "paid",
      label: "Metodo Pago",
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
    content: user => (
      <button
        onClick={() => this.props.onDelete(user)}
        className="fa fa-trash"
        style={{ color: "red", fontSize: "16px" }}
      ></button>
    )
  };

  constructor() {
    super();
    const user = auth.getCurrentUser().email;
    const role = auth.getCurrentUser().role;

    if (user && role === "Admin") this.columns.push(this.deleteColumn);
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
