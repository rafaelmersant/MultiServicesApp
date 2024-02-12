import React, { Component } from "react";
import { Link } from "react-router-dom";
import Table from "../common/table";
import auth from "../../services/authService";
import { formatNumber } from "../../utils/custom";

class QuotationsTable extends Component {
  columns = [
    {
      path: "id",
      label: "No. Cotización",
      content: (quotation) => (
        <div className="text-center">
          <Link to={`/quotation/${quotation.id}`}>{quotation.id}</Link>
        </div>
      ),
    },
    { path: "creationDate", label: "Fecha (m/d/a)" },
    {
      path: "customer.firstName",
      label: "Cliente",
      content: (quotation) => (
        <span>
          {`${quotation.customer.firstName} ${quotation.customer.lastName}`}
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
      content: (quotation) => (
        <div className="text-center">
          <span>
            {quotation.printed
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
    content: (quotation) => (
      <div className="text-center">
        <span
          onClick={() => this.props.onDelete(quotation)}
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
    const { quotations, sortColumn, onSort } = this.props;

    return (
      <Table
        columns={this.columns}
        data={quotations}
        sortColumn={sortColumn}
        onSort={onSort}
      />
    );
  }
}

export default QuotationsTable;
