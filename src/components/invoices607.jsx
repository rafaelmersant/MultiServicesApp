import React, { Component } from "react";
import _ from "lodash";
import Input from "./common/input";
import Loading from "./common/loading";
import { paginate } from "../utils/paginate";
import { getCurrentUser } from "../services/authService";
import { getInvoicesHeaderFull } from "../services/invoiceServices";
import Invoices607Table from "./tables/invoices607Table";
import ExportInvoices607 from "./reports/exportInvoices607";

class Invoices607 extends Component {
  state = {
    loading: true,
    invoices: [],
    invoicesExcel: [],
    totalCount: 0,
    searchQuery: "",
    searchYear: new Date().getFullYear(),
    sortColumn: { path: "creationDate", order: "desc" },
  };

  async componentDidMount() {
    this.populateInvoices(this.state.searchYear);
  }

  async populateInvoices(year) {
    this.setState({loading: true});
    this.forceUpdate();

    const companyId = getCurrentUser().companyId;

    let { data: invoices } = await getInvoicesHeaderFull(companyId, year);

    invoices = this.mapToModel(invoices);

    this.setState({ invoices, loading: false });
  }

  handlePageChange = (page) => {
    this.setState({ currentPage: page });
  };

  handleSearch = ({ currentTarget: input }) => {
    this.setState({ searchQuery: input.value });
  };

  handleSearchYear = ({ currentTarget: input }) => {
    this.setState({ searchYear: input.value });
  };

  handleSearchButton = () => {
    this.populateInvoices(this.state.searchYear);
  };

  handleSort = (sortColumn) => {
    this.setState({ sortColumn });
  };

  mapToModel = (data) => {
    let result = [];

    data.forEach((item) => {
      result.push({
        id: item.id,
        creationDate: item.creationDate,
        rnc:
          item.customer && item.customer.identificationType === "R"
            ? item.customer.identification
            : "",
        ncf: item.ncf,
        amount: item.subtotal - item.discount - item.itbis,
        // discount: item.discount,
        itbis: item.itbis,
        subtotal: item.subtotal - item.discount,
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
    const invoices = paginate(sorted, 1, 9999999);

    return { totalCount: filtered.length, invoices };
  };

  invoicesExportFormat = (data) => {
    let result = [];

    data.forEach((item) => {
      result.push({
        id: item.id,
        creationDate: new Date(item.creationDate).toLocaleDateString(),
        rnc: item.rnc,
        ncf: item.ncf,
        amount: item.amount,
        itbis: item.itbis,
        subtotal: item.subtotal,
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
            <h2 className="pull-right text-info">Reporte 607</h2>

            <ExportInvoices607
              data={this.invoicesExportFormat(invoices)}
              sheetName="Reporte607"
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
              <Invoices607Table
                invoices={this.state.invoices}
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

export default Invoices607;
