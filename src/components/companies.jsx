import React, { Component } from "react";
import { toast } from "react-toastify";
import _ from "lodash";
import { paginate } from "../utils/paginate";
import Pagination from "./common/pagination";
import SearchBox from "./common/searchBox";
import NewButton from "./common/newButton";
import CompaniesTable from "./tables/companiesTable";
import { getCompanies, deleteCompany } from "../services/companyService";

class Companies extends Component {
  state = {
    companies: [],
    currentPage: 1,
    pageSize: 10,
    searchQuery: "",
    sortColumn: { path: "creationDate", order: "desc" },
  };

  async componentDidMount() {
    const { data: companies } = await getCompanies();

    this.setState({ companies });
  }

  handleDelete = async (company) => {
    const answer = window.confirm(
      "Esta seguro de eliminar esta compañia? \nNo podrá deshacer esta acción"
    );
    if (answer) {
      const originalCompanies = this.state.companies;
      const companies = this.state.companies.filter((m) => m.id !== company.id);
      this.setState({ companies });

      try {
        await deleteCompany(company.id);
      } catch (ex) {
        if (ex.response && ex.response.status === 404)
          toast.error("Esta compañía ya fue eliminada");

        this.setState({ companies: originalCompanies });
      }
    }
  };

  handlePageChange = (page) => {
    this.setState({ currentPage: page });
  };

  handleSearch = (query) => {
    this.setState({ searchQuery: query, currentPage: 1 });
  };

  handleSort = (sortColumn) => {
    this.setState({ sortColumn });
  };

  getPagedData = () => {
    const {
      pageSize,
      currentPage,
      sortColumn,
      searchQuery,
      companies: allCompanies,
    } = this.state;

    let filtered = allCompanies;
    if (searchQuery)
      filtered = allCompanies.filter((m) =>
        m.name.toLowerCase().startsWith(searchQuery.toLocaleLowerCase())
      );

    const sorted = _.orderBy(filtered, [sortColumn.path], [sortColumn.order]);

    const companies = paginate(sorted, currentPage, pageSize);

    return { totalCount: filtered.length, companies };
  };

  render() {
    const { pageSize, currentPage, sortColumn, searchQuery } = this.state;
    const { user } = this.props;

    const { totalCount, companies } = this.getPagedData();

    return (
      <div className="container-fluid">
        <div className="row">
          <div className="col margin-top-msg">
            <NewButton label="Nueva Compañía" to="/company/new" />

            <SearchBox
              value={searchQuery}
              onChange={this.handleSearch}
              placeholder="Buscar..."
            />
            <CompaniesTable
              companies={companies}
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
                <em>Mostrando {totalCount} compañías</em>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Companies;
