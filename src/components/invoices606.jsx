import React, { Component } from "react";
import _ from "lodash";
import Pagination from "./common/pagination";
import SearchBox from "./common/searchBox";
import { paginate } from "../utils/paginate";
import { getCurrentUser } from "../services/authService";
import { getInvoicesHeaderFull } from "../services/invoiceServices";
import Invoices606Table from "./tables/invoices606Table";
import ExportInvoices606 from "./reports/exportInvoices606";
import Loading from "./common/loading";

class Invoices606 extends Component {
  state = {
    loading: true,
    invoices: [],
    currentPage: 1,
    pageSize: 400000,
    searchQuery: "",
    sortColumn: { path: "creationDate", order: "desc" },
  };

  async componentDidMount() {
    this.populateInvoices();
  }

  async populateInvoices() {
    const companyId = getCurrentUser().companyId;

    let { data: invoices } = await getInvoicesHeaderFull(companyId);

    this.setState({ invoices, loading: false });
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

  mapToExcelView = (data) => {
    let result = [];

    data.forEach((item) => {
      result.push({
        creationDate: new Date(item.creationDate).toLocaleDateString(),
        ncf: item.ncf,
        discount: item.discount,
        itbis: item.itbis,
        subtotal: item.subtotal,
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

    const invoices = paginate(sorted, currentPage, pageSize);

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
            <h2 className="pull-right text-info">Reporte 606</h2>

            <ExportInvoices606
              data={this.mapToExcelView(invoices)}
              sheetName="Reporte606"
            />

            <SearchBox
              value={searchQuery}
              onChange={this.handleSearch}
              placeholder="Buscar NCF..."
            />

            {this.state.loading && (
              <div>
                <p className="text-center">
                  Cargando...
                </p>
                <div className="d-flex justify-content-center mb-3">
                  <Loading />
                </div>
              </div>
            )}

            {!this.state.loading && (
              <Invoices606Table
                invoices={invoices}
                user={user}
                sortColumn={sortColumn}
                onDelete={this.handleDelete}
                onSort={this.handleSort}
              />
            )}

            {!this.state.loading && (
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
            )}

          </div>
        </div>
      </div>
    );
  }
}

export default Invoices606;
