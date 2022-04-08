import React, { Component } from "react";
import _ from "lodash";
import Pagination from "./common/pagination";
import SearchBox from "./common/searchBox";
import { paginate } from "../utils/paginate";
import { getCurrentUser } from "../services/authService";
import { getInvoicesHeaderFull } from "../services/invoiceServices";
import Invoices607Table from "./tables/invoices607Table";
import ExportInvoices607 from "./reports/exportInvoices607";

class Invoices607 extends Component {
  state = {
    invoices: [],
    currentPage: 1,
    pageSize: 4000,
    searchQuery: "",
    sortColumn: { path: "creationDate", order: "desc" },
  };

  async componentDidMount() {
    this.populateInvoices();
  }

  async populateInvoices() {
    const companyId = getCurrentUser().companyId;

    let { data: invoices } = await getInvoicesHeaderFull(companyId);

    invoices = this.mapToModel(invoices);

    this.setState({ invoices });
  }

  handlePageChange = (page) => {
    this.setState({ currentPage: page });
  };

  handleSearch = (query) => {
    this.setState({ searchQuery: query, currentPage: 1 });
  };

  handleSort = (sortColumn) => {
    this.setState({ sortColumn });
  };

  mapToModel = (data) => {
    let result = [];

    data.forEach((item) => {
      result.push({
        id: item.id,
        identification:
          item.customer && item.customer.identification
            ? item.customer.identification
            : "",
        ncf: item.ncf,
        subtotal: item.subtotal,
        creationDate: new Date(item.creationDate),
      });
    });

    return result;
  };

  getPagedData = () => {
    const {
      pageSize,
      currentPage,
      sortColumn,
      searchQuery,
      invoices: allInvoices,
    } = this.state;

    let filtered = allInvoices;
    if (searchQuery)
      filtered = allInvoices.filter((m) =>
        `${m.ncf.toLowerCase()}`.includes(searchQuery.toLocaleLowerCase())
      );

    const sorted = _.orderBy(filtered, [sortColumn.path], [sortColumn.order]);

    let invoices = paginate(sorted, currentPage, pageSize);

    return { totalCount: filtered.length, invoices };
  };

  render() {
    const { pageSize, currentPage, sortColumn, searchQuery } = this.state;
    const { user } = this.props;

    const { totalCount, invoices } = this.getPagedData();

    return (
      <div className="container-fluid">
        <div className="row">
          <div className="col">
            <h2 className="pull-right text-info">Reporte 607</h2>

            <ExportInvoices607
              data={this.mapToModel(invoices)}
              sheetName="Reporte607"
            />

            <SearchBox
              value={searchQuery}
              onChange={this.handleSearch}
              placeholder="Buscar NCF..."
            />

            <Invoices607Table
              invoices={invoices}
              user={user}
              sortColumn={sortColumn}
              onDelete={this.handleDelete}
              onSort={this.handleSort}
            />

            <div className="row">
              <Pagination
                itemsCount={totalCount}
                pageSize={pageSize}
                currentPage={currentPage}
                onPageChange={this.handlePageChange}
              />
              <p className="text-muted ml-3 mt-2">
                <em>Mostrando {totalCount} registros</em>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Invoices607;
