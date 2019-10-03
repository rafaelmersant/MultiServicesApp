import React, { Component } from "react";
import _ from "lodash";
import Pagination from "./common/pagination";
import SearchBox from "./common/searchBox";
import NewButton from "./common/newButton";
import { paginate } from "../utils/paginate";
import ProductTrackingTable from "./productTrackingTable";
import { getProductsTrackings } from "../services/inventoryService";
import { getCurrentUser } from "../services/authService";

class Inventories extends Component {
  state = {
    prodTrackings: [],
    currentPage: 1,
    pageSize: 10,
    searchQuery: "",
    sortColumn: { path: "creationDate", order: "desc" }
  };

  async componentDidMount() {
    const companyId = getCurrentUser().companyId;
    const { data: prodTrackings } = await getProductsTrackings(companyId);
    this.setState({ prodTrackings });
  }

  // handleDelete = async customer => {
  //   const answer = window.confirm(
  //     "Esta seguro de eliminar esta linea? \nNo podrá deshacer esta acción"
  //   );
  //   if (answer) {
  //     const originalCustomers = this.state.customers;
  //     const customers = this.state.customers.filter(m => m.id !== customer.id);
  //     this.setState({ customers });

  //     try {
  //       await deleteCustomer(customer.id);
  //     } catch (ex) {
  //       if (ex.response && ex.response.status === 404)
  //         toast.error("Este cliente ya fue eliminado");

  //       this.setState({ customers: originalCustomers });
  //     }
  //   }
  // };

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
      prodTrackings: allProdTrackings
    } = this.state;

    let filtered = allProdTrackings;
    if (searchQuery)
      filtered = allProdTrackings.filter(m =>
        `${m.product.name.toLowerCase()}`.startsWith(
          searchQuery.toLocaleLowerCase()
        )
      );

    const sorted = _.orderBy(filtered, [sortColumn.path], [sortColumn.order]);

    const prodTrackings = paginate(sorted, currentPage, pageSize);

    return { totalCount: filtered.length, prodTrackings };
  };

  render() {
    const { pageSize, currentPage, sortColumn, searchQuery } = this.state;
    const { user } = this.props;

    const { totalCount, prodTrackings } = this.getPagedData();

    return (
      <div className="container">
        <div className="row">
          <div className="col margin-top-msg">
            <NewButton label="Nuevo Registro" to="/inventory/new" />

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
            <ProductTrackingTable
              prodTrackings={prodTrackings}
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
                <em>Mostrando {totalCount} registros</em>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Inventories;
