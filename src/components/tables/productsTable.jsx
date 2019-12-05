import React, { Component } from "react";
import { Link } from "react-router-dom";
import Table from "../common/table";
import auth from "../../services/authService";
import { formatNumber } from "../../utils/custom";

class ProductsTable extends Component {
  columns = [
    {
      path: "description",
      label: "Descripción",
      content: product => (
        <Link to={`/product/${product.id}`}> {product.description} </Link>
      )
    },
    {
      path: "price",
      label: "Precio",
      content: item => (
        <div className="text-right">{formatNumber(item.price)}</div>
      )
    },
    {
      path: "cost",
      label: "Costo",
      content: item => (
        <div className="text-right">{formatNumber(item.cost)}</div>
      )
    },
    {
      path: "itbis",
      label: "ITBIS",
      content: item => (
        <div className="text-right">{formatNumber(item.itbis)}</div>
      )
    },
    { path: "category.description", label: "Categoria" },
    { path: "measure", label: "Medida" },
    { path: "creationDate", label: "Creado (m/d/a)" }
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

export default ProductsTable;
