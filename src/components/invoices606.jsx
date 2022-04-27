import React, { Component } from "react";
import _ from "lodash";
import Input from "./common/input";
import Loading from "./common/loading";
import { paginate } from "../utils/paginate";
import { getCurrentUser } from "../services/authService";
import Invoices606Table from "./tables/invoices606Table";
import ExportInvoices606 from "./reports/exportInvoices606";
import { getProductsTrackingsHeaderByYear } from "../services/inventoryService";

class Invoices606 extends Component {
  state = {
    loading: true,
    invoices: [],
    searchQuery: "",
    searchYear: new Date().getFullYear(),
    sortColumn: { path: "creationDate", order: "desc" },
  };

  async componentDidMount() {
    this.populateInvoices(this.state.searchYear);
  }

  async populateInvoices(year) {
    this.setState({ loading: true });
    this.forceUpdate();

    const companyId = getCurrentUser().companyId;

    let { data: invoices } = await getProductsTrackingsHeaderByYear(
      companyId,
      year
    );

    invoices = this.mapToModel(invoices.results);

    this.setState({ invoices, loading: false });
  }

  handlePageChange = (page) => {
    this.setState({ currentPage: page });
  };

  handleSearchYear = ({ currentTarget: input }) => {
    this.setState({ searchYear: input.value });
  };

  handleSearch = (query) => {
    this.setState({ searchQuery: query, currentPage: 1 });
  };

  handleSort = (sortColumn) => {
    this.setState({ sortColumn });
  };

  handleSearchButton = () => {
    this.populateInvoices(this.state.searchYear);
  };

  mapToModel = (data) => {
    let result = [];

    data.forEach((item) => {
      result.push({
        id: item.id,
        rnc: item.provider ? item.provider.rnc : "",
        ncf: item.ncf,
        amount: item.totalAmount - item.itbis,
        itbis: item.itbis,
        subtotal: item.totalAmount,
        creationDate: item.creationDate,
      });
    });

    return result;
  };

  getPagedData = () => {
    const {
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

    let invoices = paginate(sorted, 1, 9999999);
    
    return { totalCount: filtered.length, invoices };
  };

  invoicesExportFormat = (data) => {
    let result = [];

    data.forEach((item) => {
      result.push({
        id: item.id,
        rnc: item.provider ? item.provider.rnc : "",
        ncf: item.ncf,
        amount: item.totalAmount - item.itbis,
        itbis: item.itbis,
        subtotal: item.totalAmount,
        creationDate: new Date(item.creationDate).toLocaleDateString(),
      });
    });

    return result;
  };

  render() {
    const { sortColumn } = this.state;
    const { user } = this.props;

    const { invoices } = this.getPagedData();

    return (
      <div className="container-fluid">
        <div className="row">
          <div className="col">
            <h2 className="pull-right text-info">Reporte 606</h2>

            <ExportInvoices606
              data={invoices}
              sheetName="Reporte606"
            />

            <div className="d-flex flex-row">
              <div className="form-group">
                <Input
                  name="searchQuery"
                  value={this.state.searchQuery}
                  onChange={this.handleSearch}
                  placeholder="Buscar NCF..."
                />
              </div>

              <div className="form-group">
                <Input
                  name="searchYear"
                  value={this.state.searchYear}
                  onChange={this.handleSearchYear}
                  placeholder="Filtrar año..."
                />
              </div>

              <div className="form-group">
                <button
                  className="btn btn-info ml-2 my-4"
                  style={{ maxHeight: 36 }}
                  onClick={this.handleSearchButton}
                >
                  Filtrar
                </button>
              </div>
            </div>

            {this.state.loading && (
              <div>
                <p className="text-center">Cargando...</p>
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
              />
            )}

          </div>
        </div>
      </div>
    );
  }
}

export default Invoices606;
