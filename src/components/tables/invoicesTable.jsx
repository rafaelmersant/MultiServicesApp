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
      content: (invoice) => (
        <div className="text-center">
          <Link to={`/invoice/${invoice.sequence}`}>{invoice.sequence}</Link>
        </div>
      ),
    },
    { path: "creationDate", label: "Fecha (m/d/a)" },
    {
      path: "customer.firstName",
      label: "Cliente",
      content: (invoice) => (
        <span>
          {`${invoice.customer.firstName} ${invoice.customer.lastName}`}
        </span>
      ),
    },
    {
      path: "discount",
      label: "Descuento",
      align: "text-right",
      content: (item) => (
        <div className="text-right">
          <span>{formatNumber(item.discount)}</span>
        </div>
      ),
    },
    {
      path: "itbis",
      label: "ITBIS",
      align: "text-right",
      content: (item) => (
        <div className="text-right">
          <span>{formatNumber(item.itbis)}</span>
        </div>
      ),
    },
    {
      path: "subtotal",
      label: "Total",
      align: "text-right",
      content: (item) => (
        <div className="text-right">
          <span>{formatNumber(item.subtotal - item.discount)}</span>
        </div>
      ),
    },
    {
      path: "printed",
      label: "Impresa",
      align: "text-center",
      content: (invoice) => (
        <div className="text-center">
          <span>
            {invoice.printed
              .toString()
              .replace(true, "SI")
              .replace(false, "Pendiente")}
          </span>
        </div>
      ),
    },
    {
      path: "paid",
      label: "Pagada",
      align: "text-center",
      content: (invoice) => (
        <div className="text-center">
          <span>
            {invoice.paid
              .toString()
              .replace(true, "SI")
              .replace(false, "Pendiente")}
          </span>
        </div>
      ),
    },
  ];

  deleteColumn = {
    key: "delete",
    content: (invoice) => (
      <div className="text-center">
        <span
          onClick={() => this.props.onDelete(invoice)}
          className="fa fa-trash text-danger cursor-pointer trash-size"
        ></span>
      </div>
    ),
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
