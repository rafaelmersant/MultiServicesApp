import React from "react";
import Form from "../common/form";
import Joi from "joi-browser";
import { getCurrentUser } from "../../services/authService";
import { getCompany, saveCompany } from "../../services/companyService";

class CompanyForm extends Form {
  state = {
    data: {
      id: 0,
      name: "",
      email: "",
      phoneNumber: "",
      rnc: "",
      address: "",
      createdUser: getCurrentUser().email,
      creationDate: new Date().toISOString()
    },
    errors: {},
    action: "Nueva Compañía"
  };

  schema = {
    id: Joi.number(),
    name: Joi.string()
      .required()
      .min(3)
      .label("Nombre de Compañía"),
    email: Joi.optional().label("Email"),
    phoneNumber: Joi.optional().label("Teléfono"),
    rnc: Joi.optional(),
    address: Joi.optional().label("Dirección"),
    createdUser: Joi.string(),
    creationDate: Joi.string()
  };

  async populateCompany() {
    try {
      const companyId = this.props.match.params.id;
      if (companyId === "new") return;

      const { data: company } = await getCompany(companyId);

      this.setState({
        data: this.mapToViewModel(company),
        action: "Editar Compañía"
      });
    } catch (ex) {
      if (ex.response && ex.response.status === 404)
        return this.props.history.replace("/not-found");
    }
  }

  async componentDidMount() {
    await this.populateCompany();
  }

  mapToViewModel(company) {
    return {
      id: company[0].id,
      name: company[0].name,
      email: company[0].email ? company[0].email : "",
      phoneNumber: company[0].phoneNumber ? company[0].phoneNumber : "",
      rnc: company[0].rnc ? company[0].rnc : "",
      address: company[0].address ? company[0].address : "",
      createdUser: company[0].createdUser
        ? company[0].createdUser
        : getCurrentUser().email,
      creationDate: company[0].creationDate
    };
  }

  doSubmit = async () => {
    await saveCompany(this.state.data);

    this.props.history.push("/companies");
  };

  render() {
    return (
      <div className="container pull-left col-6 ml-3 shadow-lg p-3 mb-5 bg-white rounded">
        <h2 className="bg-dark text-light pl-2 pr-2">{this.state.action}</h2>
        <div className="col-12 pb-3 bg-light">
          <form onSubmit={this.handleSubmit}>
            {this.renderInput("name", "Nombre")}
            <div className="row">
              <div className="col">{this.renderInput("email", "Email")}</div>
              <div className="col">
                {this.renderInput("phoneNumber", "Teléfono")}
              </div>
            </div>
            {this.renderInput("rnc", "RNC")}
            {this.renderInput("address", "Dirección")}
            {this.renderButton("Guardar")}
          </form>
        </div>
      </div>
    );
  }
}

export default CompanyForm;
