import React, { Component } from "react";
import { Link } from "react-router-dom";
import Table from "./common/table";
import auth from "../services/authService";

class CustomersTable extends Component {
  columns = [
    {
      path: "firstName",
      label: "Nombre",
      content: customer => (
        <Link to={`/customer/${customer.id}`}> {customer.firstName} </Link>
      )
    },
    {
      path: "lastName",
      label: "Apellido",
      content: customer => (
        <Link to={`/customer/${customer.id}`}> {customer.lastName} </Link>
      )
    },
    { path: "email", label: "Email" },
    { path: "phoneNumber", label: "Teléfono" },
    { path: "creationDate", label: "Creado" }
  ];

  // companyColumn = {
  //   path: "company.name",
  //   label: "Compañía"
  // };

  deleteColumn = {
    key: "delete",
    content: customer => (
      <div className="text-center">
        <button
          onClick={() => this.props.onDelete(customer)}
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

    //if (user && role === "Admin") this.columns.push(this.companyColumn);
    if (user && role === "Admin") this.columns.push(this.deleteColumn);
  }

  render() {
    const { customers, sortColumn, onSort } = this.props;

    return (
      <Table
        columns={this.columns}
        data={customers}
        sortColumn={sortColumn}
        onSort={onSort}
      />
    );
  }
}

export default CustomersTable;
