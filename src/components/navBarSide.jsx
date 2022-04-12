import React from "react";
import { NavLink } from "react-router-dom";

const NavBarSide = ({ user }) => {
  const classesForCaja =
    user && user.role === "Caja"
      ? "list-group-item list-group-item-action bg-light"
      : "list-group-item list-group-item-action bg-light border-none";

  return (
    <div className="bg-light border-right" id="sidebar-wrapper">
      <div className="sidebar-heading text-center">
        <NavLink className="" to="/invoice/new">
          <img
            style={{ width: "150px", padding: "5px", margin: "0" }}
            src={process.env.PUBLIC_URL + "/images/FERRINMAS_small.jpg"}
            alt="FERRINMAS"
          />
        </NavLink>
      </div>
      <div className="list-group list-group-flush">
        {user &&
          (user.role === "Admin" ||
            user.role === "Owner" ||
            user.role === "Level1") && (
            <React.Fragment>
              <NavLink
                className="list-group-item list-group-item-action bg-light"
                to="/invoice/new"
              >
                <span className="fa fa-money mr-2 color-local" />
                Facturación
              </NavLink>

              <NavLink
                className="list-group-item list-group-item-action bg-light border-none"
                to="/quotations"
              >
                <span className="fa fa-book mr-2 color-local" />
                Cotizaciones
              </NavLink>
            </React.Fragment>
          )}

        {user &&
          (user.role === "Admin" ||
            user.role === "Owner" ||
            user.role === "Caja") && (
            <NavLink className={classesForCaja} to="/conduces">
              <span className="fa fa-truck mr-2 color-local" />
              Conduces
            </NavLink>
          )}

        {user && (user.role === "Admin" || user.role === "Owner") && (
          <React.Fragment>
            <NavLink
              className="list-group-item list-group-item-action bg-light border-none"
              to="/inventoriesFull"
            >
              <span className="fa fa-clone mr-2 color-local" />
              Entrada de Inventario
            </NavLink>

            <NavLink
              className="list-group-item list-group-item-action bg-light border-none"
              to="/inventories"
            >
              <span className="fa fa-bars mr-2 color-local" />
              Movimientos de Productos
            </NavLink>

            <NavLink
              className="list-group-item list-group-item-action bg-light border-none"
              to="/products"
            >
              <span className="fa fa-list mr-2 color-local" />
              Productos
            </NavLink>

            <NavLink
              className="list-group-item list-group-item-action bg-light border-none"
              to="/productsCategories"
            >
              <span className="fa fa-list mr-2 color-local" />
              Categorias
            </NavLink>
            <NavLink
              className="list-group-item list-group-item-action bg-light border-none"
              to="/customers"
            >
              <span className="fa fa-users mr-2 color-local" />
              Clientes
            </NavLink>
            <NavLink
              className="list-group-item list-group-item-action bg-light border-none"
              to="/providers"
            >
              <span className="fa fa-users mr-2 color-local" />
              Proveedores
            </NavLink>
            <NavLink
              className="list-group-item list-group-item-action bg-light border-none"
              to="/ncf"
            >
              <span className="fa fa-credit-card mr-2 color-local" />
              NCF
            </NavLink>
          </React.Fragment>
        )}

        {user &&
          (user.role === "Admin" ||
            user.role === "Owner" ||
            user.role == "Caja") && (
            <React.Fragment>
              <NavLink
                className="list-group-item list-group-item-action bg-light border-none"
                to="/invoices"
              >
                <span className="fa fa-list mr-2 color-local" />
                Listado de Facturas
              </NavLink>

              <NavLink
                className="list-group-item list-group-item-action bg-light border-none"
                to="/reports/report607"
              >
                <span className="fa fa-list mr-2 color-local" />
                Reporte 607 (Ventas)
              </NavLink>

              <NavLink
                className="list-group-item list-group-item-action bg-light border-none"
                to="/reports/report606"
              >
                <span className="fa fa-list mr-2 color-local" />
                Reporte 606 (Compras)
              </NavLink>

              <NavLink
                className="list-group-item list-group-item-action bg-light border-none"
                to="/reports/purchaseOrders"
              >
                <span className="fa fa-book mr-2 color-local" />
                Ordenes de Compra
              </NavLink>
            </React.Fragment>
          )}

        {user && (user.role === "Admin" || user.role === "Owner") && (
          <React.Fragment>
            <NavLink
              className="list-group-item list-group-item-action bg-light border-none"
              to="/inventory/report"
            >
              <span className="fa fa-list mr-2 color-local" />
              Inventario
            </NavLink>

            <NavLink
              className="list-group-item list-group-item-action bg-light border-none"
              to="/reports/entrtiesProvider"
            >
              <span className="fa fa-list mr-2 color-local" />
              Entradas por Proveedor
            </NavLink>
          </React.Fragment>
        )}
      </div>
    </div>

    // <nav className="navbar navbar-expand-lg navbar-light bg-light">
    //   <NavLink className="navbar-brand" to="/">

    //     <img
    //       width="170px"
    //       src={process.env.PUBLIC_URL + "/images/FERRINMAS_small.jpg"}
    //       alt="FERRINMAS"
    //     />
    //   </NavLink>

    //   <button
    //     className="navbar-toggler"
    //     type="button"
    //     data-toggle="collapse"
    //     data-target="#navbarTogglerDemo02"
    //     aria-controls="navbarTogglerDemo02"
    //     aria-expanded="false"
    //     aria-label="Toggle navigation"
    //   >
    //     <span className="navbar-toggler-icon"></span>
    //   </button>

    //   <div className="collapse navbar-collapse" id="navbarTogglerDemo02">
    //     <ul className="navbar-nav mr-auto mt-2 mt-lg-0">
    //       <li className="nav-item">
    //         <a href="/invoice/new" className="nav-link">
    //           Facturación
    //         </a>
    //       </li>

    //       {user && (user.role === "Admin" || user.role === "Owner") && (
    //         <React.Fragment>
    //           <li className="nav-item">
    //             <NavLink className="nav-link" to="/conduces">
    //               | Conduces
    //             </NavLink>
    //           </li>

    //           <li className="nav-item dropdown">
    //             <NavLink
    //               className="clickable text-secondary nav-link dropdown-toggle"
    //               id="navbarDropdown"
    //               data-toggle="dropdown"
    //               aria-haspopup="true"
    //               aria-expanded="false"
    //               to=""
    //             >
    //               | Inventario
    //             </NavLink>
    //             <div className="dropdown-menu" aria-labelledby="navbarDropdown">
    //               <NavLink className="dropdown-item" to="/inventoriesFull">
    //                 Entrada de Inventario
    //               </NavLink>

    //               <NavLink className="dropdown-item" to="/inventories">
    //                 Movimientos de Productos
    //               </NavLink>
    //             </div>
    //           </li>

    //           <li className="nav-item">
    //             <NavLink className="nav-link" to="/products">
    //               | Productos
    //             </NavLink>
    //           </li>

    //           <li className="nav-item">
    //             <NavLink className="nav-link" to="/productsCategories">
    //               | Categorias
    //             </NavLink>
    //           </li>

    //           <li className="nav-item">
    //             <NavLink className="nav-link" to="/customers">
    //               | Clientes
    //             </NavLink>
    //           </li>

    //           <li className="nav-item">
    //             <NavLink className="nav-link" to="/providers">
    //               | Proveedores
    //             </NavLink>
    //           </li>

    //           <li className="nav-item">
    //             <NavLink className="nav-link" to="/ncf">
    //               | NCF
    //             </NavLink>
    //           </li>

    //           <li className="nav-item dropdown">
    //             <NavLink
    //               className="clickable text-secondary nav-link dropdown-toggle"
    //               id="navbarDropdown"
    //               data-toggle="dropdown"
    //               aria-haspopup="true"
    //               aria-expanded="false"
    //               to=""
    //             >
    //               | Reportes
    //             </NavLink>
    //             <div className="dropdown-menu" aria-labelledby="navbarDropdown">
    //               <NavLink className="dropdown-item" to="/invoices">
    //                 Listado de Facturas
    //               </NavLink>
    //               <NavLink className="dropdown-item" to="/reports/report607">
    //                 Facturas 607
    //               </NavLink>

    //               <NavLink className="dropdown-item" to="/inventory/report">
    //                 Inventario
    //               </NavLink>
    //               <NavLink className="dropdown-item" to="/reports/report606">
    //                 Reporte 606
    //               </NavLink>
    //               <NavLink
    //                 className="dropdown-item"
    //                 to="/reports/entrtiesProvider"
    //               >
    //                 Entradas por Proveedor
    //               </NavLink>
    //               <NavLink
    //                 className="dropdown-item"
    //                 to="/reports/purchaseOrders"
    //               >
    //                 Ordenes de Compra
    //               </NavLink>
    //             </div>
    //           </li>
    //         </React.Fragment>
    //       )}

    //       {user && user.role === "Owner" && (
    //         <li className="nav-item">
    //           <NavLink className="nav-link" to="/companies">
    //             | Compañias
    //           </NavLink>
    //         </li>
    //       )}

    //       {user && user.role === "Owner" && (
    //         <li className="nav-item">
    //           <NavLink className="nav-link" to="/users">
    //             | Usuarios
    //           </NavLink>
    //         </li>
    //       )}
    //     </ul>

    //     <div className="navbar-text">
    //       {!user && (
    //         <React.Fragment>
    //           <ul className="navbar-nav mr-auto mt-2 mt-lg-0">
    //             <li className="nav-item">
    //               <NavLink className="nav-link" to="/login">
    //                 Iniciar sesión
    //               </NavLink>
    //             </li>
    //           </ul>
    //         </React.Fragment>
    //       )}
    //     </div>

    //     <div className="navbar-text">
    //       {user && (
    //         <React.Fragment>
    //           <ul className="navbar-nav mr-auto mt-2 mt-lg-0">
    //             <li className="nav-item">
    //               <NavLink className="nav-link mr-sm-2 active" to="/profile">
    //                 {user.name}
    //               </NavLink>
    //             </li>
    //             <li className="nav-item">
    //               <NavLink className="nav-link my-2 my-sm-0" to="/logout">
    //                 Cerrar sesión
    //               </NavLink>
    //             </li>
    //           </ul>
    //         </React.Fragment>
    //       )}
    //     </div>
    //   </div>
    // </nav>
  );
};

export default NavBarSide;
