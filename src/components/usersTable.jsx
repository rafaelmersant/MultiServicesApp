import React, { Component } from "react";
import { Link } from "react-router-dom";
import Table from "./common/table";
import auth from "../services/authService";

class UsersTable extends Component {
  columns = [
    {
      path: "name",
      label: "Name",
      content: user => <Link to={`/user/${user.id}`}> {user.name} </Link>
    },
    { path: "email", label: "Email" },
    { path: "userRole", label: "Rol" },
    { path: "creationDate", label: "Creado" }
  ];

  deleteColumn = {
    key: "delete",
    content: user => (
      <button
        onClick={() => this.props.onDelete(user)}
        className="btn btn-danger btn-sm"
      >
        Eliminar
      </button>
    )
  };

  constructor() {
    super();
    const user = auth.getCurrentUser();
    if (user && user.userRole === "Admin") this.columns.push(this.deleteColumn);
  }

  render() {
    const { users, sortColumn, onSort } = this.props;

    return (
      <Table
        columns={this.columns}
        data={users}
        sortColumn={sortColumn}
        onSort={onSort}
      />
    );
  }
}

export default UsersTable;
