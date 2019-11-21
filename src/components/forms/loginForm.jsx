import React from "react";
import { Redirect } from "react-router-dom";
import Joi from "joi-browser";
import Form from "../common/form";
import auth from "../../services/authService";
import { toast } from "react-toastify";
import { getCompany } from "../../services/companyService";

class LoginForm extends Form {
  state = {
    data: { email: "", password: "" },
    errors: {}
  };

  schema = {
    email: Joi.string()
      .required()
      .label("Email"),
    password: Joi.string()
      .required()
      .label("Contraseña")
  };

  doSubmit = async () => {
    try {
      const { data: credentials } = this.state;
      await auth.login(credentials);

      const companyId = await auth.getCurrentUser().companyId;
      const { data: company } = await getCompany(companyId);

      localStorage.setItem("ms_companyName", company[0].name);

      const { state } = this.props.location;
      window.location = state ? state.from.pathname : "/";
    } catch (ex) {
      if (ex.response && ex.response.status === 404)
        toast.error("Email/Contraseña incorrecto.");

      if (ex.response && ex.response.status === 400) {
        const errors = { ...this.state.errors };
        errors.email = ex.response.data;
        this.setState({ errors });
      }
    }
  };

  render() {
    if (auth.getCurrentUser()) return <Redirect to="/" />;

    return (
      <div className="container col-lg-5 col-md-6 col-sm-11 shadow-lg p-3 mb-5 bg-white rounded">
        <h2 className="bg-secondary text-light pl-2 pr-2">Login</h2>
        <div className="col-12 pb-3 bg-light">
          <form onSubmit={this.handleSubmit}>
            {this.renderInput("email", "Email")}
            {this.renderInput("password", "Contraseña", "password")}

            {this.renderButton("Login")}
          </form>
        </div>
      </div>
    );
  }
}

export default LoginForm;
