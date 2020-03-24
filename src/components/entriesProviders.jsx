import React, { Component } from "react";
import _ from "lodash";
import Pagination from "./common/pagination";
import SearchBox from "./common/searchBox";
import { paginate } from "../utils/paginate";
import EntriesProviderTable from "./tables/entriesProviderTable";
import { getProductsTrackingsHeader } from "../services/inventoryService";
import { getCurrentUser } from "../services/authService";
import ExportEntriesProviderToExcel from "./reports/exportEntriesProviderToExcel";

class EntriesProviders extends Component {
  state = {
    entries: [],
    currentPage: 1,
    pageSize: 1000,
    searchQuery: "",
    sortColumn: { path: "creationDate", order: "desc" }
  };

  async componentDidMount() {
    this.getInventoryRecords();
  }

  async getInventoryRecords() {
    const companyId = getCurrentUser().companyId;
    let { data: entries } = await getProductsTrackingsHeader(
      companyId,
      this.state.currentPage,
      this.state.sortColumn,
      ""
    );
    entries = entries.results;

    this.setState({ entries });
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
      entries: allentries
    } = this.state;

    let filtered = allentries;
    if (searchQuery)
      filtered = allentries.filter(m =>
        `${m.provider.name.toLowerCase()}`.startsWith(
          searchQuery.toLocaleLowerCase()
        )
      );

    const sorted = _.orderBy(filtered, [sortColumn.path], [sortColumn.order]);

    const entries = paginate(sorted, currentPage, pageSize);

    return { totalCount: filtered.length, entries };
  };

  mapToExcelView = data => {
    let result = [];

    data.forEach(item => {
      result.push({
        id: item.id
      });
    });

    return result;
  };

  render() {
    const { pageSize, currentPage, sortColumn, searchQuery } = this.state;
    const { user } = this.props;

    const { totalCount, entries } = this.getPagedData();

    return (
      <div className="container">
        <div className="row">
          <div className="col">
            <h2 className="pull-right text-info">Entradas por Proveedor</h2>

            <ExportEntriesProviderToExcel
              data={this.mapToExcelView(this.state.entries)}
              sheetName="EntradaProveedores"
            />

            <SearchBox
              value={searchQuery}
              onChange={this.handleSearch}
              placeholder="Buscar proveedor..."
            />

            <EntriesProviderTable
              entries={entries}
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

export default EntriesProviders;
