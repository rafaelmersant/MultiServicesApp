import React, { Component } from "react";
import { Link } from "react-router-dom";
import { formatNumber } from "../../utils/custom";
import Table from "../common/table";

class ProductTrackingHeaderTable extends Component {
  columns = [
    {
      path: "id",
      label: "ID",
      content: inventory => (
        <div className="text-center">
          <Link to={`/inventoryFull/${inventory.id}`}>{inventory.id}</Link>
        </div>
      )
    },
    { path: "creationDate", label: "Fecha (m/d/a)" },
    {
      path: "provider.name",
      label: "Proveedor",
      content: item => (
        <Link to={`/provider/${item.provider.id}`}>{item.provider.name}</Link>
      )
    },
    {
      path: "totalAmount",
      label: "Monto Total",
      content: item => (
        <span> {formatNumber(parseFloat(item.totalAmount))} </span>
      )
    },
    { path: "ncf", label: "NCF" }
  ];

  render() {
    const { prodTrackingsHeader, sortColumn, onSort } = this.props;

    return (
      <Table
        columns={this.columns}
        data={prodTrackingsHeader}
        sortColumn={sortColumn}
        onSort={onSort}
      />
    );
  }
}

export default ProductTrackingHeaderTable;