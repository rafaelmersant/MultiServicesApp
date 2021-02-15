import React, { Component } from "react";
import { toast } from "react-toastify";
import Pagination from "react-js-pagination";
import NewButton from "./common/newButton";
import Loading from "./common/loading";
import SearchInvoiceBlock from "./common/searchInvoiceBlock";
import InvoicesTable from "./tables/invoicesTable";
import { getCurrentUser } from "../services/authService";
import {
  getInvoicesHeader,
  deleteInvoiceHeader,
  getInvoiceDetail,
} from "../services/invoiceServices";

import {
  saveProductTracking,
  updateProductStock,
} from "../services/inventoryService";

class Invoices extends Component {
  state = {
    loading: true,
    invoices: [],
    currentPage: 1,
    pageSize: 10,
    sortColumn: { path: "creationDate", order: "desc" },
    searchParams: {
      paymentMethod: "ALL",
      customerId: 0,
      invoiceNo: 0,
    },
  };

  async componentDidMount() {
    await this.populateInvoices();
  }

  async populateInvoices(_sortColumn, _currentPage) {
    const companyId = getCurrentUser().companyId;
    const { invoiceNo, customerId, paymentMethod } = {
      ...this.state.searchParams,
    };
    const { currentPage, sortColumn } = { ...this.state };

    _sortColumn = _sortColumn ? _sortColumn : sortColumn;
    _currentPage = _currentPage ? _currentPage : currentPage;

    const { data: invoices } = await getInvoicesHeader(
      companyId,
      invoiceNo,
      customerId,
      paymentMethod,
      _currentPage,
      _sortColumn
    );

    this.setState({
      invoices: invoices.results,
      totalInvoices: invoices.count,
      loading: false,
    });
  }

  async updateInventory(productId, quantity) {
    const inventory = {
      header_id: 1,
      id: 0,
      product_id: productId,
      typeTracking: "E",
      concept: "INVO",
      quantity: quantity,
      company_id: getCurrentUser().companyId,
      createdUser: getCurrentUser().email,
      creationDate: new Date().toISOString(),
    };
    console.log("inventory", inventory);
    await saveProductTracking(inventory);
    await updateProductStock(inventory);
  }

  handlePageChange = async (page) => {
    this.setState({ currentPage: page });
    sessionStorage["currentPage"] = parseInt(page);

    await this.populateInvoices(null, page);
  };

  handleSort = async (sortColumn) => {
    this.setState({ sortColumn });

    await this.populateInvoices(sortColumn);
  };

  handleDelete = async (invoice) => {
    if (invoice.paid) {
      toast.error("No puede eliminar una factura pagada.");
      return false;
    }

    const answer = window.confirm(
      `Seguro que desea eliminar la factura #${invoice.sequence}`
    );

    if (answer) {
      try {
        const invoices = this.state.invoices.filter(
          (item) => item.id !== invoice.id
        );
        this.setState({ invoices });

        const { data: details } = await getInvoiceDetail(invoice.id);

        details.forEach(async (item) => {
          await this.updateInventory(item.product.id, item.quantity);
          //await deleteInvoiceDetail(item.id); //deleted by default with the header
        });

        var deleted = await deleteInvoiceHeader(invoice.id);
      } catch (ex) {
        if (ex.response && ex.response.status === 404)
          toast.error("Este factura ya fue eliminada");
      }

      if (deleted && deleted.status === 200)
        toast.success(
          `La factura #${invoice.sequence} fue eliminada con exito!`
        );
    }
  };

  handleInvoiceChange = async (invoiceNo) => {
    const handler = (e) => {
      e.preventDefault();
    };
    handler(window.event);

    const { searchParams } = { ...this.state };
    searchParams.invoiceNo = invoiceNo;

    this.setState({ searchParams });
    this.populateInvoices();
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
    this.populateInvoices();
  };

  handlePaymentMethodChange = async (paymentMethod) => {
    const handler = (e) => {
      e.preventDefault();
    };
    handler(window.event);

    const { searchParams } = { ...this.state };
    searchParams.paymentMethod = paymentMethod;
    searchParams.invoiceNo = "";

    this.setState({ searchParams });
    this.populateInvoices();
  };

  render() {
    const {
      invoices,
      sortColumn,
      totalInvoices,
      pageSize,
      currentPage,
    } = this.state;
    const user = getCurrentUser();
    const total = invoices ? invoices.length : 0;

    return (
      <div className="container">
        <div className="row">
          <div className="col">
            <NewButton label="Nueva Factura" to="/invoice/new" />
          </div>
        </div>

        <div className="row">
          <div className="col">
            <div className="row">
              <div>
                <h5 className="text-info">Búsqueda</h5>
              </div>
            </div>

            <SearchInvoiceBlock
              onInvoiceChange={this.handleInvoiceChange}
              onCustomerChange={this.handleCustomerChange}
              onPaymentMethodChange={this.handlePaymentMethodChange}
            />

            {this.state.loading && (
              <div className="d-flex justify-content-center">
                <Loading />
              </div>
            )}

            {!this.state.loading && (
              <div className="row">
                <InvoicesTable
                  invoices={invoices}
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
                    totalItemsCount={totalInvoices}
                    pageRangeDisplayed={5}
                    onChange={this.handlePageChange.bind(this)}
                    itemClass="page-item"
                    linkClass="page-link"
                  />
                </div>
                <p className="text-muted ml-3 mt-2">
                  <em>
                    Mostrando {total} facturas de {totalInvoices}
                  </em>
                </p>
              </div>
            )}

            {/* {!this.state.loading && (
              <div className="row">
                <Pagination
                  itemsCount={totalInvoices}
                  pageSize={pageSize}
                  currentPage={currentPage}
                  onPageChange={this.handlePageChange}
                />
                <p className="text-muted ml-3 mt-2">
                  Mostrando {invoices.length} facturas de {totalInvoices}
                </p>
              </div>
            )} */}
          </div>
        </div>
      </div>
    );
  }
}

export default Invoices;
