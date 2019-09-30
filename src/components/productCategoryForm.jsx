import React from "react";
import Joi from "joi-browser";
import Form from "./common/form";
import { getCompanies } from "../services/companyService";
import {
  getProductCategory,
  saveProductCategory
} from "../services/productCategoryService";
import { getCurrentUser } from "../services/authService";

class ProductCategoryForm extends Form {
  state = {
    data: {
      id: 0,
      description: "",
      company_id: "",
      createdByUser: getCurrentUser().email,
      creationDate: new Date().toDateString("")
    },
    companies: [],
    errors: {},
    action: "Nueva Categoria"
  };

  schema = {
    id: Joi.number(),
    description: Joi.string()
      .required()
      .min(3)
      .label("Categoria"),
    company_id: Joi.number().label("Compañîa"),
    createdByUser: Joi.string(),
    creationDate: Joi.string()
  };

  async populateCompanies() {
    const { data: companies } = await getCompanies();
    this.setState({ companies });
  }

  async populateCategory() {
    try {
      const categoryId = this.props.match.params.id;
      if (categoryId === "new") return;

      const { data: category } = await getProductCategory(categoryId);

      this.setState({
        data: this.mapToViewModel(category),
        action: "Editar Categoria"
      });
    } catch (ex) {
      if (ex.response && ex.response.status === 404)
        return this.props.history.replace("/not-found");
    }
  }

  async componentDidMount() {
    await this.populateCompanies();
    await this.populateCategory();
  }

  mapToViewModel(category) {
    return {
      id: category[0].id,
      description: category[0].description,
      company_id: category[0].company.id,
      createdByUser: category[0].createdByUser,
      creationDate: category[0].creationDate
    };
  }

  doSubmit = async () => {
    await saveProductCategory(this.state.data);

    this.props.history.push("/productsCategories");
  };

  render() {
    return (
      <div className="col-3 ml-4">
        <h1>{this.state.action}</h1>
        <form onSubmit={this.handleSubmit}>
          {this.renderInput("description", "Descripción")}
          {this.renderSelect("company_id", "Compañía", this.state.companies)}
          {this.renderButton("Guardar")}
        </form>
      </div>
    );
  }
}

export default ProductCategoryForm;
