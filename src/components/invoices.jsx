import React, { Component } from "react";
import _ from "lodash";
import { toast } from "react-toastify";
import Pagination from "./common/pagination";
import SearchBox from "./common/searchBox";
import NewButton from "./common/newButton";
import { paginate } from "../utils/paginate";
import { getCurrentUser } from "../services/authService";
import {
  getInvoicesHeader,
  deleteInvoiceHeader,
  getInvoiceDetail
} from "../services/invoiceServices";
import InvoicesTable from "./tables/invoicesTable";
import {
  saveProductTracking,
  updateProductStock
} from "../services/inventoryService";

class Invoices extends Component {
  state = {
    invoices: [],
    currentPage: 1,
    pageSize: 10,
    searchQuery: "",
    sortColumn: { path: "creationDate", order: "desc" }
  };

  async componentDidMount() {
    this.populateInvoices();
  }

  async populateInvoices() {
    const companyId = getCurrentUser().companyId;
    const { data: invoices } = await getInvoicesHeader(companyId);
    this.setState({ invoices });
  }

  async updateInventory(productId, quantity) {
    const inventory = {
      header_id: 1,
      id: 0,
      product_id: productId,
      typeTracking: "E",
      concept: "INVO",
      quantity: quantity,
      company_id: getCurrentUser().companyId,
      createdUser: getCurrentUser().email,
      creationDate: new Date().toISOString()
    };
    console.log("inventory", inventory);
    await saveProductTracking(inventory);
    await updateProductStock(inventory);
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

  handleDelete = async invoice => {
    if (invoice.paid) {
      toast.error("No puede eliminar una factura pagada.");
      return false;
    }

    const answer = window.confirm(
      `Seguro que desea eliminar la factura #${invoice.sequence}`
    );

    if (answer) {
      try {
        const invoices = this.state.invoices.filter(
          item => item.id !== invoice.id
        );
        this.setState({ invoices });

        const { data: details } = await getInvoiceDetail(invoice.id);

        details.forEach(async item => {
          await this.updateInventory(item.product.id, item.quantity);
          //await deleteInvoiceDetail(item.id); //deleted by default with the header
        });

        var deleted = await deleteInvoiceHeader(invoice.id);
      } catch (ex) {
        if (ex.response && ex.response.status === 404)
          toast.error("Este factura ya fue eliminada");
      }

      if (deleted && deleted.status === 200)
        toast.success(
          `La factura #${invoice.sequence} fue eliminada con exito!`
        );
    }
  };

  getPagedData = () => {
    const {
      pageSize,
      currentPage,
      sortColumn,
      searchQuery,
      invoices: allInvoices
    } = this.state;

    let filtered = allInvoices;
    if (searchQuery)
      filtered = allInvoices.filter(m =>
        `${m.sequence.toLowerCase()}`.startsWith(
          searchQuery.toLocaleLowerCase()
        )
      );

    const sorted = _.orderBy(filtered, [sortColumn.path], [sortColumn.order]);

    const invoices = paginate(sorted, currentPage, pageSize);

    return { totalCount: filtered.length, invoices };
  };

  render() {
    const { pageSize, currentPage, sortColumn, searchQuery } = this.state;
    const { user } = this.props;

    const { totalCount, invoices } = this.getPagedData();

    return (
      <div className="container">
        <div className="row">
          <div className="col margin-top-msg">
            <NewButton label="Nueva Factura" to="/invoice/new" />

            <SearchBox
              value={searchQuery}
              onChange={this.handleSearch}
              placeholder="Buscar factura..."
            />

            <InvoicesTable
              invoices={invoices}
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
                <em>Mostrando {totalCount} facturas</em>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Invoices;
