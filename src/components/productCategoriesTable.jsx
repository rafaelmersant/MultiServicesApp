import React, { Component } from "react";
import { Link } from "react-router-dom";
import Table from "./common/table";
import auth from "../services/authService";

class ProductCategoriesTable extends Component {
  columns = [
    {
      path: "description",
      label: "Descripción",
      content: category => (
        <Link to={`/productCategory/${category.id}`}>
          {" "}
          {category.description}{" "}
        </Link>
      )
    },
    { path: "creationDate", label: "Creado (m/d/a)" }
  ];

  deleteColumn = {
    key: "delete",
    content: category => (
      <div className="text-center">
        <button
          onClick={() => this.props.onDelete(category)}
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
    const { categories, sortColumn, onSort } = this.props;

    return (
      <Table
        columns={this.columns}
        data={categories}
        sortColumn={sortColumn}
        onSort={onSort}
      />
    );
  }
}

export default ProductCategoriesTable;
