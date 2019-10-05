import React from "react";
import Joi from "joi-browser";
import toast from "react-toastify";
import Form from "./common/form";
import Input from "./common/input";
import SearchProduct from "./common/searchProduct";
import SearchCustomer from "./common/searchCustomer";
import { getCurrentUser } from "../services/authService";
import { getProducts } from "../services/productService";
import { saveInvoiceHeader } from "../services/invoiceServices";

class InvoiceForm extends Form {
  state = {
    data: {
      id: 0,
      sequence: "",
      customer_id: "",
      ncf: "",
      paymentMethod: "",
      paid: true,
      reference: "",
      company_id: getCurrentUser().companyId,
      createdUser: getCurrentUser().email,
      creationDate: new Date().toISOString()
    },
    products: [],
    details: [],
    companies: [],
    line: {
      product_id: 0,
      quantity: 0,
      price: 0,
      itbis: 0,
      discount: 0,
      total: 0
    },
    paymentMethods: [
      { id: "CASH", name: "Efectivo" },
      { id: "CREDIT", name: "Tarjet de Credito" }
    ],
    errors: {},
    action: "Nueva Factura",
    hideSearchProduct: false,
    hideSearchCustomer: false
  };

  //Schema (Joi)
  schema = {
    id: Joi.number(),
    sequence: Joi.number().label("No. Factura"),
    customer_id: Joi.number().label("Cliente"),
    ncf: Joi.optional().label("NCF"),
    paymentMethod: Joi.string()
      .required()
      .label("Cantidad"),
    paid: Joi.optional(),
    reference: Joi.optional(),
    company_id: Joi.number().label("Compañîa"),
    createdUser: Joi.string(),
    creationDate: Joi.string()
  };

  async populateProducts() {
    const companyId = getCurrentUser().companyId;
    const { data: products } = await getProducts(companyId);
    this.setState({ products });
  }

  handleSelectProduct = async product => {
    const data = { ...this.state.data };
    data.product_id = product.id;

    this.setState({ data, hideSearchProduct: true });
  };

  handleFocusProduct = value => {
    setTimeout(() => {
      this.setState({ hideSearchProduct: value });
    }, 200);
  };

  handleSelectCustomer = async customer => {
    const handler = e => {
      e.preventDefault();
    };
    handler(window.event);

    const data = { ...this.state.data };
    data.customer_id = customer.id;

    this.setState({
      data,
      hideSearchCustomer: true,
      searchCustomerText: `${customer.firstName} ${customer.lastName}`
    });
  };

  handleFocusCustomer = value => {
    setTimeout(() => {
      this.setState({ hideSearchCustomer: value });
    }, 200);
  };

  async componentDidMount() {
    await this.populateProducts();
  }

  doSubmit = async () => {
    try {
      await saveInvoiceHeader(this.state.data);

      this.props.history.push("/invoices");
    } catch (ex) {
      if (ex.response && ex.response.status >= 400 && ex.response.status < 500)
        toast.error("Hubo un error en la información enviada.");

      if (ex.response && ex.response.status >= 500) {
        const errors = { ...this.state.errors };
        errors.email = ex.response.data;
        this.setState({ errors });

        toast.error(
          "Parece que hubo un error en el servidor. Favor contacte al administrador."
        );
        console.log("errors", this.state.errors);
      }
    }
  };

  render() {
    return (
      <div className="container pull-left col-7 ml-3 shadow-lg p-3 mb-5 bg-white rounded">
        <h2 className="bg-dark text-light pl-2 pr-2">{this.state.action}</h2>
        <div className="col-12 pb-3 bg-light">
          <form onSubmit={this.handleSubmit}>
            <SearchCustomer
              onSelect={this.handleSelectCustomer}
              onFocus={() => this.handleFocusCustomer(false)}
              onBlur={() => this.handleFocusCustomer(true)}
              hide={this.state.hideSearchCustomer}
              value={this.state.searchCustomerText}
              companyId={getCurrentUser().companyId}
            />

            {this.renderInput("sequence", "No. Factura")}
            {this.renderSelect(
              "paymentMethod",
              "Metodo de Pago",
              this.state.paymentMethods
            )}
            {this.renderInput("ncf", "NCF")}
            {this.renderInput("reference", "Referencia")}
            <div className="col mt-4">
              <input
                type="checkbox"
                className="form-check-input"
                id="invoiceTracking"
              />
              <label className="form-check-label" htmlFor="invoiceTracking">
                Pagada
              </label>
            </div>

            {this.renderInput("quantity", "Cantidad")}
            <SearchProduct
              onSelect={this.handleSelectProduct}
              onFocus={() => this.handleFocus(false)}
              onBlur={() => this.handleFocus(true)}
              hide={this.state.hideSearchProduct}
              companyId={getCurrentUser().companyId}
            />
            <Input
              disabled="disabled"
              type="text"
              name="price"
              value={this.state.line.price}
              label="Precio"
            />
            {this.renderButton("Guardar")}
          </form>
        </div>
      </div>
    );
  }
}

export default InvoiceForm;
