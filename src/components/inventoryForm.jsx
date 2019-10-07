import React from "react";
import Joi from "joi-browser";
import toast from "react-toastify";
import Form from "./common/form";
import SearchProduct from "./common/searchProduct";
import Input from "./common/input";
import Select from "./common/select";
import { formatNumber } from "../utils/custom";
import { getCompanies } from "../services/companyService";
import { getProducts } from "../services/productService";
import { getCurrentUser } from "../services/authService";
import {
  saveProductTracking,
  updateProductStock,
  getProductsStocks
} from "../services/inventoryService";

class InventoryForm extends Form {
  _isMounted = false;

  state = {
    data: {
      id: 0,
      product_id: "",
      typeTracking: "E",
      quantity: "",
      company_id: getCurrentUser().companyId,
      createdUser: getCurrentUser().email,
      creationDate: new Date().toISOString()
    },
    products: [],
    companies: [],
    typeTrackings: [{ id: "E", name: "Entrada" }, { id: "S", name: "Salida" }],
    errors: {},
    action: "Nuevo Registro de Inventario",
    hideSearch: false,
    availableStock: 0,
    searchProductInput: ""
  };

  schema = {
    id: Joi.number(),
    product_id: Joi.number().label("Producto"),
    typeTracking: Joi.string()
      .required()
      .label("Tipo"),
    quantity: Joi.number()
      .required()
      .label("Cantidad"),
    company_id: Joi.number().label("Compañîa"),
    createdUser: Joi.string(),
    creationDate: Joi.string()
  };

  async populateCompanies() {
    const { data: companies } = await getCompanies();
    this.setState({ companies });
  }

  async populateProducts() {
    const companyId = getCurrentUser().companyId;
    const { data: products } = await getProducts(companyId);
    this.setState({ products });
  }

  handleSelect = async product => {
    const data = { ...this.state.data };
    data.product_id = product.id;

    this.setState({ data, hideSearch: true });
  };

  handleFocus = value => {
    setTimeout(() => {
      this.setState({ hideSearch: value });
    }, 200);
  };

  handleChangeProduct = async ({ currentTarget: input }) => {
    const productId = input.value;
    const { data: stock } = await getProductsStocks(productId);

    if (stock.length)
      this.setState({ availableStock: stock[0].quantityAvailable });

    const updated = { ...this.state.data };
    updated.product_id = productId;
    this.setState({ data: updated, searchCustomerInput: "" });
  };

  async componentDidMount() {
    this._isMounted = true;

    await this.populateCompanies();
    await this.populateProducts();
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  doSubmit = async () => {
    try {
      await saveProductTracking(this.state.data);

      const { data: inventory } = this.state;
      await updateProductStock(inventory);

      this.props.history.push("/inventories");
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
        console.log(this.state.errors);
      }
    }
  };

  render() {
    return (
      <div className="container pull-left col-lg-6 col-md-11 col-sm-11 ml-3 shadow-lg p-3 mb-5 bg-white rounded">
        <h2 className="bg-dark text-light pl-2 pr-2">{this.state.action}</h2>
        <div className="col-12 pb-3 bg-light">
          <SearchProduct
            onSelect={this.handleSelect}
            onFocus={() => this.handleFocus(false)}
            onBlur={() => this.handleFocus(true)}
            hide={this.state.hideSearch}
            companyId={getCurrentUser().companyId}
            value={this.state.searchProductInput}
          />

          <form onSubmit={this.handleSubmit}>
            <Select
              name="product_id"
              value={this.state.data.product_id}
              label="Producto"
              options={this.state.products}
              onChange={this.handleChangeProduct}
              error={this.state.errors["product_id"]}
            />

            {this.renderSelect(
              "typeTracking",
              "Tipo",
              this.state.typeTrackings
            )}
            {this.renderInput("quantity", "Cantidad")}

            <div className="row">
              {false && (
                <div className="col">
                  {this.renderSelect(
                    "company_id",
                    "Compañía",
                    this.state.companies
                  )}
                </div>
              )}
              <div className="col">
                <Input
                  disabled="disabled"
                  type="text"
                  name="available"
                  value={formatNumber(this.state.availableStock)}
                  label="Disponible"
                />
              </div>
            </div>

            {this.renderButton("Guardar")}
          </form>
        </div>
      </div>
    );
  }
}

export default InventoryForm;
