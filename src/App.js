import React, { Component } from "react";
import { Route, Redirect, Switch } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Customers from "./components/customers";
import NotFound from "./components/notFound";
import NavBar from "./components/navBar";
import LoginForm from "./components/loginForm";
import RegisterForm from "./components/registerForm";
import Logout from "./components/logout";
import Invoice from "./components/invoiceForm";
import Invoices from "./components/invoices";
import Inventory from "./components/inventory";
import Products from "./components/products";
import Product from "./components/product";
import Companies from "./components/companies";
import Company from "./components/companyForm";
import Users from "./components/users";
import UserForm from "./components/userForm";
import ProtectedRoute from "./components/common/protectedRoute";
import auth from "./services/authService";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

class App extends Component {
  state = {};

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
            <Route path="/register" component={RegisterForm} />
            <Route path="/login" component={LoginForm} />
            <Route path="/logout" component={Logout} />
            <Route path="/invoices" component={Invoices} />} />
            <Route path="/invoice/:id" component={Invoice} />} />
            <Route path="/inventory" component={Inventory} />
            <Route path="/customers" component={Customers} />
            <Route path="/customer/:id" component={Customers} />
            <Route path="/products" component={Products} />
            <Route path="/product/:id" component={Product} />
            <Route path="/companies" component={Companies} />
            <Route path="/company/:id" component={Company} />
            <Route path="/users" component={Users} />
            <Route path="/user/:id" component={UserForm} />
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
