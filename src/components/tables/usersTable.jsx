import React, { Component } from "react";
import { Link } from "react-router-dom";
import Table from "../common/table";
import auth from "../../services/authService";

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
      <div className="text-center">
        <button
          onClick={() => this.props.onDelete(user)}
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
