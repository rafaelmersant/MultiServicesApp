import React, { Component } from "react";
import { NavLink } from "react-router-dom";
import { toast } from "react-toastify";
import _ from "lodash";
import Pagination from "./common/pagination";
import SearchBox from "./common/searchBox";
import { paginate } from "../utils/paginate";
import { getCustomers, deleteCustomer } from "../services/customerService";
import CustomersTable from "./customersTable";

class Customers extends Component {
  state = {
    customers: [],
    currentPage: 1,
    pageSize: 4,
    searchQuery: "",
    sortColumn: { path: "name", order: "asc" }
  };

  async componentDidMount() {
    const { data: customers } = await getCustomers();

    this.setState({ customers });
  }

  handleDelete = async customer => {
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
            <NavLink
              className="btn btn-primary mb-3 pull-right"
              to="/customer/new"
            >
              Nuevo Cliente
            </NavLink>

            {/* {user && (
              <NavLink className="btn btn-primary mb-3" to="/users/new">
                Nuevo Usuario
              </NavLink>
            )} */}

            <SearchBox
              value={searchQuery}
              onChange={this.handleSearch}
              placeholder="Buscar..."
            />
            <CustomersTable
              customers={customers}
              user={user}
              sortColumn={sortColumn}
              onLike={this.handleLike}
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
