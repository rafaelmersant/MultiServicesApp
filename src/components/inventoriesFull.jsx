import React, { Component } from "react";
import Pagination from "react-js-pagination";
import SearchBox from "./common/searchBox";
import NewButton from "./common/newButton";
import Loading from "./common/loading";
import ProductTrackingHeaderTable from "./tables/productTrackingHeaderTable";
import { getProductsTrackingsHeader } from "../services/inventoryService";
import { getCurrentUser } from "../services/authService";

class InventoriesFull extends Component {
  state = {
    loading: true,
    prodTrackingsHeader: [],
    currentPage: 1,
    pageSize: 10,
    totalEntries: 0,
    searchQuery: "",
    sortColumn: { path: "creationDate", order: "desc" },
  };

  async componentDidMount() {
    this.getInventoryRecords(
      this.currentPage,
      this.state.sortColumn,
      this.state.searchQuery
    );
  }

  async getInventoryRecords(currentPage, sortColumn, query) {
    const companyId = getCurrentUser().companyId;
    const { data: entries } = await getProductsTrackingsHeader(
      companyId,
      currentPage,
      sortColumn,
      query
    );

    this.setState({
      prodTrackingsHeader: entries.results,
      totalEntries: entries.count,
      loading: false,
    });
  }

  handlePageChange = async (page) => {
    this.setState({ currentPage: page });

    await this.getInventoryRecords(
      page,
      this.state.sortColumn,
      this.state.searchQuery
    );
  };

  handleSearch = async (query) => {
    this.setState({ searchQuery: query, currentPage: 1 });

    await this.getInventoryRecords(
      this.state.page,
      this.state.sortColumn,
      query
    );
  };

  handleSort = async (sortColumn) => {
    this.setState({ sortColumn });

    await this.getInventoryRecords(
      this.state.currentPage,
      sortColumn,
      this.state.searchQuery
    );
  };

  render() {
    const {
      prodTrackingsHeader,
      sortColumn,
      totalEntries,
      pageSize,
      currentPage,
      searchQuery,
    } = this.state;
    const user = getCurrentUser();
    const total = prodTrackingsHeader ? prodTrackingsHeader.length : 0;

    return (
      <div className="container-fluid">
        <div className="row">
          <div className="col">
            <h4 className="pull-left text-info list-header">
              Entradas de Inventario por Proveedor
            </h4>
            <NewButton label="Nueva Entrada" to="/inventoryFull/new" />

            <SearchBox
              value={searchQuery}
              onChange={this.handleSearch}
              placeholder="Buscar proveedor..."
            />

            {this.state.loading && (
              <div className="d-flex justify-content-center mb-3">
                <Loading />
              </div>
            )}

            {!this.state.loading && (
              <ProductTrackingHeaderTable
                prodTrackingsHeader={prodTrackingsHeader}
                user={user}
                sortColumn={sortColumn}
                onDelete={this.handleDelete}
                onSort={this.handleSort}
              />
            )}

            {!this.state.loading && (
              <div className="row">
                <Pagination
                  activePage={currentPage}
                  itemsCountPerPage={pageSize}
                  totalItemsCount={totalEntries}
                  pageRangeDisplayed={5}
                  onChange={this.handlePageChange.bind(this)}
                  itemClass="page-item"
                  linkClass="page-link"
                />
                <p className="text-muted ml-3 mt-2">
                  <em>
                    Mostrando {total} registros de {totalEntries}
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

export default InventoriesFull;
