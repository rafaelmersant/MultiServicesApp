import React, { Component } from "react";
import { toast } from "react-toastify";
import _ from "lodash";
import Pagination from "./common/pagination";
import SearchBox from "./common/searchBox";
import NewButton from "./common/newButton";
import { paginate } from "../utils/paginate";
import { getProducts, deleteProduct } from "../services/productService";
import { getCurrentUser } from "../services/authService";
import ProductsTable from "./productsTable";

class Products extends Component {
  state = {
    products: [],
    currentPage: 1,
    pageSize: 4,
    searchQuery: "",
    sortColumn: { path: "name", order: "asc" }
  };

  async componentDidMount() {
    const { data: products } = await getProducts(getCurrentUser().companyId);

    this.setState({ products });
  }

  handleDelete = async product => {
    const answer = window.confirm(
      "Esta seguro de eliminar este producto? \nNo podrá deshacer esta acción"
    );
    if (answer) {
      const originalProducts = this.state.products;
      const products = this.state.products.filter(m => m.id !== product.id);
      this.setState({ products });

      try {
        await deleteProduct(product.id);
      } catch (ex) {
        if (ex.response && ex.response.status === 404)
          toast.error("Este producto ya fue eliminado");

        this.setState({ products: originalProducts });
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
      products: allProducts
    } = this.state;

    let filtered = allProducts;
    if (searchQuery)
      filtered = allProducts.filter(m =>
        m.description.toLowerCase().includes(searchQuery.toLocaleLowerCase())
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
            <NewButton label="Nuevo Producto" to="/product/new" />

            <SearchBox
              value={searchQuery}
              onChange={this.handleSearch}
              placeholder="Buscar..."
            />
            <ProductsTable
              products={products}
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
                <em>Mostrando {totalCount} productos</em>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Products;
