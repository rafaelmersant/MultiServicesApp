import React, { Component } from "react";
import { Link } from "react-router-dom";
import Table from "./common/table";

class ProductTrackingTable extends Component {
  columns = [
    { path: "creationDate", label: "Fecha (m/d/a)" },
    {
      path: "product.description",
      label: "Producto",
      content: item => (
        <Link to={`/product/${item.product.id}`}>
          {item.product.description}
        </Link>
      )
    },
    {
      path: "typeTracking",
      label: "Tipo",
      content: item => (
        <span>
          {item.typeTracking.replace("E", "Entrada").replace("S", "Salida")}
        </span>
      )
    },
    { path: "quantity", label: "Cantidad" },
    {
      path: "concept",
      label: "Desde",
      content: item => (
        <span>
          {item.concept
            .replace("INVE", "Inventario")
            .replace("INVO", "Facturación")}
        </span>
      )
    }
  ];

  // companyColumn = { path: "company.name", label: "Compañía" };

  // deleteColumn = {
  //   key: "delete",
  //   content: user => (
  //     <button
  //       onClick={() => this.props.onDelete(user)}
  //       className="fa fa-trash"
  //       style={{ color: "red", fontSize: "16px" }}
  //     ></button>
  //   )
  // };

  // constructor() {
  //   super();
  //   const user = auth.getCurrentUser().email;
  //   const role = auth.getCurrentUser().role;

  //   if (user && role === "Admin") this.columns.push(this.companyColumn);
  //   if (user && role === "Admin") this.columns.push(this.deleteColumn);
  // }

  render() {
    const { prodTrackings, sortColumn, onSort } = this.props;

    return (
      <Table
        columns={this.columns}
        data={prodTrackings}
        sortColumn={sortColumn}
        onSort={onSort}
      />
    );
  }
}

export default ProductTrackingTable;
