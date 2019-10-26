import React, { Component } from "react";
import Table from "./common/table";
import auth from "../services/authService";

class NCFsTable extends Component {
  columns = [
    { path: "typeDoc", label: "Tipo NCF" },
    { path: "start", label: "Inicia" },
    { path: "end", label: "Termina" },
    { path: "current", label: "Actual" },
    { path: "dueDate", label: "Secuencia Vence" },
    {
      path: "active",
      label: "Activo",
      content: item => (
        <span>
          {item.active
            .toString()
            .replace("false", "No")
            .replace(true, "Sí")}
        </span>
      )
    },
    { path: "creationDate", label: "Creado (m/d/a)" }
  ];

  deleteColumn = {
    key: "delete",
    content: entry => (
      <div className="text-center">
        <button
          onClick={() => this.props.onDelete(entry)}
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

    if (user && role === "Admin") this.columns.push(this.deleteColumn);
  }

  render() {
    const { ncfs, sortColumn, onSort } = this.props;

    return (
      <Table
        columns={this.columns}
        data={ncfs}
        sortColumn={sortColumn}
        onSort={onSort}
      />
    );
  }
}

export default NCFsTable;
