import React, { Component } from "react";
import Table from "../common/table";
import { formatNumber } from "../../utils/custom";

class InvoicesCustomersTable extends Component {
  columns = [
    { path: "customer_name", label: "Cliente" },
    {
      path: "subtotal",
      label: "Monto Total",
      content: (customer) => (
        <div className="text-right">
          <span>{formatNumber(customer.subtotal)}</span>
        </div>
      ),
    },
  ];

  render() {
    const { customers, totalAmount, totalITBIS, sortColumn, onSort } = this.props;

    return (
      <React.Fragment>
        <Table
          columns={this.columns}
          data={customers}
          sortColumn={sortColumn}
          onSort={onSort}
        />
        {customers.length > 0 && (
          <table className="table col-12">
            <thead className="thead-dark">
              <tr>
                <td className="bg-dark text-light">
                  Total de clientes: {customers.length}
                </td>
                <td className="bg-dark text-light text-right">
                  Total: {formatNumber(totalAmount)}
                </td>
              </tr>
            </thead>
          </table>
        )}
      </React.Fragment>
    );
  }
}

export default InvoicesCustomersTable;