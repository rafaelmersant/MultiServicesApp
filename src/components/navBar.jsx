import React from "react";
import { NavLink } from "react-router-dom";

const NavBar = ({ user }) => {
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <NavLink className="navbar-brand" to="/">
        <span className="text-info">
          {localStorage.getItem("ms_companyName")
            ? localStorage.getItem("ms_companyName")
            : "Sistema"}
        </span>
      </NavLink>

      <button
        className="navbar-toggler"
        type="button"
        data-toggle="collapse"
        data-target="#navbarTogglerDemo02"
        aria-controls="navbarTogglerDemo02"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span className="navbar-toggler-icon"></span>
      </button>

      <div className="collapse navbar-collapse" id="navbarTogglerDemo02">
        <ul className="navbar-nav mr-auto mt-2 mt-lg-0">
          <li className="nav-item">
            <NavLink className="nav-link" to="/invoices">
              Facturación
            </NavLink>
          </li>

          <li className="nav-item">
            <NavLink className="nav-link" to="/inventoriesFull">
              | Inventario
            </NavLink>
          </li>

          <li className="nav-item">
            <NavLink className="nav-link" to="/products">
              | Productos
            </NavLink>
          </li>

          <li className="nav-item">
            <NavLink className="nav-link" to="/productsCategories">
              | Categorias
            </NavLink>
          </li>

          <li className="nav-item">
            <NavLink className="nav-link" to="/customers">
              | Clientes
            </NavLink>
          </li>

          <li className="nav-item">
            <NavLink className="nav-link" to="/providers">
              | Proveedores
            </NavLink>
          </li>

          {user && (user.role === "Admin" || user.role === "Owner") && (
            <li className="nav-item">
              <NavLink className="nav-link" to="/ncf">
                | NCF
              </NavLink>
            </li>
          )}

          <li className="nav-item dropdown">
            <NavLink
              className="clickable text-secondary nav-link dropdown-toggle"
              id="navbarDropdown"
              data-toggle="dropdown"
              aria-haspopup="true"
              aria-expanded="false"
              to=""
            >
              | Reportes
            </NavLink>
            <div className="dropdown-menu" aria-labelledby="navbarDropdown">
              <NavLink className="dropdown-item" to="/reports/invoice">
                Facturas
              </NavLink>

              <NavLink className="dropdown-item" to="/reports/inventory">
                Inventario
              </NavLink>
            </div>
          </li>

          {user && user.role === "Owner" && (
            <li className="nav-item">
              <NavLink className="nav-link" to="/companies">
                | Compañias
              </NavLink>
            </li>
          )}

          {user && user.role === "Owner" && (
            <li className="nav-item">
              <NavLink className="nav-link" to="/users">
                | Usuarios
              </NavLink>
            </li>
          )}
        </ul>

        <div className="navbar-text">
          {!user && (
            <React.Fragment>
              <ul className="navbar-nav mr-auto mt-2 mt-lg-0">
                <li className="nav-item">
                  <NavLink className="nav-link" to="/login">
                    Iniciar sesión
                  </NavLink>
                </li>
              </ul>
            </React.Fragment>
          )}
        </div>

        <div className="navbar-text">
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
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
