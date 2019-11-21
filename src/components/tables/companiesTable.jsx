import React, { Component } from "react";
import { Link } from "react-router-dom";
import Table from "../common/table";
import auth from "../../services/authService";

class CompaniesTable extends Component {
  columns = [
    {
      path: "name",
      label: "Name",
      content: company => (
        <Link to={`/company/${company.id}`}> {company.name} </Link>
      )
    },
    { path: "email", label: "Email" },
    { path: "phoneNumber", label: "Teléfono" },
    { path: "rnc", label: "RNC" },
    { path: "creationDate", label: "Creado" }
  ];

  deleteColumn = {
    key: "delete",
    content: company => (
      <div className="text-center">
        <button
          onClick={() => this.props.onDelete(company)}
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
    const { companies, sortColumn, onSort } = this.props;

    return (
      <Table
        columns={this.columns}
        data={companies}
        sortColumn={sortColumn}
        onSort={onSort}
      />
    );
  }
}

export default CompaniesTable;
