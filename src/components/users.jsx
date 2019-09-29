import React, { Component } from "react";
import { NavLink } from "react-router-dom";
import Pagination from "./common/pagination";
import SearchBox from "./common/searchBox";
import { paginate } from "../utils/paginate";
import { getUsers } from "../services/userService";
import UsersTable from "./usersTable";
import _ from "lodash";

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

  // handleDelete = async movie => {
  //   const originalMovies = this.state.movies;
  //   const movies = this.state.movies.filter(m => m._id !== movie._id);
  //   this.setState({ movies });

  //   try {
  //     await deleteMovie(movie._id);
  //   } catch (ex) {
  //     if (ex.response && ex.response.status === 404)
  //       toast.error("This movie has already been deleted.");

  //     this.setState({ movies: originalMovies });
  //   }
  // };

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

            <p>Mostrando {totalCount} usuarios</p>
            <SearchBox value={searchQuery} onChange={this.handleSearch} />
            <UsersTable
              users={users}
              user={user}
              sortColumn={sortColumn}
              onLike={this.handleLike}
              onDelete={this.handleDelete}
              onSort={this.handleSort}
            />

            <Pagination
              itemsCount={totalCount}
              pageSize={pageSize}
              currentPage={currentPage}
              onPageChange={this.handlePageChange}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default Users;
