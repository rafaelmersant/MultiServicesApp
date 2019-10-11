import React from "react";
import Joi from "joi-browser";
import DatePicker from "react-datepicker";
import { toast } from "react-toastify";
import Form from "./common/form";
import { getEntryById, saveEntry } from "../services/ncfService";
import { getCurrentUser } from "../services/authService";
import "react-datepicker/dist/react-datepicker.css";

class NCFForm extends Form {
  state = {
    data: {
      id: 0,
      typeDoc: "BC01",
      start: 0,
      end: 0,
      current: 0,
      dueDate: new Date().toISOString().slice(0, 10),
      active: 1,
      company_id: getCurrentUser().companyId,
      createdUser: getCurrentUser().email,
      creationDate: new Date().toISOString()
    },
    dueDate: new Date(),
    errors: {},
    action: "Nueva Secuencia"
  };

  schema = {
    id: Joi.number(),
    typeDoc: Joi.string().required(),
    start: Joi.number()
      .required()
      .label("Secuencia Inicia"),
    end: Joi.number()
      .required()
      .label("Secuencia Termina"),
    current: Joi.optional(),
    dueDate: Joi.string()
      .required()
      .label("Secuencia Vence"),
    active: Joi.optional(),
    company_id: Joi.number().label("Compañîa"),
    createdUser: Joi.string(),
    creationDate: Joi.string()
  };

  async populateEntry() {
    try {
      const entryId = this.props.match.params.id;
      if (entryId === "new") return;

      const { data: entry } = await getEntryById(entryId);

      this.setState({
        data: this.mapToViewModel(entry),
        action: "Visualizando Detalle de Registro"
      });
    } catch (ex) {
      if (ex.response && ex.response.status === 404)
        return this.props.history.replace("/not-found");
    }
  }

  handleChangeDueDate = date => {
    const entry = { ...this.state.data };
    let _date = new Date(date);
    _date.setDate(_date.getDate() + 1);
    entry.dueDate = new Date(_date).toISOString().slice(0, 10);

    this.setState({ data: entry, dueDate: date });
  };

  async componentDidMount() {
    await this.populateEntry();
  }

  mapToViewModel(entry) {
    return {
      id: entry[0].id,
      typeDoc: entry[0].typeDoc,
      start: entry[0].start,
      end: entry[0].end,
      current: entry[0].current,
      dueDate: entry[0].dueDate,
      active: entry[0].active,
      company_id: entry[0].company.id,
      createdUser: entry[0].createdUser
        ? entry[0].createdUser
        : getCurrentUser().email,
      creationDate: entry[0].creationDate
    };
  }

  doSubmit = async () => {
    if (this.state.data.end <= this.state.data.start) {
      toast.error("La secuencia inicial no puede ser mayor que la final.");
      return false;
    }

    await saveEntry(this.state.data);

    this.props.history.push("/ncf");
  };

  render() {
    return (
      <div className="container pull-left col-lg-8 col-md-8 col-sm-9 ml-3 shadow-lg p-3 mb-5 bg-white rounded">
        <h2 className="bg-dark text-light pl-2 pr-2">{this.state.action}</h2>
        <div className="col-12 pb-3 bg-light">
          <form onSubmit={this.handleSubmit}>
            {this.renderInput("typeDoc", "Tipo de NCF", "text", "disabled")}

            {this.renderInput("start", "Secuencia Inicial")}
            {this.renderInput("end", "Secuencia Termina")}

            <div className="row">
              <div className="col">
                <label>Secuencia Vence</label>
              </div>
            </div>

            <div className="row mb-4">
              <div className="col ml-0">
                <DatePicker
                  selected={this.state.dueDate}
                  onChange={date => this.handleChangeDueDate(date)}
                  dateFormat="MM/dd/yyyy"
                  locale="en"
                />
              </div>
            </div>

            {this.renderButton("Guardar")}
          </form>
        </div>
      </div>
    );
  }
}

export default NCFForm;