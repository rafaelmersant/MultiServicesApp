import React, { Component } from "react";
import { Route, Redirect, Switch } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import NotFound from "./components/notFound";
import NavBar from "./components/navBar";
import LoginForm from "./components/forms/loginForm";
import Logout from "./components/logout";

// Invoice
import InvoiceLeadForm from "./components/forms/invoiceLeadForm";
import InvoiceForm from "./components/forms/invoiceForm";
import Invoices from "./components/invoices";
import Invoices606 from "./components/invoices606";
import Invoices607 from "./components/invoices607";
import PrintInvoice from "./components/reports/printInvoice";
import Conduces from "./components/conduces";

// Inventory
import Inventories from "./components/inventories";
import InventoriesFull from "./components/inventoriesFull";
import InventoryForm from "./components/forms/inventoryForm";
import InventoryFullForm from "./components/forms/inventoryFullForm";

// Products and Categories
import ProductsStock from "./components/productsStock";
import Products from "./components/products";
import ProductForm from "./components/forms/productForm";
import ProductsCategories from "./components/productCategories";
import ProductCategoryForm from "./components/forms/productCategoryForm";

// Administration and settings
import Companies from "./components/companies";
import CompanyForm from "./components/forms/companyForm";
import Users from "./components/users";
import UserForm from "./components/forms/userForm";
import NCF from "./components/ncf";
import NCFForm from "./components/forms/ncfForm";

// Entities
import Providers from "./components/providers";
import ProviderForm from "./components/forms/providerForm";
import Customers from "./components/customers";
import CustomerForm from "./components/forms/customerForm";

// Reports
import PurchaseOrders from "./components/purchaseOrders";
import EntriesProviders from "./components/entriesProviders";

import ProtectedRoute from "./components/common/protectedRoute";
import auth from "./services/authService";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import "./simple-sidebar.css";
import ExportStockToExcel from "./components/reports/exportStockToExcel";
import { NavLink } from "react-router-dom";
import NavBarSide from "./components/navBarSide";

class App extends Component {
  state = {
    user: {},
  };

  componentDidMount() {
    try {
      const user = auth.getCurrentUser();

      this.setState({ user });
    } catch (ex) {
      if (window.location.pathname !== "/login")
        window.location.replace("/login");
    }
  }

  render() {
    const { user } = { ...this.state };

    return (
      <React.Fragment>
        <ToastContainer />
        {/* <NavBar user={this.state.user} /> */}
        <div className="d-flex" id="wrapper">
          <NavBarSide user={this.state.user} />

          <div id="page-content-wrapper">
            <nav className="navbar navbar-expand-lg navbar-light bg-light border-bottom">
              <button className="btn btn-secondary" id="menu-toggle">
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

              <div
                className="collapse navbar-collapse"
                id="navbarSupportedContent"
              >
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
                          <NavLink
                            className="nav-link mr-sm-2 active"
                            to="/profile"
                          >
                            {user.name}
                          </NavLink>
                        </li>
                        <li className="nav-item">
                          <NavLink
                            className="nav-link my-2 my-sm-0"
                            to="/logout"
                          >
                            Cerrar sesión
                          </NavLink>
                        </li>
                      </ul>
                    </React.Fragment>
                  )}

                  {user && user.role === "Owner" && (
                    <li className="nav-item dropdown">
                      <a
                        className="nav-link dropdown-toggle"
                        href="#"
                        id="navbarDropdown"
                        role="button"
                        data-toggle="dropdown"
                        aria-haspopup="true"
                        aria-expanded="false"
                      >
                        Admin
                      </a>
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

            <div className="container-fluid">
              <main>
                <Switch>
                  <Route path="/login" component={LoginForm} />
                  <Route path="/logout" component={Logout} />
                  <ProtectedRoute path="/invoices" component={Invoices} />
                  <ProtectedRoute path="/conduces" component={Conduces} />
                  <Route path="/invoicePrint/:id" component={PrintInvoice} />

                  <ProtectedRoute path="/invoice/:id" component={InvoiceForm} />
                  <ProtectedRoute
                    path="/conduce/:id"
                    component={InvoiceLeadForm}
                  />

                  <ProtectedRoute path="/inventories" component={Inventories} />
                  <ProtectedRoute
                    path="/inventoriesFull"
                    component={InventoriesFull}
                  />
                  <ProtectedRoute
                    path="/inventory/report/excel"
                    component={ExportStockToExcel}
                  />
                  <ProtectedRoute
                    path="/inventory/report"
                    component={ProductsStock}
                  />
                  <ProtectedRoute
                    path="/inventory/:id"
                    component={InventoryForm}
                  />
                  <ProtectedRoute
                    path="/inventoryFull/:id"
                    component={InventoryFullForm}
                  />
                  <ProtectedRoute
                    path="/reports/report606"
                    component={Invoices606}
                  />
                  <ProtectedRoute
                    path="/reports/report607"
                    component={Invoices607}
                  />
                  <ProtectedRoute
                    path="/reports/entrtiesProvider"
                    component={EntriesProviders}
                  />
                  <ProtectedRoute
                    path="/reports/purchaseOrders"
                    component={PurchaseOrders}
                  />

                  <ProtectedRoute path="/customers" component={Customers} />
                  <ProtectedRoute
                    path="/customer/:id"
                    component={CustomerForm}
                  />
                  <ProtectedRoute path="/products" component={Products} />
                  <ProtectedRoute path="/product/:id" component={ProductForm} />
                  <ProtectedRoute path="/providers" component={Providers} />
                  <ProtectedRoute
                    path="/provider/:id"
                    component={ProviderForm}
                  />
                  <ProtectedRoute
                    path="/productsCategories/"
                    component={ProductsCategories}
                  />
                  <ProtectedRoute
                    path="/productCategory/:id"
                    component={ProductCategoryForm}
                  />
                  <ProtectedRoute path="/ncf/:id" component={NCFForm} />
                  <ProtectedRoute path="/ncf" component={NCF} />
                  <ProtectedRoute path="/companies" component={Companies} />
                  <ProtectedRoute path="/company/:id" component={CompanyForm} />
                  <ProtectedRoute path="/users" component={Users} />
                  <ProtectedRoute path="/user/:id" component={UserForm} />
                  <Redirect exact from="/" to="/invoices" />
                  <Route path="/not-found" component={NotFound} />
                  <Redirect to="/not-found" />
                  {/* <ProtectedRoute path="/invoice/:id" component={Invoice} /> */}
                </Switch>
              </main>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default App;
