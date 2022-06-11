import React, { Component } from "react";
import Table from "../common/table";
import { formatNumber } from "../../utils/custom";

class CuadreTable extends Component {
  columns = [
    { path: "creationDate", label: "Fecha (m/d/a)" },
    {
      path: "amountWithoutITBIS",
      label: "Monto",
      content: (invoice) => (
        <div className="text-right">
          <span>{formatNumber(invoice.amountWithoutITBIS)}</span>
        </div>
      ),
    },
    {
      path: "itbis",
      label: "ITBIS",
      content: (invoice) => (
        <div className="text-right">
          <span>{formatNumber(invoice.itbis)}</span>
        </div>
      ),
    },
    {
      path: "subtotal",
      label: "Total",
      content: (invoice) => (
        <div className="text-right">
          <span>{formatNumber(invoice.subtotal)}</span>
        </div>
      ),
    },
    {
      path: "utilidad",
      label: "Utilidad",
      content: (invoice) => (
        <div className="text-right">
          <span>{formatNumber(invoice.subtotal - invoice.cost)}</span>
        </div>
      ),
    },
  ];

  render() {
    const { invoices, totalAmount, totalUtility, totalITBIS, sortColumn, onSort } = this.props;

    return (
      <React.Fragment>
        <Table
          columns={this.columns}
          data={invoices}
          sortColumn={sortColumn}
          onSort={onSort}
        />
        {invoices.length > 0 && (
          <table className="table col-12">
            <thead className="thead-dark">
              <tr>
                <td className="bg-dark text-light">
                  Total de facturas: {invoices.length}
                </td>
                <td className="bg-dark text-light text-right">
                  Monto: {formatNumber(totalAmount - totalITBIS)}
                </td>
                <td className="bg-dark text-light text-right">
                  ITBIS: {formatNumber(totalITBIS)}
                </td>
                <td className="bg-dark text-light text-right">
                  Total: {formatNumber(totalAmount)}
                </td>
                <td className="bg-dark text-light text-right">
                  Utilidad: {formatNumber(totalUtility)}
                </td>
              </tr>
            </thead>
          </table>
        )}
      </React.Fragment>
    );
  }
}

export default CuadreTable;