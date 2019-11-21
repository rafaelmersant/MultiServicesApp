import React from "react";
import Joi from "joi-browser";
import DatePicker from "react-datepicker";
import { toast } from "react-toastify";
import Form from "../common/form";
import { getEntryById, saveEntry, getEntries } from "../../services/ncfService";
import { getCurrentUser } from "../../services/authService";
import "react-datepicker/dist/react-datepicker.css";

class NCFForm extends Form {
  state = {
    data: {
      id: 0,
      typeDoc: "B01",
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
    typeDoc: [
      { id: "B01", name: "B01" },
      { id: "B02", name: "B02" }
    ],
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
    this.setState({ dueDate: date });
  };

  deactivateOldEntries = async typeDoc => {
    const { data: entries } = await getEntries(
      typeDoc,
      getCurrentUser().companyId
    );
    entries.forEach(async item => {
      const entry = { ...item };
      entry.active = false;
      entry.company_id = entry.company.id;
      await saveEntry(entry);
    });
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
    if (parseInt(this.state.data.end) <= parseInt(this.state.data.start)) {
      toast.error("La secuencia inicial no puede ser mayor que la final.");
      return false;
    }

    this.deactivateOldEntries(this.state.data.typeDoc);

    const data = { ...this.state.data };
    data.dueDate = this.state.dueDate.toISOString();
    this.setState({ data });

    setTimeout(async () => {
      await saveEntry(this.state.data);
      this.props.history.push("/ncf");
    }, 200);
  };

  render() {
    return (
      <div className="container pull-left col-lg-8 col-md-8 col-sm-9 ml-3 shadow-lg p-3 mb-5 bg-white rounded">
        <h2 className="bg-dark text-light pl-2 pr-2">{this.state.action}</h2>
        <div className="col-12 pb-3 bg-light">
          <form onSubmit={this.handleSubmit}>
            {this.renderSelect("typeDoc", "Tipo de NCF", this.state.typeDoc)}

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
                  dateFormat="yyyy/MM/dd"
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
