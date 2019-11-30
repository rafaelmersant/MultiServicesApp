import React, { Component } from "react";
import Table from "../common/table";
import { formatNumber } from "../../utils/custom";

class ProductStockTable extends Component {
  columns = [
    {
      path: "description",
      label: "Producto",
      content: stock => <span> {stock.product.description} </span>
    },
    { path: "quantityAvailable", label: "Cantidad" },
    {
      path: "product.cost",
      label: "Costo",
      content: stock => <span> {stock.product.cost} </span>
    },
    {
      path: "product.price",
      label: "Precio",
      content: stock => <span> {stock.product.price} </span>
    },
    {
      path: "totalCost",
      label: "Costo Total",
      content: stock => (
        <span>
          {formatNumber(stock.quantityAvailable * stock.product.cost)}
        </span>
      )
    },
    {
      path: "totalPrice",
      label: "Precio Total",
      content: stock => (
        <span>
          {formatNumber(stock.quantityAvailable * stock.product.price)}
        </span>
      )
    }
  ];

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

export default ProductStockTable;
