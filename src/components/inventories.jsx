import React, { Component } from "react";
import _ from "lodash";
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
    pageSize: 20,
    totalEntries: 0,
    productSelected: 0,
    searchProductText: "",
    hideSearchProduct: true,
    invoiceRecords: false,
    sortColumn: { path: "creationDate", order: "desc" }
  };

  async componentDidMount() {
    const currentPage = parseFloat(sessionStorage["currentPage"] ?? 0);
    if (currentPage > 1) this.setState({ currentPage: currentPage });

    await this.getInventoryRecords(0, currentPage, this.state.invoiceRecords);
  }

  componentWillMount() {
    sessionStorage["currentPage"] = 1;
  }

  getInventoryRecords = async (productId, page, invoiceRecords) => {
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
      loading: false,
      productSelected: productId,
      searchProductText: productId === 0 ? "" : this.state.searchProductText
    });

    if (productId === 0) this.handleFocusProduct(true);
  };

  fetchData = async page => {
    if (this.state.productSelected)
      await this.getInventoryRecords(
        this.state.productSelected,
        page,
        this.state.invoiceRecords
      );
    else await this.getInventoryRecords(0, page, this.state.invoiceRecords);
  };

  handlePageChange = page => {
    this.setState({ currentPage: page });
    sessionStorage["currentPage"] = parseInt(page);

    this.fetchData(page);
  };

  handleSort = sortColumn => {
    this.setState({ sortColumn });
  };

  handleOnChangeInvoiceRecords = event => {
    this.setState({ invoiceRecords: !this.state.invoiceRecords });
    this.handlePageChange(1);

    setTimeout(() => {
      this.fetchData(1);
    }, 100);
  };

  handleSelectProduct = async product => {
    const handler = e => {
      e.preventDefault();
    };
    handler(window.event);

    if (product.id === 0) {
      toast.error("Lo sentimos, no puede crear un nuevo producto desde aqui.");
      return false;
    }

    this.setState({
      productSelected: product.id,
      searchProductText: product.description,
      hideSearchProduct: true
    });

    this.getInventoryRecords(product.id, 1, this.state.invoiceRecords);
  };

  handleFocusProduct = value => {
    setTimeout(() => {
      this.setState({ hideSearchProduct: value });
    }, 200);
  };

  getPagedData = () => {
    const { prodTrackings: allProdTrackings, sortColumn } = this.state;

    const sorted = _.orderBy(
      allProdTrackings,
      [sortColumn.path],
      [sortColumn.order]
    );

    return {
      totalCount: this.state.prodTrackings.length,
      prodTrackings: sorted
    };
  };

  render() {
    const { pageSize, currentPage, sortColumn, totalEntries } = this.state;
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
                  <div className="col-1">
                    <a
                      title="Limpiar filtro de producto"
                      onClick={() =>
                        this.getInventoryRecords(
                          0,
                          1,
                          this.state.invoiceRecords
                        )
                      }
                      className="fa fa-ban"
                      style={{
                        color: "green",
                        fontSize: "2.2em",
                        marginTop: "24px",
                        marginLeft: "-10px",
                        cursor: "pointer"
                      }}
                    ></a>
                  </div>
                )}

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
