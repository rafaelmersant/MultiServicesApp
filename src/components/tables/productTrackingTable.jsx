import React, { Component } from "react";
import { Link } from "react-router-dom";
import Table from "../common/table";
import { formatNumber } from "../../utils/custom";

class ProductTrackingTable extends Component {
  columns = [
    { path: "creationDate", label: "Fecha (mm/dd/aaaa)" },
    {
      path: "product.description",
      label: "Producto",
      content: (item) =>
        item.product && (
          <Link to={`/product/${item.product.id}`}>
            {item.product.description}
          </Link>
        ),
    },
    {
      path: "typeTracking",
      label: "Tipo",
      content: (item) => (
        <span>
          {item.typeTracking.replace("E", "Entrada").replace("S", "Salida")}
        </span>
      ),
    },
    {
      path: "quantity",
      label: "Cantidad",
      content: (item) => (
        <div className="text-right">{formatNumber(item.quantity)}</div>
      ),
    },
    {
      path: "concept",
      label: "Desde",
      content: (item) => (
        <span>
          {item.concept
            .replace("INVE", "Inventario")
            .replace("INVO", "Facturación")}
        </span>
      ),
    },
    {
      path: "provider",
      label: "Proveedor",
      content: (item) => (
        <span>{item.header && item.header.provider.name}</span>
      ),
    },
  ];

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
