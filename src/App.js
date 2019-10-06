import React, { Component } from "react";
import { Route, Redirect, Switch } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Customers from "./components/customers";
import CustomerForm from "./components/customerForm";
import NotFound from "./components/notFound";
import NavBar from "./components/navBar";
import LoginForm from "./components/loginForm";
import Logout from "./components/logout";
import InvoiceForm from "./components/invoiceForm";
import Invoices from "./components/invoices";
import Inventories from "./components/inventories";
import InventoryForm from "./components/inventoryForm";
import Products from "./components/products";
import ProductForm from "./components/productForm";
import Companies from "./components/companies";
import CompanyForm from "./components/companyForm";
import Users from "./components/users";
import UserForm from "./components/userForm";
import ProductsCategories from "./components/productCategories";
import ProductCategoryForm from "./components/productCategoryForm";
import ProtectedRoute from "./components/common/protectedRoute";
import auth from "./services/authService";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

class App extends Component {
  state = {
    user: {}
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
    return (
      <React.Fragment>
        <ToastContainer />
        <NavBar user={this.state.user} />
        <main>
          <Switch>
            <Route path="/login" component={LoginForm} />
            <Route path="/logout" component={Logout} />
            <ProtectedRoute path="/invoices" component={Invoices} />} />
            <ProtectedRoute path="/invoice/:id" component={InvoiceForm} />} />
            <ProtectedRoute path="/inventories" component={Inventories} />
            <ProtectedRoute path="/inventory/:id" component={InventoryForm} />
            <ProtectedRoute path="/customers" component={Customers} />
            <ProtectedRoute path="/customer/:id" component={CustomerForm} />
            <ProtectedRoute path="/products" component={Products} />
            <ProtectedRoute path="/product/:id" component={ProductForm} />
            <ProtectedRoute
              path="/productsCategories/"
              component={ProductsCategories}
            />
            <ProtectedRoute
              path="/productCategory/:id"
              component={ProductCategoryForm}
            />
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
      </React.Fragment>
    );
  }
}

export default App;
