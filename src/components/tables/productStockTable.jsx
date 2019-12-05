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
    {
      path: "quantityAvailable",
      label: "Cantidad",
      align: "text-right",
      content: stock => (
        <div className="text-right">
          {formatNumber(stock.quantityAvailable)}
        </div>
      )
    },
    {
      path: "product.cost",
      label: "Costo",
      align: "text-right",
      content: stock => (
        <div className="text-right">
          <span> {formatNumber(stock.product.cost)} </span>
        </div>
      )
    },
    {
      path: "product.price",
      label: "Precio",
      align: "text-right",
      content: stock => (
        <div className="text-right">
          <span> {formatNumber(stock.product.price)} </span>
        </div>
      )
    },
    {
      path: "totalCost",
      label: "Costo Total",
      align: "text-right",
      content: stock => (
        <div className="text-right">
          <span>
            {formatNumber(stock.quantityAvailable * stock.product.cost)}
          </span>
        </div>
      )
    },
    {
      path: "totalPrice",
      label: "Precio Total",
      align: "text-right",
      content: stock => (
        <div className="text-right">
          <span>
            {formatNumber(stock.quantityAvailable * stock.product.price)}
          </span>
        </div>
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
