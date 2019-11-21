import React from "react";
import Joi from "joi-browser";
import Form from "../common/form";
import { getCompanies } from "../../services/companyService";
import {
  getProductCategory,
  saveProductCategory
} from "../../services/productCategoryService";
import { getCurrentUser } from "../../services/authService";

class ProductCategoryForm extends Form {
  state = {
    data: {
      id: 0,
      description: "",
      company_id: getCurrentUser().companyId,
      createdUser: getCurrentUser().email,
      creationDate: new Date().toISOString()
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
    createdUser: Joi.string(),
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
      createdUser: category[0].createdByUser,
      creationDate: category[0].creationDate
    };
  }

  doSubmit = async () => {
    console.log(this.state.data);
    const { data: category } = await saveProductCategory(this.state.data);

    if (!this.props.popUp) this.props.history.push("/productsCategories");
    else this.props.closeMe(category);
  };

  render() {
    const { user, popUp } = this.props;
    const _standardSize =
      "container pull-left col-lg-6 col-md-7 col-sm-9 ml-3 shadow-lg p-3 mb-5 bg-white rounded";
    const _fullSize =
      "container pull-left col-lg-12 col-md-12 col-sm-12  shadow-lg p-3 mb-5 bg-white rounded";
    const containerSize = popUp ? _fullSize : _standardSize;

    return (
      <div className={containerSize}>
        {!popUp && (
          <h2 className="bg-dark text-light pl-2 pr-2">{this.state.action}</h2>
        )}
        <div className="col-12 pb-3 bg-light">
          <form onSubmit={this.handleSubmit}>
            {this.renderInput("description", "Descripción")}
            {user &&
              user.role === "Admin" &&
              this.renderSelect("company_id", "Compañía", this.state.companies)}
            {this.renderButton("Guardar")}
          </form>
        </div>
      </div>
    );
  }
}

export default ProductCategoryForm;