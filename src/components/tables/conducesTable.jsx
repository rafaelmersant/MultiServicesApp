import React, { Component } from "react";
import { Link } from "react-router-dom";
import Table from "../common/table";
import auth from "../../services/authService";

class ConducesTable extends Component {
  columns = [
    {
      path: "id",
      label: "ID",
      content: (conduce) => (
        <div className="text-center">
          <Link to={`/conduce/${conduce.id}`}>{conduce.id}</Link>
        </div>
      ),
    },
    {
      path: "invoice.customer.firstName",
      label: "Cliente",
      content: (conduce) => (
        <span>
          {`${conduce.invoice.customer.firstName} ${conduce.invoice.customer.lastName}`}
        </span>
      ),
    },
    {
      path: "invoice.sequence",
      label: "Factura No.",
      content: (conduce) => <span>{conduce.invoice.sequence}</span>,
    },
    { path: "creationDate", label: "Fecha (m/d/a)" },
  ];

  deleteColumn = {
    key: "delete",
    content: (conduce) => (
      <div className="text-center">
        <span
          onClick={() => this.props.onDelete(conduce)}
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
    const { conduces, sortColumn, onSort } = this.props;

    return (
      <Table
        columns={this.columns}
        data={conduces}
        sortColumn={sortColumn}
        onSort={onSort}
      />
    );
  }
}

export default ConducesTable;
