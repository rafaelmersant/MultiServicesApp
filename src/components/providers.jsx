import React, { Component } from "react";
import { toast } from "react-toastify";
import _ from "lodash";
import Pagination from "./common/pagination";
import SearchBox from "./common/searchBox";
import NewButton from "./common/newButton";
import { paginate } from "../utils/paginate";
import { getProviders, deleteProvider } from "../services/providerService";
// import { getCustomerInInvoice } from "../services/invoiceServices";
import { getCurrentUser } from "../services/authService";
import ProvidersTable from "./tables/providersTable";

class Providers extends Component {
  state = {
    providers: [],
    currentPage: 1,
    pageSize: 10,
    searchQuery: "",
    sortColumn: { path: "creationDate", order: "desc" }
  };

  async componentDidMount() {
    const companyId = getCurrentUser().companyId;
    const { data: providers } = await getProviders(companyId);

    this.setState({ providers });
  }

  handleDelete = async provider => {
    // const { data: found } = await getCustomerInInvoice(
    //   getCurrentUser().companyId,
    //   customer.id
    // );
    // if (found.length) {
    //   toast.error("No puede eliminar un cliente que tiene factura creada.");
    //   return false;
    // }

    const answer = window.confirm(
      "Esta seguro de eliminar este proveedor? \nNo podrá deshacer esta acción"
    );
    if (answer) {
      const originalProviders = this.state.providers;
      const providers = this.state.providers.filter(m => m.id !== provider.id);
      this.setState({ providers });

      try {
        await deleteProvider(provider.id);
      } catch (ex) {
        if (ex.response && ex.response.status === 404)
          toast.error("Este proveedor ya fue eliminado");

        this.setState({ providers: originalProviders });
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
      providers: allProviders
    } = this.state;

    let filtered = allProviders;
    if (searchQuery)
      filtered = allProviders.filter(m =>
        `${m.firstName.toLowerCase()} ${m.lastName.toLowerCase()}`.startsWith(
          searchQuery.toLocaleLowerCase()
        )
      );

    const sorted = _.orderBy(filtered, [sortColumn.path], [sortColumn.order]);

    const providers = paginate(sorted, currentPage, pageSize);

    return { totalCount: filtered.length, providers };
  };

  render() {
    const { pageSize, currentPage, sortColumn, searchQuery } = this.state;
    const { user } = this.props;

    const { totalCount, providers } = this.getPagedData();

    return (
      <div className="container">
        <div className="row">
          <div className="col margin-top-msg">
            <NewButton label="Nuevo Proveedor" to="/provider/new" />

            <SearchBox
              value={searchQuery}
              onChange={this.handleSearch}
              placeholder="Buscar..."
            />
            <ProvidersTable
              providers={providers}
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
                <em>Mostrando {totalCount} proveedores</em>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Providers;