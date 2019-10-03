import React from "react";
import Joi from "joi-browser";
import Form from "./common/form";
import { getCompanies } from "../services/companyService";
import { getProductsCategories } from "../services/productCategoryService";
import { getProduct, saveProduct } from "../services/productService";
import { getCurrentUser } from "../services/authService";

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
      company_id: "",
      createdUser: getCurrentUser().email,
      creationDate: new Date().toISOString()
    },
    companies: [],
    categories: [],
    errors: {},
    action: "Nuevo Producto"
  };

  schema = {
    id: Joi.number(),
    description: Joi.string()
      .required()
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
    company_id: Joi.number().label("Compañîa"),
    createdUser: Joi.string(),
    creationDate: Joi.string()
  };

  async populateCompanies() {
    const { data: companies } = await getCompanies();
    this.setState({ companies });
  }

  async populateCategories() {
    const { data: categories } = await getProductsCategories();
    this.setState({ categories });
  }

  async populateProduct() {
    try {
      const productId = this.props.match.params.id;
      if (productId === "new") return;

      const { data: product } = await getProduct(productId);

      this.setState({
        data: this.mapToViewModel(product),
        action: "Editar Producto"
      });
    } catch (ex) {
      if (ex.response && ex.response.status === 404)
        return this.props.history.replace("/not-found");
    }
  }

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
      company_id: product[0].company.id,
      createdUser: product[0].createdUser
        ? product[0].createdUser
        : getCurrentUser().email,
      creationDate: product[0].creationDate
    };
  }

  doSubmit = async () => {
    await saveProduct(this.state.data);

    this.props.history.push("/products");
  };

  render() {
    return (
      <div className="container pull-left col-6 ml-3 shadow-lg p-3 mb-5 bg-white rounded">
        <h2 className="bg-dark text-light pl-2 pr-2">{this.state.action}</h2>
        <div className="col-12 pb-3 bg-light">
          <form onSubmit={this.handleSubmit}>
            <div className="form-row">
              <div className="form-group col-12">
                {this.renderInput("description", "Descripción")}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group col-12">
                {this.renderInput("descriptionLong", "Descripción Larga")}
              </div>
            </div>

            <div className="row">
              <div className="col">{this.renderInput("price", "Precio")}</div>
              <div className="col">{this.renderInput("cost", "Costo")}</div>
              <div className="col">{this.renderInput("itbis", "ITBIS")}</div>
            </div>

            <div className="row">
              <div className="col">{this.renderInput("measure", "Medida")}</div>
              <div className="col">{this.renderInput("model", "Modelo")}</div>
            </div>

            {this.renderSelect(
              "category_id",
              "Categoria",
              this.state.categories
            )}
            {this.renderSelect("company_id", "Compañía", this.state.companies)}
            {this.renderButton("Guardar")}
          </form>
        </div>
      </div>
    );
  }
}

export default ProductForm;
