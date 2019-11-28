import React, { Component } from "react";
import _ from "lodash";
import Pagination from "./common/pagination";
import SearchBox from "./common/searchBox";
import NewButton from "./common/newButton";
import { paginate } from "../utils/paginate";
import ProductTrackingTable from "./tables/productTrackingTable";
import { getProductsTrackings } from "../services/inventoryService";
import { getCurrentUser } from "../services/authService";

class Inventories extends Component {
  state = {
    prodTrackings: [],
    currentPage: 1,
    pageSize: 10,
    searchQuery: "",
    invoiceRecords: false,
    sortColumn: { path: "creationDate", order: "desc" }
  };

  async componentDidMount() {
    this.getInventoryRecords(this.state.invoiceRecords);
  }

  async getInventoryRecords(invoiceRecords) {
    const companyId = getCurrentUser().companyId;
    const { data: prodTrackings } = await getProductsTrackings(
      companyId,
      invoiceRecords
    );
    this.setState({ prodTrackings });
  }

  handlePageChange = page => {
    this.setState({ currentPage: page });
  };

  handleSearch = query => {
    this.setState({ searchQuery: query, currentPage: 1 });
  };

  handleSort = sortColumn => {
    this.setState({ sortColumn });
  };

  handleOnChangeInvoiceRecords = event => {
    this.setState({ invoiceRecords: !this.state.invoiceRecords });

    setTimeout(() => {
      this.getInventoryRecords(this.state.invoiceRecords);
    }, 100);
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
        `${m.product.description.toLowerCase()}`.startsWith(
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
            <NewButton label="Ajuste de Inventario" to="/inventory/new" />

            <div className="row">
              <div className="col">
                <SearchBox
                  value={searchQuery}
                  onChange={this.handleSearch}
                  placeholder="Buscar producto..."
                />
              </div>
              <div className="col mt-4">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="invoiceTracking"
                  value={this.state.invoiceRecords}
                  onChange={this.handleOnChangeInvoiceRecords}
                />
                <label className="form-check-label" htmlFor="invoiceTracking">
                  Mostrar Movimientos de Facturas
                </label>
              </div>
            </div>

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
