import React, { Component } from "react";
import _ from "lodash";
import Pagination from "react-js-pagination";
import SearchBox from "./common/searchBox";
import NewButton from "./common/newButton";
import Loading from "./common/loading";
import ProductTrackingTable from "./tables/productTrackingTable";
import { getProductsTrackings } from "../services/inventoryService";
import { getCurrentUser } from "../services/authService";

class Inventories extends Component {
  state = {
    loading: true,
    prodTrackings: [],
    currentPage: 1,
    pageSize: 20,
    searchQuery: "",
    totalEntries: 0,
    productSelected: 0,
    invoiceRecords: false,
    sortColumn: { path: "creationDate", order: "desc" }
  };

  async componentDidMount() {
    const currentPage = parseFloat(sessionStorage["currentPage"] ?? 0);
    if (currentPage > 1) this.setState({ currentPage: currentPage });

    await this.getInventoryRecords(0, currentPage, this.state.invoiceRecords);
  }

  async getInventoryRecords(productId, page, invoiceRecords) {
    const product = productId === 0 ? "" : productId;
    const companyId = getCurrentUser().companyId;
    const { data: prodTrackings } = await getProductsTrackings(
      companyId,
      product,
      page,
      invoiceRecords
    );
    this.setState({
      prodTrackings: prodTrackings.results,
      totalEntries: prodTrackings.count,
      loading: false
    });
  }

  fetchData = async page => {
    if (this.state.productSelected)
      await this.getInventoryRecords(
        this.state.productSelected,
        parseInt(page),
        this.state.invoiceRecords
      );
    else await this.getInventoryRecords(0, page, this.state.invoiceRecords);
  };

  handlePageChange = page => {
    this.setState({ currentPage: page });
    sessionStorage["currentPage"] = parseInt(page);

    this.fetchData(page);
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
      this.fetchData(this.state.page);
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

    // let filtered = allProdTrackings;
    // if (searchQuery)
    //   filtered = allProdTrackings.filter(m =>
    //     `${m.product.description.toLowerCase()}`.startsWith(
    //       searchQuery.toLocaleLowerCase()
    //     )
    //   );

    // const sorted = _.orderBy(filtered, [sortColumn.path], [sortColumn.order]);

    // const prodTrackings = paginate(sorted, currentPage, pageSize);

    return {
      totalCount: this.state.prodTrackings.length,
      prodTrackings: allProdTrackings
    };
  };

  render() {
    const {
      pageSize,
      currentPage,
      sortColumn,
      searchQuery,
      totalEntries
    } = this.state;
    const { user } = this.props;

    const { totalCount, prodTrackings } = this.getPagedData();

    return (
      <div className="container">
        <div className="row">
          <div className="col margin-top-msg">
            <h5 className="text-info mt-2">Movimientos de Inventario</h5>

            <NewButton label="Ajuste de Inventario" to="/inventory/new" />

            {!this.state.loading && (
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
            )}

            {this.state.loading && (
              <div className="d-flex justify-content-center mb-3">
                <Loading />
              </div>
            )}
            {!this.state.loading && (
              <ProductTrackingTable
                prodTrackings={prodTrackings}
                user={user}
                sortColumn={sortColumn}
                onDelete={this.handleDelete}
                onSort={this.handleSort}
              />
            )}

            {!this.state.loading && (
              <div className="row">
                <div>
                  <Pagination
                    activePage={currentPage}
                    itemsCountPerPage={pageSize}
                    totalItemsCount={totalEntries}
                    pageRangeDisplayed={5}
                    onChange={this.handlePageChange.bind(this)}
                    itemClass="page-item"
                    linkClass="page-link"
                  />
                </div>
                {/* <Pagination
                  itemsCount={totalCount}
                  pageSize={pageSize}
                  currentPage={currentPage}
                  onPageChange={this.handlePageChange}
                /> */}
                <p className="text-muted ml-3 mt-2">
                  <em>
                    Mostrando {totalCount} registros de {totalEntries}
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

export default Inventories;
