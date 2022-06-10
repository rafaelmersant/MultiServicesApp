import React, { Component } from "react";
import Pagination from "react-js-pagination";
import Loading from "./common/loading";

import PointsTable from "./tables/pointsTable";
import { getCurrentUser } from "../services/authService";
import {
  getPoints,
} from "../services/invoiceServices";
import SearchCustomer from "./common/searchCustomer";
import { toast } from "react-toastify";

class Points extends Component {
  state = {
    loading: true,
    points: [],
    currentPage: 1,
    pageSize: 10,
    totalPoints: 0,
    sumPoints: 0,
    sumAmount: 0,
    sortColumn: { path: "creationDate", order: "desc" },
    searchParams: {
      customerId: 0,
    },
    hideSearchCustomer: false,
    searchCustomerText: "",
  };

  async componentDidMount() {
    await this.populatePoints();

    this.intervalInvoiceId = setInterval(async () => {
      await this.populatePoints();
    }, 4000);
  }

  componentWillUnmount() {
    clearInterval(this.intervalInvoiceId);
  }

  async populatePoints(_sortColumn, _currentPage) {
    const { customerId } = {
      ...this.state.searchParams,
    };
    const { currentPage, sortColumn } = { ...this.state };

    _sortColumn = _sortColumn ? _sortColumn : sortColumn;
    _currentPage = _currentPage ? _currentPage : currentPage;

    const { data: points } = await getPoints(
      customerId,
      _currentPage,
      _sortColumn
    );

    const pageSize = customerId ? points.count : this.state.pageSize;

    const sumPoints = points.results.reduce(
      (acc, item) => acc + parseFloat(item.total_points),
      0
    );
    const sumAmount = points.results.reduce(
      (acc, item) => acc + parseFloat(item.invoice_amount),
      0
    );

    console.log('Total Points:', sumPoints)
    console.log('Total Amount:', sumAmount)

    this.setState({
      points: points.results,
      totalPoints: points.count,
      loading: false,
      currentPage: _currentPage,
      sortColumn: _sortColumn,
      pageSize,
      sumPoints,
      sumAmount,
    });
  }

  handlePageChange = async (page) => {
    this.setState({ currentPage: page });
    sessionStorage["currentPage"] = parseInt(page);

    await this.populatePoints(null, page);
  };

  handleSort = async (sortColumn) => {
    this.setState({ sortColumn });

    await this.populatePoints(sortColumn);
  };

  //   handleDelete = async (invoice) => {
  //     if (invoice.paid) {
  //       toast.error("No puede anular una factura pagada.");
  //       return false;
  //     }

  //     const answer = window.confirm(
  //       `Seguro que desea anular la factura #${invoice.sequence}`
  //     );

  //     if (answer) {
  //       try {
  //         const invoices = this.state.invoices.filter(
  //           (item) => item.id !== invoice.id
  //         );
  //         this.setState({ invoices });

  //         const { data: details } = await getInvoiceDetail(invoice.id);

  //         console.log('details:', details)
  //         details.forEach(async (item) => {
  //           await this.updateInventory(item.product_id, item.quantity);
  //         });

  //         var deleted = await cancelInvoiceHeader(invoice.sequence);
  //       } catch (ex) {
  //         if (ex.response && ex.response.status === 404)
  //           toast.error("Este factura ya fue anulada");
  //       }

  //       if (deleted && deleted.status === 200)
  //         toast.success(
  //           `La factura #${invoice.sequence} fue anulada con exito!`
  //         );
  //     }
  //   };

  handleFocusCustomer = (value) => {
    setTimeout(() => {
      this.setState({ hideSearchCustomer: value });
    }, 200);
  };

  handleCustomerChange = async (customer) => {
    const handler = (e) => {
      e.preventDefault();
    };
    handler(window.event);

    if (customer.id === 0) {
      toast.error("Lo sentimos, no puede crear un nuevo cliente desde aqui.");
      return false;
    }

    const { searchParams } = { ...this.state };
    searchParams.customerId = customer.id;

    this.setState({
      searchParams,
      loading: true,
      hideSearchCustomer: true,
      searchCustomerText: `${customer.firstName} ${customer.lastName}`,
    });
    this.populatePoints(null, 1);
  };

  handleClearCustomerSelection = () => {
    const handler = (e) => {
      e.preventDefault();
    };
    handler(window.event);

    this.handleCustomerChange({ id: null, firstName: "", lastName: "" });
    this.setState({ searchCustomerText: "" });
  };

  render() {
    const {
      points,
      sortColumn,
      totalPoints,
      pageSize,
      currentPage,
      sumPoints,
      sumAmount,
    } = this.state;
    const user = getCurrentUser();
    const total = points ? points.length : 0;

    return (
      <div className="container-fluid">
        <div className="row">
          <div className="col">
            <div className="d-flex justify-content-between">
              <div>
                <h5 className="text-info">Puntos Superavit</h5>
              </div>
            </div>

            <div className="row">
              <div className="col-7">
                <SearchCustomer
                  onSelect={this.handleCustomerChange}
                  onFocus={() => this.handleFocusCustomer(false)}
                  onBlur={() => this.handleFocusCustomer(true)}
                  hide={this.state.hideSearchCustomer}
                  companyId={getCurrentUser().companyId}
                  value={this.state.searchCustomerText}
                />
              </div>
              {this.state.searchParams.customerId > 0 && (
                <div
                  style={{
                    marginTop: "28px",
                  }}
                >
                  <span
                    className="fa fa-trash text-danger"
                    style={{
                      fontSize: "24px",
                      position: "absolute",
                      marginLeft: "-39px",
                      cursor: "pointer",
                    }}
                    title="Limpiar filtro de cliente"
                    onClick={this.handleClearCustomerSelection}
                  ></span>
                </div>
              )}
            </div>

            {this.state.loading && (
              <div className="d-flex justify-content-center">
                <Loading />
              </div>
            )}

            {!this.state.loading && points.length > 0 && (
              <div className="row">
                <PointsTable
                  points={points}
                  user={user}
                  sortColumn={sortColumn}
                  onDelete={this.handleDelete}
                  onSort={this.handleSort}
                  sumPoints={sumPoints}
                  sumAmount={sumAmount}
                />
              </div>
            )}
            {!points.length && (
              <div className="text-center mt-5 mb-5">
                <h5>
                  No existen registros con el criterio de búsqueda especificado
                </h5>
              </div>
            )}

            {!this.state.loading && points.length > 0 && (
              <div className="row">
                <div>
                  <Pagination
                    activePage={currentPage}
                    itemsCountPerPage={pageSize}
                    totalItemsCount={totalPoints}
                    pageRangeDisplayed={5}
                    onChange={this.handlePageChange.bind(this)}
                    itemClass="page-item"
                    linkClass="page-link"
                  />
                </div>
                <p className="text-muted ml-3 mt-2">
                  <em>
                    Mostrando {total} registros de {totalPoints}
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

export default Points;