import React, { Component } from "react";
import { NavLink } from "react-router-dom";
import { toast } from "react-toastify";
import _ from "lodash";
import Pagination from "./common/pagination";
import SearchBox from "./common/searchBox";
import { paginate } from "../utils/paginate";
import { getUsers, deleteUser } from "../services/userService";
import UsersTable from "./usersTable";

class Users extends Component {
  state = {
    users: [],
    currentPage: 1,
    pageSize: 4,
    searchQuery: "",
    sortColumn: { path: "name", order: "asc" }
  };

  async componentDidMount() {
    const { data: users } = await getUsers();

    this.setState({ users });
  }

  handleDelete = async user => {
    const answer = window.confirm(
      "Esta seguro de eliminar este usuario? \nNo podrá deshacer esta acción"
    );
    if (answer) {
      const originalUsers = this.state.users;
      const users = this.state.users.filter(m => m.id !== user.id);
      this.setState({ users });

      try {
        await deleteUser(user.id);
      } catch (ex) {
        if (ex.response && ex.response.status === 404)
          toast.error("This user has already been deleted.");

        this.setState({ users: originalUsers });
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
      users: allUsers
    } = this.state;

    let filtered = allUsers;
    if (searchQuery)
      filtered = allUsers.filter(m =>
        m.name.toLowerCase().startsWith(searchQuery.toLocaleLowerCase())
      );

    const sorted = _.orderBy(filtered, [sortColumn.path], [sortColumn.order]);

    const users = paginate(sorted, currentPage, pageSize);

    return { totalCount: filtered.length, users };
  };

  render() {
    const { pageSize, currentPage, sortColumn, searchQuery } = this.state;
    const { user } = this.props;

    const { totalCount, users } = this.getPagedData();

    return (
      <div className="container">
        <div className="row">
          <div className="col margin-top-msg">
            <NavLink className="btn btn-primary mb-3 pull-right" to="/user/new">
              Nuevo Usuario
            </NavLink>

            {/* {user && (
              <NavLink className="btn btn-primary mb-3" to="/users/new">
                Nuevo Usuario
              </NavLink>
            )} */}

            <SearchBox
              value={searchQuery}
              onChange={this.handleSearch}
              placeholder="Buscar..."
            />
            <UsersTable
              users={users}
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
                <em>Mostrando {totalCount} usuarios</em>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Users;
