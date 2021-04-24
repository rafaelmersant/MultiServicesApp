import React from "react";
import { NavLink } from "react-router-dom";

const NavBarTop = ({ user }) => {
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light border-bottom">
      <button className="btn btn-light" id="menu-toggle">
        ...
      </button>

      <button
        className="navbar-toggler"
        type="button"
        data-toggle="collapse"
        data-target="#navbarSupportedContent"
        aria-controls="navbarSupportedContent"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span className="navbar-toggler-icon"></span>
      </button>

      <div className="collapse navbar-collapse" id="navbarSupportedContent">
        <ul className="navbar-nav ml-auto mt-2 mt-lg-0">
          {!user && (
            <React.Fragment>
              <ul className="navbar-nav mr-auto mt-2 mt-lg-0">
                <li className="nav-item active">
                  <NavLink className="nav-link" to="/login">
                    Iniciar sesión
                  </NavLink>
                </li>
              </ul>
            </React.Fragment>
          )}

          {user && (
            <React.Fragment>
              <ul className="navbar-nav mr-auto mt-2 mt-lg-0">
                <li className="nav-item">
                  <NavLink className="nav-link mr-sm-2 active" to="/profile">
                    {user.name}
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link my-2 my-sm-0" to="/logout">
                    Cerrar sesión
                  </NavLink>
                </li>
              </ul>
            </React.Fragment>
          )}

          {user && user.role === "Owner" && (
            <li className="nav-item dropdown">
              <span
                className="nav-link dropdown-toggle cursor-pointer"
                href="#"
                id="navbarDropdown"
                role="button"
                data-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false"
              >
                Admin
              </span>
              <div
                className="dropdown-menu dropdown-menu-right"
                aria-labelledby="navbarDropdown"
              >
                <NavLink className="dropdown-item" to="/companies">
                  Compañias
                </NavLink>
                <div className="dropdown-divider"></div>
                <NavLink className="dropdown-item" to="/users">
                  Usuarios
                </NavLink>
              </div>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default NavBarTop;
