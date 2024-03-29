import React from "react";
import Joi from "joi-browser";
import { toast } from "react-toastify";
import Form from "../common/form";
import { getCompanies } from "../../services/companyService";
import {
  getProvider,
  saveProvider,
  getProviderByFirstName,
} from "../../services/providerService";
import { getCurrentUser } from "../../services/authService";

class ProviderForm extends Form {
  state = {
    data: {
      id: 0,
      firstName: "",
      lastName: "",
      email: "",
      address: "",
      phoneNumber: "",
      rnc: "",
      company_id: getCurrentUser().companyId,
      createdUser: getCurrentUser().email,
      creationDate: new Date().toISOString(),
    },
    companies: [],
    errors: {},
    action: "Nuevo Proveedor",
  };

  schema = {
    id: Joi.number(),
    firstName: Joi.string().required().max(100).label("Nombre de Empresa"),
    lastName: Joi.optional(),
    email: Joi.optional(),
    address: Joi.optional(),
    phoneNumber: Joi.optional(),
    rnc: Joi.optional(),
    company_id: Joi.number().required().label("Compañîa"),
    createdUser: Joi.string(),
    creationDate: Joi.string(),
  };

  async populateCompanies() {
    const { data: companies } = await getCompanies();
    this.setState({ companies });
  }

  async populateProvider() {
    try {
      const providerId = this.props.match.params.id;
      if (providerId === "new") return;

      const { data: provider } = await getProvider(providerId);

      this.setState({
        data: this.mapToViewModel(provider),
        action: "Editar Proveedor",
      });
    } catch (ex) {
      if (ex.response && ex.response.status === 404)
        return this.props.history.replace("/not-found");
    }
  }

  async componentDidMount() {
    await this.populateCompanies();
    await this.populateProvider();

    if (this.props.providerName && this.props.providerName.length) {
      const data = { ...this.state.data };
      data.firstName = this.props.providerName;
      this.setState({ data });
      this.forceUpdate();
    }
  }

  mapToViewModel(provider) {
    return {
      id: provider[0].id,
      firstName: provider[0].firstName,
      lastName: provider[0].lastName,
      email: provider[0].email ? provider[0].email : "",
      address: provider[0].address ? provider[0].address : "",
      phoneNumber: provider[0].phoneNumber ? provider[0].phoneNumber : "",
      rnc: provider[0].rnc ? provider[0].rnc : "",
      company_id: provider[0].company.id,
      createdUser: provider[0].createdByUser
        ? provider[0].createdByUser
        : getCurrentUser().email,
      creationDate: provider[0].creationDate,
    };
  }

  doSubmit = async () => {
    const { data: _provider } = await getProviderByFirstName(
      getCurrentUser().companyId,
      this.state.data.firstName.toUpperCase()
    );

    if (_provider.length > 0 && this.state.data.id === 0) {
      toast.error("Este proveedor ya existe!");
      return false;
    }

    const { data } = { ...this.state };
    data.firstName = data.firstName.toUpperCase();
    const { data: provider } = await saveProvider(data);

    if (!this.props.popUp) this.props.history.push("/providers");
    else this.props.closeMe(provider);
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
                {this.renderInput("firstName", "Nombre de Empresa")}
              </div>
            </div>
            <div className="row">
              <div className="col">{this.renderInput("email", "Email")}</div>
              <div className="col">
                {this.renderInput("phoneNumber", "Teléfono")}
              </div>
              <div className="col">{this.renderInput("rnc", "RNC")}</div>
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

export default ProviderForm;
