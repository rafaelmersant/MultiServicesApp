import React, { Component } from "react";
import Table from "../common/table";
import { formatNumber } from "../../utils/custom";

class CuadreTable extends Component {
  columns = [
    { path: "creationDate", label: "Fecha (m/d/a)" },
    {
      path: "subtotal",
      label: "Monto",
      content: (entry) => (
        <div className="text-right">
          <span>{formatNumber(entry.subtotal)}</span>
        </div>
      ),
    },
  ];

  render() {
    const { invoices, totalAmount, sortColumn, onSort } = this.props;

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
                  Total registros: {invoices.length}
                </td>
                <td className="bg-dark text-light text-right">
                  Monto Total: {formatNumber(totalAmount)}
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