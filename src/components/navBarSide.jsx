import React from "react";
import { NavLink } from "react-router-dom";

const NavBarSide = ({ user }) => {
  const classesForCaja =
    user && user.role === "Caja"
      ? "list-group-item list-group-item-action bg-light border-none"
      : "list-group-item list-group-item-action bg-light border-none";

  return (
    <div className="bg-light border-right" id="sidebar-wrapper">
      <div className="sidebar-heading text-center border-bottom">
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
            user.role === "Caja" ||
            user.role === "Level1") && (
            <React.Fragment>
              <NavLink
                className="list-group-item list-group-item-action bg-light border-none py-2"
                to="/invoice/new"
              >
                <span className="fa fa-money mr-2 color-local" />
                Facturación
              </NavLink>

              <NavLink
                className="list-group-item list-group-item-action bg-light border-none py-2"
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
              className="list-group-item list-group-item-action bg-light border-none py-2"
              to="/inventoriesFull"
            >
              <span className="fa fa-clone mr-2 color-local" />
              Entrada de Inventario
            </NavLink>

            <NavLink
              className="list-group-item list-group-item-action bg-light border-none py-2"
              to="/inventories"
            >
              <span className="fa fa-bars mr-2 color-local" />
              Movimientos de Productos
            </NavLink>

            <NavLink
              className="list-group-item list-group-item-action bg-light border-none py-2"
              to="/products"
            >
              <span className="fa fa-list mr-2 color-local" />
              Productos
            </NavLink>

            <NavLink
              className="list-group-item list-group-item-action bg-light border-none py-2"
              to="/productsCategories"
            >
              <span className="fa fa-list mr-2 color-local" />
              Categorias
            </NavLink>
            <NavLink
              className="list-group-item list-group-item-action bg-light border-none py-2"
              to="/customers"
            >
              <span className="fa fa-users mr-2 color-local" />
              Clientes
            </NavLink>
            <NavLink
              className="list-group-item list-group-item-action bg-light border-none py-2"
              to="/providers"
            >
              <span className="fa fa-users mr-2 color-local" />
              Proveedores
            </NavLink>
            <NavLink
              className="list-group-item list-group-item-action bg-light border-none py-2"
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
            user.role === "Caja") && (
            <React.Fragment>
              <NavLink
                className="list-group-item list-group-item-action bg-light border-none py-2"
                to="/invoices"
              >
                <span className="fa fa-list mr-2 color-local" />
                Listado de Facturas
              </NavLink>

              <NavLink
                className="list-group-item list-group-item-action bg-light border-none py-2"
                to="/reports/purchaseOrders"
              >
                <span className="fa fa-book mr-2 color-local" />
                Ordenes de Compra
              </NavLink>

              <NavLink
                className="list-group-item list-group-item-action bg-light border-none py-2"
                to="/reports/cuadre"
              >
                <span className="fa fa-book mr-2 color-local" />
                Reporte de Cuadre
              </NavLink>
            </React.Fragment>
          )}

        {user && (user.role === "Admin" || user.role === "Owner") && (
          <React.Fragment>
            <NavLink
              className="list-group-item list-group-item-action bg-light border-none py-2"
              to="/reports/report607"
            >
              <span className="fa fa-list mr-2 color-local" />
              Reporte 607 (Ventas)
            </NavLink>

            <NavLink
              className="list-group-item list-group-item-action bg-light border-none py-2"
              to="/reports/report606"
            >
              <span className="fa fa-list mr-2 color-local" />
              Reporte 606 (Compras)
            </NavLink>


            <NavLink
              className="list-group-item list-group-item-action bg-light border-none py-2"
              to="/invoicesCustomers"
            >
              <span className="fa fa-list mr-2 color-local" />
              Reporte de Clientes
            </NavLink>
            
            <NavLink
              className="list-group-item list-group-item-action bg-light border-none py-2"
              to="/inventory/report"
            >
              <span className="fa fa-list mr-2 color-local" />
              Inventario
            </NavLink>

            <NavLink
              className="list-group-item list-group-item-action bg-light border-none py-2"
              to="/reports/entrtiesProvider"
            >
              <span className="fa fa-list mr-2 color-local" />
              Entradas por Proveedor
            </NavLink>
          </React.Fragment>
        )}
      </div>
    </div>
  
  );
};

export default NavBarSide;
