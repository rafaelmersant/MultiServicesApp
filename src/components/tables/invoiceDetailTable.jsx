import React, { Component } from "react";
import TableBody from "../common/tableBody";
//import auth from "../../services/authService";
import { formatNumber } from "../../utils/custom";

class InvoiceDetailTable extends Component {
  columns = [
    { path: "quantity", label: "Cant." },
    { path: "product", label: "Producto" },
    { path: "price", label: "Precio" },
    { path: "itbis", label: "ITBIS Total" },
    { path: "discount", label: "Desc. Total" },
    { path: "total", label: "Importe" }
  ];

  deleteColumn = {
    path: "delete",
    key: "delete",
    content: detail => (
      <div className="row text-center" style={{ width: "68px" }}>
        <div className="col-2 text-center">
          <span
            onClick={() => this.props.onDelete(detail)}
            className="fa fa-trash text-danger cursor-pointer"
            style={{ fontSize: "23px" }}
          ></span>
        </div>
        <div className="col-2 text-center">
          <span
            onClick={() => this.props.onEdit(detail)}
            className="fa fa-edit text-warning cursor-pointer"
            style={{ fontSize: "23px" }}
          ></span>
        </div>
      </div>
    )
  };

  constructor() {
    super();
    this.columns.push(this.deleteColumn);
  }

  render() {
    const { details, invoiceHeader } = this.props;

    if (invoiceHeader.paid && invoiceHeader.id)
      this.columns = this.columns.filter(c => c.path !== "delete");

    return (
      <React.Fragment>
        <table className="table table-striped table-bordered">
          <thead className="thead-dark">
            <tr>
              {this.columns.map(column => (
                <th key={column.path || column.key} className="py-2">{column.label}</th>
              ))}
            </tr>
          </thead>

          <TableBody columns={this.columns} data={details} />

          {details.length > 0 && (
            <tfoot>
              <tr className="table-active">
                <th>Total</th>
                <th></th>
                <th></th>
                <th>{formatNumber(invoiceHeader.itbis)}</th>
                <th>{formatNumber(invoiceHeader.discount)}</th>
                <th>{formatNumber(invoiceHeader.subtotal - invoiceHeader.discount)}</th>
                {(!invoiceHeader.paid || !invoiceHeader.id) && <th></th>}
              </tr>
            </tfoot>
          )}
        </table>
      </React.Fragment>
    );
  }
}

export default InvoiceDetailTable;
