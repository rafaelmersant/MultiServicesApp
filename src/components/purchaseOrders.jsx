import React, { Component } from "react";
import { toast } from "react-toastify";
import Pagination from "react-js-pagination";
import SearchBox from "./common/searchBox";
import Loading from "./common/loading";
import PurchaseOrdersTable from "./tables/purchaseOrdersTable";
import { getCurrentUser } from "../services/authService";
import {
  getPurchaseOrder,
  savePurchaseOrder,
} from "../services/productService";

class PurchaseOrders extends Component {
  state = {
    loading: true,
    orders: [],
    currentPage: 1,
    pageSize: 20,
    searchQuery: "",
    totalOrders: 0,
    sortColumn: { path: "creationDate", order: "desc" },
  };

  async componentDidMount() {
    await this.populateOrders(
      "",
      this.state.currentPage,
      this.state.sortColumn
    );
  }

  async populateOrders(query, page, sortColumn) {
    const currentPage = page ? page : 1;

    const product = query.toUpperCase().split(" ").join("%20");

    const { data: orders } = await getPurchaseOrder(
      getCurrentUser().companyId,
      currentPage,
      product,
      sortColumn
    );

    this.setState({
      orders: orders.results,
      totalOrders: orders.count,
      loading: false,
    });
  }

  handleMarkAsComplete = async (item) => {
    const answer = window.confirm(
      "Esta seguro que desea marcar como completado?"
    );
    if (answer) {
      try {
        const _item = {
          id: item.id,
          product_id: item.product.id,
          quantity: item.quantity,
          company_id: item.company.id,
          creationDate: new Date(item.creationDate),
          pending: false,
        };

        await savePurchaseOrder(_item);

        await this.populateOrders(
          this.state.searchQuery,
          this.state.currentPage,
          this.state.sortColumn
        );
      } catch (ex) {
        if (ex.response && ex.response.status === 404)
          toast.error("Esta orden ya fue marcada como completada.");
      }
    }
  };

  handlePageChange = async (page) => {
    this.setState({ currentPage: page });

    if (this.state.searchQuery)
      await this.populateOrders(
        this.state.searchQuery,
        parseInt(page),
        this.state.sortColumn
      );
    else await this.populateOrders("", parseInt(page), this.sortColumn);
  };

  handleSearch = (query) => {
    this.setState({ searchQuery: query, currentPage: 1 });
    this.populateOrders(query);
  };

  handleSort = async (sortColumn) => {
    this.setState({ sortColumn });

    await this.populateOrders(
      this.state.searchQuery,
      this.state.currentPage,
      sortColumn
    );
  };

  render() {
    const {
      orders,
      sortColumn,
      searchQuery,
      totalOrders,
      pageSize,
      currentPage,
    } = this.state;
    const user = getCurrentUser();
    console.log("orders", orders);

    return (
      <div className="container-fluid">
        <div className="row">
          <div className="col">
            <h5 className="pull-left text-info mt-2">Ordenes de Compra</h5>

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
              <PurchaseOrdersTable
                orders={orders}
                user={user}
                sortColumn={sortColumn}
                onMarkAsComplete={this.handleMarkAsComplete}
                onSort={this.handleSort}
              />
            )}
            {!this.state.loading && (
              <div className="row">
                <div>
                  <Pagination
                    activePage={currentPage}
                    itemsCountPerPage={pageSize}
                    totalItemsCount={totalOrders}
                    pageRangeDisplayed={5}
                    onChange={this.handlePageChange.bind(this)}
                    itemClass="page-item"
                    linkClass="page-link"
                  />
                </div>
                <p className="text-muted ml-3 mt-2">
                  <em>
                    Mostrando {orders.length} ordenes de {totalOrders}
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

export default PurchaseOrders;
