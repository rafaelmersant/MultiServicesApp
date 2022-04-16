import React, { Component } from "react";
import { toast } from "react-toastify";
import Pagination from "react-js-pagination";
import SearchBox from "./common/searchBox";
import NewButton from "./common/newButton";
import Loading from "./common/loading";
import {
  getProducts,
  deleteProduct,
  getProductsByDescription,
} from "../services/productService";
import { getCurrentUser } from "../services/authService";
import { getProductInInvoice } from "../services/invoiceServices";
import ProductsTable from "./tables/productsTable";
import _ from "lodash";

class Products extends Component {
  state = {
    loading: true,
    products: [],
    currentPage: 1,
    pageSize: 50,
    searchQuery: "",
    totalProducts: 0,
    sortColumn: { path: "description", order: "asc" },
  };

  async componentDidMount() {
    this.defaultProducts = [];

    const currentPage = parseInt(sessionStorage["currentPage"] ?? 0);
    if (currentPage > 1) this.setState({ currentPage: currentPage });

    await this.populateProducts("", currentPage, this.state.sortColumn);
  }

  async populateProducts(query, page, sortColumn) {
    let products = [];
    const descrp = query.toUpperCase().split(" ").join("%20");

    try {
      if (descrp.length >= 3) {
        const { data: prods } = await getProductsByDescription(
          getCurrentUser().companyId,
          descrp,
          page,
          sortColumn
        );

        products = prods;
      } else {
        const { data: prods } = await getProducts(
          getCurrentUser().companyId,
          page,
          sortColumn
        );
        this.defaultProducts = prods;
        products = prods;
      }

      const productsFiltered = _.orderBy(
        products.results,
        ["ocurrences"],
        ["desc"]
      );

      this.setState({
        products: productsFiltered,
        totalProducts: products.count,
        loading: false,
      });
    } catch (ex) {
      sessionStorage["currentPage"] = 1;
      console.log(ex);
    }
  }

  handleDelete = async (product) => {
    const { data: found } = await getProductInInvoice(
      getCurrentUser().companyId,
      product.id
    );
    if (found.length) {
      toast.error("No puede eliminar un producto que se ha facturado.");
      return false;
    }

    const answer = window.confirm(
      "Esta seguro de eliminar este producto? \nNo podrá deshacer esta acción"
    );
    if (answer) {
      const originalProducts = this.state.products;
      const products = this.state.products.filter((m) => m.id !== product.id);
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

  handlePageChange = async (page) => {
    this.setState({ currentPage: page });
    sessionStorage["currentPage"] = parseInt(page);

    if (this.state.searchQuery) {
      await this.populateProducts(this.state.searchQuery, parseInt(page));
    } else await this.populateProducts("", parseInt(page));
  };

  handleSearch = async (query) => {
    this.setState({ searchQuery: query, currentPage: 1 });

    setTimeout(async () => {
      if (query === this.state.searchQuery) {
        await this.populateProducts(
          query,
          this.state.currentPage,
          this.state.sortColumn
        );
      }
    }, 400);
  };

  handleSort = async (sortColumn) => {
    this.setState({ sortColumn });

    await this.populateProducts(
      this.state.searchQuery,
      this.state.currentPage,
      sortColumn
    );
  };

  render() {
    const {
      products,
      sortColumn,
      searchQuery,
      totalProducts,
      pageSize,
      currentPage,
    } = this.state;
    const user = getCurrentUser();

    return (
      <div className="container-fluid">
        <div className="row">
          <div className="col">
            <h5 className="pull-left text-info mt-2">Listado de Productos</h5>
            {user && (user.role === "Admin" || user.role === "Owner") && (
              <NewButton label="Nuevo Producto" to="/product/new" />
            )}
            <SearchBox
              value={searchQuery}
              onChange={this.handleSearch}
              placeholder="Buscar..."
            />
            {this.state.loading && (
              <div className="d-flex justify-content-center mb-3">
                <Loading />
              </div>
            )}

            {!this.state.loading && (
              <ProductsTable
                products={products}
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
                    totalItemsCount={totalProducts}
                    pageRangeDisplayed={5}
                    onChange={this.handlePageChange.bind(this)}
                    itemClass="page-item"
                    linkClass="page-link"
                  />
                </div>
                <p className="text-muted ml-3 mt-2">
                  <em>
                    Mostrando {products.length} productos de {totalProducts}
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

export default Products;
