import React, { Component } from "react";
import Table from "../common/table";
import { formatNumber } from "../../utils/custom";

class EmployeesSalesTable extends Component {
  columns = [
    { path: "createdUser", label: "Empleado" },
    {
      path: "subtotal",
      label: "Monto Total",
      content: (employee) => (
        <div className="text-right">
          <span>{formatNumber(employee.subtotal)}</span>
        </div>
      ),
    },
  ];

  render() {
    const { employees, totalAmount, totalITBIS, sortColumn, onSort } = this.props;

    return (
      <React.Fragment>
        <Table
          columns={this.columns}
          data={employees}
          sortColumn={sortColumn}
          onSort={onSort}
        />
        {employees.length > 0 && (
          <table className="table col-12">
            <thead className="thead-dark">
              <tr>
                <td className="bg-dark text-light">
                  Total de empleados: {employees.length}
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

export default EmployeesSalesTable;