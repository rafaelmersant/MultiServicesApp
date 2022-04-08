import React, { Component } from "react";
import { toast } from "react-toastify";
import Pagination from "react-js-pagination";
import SearchBox from "./common/searchBox";
import NewButton from "./common/newButton";
import Loading from "./common/loading";
import { getCustomers, deleteCustomer } from "../services/customerService";
import { getCustomerInInvoice } from "../services/invoiceServices";
import { getCurrentUser } from "../services/authService";
import CustomersTable from "./tables/customersTable";

class Customers extends Component {
  state = {
    loading: true,
    customers: [],
    currentPage: 1,
    pageSize: 15,
    searchQuery: "",
    totalCustomers: 0,
    sortColumn: { path: "creationDate", order: "desc" },
  };

  async componentDidMount() {
    this.populateCustomers();
  }

  async populateCustomers(_sortColumn, _currentPage, _searchQuery = "") {
    const companyId = getCurrentUser().companyId;
    const { currentPage, sortColumn, searchQuery } = { ...this.state };

    _sortColumn = _sortColumn ? _sortColumn : sortColumn;
    _currentPage = _currentPage ? _currentPage : currentPage;
    _searchQuery = _searchQuery ? _searchQuery : searchQuery;

    const { data: customers } = await getCustomers(
      companyId,
      _sortColumn,
      _currentPage,
      _searchQuery
    );

    this.setState({
      customers: customers.results,
      totalCustomers: customers.count,
      loading: false,
      sortColumn: _sortColumn,
      currentPage: _currentPage,
    });
  }

  handleDelete = async (customer) => {
    const { data: found } = await getCustomerInInvoice(
      getCurrentUser().companyId,
      customer.id
    );

    if (found.count) {
      toast.error("No puede eliminar un cliente que tiene factura creada.");
      return false;
    }

    const answer = window.confirm(
      "Esta seguro de eliminar este cliente? \nNo podrá deshacer esta acción"
    );
    if (answer) {
      const originalCustomers = this.state.customers;
      const customers = this.state.customers.filter(
        (m) => m.id !== customer.id
      );
      this.setState({ customers });

      try {
        await deleteCustomer(customer.id);
        toast.success(`El Cliente ${customer.firstName} ${customer.lastName} fue eliminado!`);
      } catch (ex) {
        if (ex.response && ex.response.status === 404)
          toast.error("Este cliente ya fue eliminado");

        this.setState({ customers: originalCustomers });
      }
    }
  };

  handlePageChange = async (page) => {
    this.setState({ currentPage: page });

    await this.populateCustomers(null, page);
  };

  handleSearch = async (query) => {
    this.setState({ searchQuery: query, currentPage: 1 });
    await this.populateCustomers(null, null, query);
  };

  handleSort = async (sortColumn) => {
    this.setState({ sortColumn });

    await this.populateCustomers(sortColumn);
  };

  render() {
    const { pageSize, currentPage, sortColumn, searchQuery } = this.state;
    const { user } = this.props;

    const { totalCustomers, customers } = { ...this.state };
    const total = customers ? customers.length : 0;

    return (
      <div className="container-fluid">
        <div className="row">
          <div className="col">
            <h5 className="pull-left text-info mt-2">Listado de Clientes</h5>
            <NewButton label="Nuevo Cliente" to="/customer/new" />

            <SearchBox
              value={searchQuery}
              onChange={this.handleSearch}
              placeholder="Buscar..."
            />

            {this.state.loading && (
              <div className="d-flex justify-content-center mb-3">
                <Loading />
              </div>
            )}

            {!this.state.loading && (
              <CustomersTable
                customers={customers}
                user={user}
                sortColumn={sortColumn}
                onDelete={this.handleDelete}
                onSort={this.handleSort}
              />
            )}

            {!this.state.loading && customers.length > 0 && (
              <div className="row">
                <div>
                  <Pagination
                    activePage={currentPage}
                    itemsCountPerPage={pageSize}
                    totalItemsCount={totalCustomers}
                    pageRangeDisplayed={5}
                    onChange={this.handlePageChange.bind(this)}
                    itemClass="page-item"
                    linkClass="page-link"
                  />
                </div>
                <p className="text-muted ml-3 mt-2">
                  <em>
                    Mostrando {total} clientes de {totalCustomers}
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

export default Customers;
