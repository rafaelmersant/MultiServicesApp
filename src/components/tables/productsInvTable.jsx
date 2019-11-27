import React, { Component } from "react";
import { Link } from "react-router-dom";
import Table from "../common/table";
import auth from "../../services/authService";

class ProductsInvTable extends Component {
  columns = [
    {
      path: "description",
      label: "Descripción",
      content: product => (
        <Link to={`/product/${product.product.id}`}>
          {" "}
          {product.product.description}{" "}
        </Link>
      )
    },
    { path: "typeTracking", label: "Tipo" },
    { path: "quantity", label: "Cantidad" },
    { path: "price", label: "Precio" },
    { path: "cost", label: "Costo" }
  ];

  deleteColumn = {
    key: "delete",
    content: product => (
      <div className="text-center">
        <button
          onClick={() => this.props.onDelete(product)}
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
    const { products, sortColumn, onSort } = this.props;

    return (
      <Table
        columns={this.columns}
        data={products}
        sortColumn={sortColumn}
        onSort={onSort}
      />
    );
  }
}

export default ProductsInvTable;
