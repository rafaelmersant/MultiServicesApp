import React, { Component } from "react";
import { Link } from "react-router-dom";
import Table from "../common/table";
import auth from "../../services/authService";

class ProvidersTable extends Component {
  columns = [
    { path: "id", label: "Codigo" },
    {
      path: "firstName",
      label: "Nombre de Empresa",
      content: provider => (
        <Link to={`/provider/${provider.id}`}> {provider.firstName} </Link>
      )
    },
    // {
    //   path: "lastName",
    //   label: "Apellido",
    //   content: provider => (
    //     <Link to={`/provider/${provider.id}`}> {provider.lastName} </Link>
    //   )
    // },
    { path: "email", label: "Email" },
    { path: "phoneNumber", label: "Teléfono" },
    { path: "creationDate", label: "Creado (m/d/a)" }
  ];

  deleteColumn = {
    key: "delete",
    content: provider => (
      <div className="text-center">
        <span
          onClick={() => this.props.onDelete(provider)}
          className="fa fa-trash text-danger cursor-pointer"
          style={{ fontSize: "19px" }}
        ></span>
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
    const { providers, sortColumn, onSort } = this.props;

    return (
      <Table
        columns={this.columns}
        data={providers}
        sortColumn={sortColumn}
        onSort={onSort}
      />
    );
  }
}

export default ProvidersTable;
