import React, { Component } from "react";
import { toast } from "react-toastify";
import _ from "lodash";
import Pagination from "./common/pagination";
import SearchBox from "./common/searchBox";
import NewButton from "./common/newButton";
import { paginate } from "../utils/paginate";
import { getCustomers, deleteCustomer } from "../services/customerService";
import { getCustomerInInvoice } from "../services/invoiceServices";
import { getCurrentUser } from "../services/authService";
import CustomersTable from "./tables/customersTable";

class Customers extends Component {
  state = {
    customers: [],
    currentPage: 1,
    pageSize: 10,
    searchQuery: "",
    sortColumn: { path: "creationDate", order: "desc" }
  };

  async componentDidMount() {
    const companyId = getCurrentUser().companyId;
    const { data: customers } = await getCustomers(companyId);

    this.setState({ customers });
  }

  handleDelete = async customer => {
    const { data: found } = await getCustomerInInvoice(
      getCurrentUser().companyId,
      customer.id
    );
    if (found.length) {
      toast.error("No puede eliminar un cliente que tiene factura creada.");
      return false;
    }

    const answer = window.confirm(
      "Esta seguro de eliminar este cliente? \nNo podrá deshacer esta acción"
    );
    if (answer) {
      const originalCustomers = this.state.customers;
      const customers = this.state.customers.filter(m => m.id !== customer.id);
      this.setState({ customers });

      try {
        await deleteCustomer(customer.id);
      } catch (ex) {
        if (ex.response && ex.response.status === 404)
          toast.error("Este cliente ya fue eliminado");

        this.setState({ customers: originalCustomers });
      }
    }
  };

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
      customers: allCustomers
    } = this.state;

    let filtered = allCustomers;
    if (searchQuery)
      filtered = allCustomers.filter(m =>
        `${m.firstName.toLowerCase()} ${m.lastName.toLowerCase()}`.startsWith(
          searchQuery.toLocaleLowerCase()
        )
      );

    const sorted = _.orderBy(filtered, [sortColumn.path], [sortColumn.order]);

    const customers = paginate(sorted, currentPage, pageSize);

    return { totalCount: filtered.length, customers };
  };

  render() {
    const { pageSize, currentPage, sortColumn, searchQuery } = this.state;
    const { user } = this.props;

    const { totalCount, customers } = this.getPagedData();

    return (
      <div className="container">
        <div className="row">
          <div className="col margin-top-msg">
            <NewButton label="Nuevo Cliente" to="/customer/new" />

            <SearchBox
              value={searchQuery}
              onChange={this.handleSearch}
              placeholder="Buscar..."
            />
            <CustomersTable
              customers={customers}
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
                <em>Mostrando {totalCount} clientes</em>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Customers;
