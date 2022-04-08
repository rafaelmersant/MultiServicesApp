import React, { Component } from "react";
import Pagination from "react-js-pagination";
import SearchProduct from "./common/searchProduct";
import NewButton from "./common/newButton";
import Loading from "./common/loading";
import ProductTrackingTable from "./tables/productTrackingTable";
import { getProductsTrackings } from "../services/inventoryService";
import { getCurrentUser } from "../services/authService";
import { toast } from "react-toastify";

class Inventories extends Component {
  state = {
    loading: true,
    prodTrackings: [],
    currentPage: 1,
    pageSize: 50,
    totalEntries: 0,
    productSelected: 0,
    searchProductText: "",
    hideSearchProduct: true,
    invoiceRecords: false,
    sortColumn: { path: "creationDate", order: "desc" },
  };

  async componentDidMount() {
    const { productSelected: product, invoiceRecords, sortColumn } = {
      ...this.state,
    };

    await this.getInventoryRecords(
      product,
      this.state.currentPage,
      sortColumn,
      invoiceRecords
    );
  }

  getInventoryRecords = async (productId, page, sortColumn, invoiceRecords) => {
    const product = productId === 0 ? "" : productId;
    const companyId = getCurrentUser().companyId;

    const { data: prodTrackings } = await getProductsTrackings(
      companyId,
      product,
      page,
      sortColumn,
      invoiceRecords
    );

    this.setState({
      prodTrackings: prodTrackings.results,
      totalEntries: prodTrackings.count,
      loading: false,
      productSelected: productId,
      searchProductText: productId === 0 ? "" : this.state.searchProductText,
    });

    if (productId === 0) this.handleFocusProduct(true);
  };

  handlePageChange = async (page) => {
    this.setState({ currentPage: page });

    const { productSelected: product, sortColumn, invoiceRecords } = {
      ...this.state,
    };

    await this.getInventoryRecords(product, page, sortColumn, invoiceRecords);
  };

  handleSort = async (sortColumn) => {
    this.setState({ sortColumn });

    const { productSelected: product, currentPage: page, invoiceRecords } = {
      ...this.state,
    };

    await this.getInventoryRecords(product, page, sortColumn, invoiceRecords);
  };

  handleOnChangeInvoiceRecords = async () => {
    const invoiceRecords = !this.state.invoiceRecords;
    const { productSelected: product, sortColumn } = {
      ...this.state,
    };
    const currentPage = 1;

    setTimeout(async () => {
      await this.getInventoryRecords(
        product,
        currentPage,
        sortColumn,
        invoiceRecords
      );

      this.setState({ invoiceRecords });
    }, 100);
  };

  handleSelectProduct = async (product) => {
    const handler = (e) => {
      e.preventDefault();
    };
    handler(window.event);

    const { currentPage: page, sortColumn, invoiceRecords } = {
      ...this.state,
    };

    if (product.id === 0) {
      toast.error("Lo sentimos, no puede crear un nuevo producto desde aqui.");
      return false;
    }

    this.setState({
      productSelected: product.id,
      searchProductText: product.description,
      hideSearchProduct: true,
    });

    await this.getInventoryRecords(
      product.id,
      page,
      sortColumn,
      invoiceRecords
    );
  };

  handleFocusProduct = (value) => {
    setTimeout(() => {
      this.setState({ hideSearchProduct: value });
    }, 200);
  };

  handleCleanProduct = async () => {
    const productId = 0;
    const currentPage = 1;

    await this.getInventoryRecords(
      productId,
      currentPage,
      this.state.sortColumn,
      this.state.invoiceRecords
    );
  };

  render() {
    const {
      prodTrackings,
      sortColumn,
      totalEntries,
      pageSize,
      currentPage,
    } = this.state;
    const user = getCurrentUser();

    return (
      <div className="container-fluid">
        <div className="row">
          <div className="col">
            <h5 className="text-info mt-2">Movimientos de Inventario</h5>

            <NewButton label="Ajuste de Inventario" to="/inventory/new" />

            {!this.state.loading && (
              <div className="row">
                <div className="col-7">
                  <SearchProduct
                    onSelect={this.handleSelectProduct}
                    onFocus={() => this.handleFocusProduct(false)}
                    onBlur={() => this.handleFocusProduct(true)}
                    hide={this.state.hideSearchProduct}
                    companyId={getCurrentUser().companyId}
                    value={this.state.searchProductText}
                  />
                </div>
                {this.state.productSelected > 0 && (
                  <div
                    style={{
                      marginTop: "28px",
                    }}
                  >
                    <span
                      className="fa fa-trash text-danger"
                      style={{
                        fontSize: "24px",
                        position: "absolute",
                        marginLeft: "-39px",
                        cursor: "pointer",
                      }}
                      title="Limpiar filtro de producto"
                      onClick={this.handleCleanProduct}
                    ></span>
                  </div>
                )}

                <div className="ml-4 mt-4">
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

                <p className="text-muted ml-3 mt-2">
                  <em>
                    Mostrando {prodTrackings.length} registros de {totalEntries}
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
