import React, { Component } from "react";
import _ from "lodash";
import Pagination from "./common/pagination";
import SearchBox from "./common/searchBox";
import NewButton from "./common/newButton";
import { paginate } from "../utils/paginate";
import ProductTrackingHeaderTable from "./tables/productTrackingHeaderTable";
import { getProductsTrackingsHeader } from "../services/inventoryService";
import { getCurrentUser } from "../services/authService";

class InventoriesFull extends Component {
  state = {
    prodTrackingsHeader: [],
    currentPage: 1,
    pageSize: 10,
    searchQuery: "",
    sortColumn: { path: "creationDate", order: "desc" }
  };

  async componentDidMount() {
    this.getInventoryRecords();
  }

  async getInventoryRecords() {
    const companyId = getCurrentUser().companyId;
    const { data: prodTrackingsHeader } = await getProductsTrackingsHeader(
      companyId
    );
    this.setState({ prodTrackingsHeader });
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

  getPagedData = () => {
    const {
      pageSize,
      currentPage,
      sortColumn,
      searchQuery,
      prodTrackingsHeader: allProdTrackingsHeader
    } = this.state;

    let filtered = allProdTrackingsHeader;
    if (searchQuery)
      filtered = allProdTrackingsHeader.filter(m =>
        `${m.provider.name.toLowerCase()}`.startsWith(
          searchQuery.toLocaleLowerCase()
        )
      );

    const sorted = _.orderBy(filtered, [sortColumn.path], [sortColumn.order]);

    const prodTrackingsHeader = paginate(sorted, currentPage, pageSize);

    return { totalCount: filtered.length, prodTrackingsHeader };
  };

  render() {
    const { pageSize, currentPage, sortColumn, searchQuery } = this.state;
    const { user } = this.props;

    const { totalCount, prodTrackingsHeader } = this.getPagedData();

    return (
      <div className="container">
        <div className="row">
          <div className="col margin-top-msg">
            <NewButton label="Nueva Entrada" to="/inventoryFull/new" />

            <SearchBox
              value={searchQuery}
              onChange={this.handleSearch}
              placeholder="Buscar proveedor..."
            />

            <ProductTrackingHeaderTable
              prodTrackingsHeader={prodTrackingsHeader}
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

export default InventoriesFull;
