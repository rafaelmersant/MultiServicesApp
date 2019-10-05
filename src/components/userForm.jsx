import React from "react";
import Joi from "joi-browser";
import Form from "./common/form";
import { getCompanies } from "../services/companyService";
import { getUser, saveUser } from "../services/userService";
import { getCurrentUser } from "../services/authService";

class UserForm extends Form {
  state = {
    data: {
      id: 0,
      email: "",
      password: "",
      name: "",
      userRole: "",
      company_id: getCurrentUser().companyId,
      userHash: "hash",
      createdUser: getCurrentUser().email,
      creationDate: new Date().toISOString()
    },
    companies: [],
    roles: [
      { id: "Admin", name: "Admin" },
      { id: "Level1", name: "Level1" },
      { id: "Level2", name: "Level2" },
      { id: "Reportes", name: "Reportes" }
    ],
    errors: {},
    action: "Nuevo Usuario"
  };

  schema = {
    id: Joi.number(),
    email: Joi.string()
      .required()
      .email()
      .label("Email"),
    password: Joi.string()
      .required()
      .min(8)
      .max(30)
      .label("Password"),
    name: Joi.string()
      .required()
      .min(5)
      .label("Nombre"),
    userRole: Joi.string()
      .required()
      .label("Rol"),
    company_id: Joi.number().label("Compañîa"),
    userHash: Joi.string().optional(),
    createdUser: Joi.string(),
    creationDate: Joi.string()
  };

  async populateCompanies() {
    const { data: companies } = await getCompanies();
    this.setState({ companies });
  }

  async populateUser() {
    try {
      const userId = this.props.match.params.id;
      if (userId === "new") return;

      const { data: user } = await getUser(userId);

      this.setState({
        data: this.mapToViewModel(user),
        action: "Editar Usuario"
      });
    } catch (ex) {
      if (ex.response && ex.response.status === 404)
        return this.props.history.replace("/not-found");
    }
  }

  async componentDidMount() {
    await this.populateCompanies();
    await this.populateUser();
  }

  mapToViewModel(user) {
    return {
      id: user[0].id,
      email: user[0].email,
      password: user[0].password,
      name: user[0].name,
      userRole: user[0].userRole,
      company_id: user[0].company.id,
      userHash: user[0].userHash ? user[0].userHash : "hash",
      createdUser: user[0].createdByUser
        ? user[0].createdByUser
        : getCurrentUser().email,
      creationDate: user[0].creationDate
    };
  }

  doSubmit = async () => {
    await saveUser(this.state.data);

    this.props.history.push("/users");
  };

  render() {
    return (
      <div className="container pull-left col-5 ml-3 shadow-lg p-3 mb-5 bg-white rounded">
        <h2 className="bg-dark text-light pl-2 pr-2">{this.state.action}</h2>
        <div className="col-12 pb-3 bg-light">
          <form onSubmit={this.handleSubmit}>
            {this.renderInput("email", "Email")}
            {this.renderInput("password", "Contraseña", "password")}
            {this.renderInput("name", "Nombre")}
            {this.renderSelect("userRole", "Rol", this.state.roles)}
            {this.renderSelect("company_id", "Compañía", this.state.companies)}
            {this.renderButton("Guardar")}
          </form>
        </div>
      </div>
    );
  }
}

export default UserForm;
