import React, { Component } from "react";
import Table from "../common/table";
import auth from "../../services/authService";
import { formatNumber } from "../../utils/custom";

class PurchaseOrdersTable extends Component {
  columns = [
    {
      path: "product",
      label: "Producto",
      content: (item) => <div>{item.product && item.product.description}</div>,
    },
    {
      path: "quantity",
      label: "Cantidad",
      content: (item) => (
        <div className="text-right">{formatNumber(item.quantity ?? 0)}</div>
      ),
    },
    { path: "creationDate", label: "Creado (m/d/a)" },
  ];

  markAsCompleteColumn = {
    key: "pending",
    content: (item) => (
      <div className="text-center">
        <span
          title="Marcar como completada"
          onClick={() => this.props.onMarkAsComplete(item)}
          className="fa fa-check"
          style={{ color: "orange", fontSize: "26px", cursor: "pointer" }}
        ></span>
      </div>
    ),
  };

  constructor() {
    super();
    const user = auth.getCurrentUser().email;
    const role = auth.getCurrentUser().role;

    if (user && (role === "Admin" || role === "Owner"))
      this.columns.push(this.markAsCompleteColumn);
  }

  render() {
    const { orders, sortColumn, onSort } = this.props;

    return (
      <Table
        columns={this.columns}
        data={orders}
        sortColumn={sortColumn}
        onSort={onSort}
      />
    );
  }
}

export default PurchaseOrdersTable;
