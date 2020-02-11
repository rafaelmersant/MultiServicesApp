import React from "react";
import Joi from "joi-browser";
import { toast } from "react-toastify";
import Form from "../common/form";
import Input from "../common/input";
import { formatNumber } from "../../utils/custom";
import PriceCalculation from "../common/priceCalculation";
import { getCompanies } from "../../services/companyService";
import { getProductsCategories } from "../../services/productCategoryService";
import {
  getProduct,
  saveProduct,
  getProductByExactDescription
} from "../../services/productService";
import { getCurrentUser } from "../../services/authService";
import {
  getProductsStocks,
  updateProductStock,
  saveProductTracking
} from "../../services/inventoryService";
import CategoryModal from "../modals/categoryModal";

class ProductForm extends Form {
  state = {
    data: {
      id: 0,
      description: "",
      descriptionLong: "",
      price: "",
      cost: 0,
      itbis: 0,
      measure: "",
      model: "",
      category_id: "",
      barcode: "",
      company_id: getCurrentUser().companyId,
      createdUser: getCurrentUser().email,
      creationDate: new Date().toISOString()
    },
    quantity: 0,
    itbis: false,
    companies: [],
    categories: [],
    errors: {},
    availableStock: 0,
    action: "Nuevo Producto"
  };

  schema = {
    id: Joi.number(),
    description: Joi.string()
      .required()
      .max(100)
      .label("Descripción"),
    descriptionLong: Joi.optional(),
    price: Joi.number()
      .required()
      .label("Precio"),
    cost: Joi.optional(),
    itbis: Joi.optional(),
    measure: Joi.optional(),
    model: Joi.optional(),
    category_id: Joi.number().label("Categoria"),
    barcode: Joi.optional(),
    company_id: Joi.number().label("Compañîa"),
    createdUser: Joi.string(),
    creationDate: Joi.string()
  };

  async updateInventory(productId, quantity) {
    if (productId > 0) {
      const inventory = {
        header_id: 1,
        id: 0,
        product_id: productId,
        typeTracking: "E",
        concept: "INVE",
        quantity: quantity,
        company_id: getCurrentUser().companyId,
        createdUser: getCurrentUser().email,
        creationDate: new Date().toISOString()
      };

      await saveProductTracking(inventory);
      await updateProductStock(inventory);
    }
  }

  async populateCompanies() {
    const { data: companies } = await getCompanies();
    this.setState({ companies });
  }

  async populateCategories() {
    const { data: categories } = await getProductsCategories(
      getCurrentUser().companyId
    );

    this.setState({ categories });
  }

  async populateProduct() {
    try {
      const productId = this.props.match.params.id;
      if (productId === "new") return;

      this.getProductStock(productId);
      const { data: product } = await getProduct(productId);

      this.setState({
        data: this.mapToViewModel(product.results),
        itbis: product.results[0].itbis > 0,
        action: "Editar Producto"
      });
    } catch (ex) {
      if (ex.response && ex.response.status === 404)
        return this.props.history.replace("/not-found");
    }
  }

  async getProductStock(productId) {
    const { data: stock } = await getProductsStocks(productId);
    if (stock.length)
      this.setState({ availableStock: stock[0].quantityAvailable });
  }

  handleSetNewCategory = e => {
    const handler = e => {
      e.preventDefault();
    };
    handler(window.event);

    this.populateCategories();

    const data = { ...this.state.data };
    data.category_id = e.id;
    this.setState({ data });
  };

  handleChangeITBIS = e => {
    const { data } = { ...this.state };

    if (!this.state.itbis) {
      if (data.cost > 0)
        data.itbis = Math.round(parseFloat(data.cost * 0.18) * 100) / 100;
    } else {
      data.itbis = 0;
    }

    this.setState({ data, itbis: !this.state.itbis });
  };

  handleChangeCost = ({ currentTarget: input }) => {
    const data = { ...this.state.data };
    data.cost = input.value;

    if (this.state.itbis) {
      if (input.value.length > 0)
        data.itbis = Math.round(parseFloat(input.value * 0.18) * 100) / 100;
    } else {
      data.itbis = 0;
    }

    this.setState({ data });
  };

  handleChangeQuantity = ({ currentTarget: input }) => {
    this.setState({ quantity: input.value });
  };

  handleChangeCalculation = e => {
    const data = { ...this.state.data };
    data.cost = e.priceC2;
    data.price = e.priceSales;
    data.itbis = e.itbis > 0 ? e.itbis : 0;

    this.setState({ data, itbis: e.itbis > 0 });
  };

  async componentDidMount() {
    await this.populateCompanies();
    await this.populateCategories();
    await this.populateProduct();
  }

  mapToViewModel(product) {
    return {
      id: product[0].id,
      description: product[0].description,
      descriptionLong: product[0].descriptionLong
        ? product[0].descriptionLong
        : "",
      price: product[0].price,
      cost: product[0].cost ? product[0].cost : 0,
      itbis: product[0].itbis ? product[0].itbis : 0,
      measure: product[0].measure ? product[0].measure : "",
      model: product[0].model ? product[0].model : "",
      category_id: product[0].category.id,
      barcode: product[0].barcode ? product[0].barcode : "",
      company_id: product[0].company.id,
      createdUser: product[0].createdUser
        ? product[0].createdUser
        : getCurrentUser().email,
      creationDate: product[0].creationDate
    };
  }

  doSubmit = async () => {
    const descrp = this.state.data.description
      .toUpperCase()
      .split(" ")
      .join("%20");
    const { data: _product } = await getProductByExactDescription(
      getCurrentUser().companyId,
      descrp
    );

    if (_product.results.length > 0 && this.state.data.id === 0) {
      toast.error("Este producto ya existe!");
      return false;
    }

    const { data } = { ...this.state };
    data.description = data.description.toUpperCase();
    const { data: product } = await saveProduct(data);

    if (this.state.quantity > 0)
      await this.updateInventory(product.id, this.state.quantity);

    if (!this.props.popUp) this.props.history.push("/products");
    else this.props.closeMe(product);
  };

  render() {
    const { popUp } = this.props;
    const _standardSize =
      "container pull-left col-lg-8 col-md-8 col-sm-9 ml-3 shadow p-3 mb-5 bg-white rounded border";
    const _fullSize =
      "container pull-left col-lg-12 col-md-12 col-sm-12 p-3 mb-5 bg-white rounded border";
    const _customCol = popUp ? "col-3" : "col-2";
    const containerSize = popUp ? _fullSize : _standardSize;

    return (
      <div className={containerSize}>
        {!popUp && (
          <h2 className="bg-dark text-light pl-2 pr-2">{this.state.action}</h2>
        )}

        <div className="col-12 pb-3 bg-light">
          <form onSubmit={this.handleSubmit}>
            <div className="row">
              <div className="col-9 col-md-8">
                {this.renderInput("description", "Descripción")}
              </div>

              <div className="col-3 col-md-4">
                {this.renderInput("barcode", "Código de Barra")}
              </div>
            </div>

            {/* <div className="form-row">
              <div className="form-group col-12">
                {this.renderInput("descriptionLong", "Descripción Larga")}
              </div>
            </div> */}
            <div className="row">
              <div className="col">
                {this.renderInput("measure", "Almacen")}
              </div>
              <div className="col">
                {this.renderInput("model", "Tramo/Nivel")}
              </div>
            </div>

            <PriceCalculation onChange={this.handleChangeCalculation} />

            <div className="row">
              <div className={_customCol}>
                <Input
                  type="text"
                  name="cost"
                  value={this.state.data.cost}
                  label="Costo"
                  onChange={this.handleChangeCost}
                />
              </div>

              <div className={_customCol}>
                {this.renderInput("price", "Precio")}
              </div>
              <div
                className="col-1"
                style={{
                  marginTop: "35px",
                  maxWidth: "10px",
                  marginRight: "-22px"
                }}
              >
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="chkITBIS"
                  title="Click para activar/desactivar ITBIS"
                  checked={this.state.itbis}
                  onChange={this.handleChangeITBIS}
                />
              </div>
              <div className={_customCol}>
                {this.renderInput("itbis", "ITBIS", "text", "disabled")}
              </div>
              <div className="col-5">
                <Input
                  disabled="disabled"
                  type="text"
                  name="available"
                  value={formatNumber(this.state.availableStock)}
                  label="Disponible en inventario"
                />
              </div>
            </div>

            <div className="row">
              <div className="col-5">
                {this.renderSelect(
                  "category_id",
                  "Categoria",
                  this.state.categories
                )}
              </div>

              {!popUp && (
                <div className="col-1 ml-0 pl-0">
                  <button
                    type="button"
                    className="fa fa-plus-circle"
                    data-toggle="modal"
                    data-target="#categoryModal"
                    style={{
                      color: "green",
                      border: "0",
                      backgroundColor: "transparent",
                      marginTop: "32px",
                      fontSize: "36px",
                      outline: "none"
                    }}
                  ></button>
                </div>
              )}
              <div className="col-5">
                <Input
                  type="text"
                  name="quantity"
                  value={this.state.quantity}
                  label="Cantidad para inventario"
                  onChange={this.handleChangeQuantity}
                />
              </div>
            </div>

            {false &&
              this.renderSelect("company_id", "Compañía", this.state.companies)}
            {this.renderButton("Guardar")}
          </form>
        </div>
        <CategoryModal setNewCategory={this.handleSetNewCategory} />
      </div>
    );
  }
}

export default ProductForm;
