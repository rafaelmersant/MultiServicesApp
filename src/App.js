import React, { Component } from "react";
import { Route, Redirect, Switch } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Customers from "./components/customers";
import CustomerForm from "./components/forms/customerForm";
import NotFound from "./components/notFound";
import NavBar from "./components/navBar";
import LoginForm from "./components/forms/loginForm";
import Logout from "./components/logout";
import InvoiceForm from "./components/forms/invoiceForm";
import Invoices from "./components/invoices";
import PrintInvoice from "./components/reports/printInvoice";
import Inventories from "./components/inventories";
import InventoriesFull from "./components/inventoriesFull";
import InventoryForm from "./components/forms/inventoryForm";
import InventoryFullForm from "./components/forms/inventoryFullForm";
import Products from "./components/products";
import ProductForm from "./components/forms/productForm";
import Companies from "./components/companies";
import CompanyForm from "./components/forms/companyForm";
import Users from "./components/users";
import UserForm from "./components/forms/userForm";
import ProductsCategories from "./components/productCategories";
import ProductCategoryForm from "./components/forms/productCategoryForm";
import NCF from "./components/ncf";
import NCFForm from "./components/forms/ncfForm";
import Providers from "./components/providers";
import ProviderForm from "./components/forms/providerForm";
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
            <ProtectedRoute path="/invoices" component={Invoices} />
            <Route path="/invoicePrint/:id" component={PrintInvoice} />

            <ProtectedRoute path="/invoice/:id" component={InvoiceForm} />
            <ProtectedRoute path="/inventories" component={Inventories} />
            <ProtectedRoute
              path="/inventoriesFull"
              component={InventoriesFull}
            />
            <ProtectedRoute path="/inventory/:id" component={InventoryForm} />
            <ProtectedRoute
              path="/inventoryFull/:id"
              component={InventoryFullForm}
            />
            <ProtectedRoute path="/customers" component={Customers} />
            <ProtectedRoute path="/customer/:id" component={CustomerForm} />
            <ProtectedRoute path="/products" component={Products} />
            <ProtectedRoute path="/product/:id" component={ProductForm} />
            <ProtectedRoute path="/providers" component={Providers} />
            <ProtectedRoute path="/provider/:id" component={ProviderForm} />
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
      </React.Fragment>
    );
  }
}

export default App;
