import React, { Component } from "react";
import _ from "lodash";
import Pagination from "./common/pagination";
import SearchBox from "./common/searchBox";
import { paginate } from "../utils/paginate";
import ProductStockTable from "./tables/productStockTable";
import { getProductsStocksByCompany } from "../services/inventoryService";
import { getCurrentUser } from "../services/authService";
import ExportStockToExcel from "./reports/exportStockToExcel";
import Loading from "./common/loading";

class ProductsStock extends Component {
  state = {
    loading: true,
    products: [],
    currentPage: 1,
    pageSize: 8000,
    searchQuery: "",
    sortColumn: { path: "creationDate", order: "desc" }
  };

  async componentDidMount() {
    this.getProducts();
  }

  async getProducts() {
    const companyId = getCurrentUser().companyId;
    const { data: products } = await getProductsStocksByCompany(companyId);

    this.setState({ products, loading: false });
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

  mapToExcelView = data => {
    let result = [];

    data.forEach(item => {
      result.push({
        product: item.product.description,
        quantity: item.quantityAvailable,
        cost: item.product.cost,
        price: item.product.price,
        costTotal: item.product.cost * item.quantityAvailable,
        priceTotal: item.product.price * item.quantityAvailable
      });
    });

    return result;
  };

  getPagedData = () => {
    const {
      pageSize,
      currentPage,
      sortColumn,
      searchQuery,
      products: allProducts
    } = this.state;

    let filtered = allProducts;
    if (searchQuery)
      filtered = allProducts.filter(m =>
        `${m.product.description.toLowerCase()}`.startsWith(
          searchQuery.toLocaleLowerCase()
        )
      );

    const sorted = _.orderBy(filtered, [sortColumn.path], [sortColumn.order]);

    const products = paginate(sorted, currentPage, pageSize);

    return { totalCount: filtered.length, products };
  };

  render() {
    const { pageSize, currentPage, sortColumn, searchQuery } = this.state;
    const { user } = this.props;

    const { totalCount, products } = this.getPagedData();

    return (
      <div className="container">
        <div className="row">
          <div className="col margin-top-msg">
            <h2 className="pull-right text-info">Reporte de Inventario</h2>

            <ExportStockToExcel
              data={this.mapToExcelView(products)}
              sheetName="Inventario"
            />

            <SearchBox
              value={searchQuery}
              onChange={this.handleSearch}
              placeholder="Buscar producto..."
            />

            {this.state.loading && (
              <div>
                <p className="text-center">
                  Cargando todos los productos del sistema...
                </p>
                <div className="d-flex justify-content-center mb-3">
                  <Loading />
                </div>
              </div>
            )}

            {!this.state.loading && (
              <ProductStockTable
                products={products}
                user={user}
                sortColumn={sortColumn}
                onDelete={this.handleDelete}
                onSort={this.handleSort}
              />
            )}

            {!this.state.loading && (
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
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default ProductsStock;
