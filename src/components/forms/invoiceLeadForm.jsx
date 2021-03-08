import React from "react";
import { NavLink } from "react-router-dom";
import Joi from "joi-browser";
import { toast } from "react-toastify";
import ReactToPrint from "react-to-print";
import Form from "../common/form";
import Input from "../common/input";
import Select from "../common/select";
import { formatNumber } from "../../utils/custom";
import { registerLocale } from "react-datepicker";
import es from "date-fns/locale/es";
import { getCurrentUser } from "../../services/authService";
import { getUserByEmail } from "../../services/userService";
import {
  getInvoiceHeader,
  getInvoiceDetail,
} from "../../services/invoiceServices";
import InvoiceDetailTable from "../tables/invoiceDetailTable";
import _ from "lodash";
import * as Sentry from "@sentry/react";
import TableBody from "../common/tableBody";
import {
  getInvoiceLeadHeader,
  saveInvoiceLeadHeader,
  saveInvoiceLeadDetail,
  getInvoiceLeadDetail,
} from "../../services/invoiceLeadServices";
import {
  mapToViewInvoiceDetail,
  mapToViewInvoiceDetailWithConduces,
  mapToViewInvoiceHeader,
  mapToViewInvoiceLeadHeader,
} from "../mappers/mapInvoiceLead";

registerLocale("es", es);

class InvoiceLeadForm extends Form {
  _isMounted = false;

  state = {
    data: {
      id: 0,
      invoice: "",
      company_id: getCurrentUser().companyId,
      createdUser: getCurrentUser().email,
      creationDate: new Date().toISOString(),
      serverDate: new Date().toISOString(),
    },
    invoiceHeader: {},
    details: [],
    line: {
      id: 0,
      invoice_id: 0,
      product_id: 0,
      product: "",
      quantity: 0,
      quantityDelivered: 0,
      quantityToDeliver: 0,
    },
    errors: {},
    currentProduct: {},
    createdUserName: "",
    action: "Nuevo Conduce",
    serializedInvoiceHeader: {},
    serializedInvoiceDetail: [],
  };

  //Schema (Joi)
  schema = {
    id: Joi.number(),
    invoice: Joi.number(),
    company_id: Joi.number(),
    createdUser: Joi.string(),
    creationDate: Joi.string(),
    serverDate: Joi.string(),
  };

  //Columns
  columns = [
    { path: "product", label: "Producto" },
    { path: "quantity", label: "Cantidad" },
  ];

  quantityDelivered = {
    path: "quantityDelivered",
    key: "quantityDelivered",
    label: "Cantidad Entregada",
    content: (detail) => <span>{formatNumber(detail.quantityDelivered)}</span>,
  };

  quantityToDeliver = {
    path: "quantityToDeliver",
    key: "quantityToDeliver",
    label: "Cantidad a Entregar",
    content: (item) => (
      <div className="row">
        <div className="col">
          <input
            type="text"
            max={item.quantity}
            min="0"
            className="form-control form-control-sm"
            name={item.id}
            id={item.id}
            value={item.quantityToDeliver}
            onChange={this.handleChangeQuantity}
            disabled={item.quantity === item.quantityDelivered}
          />
        </div>
      </div>
    ),
  };

  constructor() {
    super();
    this.columns.push(this.quantityDelivered);
    this.columns.push(this.quantityToDeliver);
  }

  handleChangeQuantity = ({ currentTarget: input }) => {
    const { details } = { ...this.state };

    const index = details.findIndex((item) => item.id == input.id);
    details[index].quantityToDeliver = input.value;

    this.setState({ details });
  };

  async fetchData(invoiceNo) {
    const { data: invoiceHeader } = await getInvoiceHeader(
      getCurrentUser().companyId,
      invoiceNo
    );

    const { data: invoiceDetail } = await getInvoiceDetail(
      invoiceHeader.results[0].id
    );

    const { data: invoiceLeadHeader } = await getInvoiceLeadHeader(
      getCurrentUser().companyId,
      invoiceHeader.results[0].id
    );

    let invoiceLeadDetail = [];

    if (invoiceLeadHeader.count) {
      for (const item of invoiceLeadHeader.results) {
        const { data: result } = await getInvoiceLeadDetail(item);
        for (const detail of result) {
          invoiceLeadDetail.push(detail);
        }
      }
    }

    return {
      invoiceLeadHeader,
      invoiceLeadDetail,
      invoiceHeader,
      invoiceDetail,
    };
  }

  async populateInvoiceLead() {
    try {
      const invoiceNo = this.props.match.params.id;
      if (invoiceNo === "new") return;

      const {
        invoiceLeadHeader,
        invoiceLeadDetail,
        invoiceHeader,
        invoiceDetail,
      } = await this.fetchData(invoiceNo);

      console.log("invoiceHeader", invoiceHeader);
      console.log("invoiceDetail", invoiceDetail);
      console.log("invoiceLeadHeader", invoiceLeadHeader);
      console.log("invoiceLeadDetail", invoiceLeadDetail.length);

      const { data: createdUserData } = await getUserByEmail(
        this.state.data.createdUser
      );

      // Map all retrieved data
      const _invoiceLead = mapToViewInvoiceLeadHeader(
        invoiceLeadHeader.results,
        invoiceNo,
        { ...this.state.data }
      );

      const _invoiceHeader = mapToViewInvoiceHeader(invoiceHeader.results);

      const _invoiceDetail = mapToViewInvoiceDetailWithConduces(
        invoiceDetail,
        invoiceLeadDetail
      );

      this.setState({
        data: _invoiceLead,
        invoiceHeader: _invoiceHeader,
        details: _invoiceDetail,
        action: "Detalle de Conduce",
        serializedInvoiceHeader: invoiceHeader,
        serializedInvoiceDetail: invoiceDetail,
        createdUserName: createdUserData[0].name,
      });
    } catch (ex) {
      Sentry.captureException(ex);

      if (ex.response && ex.response.status === 404)
        return this.props.history.replace("/not-found");
    }
  }

  // handleEditQuantity = (value) => {

  //   const details = { ...this.state.details };
  //   details.quantityToDeliver = value;

  //   this.setState({ details });
  // };

  componentDidMount() {
    this.populateInvoiceLead();
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  async saveDetails(headerId) {
    const details = {};
    let results = [];

    this.state.details.forEach(async (item) => {
      const detail = {
        header_id: headerId,
        product_id: item.product_id,
        quantity: item.quantityToDeliver,
        creationDate: new Date().toISOString(),
      };

      const { data: result } = await saveInvoiceLeadDetail(detail);
      results.push(result);
    });

    console.log("details saved:", results);
  }

  doSubmit = async () => {
    try {
      console.log("Saving the details...");

      //Save Invoice lead header
      const invoiceLeadHeader = {
        invoice_id: this.state.invoiceHeader.id,
        company_id: getCurrentUser().companyId,
        creationDate: new Date().toISOString(),
      };

      const { data: result } = await saveInvoiceLeadHeader(invoiceLeadHeader);

      //Save Invoice lead detail
      await this.saveDetails(result.id);

      toast.success("El conduce fue realizado con exito!");
    } catch (ex) {
      Sentry.captureException(ex);

      if (ex.response && ex.response.status >= 400 && ex.response.status < 500)
        toast.error("Hubo un error en la información enviada.");

      if (ex.response && ex.response.status >= 500) {
        const errors = { ...this.state.errors };
        errors.email = ex.response.data;
        this.setState({ errors });

        toast.error(
          "Parece que hubo un error en el servidor. Favor contacte al administrador."
        );
        console.log("errors", this.state.errors);
      }
    }
  };

  render() {
    const { user } = this.props;

    return (
      <React.Fragment>
        <div className="container pull-left col-lg-9 col-md-11 col-sm-11 ml-3 shadow-sm p-3 mb-5 bg-white rounded border border-secondary">
          <h4 className="bg-dark text-light pl-2 pr-2">{this.state.action}</h4>
          <div className="col-12 pb-3 bg-light">
            <form onSubmit={this.handleSubmit}>
              <div className="row">
                <div className="col-2">
                  {this.renderInput("invoice", "Factura")}
                </div>
              </div>

              <div>
                <table className="table table-striped table-bordered">
                  <thead className="thead-dark">
                    <tr>
                      {this.columns.map((column) => (
                        <th key={column.path || column.key} className="py-2">
                          {column.label}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <TableBody columns={this.columns} data={this.state.details} />
                </table>
              </div>

              {this.renderButton("Guardar")}
            </form>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default InvoiceLeadForm;
