import React, { Component } from "react";
import TableBody from "./common/tableBody";
import auth from "../services/authService";
import { formatNumber } from "../utils/custom";

class InvoiceDetailTable extends Component {
  columns = [
    { path: "quantity", label: "Cant." },
    { path: "product", label: "Producto" },
    { path: "price", label: "Precio" },
    { path: "itbis", label: "ITBIS" },
    { path: "discount", label: "Desc." },
    { path: "total", label: "Importe" }
  ];

  deleteColumn = {
    key: "delete",
    content: detail => (
      <div className="text-center">
        <button
          onClick={() => this.props.onDelete(detail)}
          className="fa fa-trash text-danger"
          style={{ fontSize: "16px" }}
        ></button>
      </div>
    )
  };

  editColumn = {
    key: "edit",
    content: detail => (
      <div className="text-center">
        <button
          onClick={() => this.props.onEdit(detail)}
          className="fa fa-edit text-warning h5"
          // style={{ fontSize: "16px" }}
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
    //if (user && role === "Admin") this.columns.push(this.editColumn);
  }

  render() {
    const { details, invoiceHeader } = this.props;

    return (
      <React.Fragment>
        <table className="table table-striped table-bordered">
          <thead className="thead-dark">
            <tr>
              {this.columns.map(column => (
                <th key={column.path || column.key}>{column.label}</th>
              ))}
            </tr>
          </thead>

          <TableBody columns={this.columns} data={details} />

          {details.length > 1 && (
            <tfoot>
              <tr className="table-active">
                <th>Total</th>
                <th></th>
                <th></th>
                <th>{formatNumber(invoiceHeader.itbis)}</th>
                <th>{formatNumber(invoiceHeader.discount)}</th>
                <th>{formatNumber(invoiceHeader.subtotal)}</th>
                <th></th>
              </tr>
            </tfoot>
          )}
        </table>
      </React.Fragment>
    );
  }
}

export default InvoiceDetailTable;
