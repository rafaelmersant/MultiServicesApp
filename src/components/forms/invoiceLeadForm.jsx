import React from "react";
import Joi, { intersect } from "joi-browser";
import { toast } from "react-toastify";
import ReactToPrint from "react-to-print";
import Form from "../common/form";
import { formatNumber } from "../../utils/custom";
import { registerLocale } from "react-datepicker";
import es from "date-fns/locale/es";
import { getCurrentUser } from "../../services/authService";
import { getUserByEmail } from "../../services/userService";
import {
  getInvoiceHeader,
  getInvoiceDetail,
} from "../../services/invoiceServices";
import * as Sentry from "@sentry/react";
import TableBody from "../common/tableBody";
import {
  getInvoiceLeadHeader,
  saveInvoiceLeadHeader,
  saveInvoiceLeadDetail,
  getInvoiceLeadDetail,
  getInvoiceLeadHeaderById,
  getInvoiceLeadHeaderByConduceId,
} from "../../services/invoiceLeadServices";
import {
  mapToViewInvoiceDetailWithConduces,
  mapToViewInvoiceHeader,
  mapToViewInvoiceLeadHeader,
} from "../mappers/mapInvoiceLead";
import PrintConduce from "../reports/printConduce";

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
    onlyView: false,
    errors: {},
    currentProduct: {},
    createdUserName: "",
    action: "Nuevo Conduce",
    serializedInvoiceHeader: {},
    serializedInvoiceDetail: [],
    serializedInvoiceLeadDetail: [],
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

  handleSearchInvoice = async () => {
    const handler = (e) => {
      e.preventDefault();
    };
    handler(window.event);

    await this.populateInvoiceLead(this.state.data.invoice);
  };

  async fetchData(invoiceNo, conduceNo) {
    let invoiceId = 0;
    let invoiceLeadHeader = {};

    if (conduceNo) {
      const { data: result } = await getInvoiceLeadHeaderById(conduceNo);
      invoiceId = result.results[0].invoice.id;
      invoiceNo = result.results[0].invoice.sequence;
    }

    const { data: invoiceHeader } = await getInvoiceHeader(
      getCurrentUser().companyId,
      invoiceNo
    );

    const { data: invoiceDetail } = await getInvoiceDetail(
      invoiceHeader.results[0].id
    );

    if (conduceNo) {
      invoiceLeadHeader = await getInvoiceLeadHeaderByConduceId(
        getCurrentUser().companyId,
        conduceNo
      );
    } else {
      invoiceLeadHeader = await getInvoiceLeadHeader(
        getCurrentUser().companyId,
        invoiceHeader.results[0].id,
        null,
        null
      );
    }
    invoiceLeadHeader = { ...invoiceLeadHeader.data };

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

  async populateInvoiceLead(invoiceNo, conduceNo) {
    try {
      const {
        invoiceLeadHeader,
        invoiceLeadDetail,
        invoiceHeader,
        invoiceDetail,
      } = await this.fetchData(invoiceNo, conduceNo);

      console.log("invoiceHeader", invoiceHeader);
      console.log("invoiceDetail", invoiceDetail);
      console.log("invoiceLeadHeader", invoiceLeadHeader);

      const { data: createdUserData } = await getUserByEmail(
        this.state.data.createdUser
      );

      // Map all retrieved data
      const _invoiceLead = mapToViewInvoiceLeadHeader(
        invoiceLeadHeader.results,
        invoiceHeader.results[0].sequence,
        { ...this.state.data }
      );

      const _invoiceHeader = mapToViewInvoiceHeader(invoiceHeader.results);

      const _invoiceDetail = mapToViewInvoiceDetailWithConduces(
        invoiceDetail,
        invoiceLeadDetail
      );

      if (!(invoiceNo > 0)) {
        const index = this.columns.indexOf(this.quantityToDeliver);
        this.columns.splice(index, 1);
      }

      const serializedInvoiceLeadDetail = invoiceLeadDetail.filter((item) => {
        if (item.quantity > 0) return item;
      });

      this.setState({
        data: _invoiceLead,
        invoiceHeader: _invoiceHeader,
        details: _invoiceDetail,
        action: "Detalle de Conduce",
        serializedInvoiceHeader: invoiceHeader,
        serializedInvoiceDetail: invoiceDetail,
        serializedInvoiceLeadDetail,
        createdUserName: createdUserData[0].name,
        onlyView: !(invoiceNo > 0),
      });
    } catch (ex) {
      Sentry.captureException(ex);

      if (ex.response && ex.response.status === 404)
        return this.props.history.replace("/not-found");
    }
  }

  async componentDidMount() {
    const conduceNo = this.props.match.params.id;
    if (conduceNo === "new") return;

    await this.populateInvoiceLead(0, conduceNo);
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  async saveDetails(headerId) {
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

  validateFields = () => {
    const { details } = { ...this.state };

    const total = details.reduce(
      (acc, item) => acc + parseFloat(item.quantityToDeliver),
      0
    );

    if (total === 0) return false;

    for (const item of details) {
      const pending = item.quantity - item.quantityDelivered;

      if (item.quantityToDeliver > pending) return false;
    }

    return true;
  };

  doSubmit = async () => {
    try {
      console.log("Saving the details...");

      if (!this.validateFields()) {
        toast.error(
          "Favor asegurarse de digitar la cantidad a entregar correcta."
        );
        return;
      }

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

      this.populateInvoiceLead(0, result.id);
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
    const { invoiceHeader } = { ...this.state };
    const totalToDeliver = this.state.serializedInvoiceLeadDetail.reduce(
      (acc, item) => acc + item.quantity,
      0
    );

    return (
      <React.Fragment>
        <div className="container-fluid">
          <h4 className="bg-dark text-light pl-2 pr-2">{this.state.action}</h4>
          <div className="col-12 pb-3 bg-light">
            <form onSubmit={this.handleSubmit}>
              <div className="row">
                <div className="col-2" disabled={this.state.onlyView}>
                  {this.renderInput("invoice", "Factura")}
                </div>
                <div
                  className="col-1 pt-0 pb-0 mr-0 ml-0 pr-0 pl-0"
                  style={{ marginTop: "1.98em" }}
                >
                  <button
                    className="btn btn-info btn-sm ml-1 pl-3 pr-3"
                    onClick={this.handleSearchInvoice}
                    disabled={this.state.onlyView}
                  >
                    Buscar
                  </button>
                </div>
                {invoiceHeader.customer_firstName && (
                  <div className="col" style={{ marginTop: "1.98em" }}>
                    <span className="mr-2">Cliente:</span>
                    <span>
                      {invoiceHeader.customer_firstName}{" "}
                      {invoiceHeader.customer_lastName}
                    </span>
                  </div>
                )}
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

              {!this.state.onlyView && this.renderButton("Guardar")}
            </form>
          </div>

          {this.state.onlyView && (
            <ReactToPrint
              trigger={() => (
                <span
                  ref={(button) => (this.printButton = button)}
                  className="fa fa-print text-success pull-right pt-2 cursor-pointer"
                  style={{ fontSize: "35px" }}
                  //onClick={this.handlePrintConduce()}
                ></span>
              )}
              content={() => this.componentRef}
              //onAfterPrint={() => this.invoicePrinted()}
            />
          )}

          <div hidden="hidden">
            <PrintConduce
              ref={(el) => (this.componentRef = el)}
              invoiceHeader={this.state.serializedInvoiceHeader}
              invoiceDetail={this.state.serializedInvoiceDetail}
              invoiceLeadDetail={this.state.serializedInvoiceLeadDetail}
              totalToDeliver={totalToDeliver}
              createdUserName={this.state.createdUserName}
            />
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default InvoiceLeadForm;
