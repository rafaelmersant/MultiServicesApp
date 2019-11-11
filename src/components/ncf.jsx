import React, { Component } from "react";
import { toast } from "react-toastify";
import _ from "lodash";
import Pagination from "./common/pagination";
import NewButton from "./common/newButton";
import { paginate } from "../utils/paginate";
import { getEntries, deleteEntry } from "../services/ncfService";
import { getCurrentUser } from "../services/authService";
import NCFsTable from "./NCFsTable";

class NCF extends Component {
  state = {
    ncfs: [],
    currentPage: 1,
    pageSize: 10,
    sortColumn: { path: "creationDate", order: "desc" }
  };

  componentDidMount() {
    this.getEntries();
  }

  async getEntries() {
    const companyId = getCurrentUser().companyId;
    const { data: ncfs } = await getEntries(null, companyId);

    this.setState({ ncfs });
  }

  handleDelete = async entry => {
    if (entry.current > 0) {
      toast.error(
        "No puede eliminar esta entrada porque su secuencia ha sido usada en factura(s)."
      );
      return false;
    }

    const answer = window.confirm(
      "Esta seguro de eliminar este registro? \nNo podrá deshacer esta acción"
    );
    if (answer) {
      const originalNCFs = this.state.ncfs;
      const ncfs = this.state.ncfs.filter(m => m.id !== entry.id);
      this.setState({ ncfs });

      try {
        await deleteEntry(entry.id);
      } catch (ex) {
        if (ex.response && ex.response.status === 404)
          toast.error("Este registro ya fue eliminado");

        this.setState({ ncfs: originalNCFs });
      }
    }
  };

  handlePageChange = page => {
    this.setState({ currentPage: page });
  };

  handleSort = sortColumn => {
    this.setState({ sortColumn });
  };

  getPagedData = () => {
    const { pageSize, currentPage, sortColumn, ncfs: allNCFs } = this.state;
    const sorted = _.orderBy(allNCFs, [sortColumn.path], [sortColumn.order]);
    const ncfs = paginate(sorted, currentPage, pageSize);

    return { totalCount: allNCFs.length, ncfs };
  };

  render() {
    const { pageSize, currentPage, sortColumn } = this.state;
    const { user } = this.props;

    const { totalCount, ncfs } = this.getPagedData();

    return (
      <div className="container">
        <div className="row">
          <div className="col margin-top-msg">
            <NewButton label="Nueva Secuencia" to="/ncf/new" />

            <NCFsTable
              ncfs={ncfs}
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

export default NCF;