import React, { Component } from "react";
import { toast } from "react-toastify";
import _ from "lodash";
import Pagination from "./common/pagination";
import SearchBox from "./common/searchBox";
import { paginate } from "../utils/paginate";
import NewButton from "./common/newButton";
import {
  getProductsCategories,
  deleteCategory
} from "../services/productCategoryService";
import { getCategoryInProduct } from "../services/productService";
import { getCurrentUser } from "../services/authService";
import ProductCategoriesTable from "./productCategoriesTable";

class ProductsCategories extends Component {
  state = {
    categories: [],
    currentPage: 1,
    pageSize: 10,
    searchQuery: "",
    sortColumn: { path: "creationDate", order: "desc" }
  };

  async componentDidMount() {
    const companyId = getCurrentUser().companyId;
    const { data: categories } = await getProductsCategories(companyId);

    this.setState({ categories });
  }

  handleDelete = async category => {
    const { data: found } = await getCategoryInProduct(
      getCurrentUser().companyId,
      category.id
    );
    if (found.length) {
      toast.error(
        "No puede eliminar una categoria que se esta usando en productos."
      );
      return false;
    }

    const answer = window.confirm(
      "Esta seguro de eliminar esta categoria? \nNo podrá deshacer esta acción"
    );
    if (answer) {
      const originalCategories = this.state.categories;
      const categories = this.state.categories.filter(
        m => m.id !== category.id
      );
      this.setState({ categories });

      try {
        await deleteCategory(category.id);
      } catch (ex) {
        if (ex.response && ex.response.status === 404)
          toast.error("Esta categoria ya fue eliminada");

        this.setState({ categories: originalCategories });
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
      categories: allCategories
    } = this.state;

    let filtered = allCategories;
    if (searchQuery)
      filtered = allCategories.filter(m =>
        m.description.toLowerCase().startsWith(searchQuery.toLocaleLowerCase())
      );

    const sorted = _.orderBy(filtered, [sortColumn.path], [sortColumn.order]);

    const categories = paginate(sorted, currentPage, pageSize);

    return { totalCount: filtered.length, categories };
  };

  render() {
    const { pageSize, currentPage, sortColumn, searchQuery } = this.state;
    const { user } = this.props;

    const { totalCount, categories } = this.getPagedData();

    return (
      <div className="container">
        <div className="row">
          <div className="col margin-top-msg">
            <NewButton label="Nueva Categoria" to="/productCategory/new" />

            <SearchBox
              value={searchQuery}
              onChange={this.handleSearch}
              placeholder="Buscar..."
            />
            <ProductCategoriesTable
              categories={categories}
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
                <em>Mostrando {totalCount} categorias de productos</em>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default ProductsCategories;
