import React, { Component } from "react";
import _ from "lodash";
import Pagination from "./common/pagination";
import SearchBox from "./common/searchBox";
import { paginate } from "../utils/paginate";
import { getCurrentUser } from "../services/authService";
import { getInvoicesHeader } from "../services/invoiceServices";
import Invoices606Table from "./tables/invoices606Table";

class Invoices606 extends Component {
  state = {
    invoices: [],
    currentPage: 1,
    pageSize: 4000,
    searchQuery: "",
    sortColumn: { path: "creationDate", order: "desc" }
  };

  async componentDidMount() {
    this.populateInvoices();
  }

  async populateInvoices() {
    const companyId = getCurrentUser().companyId;
    const invoiceNo = null;
    const customerId = null;
    const paymentMethod = "ALL";

    let { data: invoices } = await getInvoicesHeader(
      companyId,
      invoiceNo,
      customerId,
      paymentMethod,
      this.state.currentPage,
      this.state.sortColumn
    );

    invoices = invoices.results;

    this.setState({ invoices });
  }

  handlePageChange = page => {
    this.setState({ currentPage: page });
  };

  handleSearch = query => {
    this.setState({ searchQuery: query, currentPage: 1 });
  };

  handleSort = sortColumn => {
    this.setState({ sortColumn });
  };

  getPagedData = () => {
    const {
      pageSize,
      currentPage,
      sortColumn,
      searchQuery,
      invoices: allInvoices
    } = this.state;

    let filtered = allInvoices;
    if (searchQuery)
      filtered = allInvoices.filter(m =>
        `${m.ncf.toLowerCase()}`.includes(searchQuery.toLocaleLowerCase())
      );

    const sorted = _.orderBy(filtered, [sortColumn.path], [sortColumn.order]);

    const invoices = paginate(sorted, currentPage, pageSize);

    return { totalCount: filtered.length, invoices };
  };

  render() {
    const { pageSize, currentPage, sortColumn, searchQuery } = this.state;
    const { user } = this.props;

    const { totalCount, invoices } = this.getPagedData();

    return (
      <div className="container">
        <div className="row">
          <div className="col">
            <h2 className="pull-right text-info">Reporte 606</h2>
            <SearchBox
              value={searchQuery}
              onChange={this.handleSearch}
              placeholder="Buscar NCF..."
            />

            <Invoices606Table
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
                <em>Mostrando {totalCount} facturas</em>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Invoices606;
