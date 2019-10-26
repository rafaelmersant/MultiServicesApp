import React from "react";
import Joi from "joi-browser";
import toast from "react-toastify";
import Form from "./common/form";
import SearchProduct from "./common/searchProduct";
import Input from "./common/input";
import ProductModal from "./modals/productModal";
import { formatNumber } from "../utils/custom";
import { getCurrentUser } from "../services/authService";
import { saveProduct } from "../services/productService";
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
      price: "",
      cost: "",
      provider: "",
      company_id: getCurrentUser().companyId,
      createdUser: getCurrentUser().email,
      creationDate: new Date().toISOString()
    },
    product: {},
    typeTrackings: [{ id: "E", name: "Entrada" }, { id: "S", name: "Salida" }],
    errors: {},
    action: "Nuevo Registro de Inventario",
    hideSearch: false,
    availableStock: 0,
    searchProductText: ""
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
    price: Joi.number()
      .required()
      .label("Precio"),
    cost: Joi.optional(),
    provider: Joi.optional(),
    company_id: Joi.number().label("Compañîa"),
    createdUser: Joi.string(),
    creationDate: Joi.string()
  };

  async getProductStock(productId) {
    const { data: stock } = await getProductsStocks(productId);

    if (stock.length)
      this.setState({ availableStock: stock[0].quantityAvailable });
  }

  handleSelectProduct = async product => {
    const handler = e => {
      e.preventDefault();
    };
    handler(window.event);

    if (product.id === 0) {
      this.raiseProductModal.click();
      return false;
    }

    const data = { ...this.state.data };
    data.product_id = product.id;
    data.price = product.price;
    data.cost = product.cost;

    this.getProductStock(product.id);

    this.setState({
      data,
      product,
      searchProductText: product.description,
      hideSearch: true
    });
  };

  handleFocusProduct = value => {
    setTimeout(() => {
      this.setState({ hideSearch: value });
    }, 200);
  };

  handleSetNewProduct = e => {
    this.setState({ searchProductText: `${e.description}` });
    this.handleSelectProduct(e);
  };

  async componentDidMount() {
    this._isMounted = true;
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  updateProduct = async () => {
    const product = { ...this.state.product };
    product.price = this.state.data.price;
    product.cost = this.state.data.cost;
    product.category_id = product.category.id;
    product.company_id = product.company.id;

    await saveProduct(product);
  };

  doSubmit = async () => {
    try {
      await saveProductTracking(this.state.data);

      const { data: inventory } = this.state;
      await updateProductStock(inventory);

      if (inventory.typeTracking === "E") this.updateProduct();

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
            onSelect={this.handleSelectProduct}
            onFocus={() => this.handleFocusProduct(false)}
            onBlur={() => this.handleFocusProduct(true)}
            hide={this.state.hideSearch}
            companyId={getCurrentUser().companyId}
            value={this.state.searchProductText}
            label="Producto"
          />

          <form onSubmit={this.handleSubmit}>
            <div className="row">
              <div className="col">
                {this.renderSelect(
                  "typeTracking",
                  "Tipo",
                  this.state.typeTrackings
                )}
              </div>
              <div className="col">
                {this.renderInput("quantity", "Cantidad")}
              </div>
            </div>

            <div className="row">
              <div className="col">{this.renderInput("price", "Precio")}</div>
              <div className="col">{this.renderInput("cost", "Costo")}</div>
            </div>

            {this.renderInput("provider", "Proveedor")}

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

            <button
              type="button"
              data-toggle="modal"
              data-target="#productModal"
              hidden="hidden"
              ref={button => (this.raiseProductModal = button)}
            ></button>
          </form>

          <ProductModal setNewProduct={this.handleSetNewProduct} />
        </div>
      </div>
    );
  }
}

export default InventoryForm;
