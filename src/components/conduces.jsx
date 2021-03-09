import React, { Component } from "react";
import { toast } from "react-toastify";
import Pagination from "react-js-pagination";
import NewButton from "./common/newButton";
import Loading from "./common/loading";
import { getCurrentUser } from "../services/authService";
import { getInvoiceLeadHeader } from "../services/invoiceLeadServices";
import ConducesTable from "./tables/conducesTable";

class Conduces extends Component {
  state = {
    loading: true,
    conduces: [],
    currentPage: 1,
    pageSize: 10,
    sortColumn: { path: "creationDate", order: "desc" },
    searchParams: {
      customerId: 0,
      invoiceNo: 0,
    },
  };

  async componentDidMount() {
    await this.populateConduces();
  }

  async populateConduces(_sortColumn, _currentPage) {
    const companyId = getCurrentUser().companyId;
    const { invoiceNo, customerId } = {
      ...this.state.searchParams,
    };
    const { currentPage, sortColumn } = { ...this.state };

    _sortColumn = _sortColumn ? _sortColumn : sortColumn;
    _currentPage = _currentPage ? _currentPage : currentPage;

    const { data: conduces } = await getInvoiceLeadHeader(
      companyId,
      0,
      _currentPage,
      _sortColumn
    );

    this.setState({
      conduces: conduces.results,
      totalConduces: conduces.count,
      loading: false,
    });
  }

  handlePageChange = async (page) => {
    this.setState({ currentPage: page });
    sessionStorage["currentPage"] = parseInt(page);

    await this.populateConduces(null, page);
  };

  handleSort = async (sortColumn) => {
    this.setState({ sortColumn });

    await this.populateConduces(sortColumn);
  };

  handleInvoiceChange = async (invoiceNo) => {
    const handler = (e) => {
      e.preventDefault();
    };
    handler(window.event);

    const { searchParams } = { ...this.state };
    searchParams.invoiceNo = invoiceNo;

    this.setState({ searchParams });
    this.populateConduces();
  };

  handleCustomerChange = async (customer) => {
    const handler = (e) => {
      e.preventDefault();
    };
    handler(window.event);

    const { searchParams } = { ...this.state };
    searchParams.customerId = customer.id;
    searchParams.invoiceNo = "";

    this.setState({ searchParams });
    this.populateConduces();
  };

  render() {
    const {
      conduces,
      sortColumn,
      totalConduces,
      pageSize,
      currentPage,
    } = this.state;
    const user = getCurrentUser();
    const total = conduces ? conduces.length : 0;

    return (
      <div className="container">
        <div className="row">
          <div className="col">
            <NewButton label="Nuevo Conduce" to="/conduce/new" />
          </div>
        </div>

        <div className="row">
          <div className="col">
            <div className="row">
              <div>
                <h5 className="text-info">Listado de Conduces</h5>
              </div>
            </div>

            {/* <SearchInvoiceBlock
              onInvoiceChange={this.handleInvoiceChange}
              onCustomerChange={this.handleCustomerChange}
              onPaymentMethodChange={this.handlePaymentMethodChange}
            /> */}

            {this.state.loading && (
              <div className="d-flex justify-content-center">
                <Loading />
              </div>
            )}

            {!this.state.loading && (
              <div className="row">
                <ConducesTable
                  conduces={conduces}
                  user={user}
                  sortColumn={sortColumn}
                  onDelete={this.handleDelete}
                  onSort={this.handleSort}
                />
              </div>
            )}

            {!this.state.loading && (
              <div className="row">
                <div>
                  <Pagination
                    activePage={currentPage}
                    itemsCountPerPage={pageSize}
                    totalItemsCount={totalConduces}
                    pageRangeDisplayed={5}
                    onChange={this.handlePageChange.bind(this)}
                    itemClass="page-item"
                    linkClass="page-link"
                  />
                </div>
                <p className="text-muted ml-3 mt-2">
                  <em>
                    Mostrando {total} conduces de {totalConduces}
                  </em>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default Conduces;
