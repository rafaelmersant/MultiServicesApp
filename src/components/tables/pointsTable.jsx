import React, { Component } from "react";
import Table from "../common/table";
import auth from "../../services/authService";
import { formatNumber } from "../../utils/custom";

class PointsTable extends Component {
  columns = [
    {
      path: "invoice.sequence",
      label: "No. Factura",
      content: (point) => <span>{`${point.invoice.sequence}`}</span>,
    },
    {
      path: "customer.firstName",
      label: "Cliente",
      content: (point) => (
        <span>{`${point.customer.firstName} ${point.customer.lastName}`}</span>
      ),
    },
    {
      path: "invoice_amount",
      label: "Monto Factura",
      align: "text-right",
      content: (point) => (
        <div className="text-right">
          <span>{formatNumber(point.invoice_amount)}</span>
        </div>
      ),
    },
    {
      path: "total_points",
      label: "Puntos",
      align: "text-right",
      content: (point) => (
        <div className="text-right">
          <span>{formatNumber(point.total_points)}</span>
        </div>
      ),
    },
    {
      path: "type",
      label: "Tipo",
      align: "text-center",
      content: (point) => (
        <div className="text-center">
          <span>
            {point.type.replace("E", "Obtenidos").replace("R", "Usados")}
          </span>
        </div>
      ),
    },
    { path: "reference", label: "Referencia" },
    { path: "creationDate", label: "Fecha (m/d/a)" },
  ];

  //   deleteColumn = {
  //     key: "delete",
  //     content: (invoice) => (
  //       <div className="text-center">
  //         {invoice.invoiceStatus !== "ANULADA" && (
  //           <span
  //             onClick={() => this.props.onDelete(invoice)}
  //             className="fa fa-trash text-danger cursor-pointer trash-size"
  //           ></span>
  //         )}
  //       </div>
  //     ),
  //   };

  constructor() {
    super();
    const user = auth.getCurrentUser().email;
    const role = auth.getCurrentUser().role;

    // if (user && (role === "Admin" || role === "Owner"))
    //   this.columns.push(this.deleteColumn);
  }

  render() {
    const { points, sortColumn, onSort, sumPoints, sumAmount } = this.props;

    return (
      <React.Fragment>
        <Table
          columns={this.columns}
          data={points}
          sortColumn={sortColumn}
          onSort={onSort}
        />

        {points.length > 0 && (
          <table className="table col-12">
            <thead className="thead-dark">
              <tr>
                <td colSpan={2} className="bg-dark text-warning">
                  Total registros: {points.length}
                </td>
                <td className="bg-dark text-warning text-right">
                  Monto Total: {formatNumber(sumAmount)}
                </td>
                <td className="bg-dark text-warning text-right">
                  Total Puntos: {formatNumber(sumPoints)}
                </td>
                <td className="bg-dark text-warning text-right"></td>
                <td className="bg-dark text-warning text-right"></td>
              </tr>
            </thead>
          </table>
        )}
      </React.Fragment>
    );
  }
}

export default PointsTable;
