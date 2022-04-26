import React, { Component } from "react";
import { toast } from "react-toastify";
import Pagination from "react-js-pagination";
import NewButton from "./common/newButton";
import Loading from "./common/loading";
import { getCurrentUser } from "../services/authService";
import { deleteQuotationHeader, getQuotationHeader, getQuotationsHeader } from "../services/quotationServices";
import SearchInvoiceBlock from "./common/searchInvoiceBlock";
import QuotationsTable from './tables/quotationsTable'

class Quotations extends Component {
  state = {
    loading: true,
    quotations: [],
    currentPage: 1,
    pageSize: 10,
    sortColumn: { path: "creationDate", order: "desc" },
    searchParams: {
      customerId: 0,
      headerId: 0,
    },
  };

  async componentDidMount() {
    await this.populateQuotations();
  }

  async populateQuotations(_sortColumn, _currentPage) {
    const companyId = getCurrentUser().companyId;
    const { customerId, headerId } = {
      ...this.state.searchParams,
    };
    const { currentPage, sortColumn } = { ...this.state };

    _sortColumn = _sortColumn ? _sortColumn : sortColumn;
    _currentPage = _currentPage ? _currentPage : currentPage;

    const { data: quotations } = await getQuotationsHeader(
      companyId,
      customerId,
      headerId,
      _currentPage,
      _sortColumn
    );

    console.log('quotations', quotations)

    this.setState({
      quotations: quotations.results,
      totalQuotations: quotations.count,
      loading: false,
    });
  }

  handlePageChange = async (page) => {
    this.setState({ currentPage: page });
    sessionStorage["currentPage"] = parseInt(page);

    await this.populateQuotations(null, page);
  };

  handleSort = async (sortColumn) => {
    this.setState({ sortColumn });

    await this.populateQuotations(sortColumn);
  };

  handleQuotationChange = async (headerId) => {
    const handler = (e) => {
      e.preventDefault();
    };
    handler(window.event);

    const { searchParams } = { ...this.state };
    searchParams.headerId = headerId;

    this.setState({ searchParams });
    this.populateQuotations();
  };

  handleCustomerChange = async (customer) => {
    const handler = (e) => {
      e.preventDefault();
    };
    handler(window.event);

    const { searchParams } = { ...this.state };
    searchParams.customerId = customer.id;
    searchParams.headerId = "";

    this.setState({ searchParams });
    this.populateQuotations();
  };

  handleDelete = async (quotation) => {
    const answer = window.confirm(
      `Seguro que desea eliminar la cotización #${quotation.id}`
    );

    if (answer) {
      try {
        const quotations = this.state.quotations.filter(
          (item) => item.id !== quotation.id
        );
        this.setState({ quotations });

        var deleted = await deleteQuotationHeader(quotation.id);
      } catch (ex) {
        if (ex.response && ex.response.status === 404)
          toast.error("Esta cotización ya fue eliminada");
      }

      if (deleted && deleted.status === 200)
        toast.success(
          `La cotización #${quotation.id} fue eliminada con exito!`
        );
    }
  };

  render() {
    const { quotations, sortColumn, totalQuotations, pageSize, currentPage } =
      this.state;
    const user = getCurrentUser();
    const total = quotations ? quotations.length : 0;

    return (
      <div className="container-fluid">
        <div className="row">
          <div className="col">
            <NewButton label="Nueva Cotización" to="/quotation/new" />
          </div>
        </div>

        <div className="row">
          <div className="col">
            <div className="row">
              <div>
                <h5 className="text-info">Listado de Cotizaciones</h5>
              </div>
            </div>
            <SearchInvoiceBlock
              onInvoiceChange={this.handleQuotationChange}
              onCustomerChange={this.handleCustomerChange}
              paymentMethodOff={true}
              source="quotations"
            />

            {this.state.loading && (
              <div className="d-flex justify-content-center">
                <Loading />
              </div>
            )}

            {!this.state.loading && (
              <div className="row">
                <QuotationsTable
                  quotations={quotations}
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
                    totalItemsCount={totalQuotations}
                    pageRangeDisplayed={5}
                    onChange={this.handlePageChange.bind(this)}
                    itemClass="page-item"
                    linkClass="page-link"
                  />
                </div>
                <p className="text-muted ml-3 mt-2">
                  <em>
                    Mostrando {total} cotizaciones de {totalQuotations}
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

export default Quotations;
