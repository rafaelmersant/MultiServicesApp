import React from "react";
import Joi from "joi-browser";
import Form from "./common/form";
import { getCompanies } from "../services/companyService";
import { getCustomer, saveCustomer } from "../services/customerService";
import { getCurrentUser } from "../services/authService";

class UserForm extends Form {
  state = {
    data: {
      id: 0,
      firstName: "",
      lastName: "",
      email: "",
      address: "",
      phoneNumber: "",
      company_id: "",
      createdByUser: getCurrentUser(),
      creationDate: new Date().toDateString("")
    },
    companies: [],
    errors: {},
    action: "Nuevo Cliente"
  };

  schema = {
    id: Joi.number(),
    firstName: Joi.string()
      .required()
      .max(100)
      .label("Nombre"),
    lastName: Joi.string()
      .required()
      .max(100)
      .label("Apellidos"),
    email: Joi.optional(),
    address: Joi.optional(),
    phoneNumber: Joi.optional(),
    company_id: Joi.number()
      .required()
      .label("Compañîa"),
    createdByUser: Joi.string(),
    creationDate: Joi.string()
  };

  async populateCompanies() {
    const { data: companies } = await getCompanies();
    this.setState({ companies });
  }

  async populateCustomer() {
    try {
      const customerId = this.props.match.params.id;
      if (customerId === "new") return;

      const { data: customer } = await getCustomer(customerId);

      this.setState({
        data: this.mapToViewModel(customer),
        action: "Editar Cliente"
      });
    } catch (ex) {
      if (ex.response && ex.response.status === 404)
        return this.props.history.replace("/not-found");
    }
  }

  async componentDidMount() {
    await this.populateCompanies();
    await this.populateCustomer();
  }

  mapToViewModel(customer) {
    return {
      id: customer[0].id,
      firstName: customer[0].firstName,
      lastName: customer[0].lastName,
      email: customer[0].email ? customer[0].email : "",
      address: customer[0].address ? customer[0].address : "",
      phoneNumber: customer[0].phoneNumber ? customer[0].phoneNumber : "",
      company_id: customer[0].company.id,
      createdByUser: customer[0].createdByUser
        ? customer[0].createdByUser
        : getCurrentUser(),
      creationDate: customer[0].creationDate
    };
  }

  doSubmit = async () => {
    await saveCustomer(this.state.data);

    this.props.history.push("/customers");
  };

  render() {
    return (
      <div className="col-3 ml-4">
        <h1>{this.state.action}</h1>
        <form onSubmit={this.handleSubmit}>
          {this.renderInput("firstName", "First Name")}
          {this.renderInput("lastName", "Last Name")}
          {this.renderInput("email", "Email")}
          {this.renderInput("address", "Dirección")}
          {this.renderInput("phoneNumber", "Teléfono")}
          {this.renderSelect("company_id", "Compañía", this.state.companies)}
          {this.renderButton("Guardar")}
        </form>
      </div>
    );
  }
}

export default UserForm;
