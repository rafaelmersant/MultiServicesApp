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
      content: product => {
        if (
          auth.getCurrentUser().role === "Admin" ||
          auth.getCurrentUser().role === "Owner"
        ) {
          return (
            <Link to={`/product/${product.id}`}> {product.description} </Link>
          );
        } else {
          return <span className="text-info"> {product.description} </span>;
        }
      }
    },
    {
      path: "quantity",
      label: "Cantidad",
      content: item => (
        <div className="text-right">{formatNumber(item.quantity ?? 0)}</div>
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
    { path: "creationDate", label: "Creado (m/d/a)", content: item => (
      <span>{new Date(item.creationDate).toLocaleDateString()}</span>
    ) }
  ];

  deleteColumn = {
    key: "delete",
    content: product => (
      <div className="text-center">
        <span
          onClick={() => this.props.onDelete(product)}
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
