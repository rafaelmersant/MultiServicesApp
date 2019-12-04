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
      content: item => (
        <Link to={`/provider/${item.provider.id}`}>{item.provider.name}</Link>
      )
    },
    {
      path: "totalAmount",
      label: "Monto Total",
      content: item => (
        <span> {formatNumber(parseFloat(item.totalAmount))} </span>
      )
    },
    {
      path: "itbis",
      label: "ITBIS",
      content: item => <span> {formatNumber(parseFloat(item.itbis))} </span>
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
