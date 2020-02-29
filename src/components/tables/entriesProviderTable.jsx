import React, { Component } from "react";
import { Link } from "react-router-dom";
import { formatNumber } from "../../utils/custom";
import Table from "../common/table";

class EntriesProviderTable extends Component {
  columns = [
    { path: "provider.id", label: "Código" },
    {
      path: "provider.name",
      label: "Proveedor",
      content: item => <span>{item.provider.name}</span>
    },
    {
      path: "totalAmount",
      label: "Monto Total",
      align: "text-right",
      content: item => (
        <div className="text-right">
          <span> {formatNumber(parseFloat(item.totalAmount))} </span>
        </div>
      )
    },
    {
      path: "itbis",
      label: "ITBIS",
      align: "text-right",
      content: item => (
        <div className="text-right">
          <span> {formatNumber(parseFloat(item.itbis))} </span>
        </div>
      )
    },
    { path: "ncf", label: "NCF" },
    { path: "creationDate", label: "Fecha (m/d/a)" }
  ];

  render() {
    const { entries, sortColumn, onSort } = this.props;

    return (
      <Table
        columns={this.columns}
        data={entries}
        sortColumn={sortColumn}
        onSort={onSort}
      />
    );
  }
}

export default EntriesProviderTable;
