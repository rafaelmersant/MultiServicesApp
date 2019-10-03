import React from "react";
import Joi from "joi-browser";
import Form from "./common/form";
import SearchProduct from "./common/searchProduct";
import { getCompanies } from "../services/companyService";
import { getProducts } from "../services/productService";
import { getCurrentUser } from "../services/authService";
import { saveProductTracking } from "../services/inventoryService";

class InventoryForm extends Form {
  state = {
    data: {
      id: 0,
      product_id: "",
      typeTracking: "E",
      quantity: "",
      available: 0,
      company_id: getCurrentUser().companyId,
      createdUser: getCurrentUser().email,
      creationDate: new Date().toISOString()
    },
    products: [],
    companies: [],
    typeTrackings: [{ id: "E", name: "Entrada" }, { id: "S", name: "Salida" }],
    errors: {},
    action: "Nuevo Registro",
    hideSearch: false
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
    creationDate: Joi.string(),
    available: Joi.optional()
  };

  async populateCompanies() {
    const { data: companies } = await getCompanies();
    this.setState({ companies });
  }

  async populateProducts() {
    const { data: products } = await getProducts();
    this.setState({ products });
  }

  handleSelect = product => {
    const data = { ...this.state.data };
    data.product_id = product.id;

    this.setState({ data, hideSearch: true });
  };

  handleFocus = () => {
    this.setState({ hideSearch: false });
  };

  async componentDidMount() {
    await this.populateCompanies();
    await this.populateProducts();
  }

  doSubmit = async () => {
    await saveProductTracking(this.state.data);

    this.props.history.push("/inventories");
  };

  render() {
    return (
      <div className="container pull-left col-5 ml-3 shadow-lg p-3 mb-5 bg-white rounded">
        <h2 className="bg-dark text-light pl-2 pr-2">{this.state.action}</h2>
        <div className="col-12 pb-3 bg-light">
          <SearchProduct
            onSelect={this.handleSelect}
            onFocus={this.handleFocus}
            hide={this.state.hideSearch}
          />

          <form onSubmit={this.handleSubmit}>
            {this.renderSelect("product_id", "Producto", this.state.products)}
            {this.renderSelect(
              "typeTracking",
              "Tipo",
              this.state.typeTrackings
            )}
            {this.renderInput("quantity", "Cantidad")}

            <div className="row">
              <div className="col">
                {this.renderSelect(
                  "company_id",
                  "Compañía",
                  this.state.companies
                )}
              </div>
              <div className="col">
                {this.renderInput(
                  "available",
                  "Disponible",
                  "text",
                  "disabled"
                )}
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
