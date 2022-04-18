import React from "react";
import Joi from "joi-browser";
import { toast } from "react-toastify";
import Form from "../common/form";
import { getCompanies } from "../../services/companyService";
import {
  getCustomer,
  saveCustomer,
  getCustomerByFirstLastName,
} from "../../services/customerService";
import { getCurrentUser } from "../../services/authService";

class CustomerForm extends Form {
  state = {
    data: {
      id: 0,
      firstName: "",
      lastName: "",
      email: "",
      address: "",
      phoneNumber: "",
      identification: "",
      identificationType: "0",
      company_id: getCurrentUser().companyId,
      createdUser: getCurrentUser().email,
      creationDate: new Date().toISOString(),
    },
    companies: [],
    identificationTypes: [
      { id: "0", name: "Seleccionar..." },
      { id: "C", name: "Cédula" },
      { id: "R", name: "RNC" },
    ],
    errors: {},
    action: "Nuevo Cliente",
  };

  schema = {
    id: Joi.number(),
    firstName: Joi.string().required().max(100).min(3).label("Nombre"), //.regex(/^\w+(?:\s+\w+)*$/),
    lastName: Joi.string()
      .required()
      .min(3)
      .max(100)
      .label("Apellidos"),
    email: Joi.optional(),
    address: Joi.string().required().min(10).label("Dirección"),
    phoneNumber: Joi.optional(),
    identification: Joi.string().max(20).optional(),
    identificationType: Joi.optional(),
    company_id: Joi.number().required().label("Compañîa"),
    createdUser: Joi.string(),
    creationDate: Joi.string(),
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
        data: this.mapToViewModel(customer.results),
        action: "Editar Cliente",
      });
    } catch (ex) {
      if (ex.response && ex.response.status === 404)
        return this.props.history.replace("/not-found");
    }
  }

  async componentDidMount() {
    await this.populateCompanies();
    await this.populateCustomer();

    if (this.props.customerName && this.props.customerName.length) {
      const data = { ...this.state.data };
      data.firstName = this.props.customerName;
      this.setState({ data });
      this.forceUpdate();
    }
  }

  mapToViewModel(customer) {
    return {
      id: customer[0].id,
      firstName: customer[0].firstName,
      lastName: customer[0].lastName,
      email: customer[0].email ? customer[0].email : "",
      address: customer[0].address ? customer[0].address : "",
      phoneNumber: customer[0].phoneNumber ? customer[0].phoneNumber : "",
      identificationType: customer[0].identificationType
        ? customer[0].identificationType
        : "0",
      identification: customer[0].identification
        ? customer[0].identification
        : "",
      company_id: customer[0].company.id,
      createdUser: customer[0].createdByUser
        ? customer[0].createdByUser
        : getCurrentUser().email,
      creationDate: customer[0].creationDate,
    };
  }

  doSubmit = async () => {
    const { data: _customer } = await getCustomerByFirstLastName(
      getCurrentUser().companyId,
      this.state.data.firstName.toUpperCase(),
      this.state.data.lastName.toUpperCase()
    );

    if (_customer.length > 0 && this.state.data.id === 0) {
      toast.error("Este cliente ya existe!");
      return false;
    }

    const { data } = { ...this.state };
    data.firstName = data.firstName.toUpperCase();
    data.lastName = data.lastName.toUpperCase();

    const { data: customer } = await saveCustomer(data);

    if (!this.props.popUp) this.props.history.push("/customers");
    else this.props.closeMe(customer);
  };

  render() {
    const { user, popUp } = this.props;

    return (
      <div className="container-fluid">
        {!popUp && (
          <h3 className="bg-dark text-light list-header">
            {this.state.action}
          </h3>
        )}

        <div className="col-12 pb-3 bg-light">
          <form onSubmit={this.handleSubmit}>
            <div className="row">
              <div className="col">
                {this.renderInput("firstName", "Nombre")}
              </div>
              <div className="col">
                {this.renderInput("lastName", "Apellidos")}
              </div>
            </div>
            <div className="row">
              <div className="col">{this.renderInput("email", "Email")}</div>
              <div className="col">
                {this.renderInput("phoneNumber", "Teléfono")}
              </div>
            </div>
            <div className="row">
              <div className="col">
                {this.renderSelect(
                  "identificationType",
                  "Tipo de Identificación",
                  this.state.identificationTypes
                )}
              </div>
              <div className="col">
                {this.renderInput("identification", "Identificación")}
              </div>
            </div>

            {this.renderInput("address", "Dirección")}
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

export default CustomerForm;
