import React from "react";
import { NavLink } from "react-router-dom";
import Joi from "joi-browser";
import { toast } from "react-toastify";
import ReactToPrint from "react-to-print";
import Form from "../common/form";
import Input from "../common/input";
import Select from "../common/select";
import SearchProduct from "../common/searchProduct";
import SearchCustomer from "../common/searchCustomer";
import { formatNumber } from "../../utils/custom";
import CustomerModal from "../modals/customerModal";
import ProductModal from "../modals/productModal";
import DatePicker from "react-datepicker";
import { registerLocale } from "react-datepicker";
import es from "date-fns/locale/es";
import PrintInvoice from "../reports/printInvoice";
import { getCurrentUser } from "../../services/authService";
import { getUserByEmail } from "../../services/userService";
import {
  getInvoiceHeader,
  getInvoiceDetail,
} from "../../services/invoiceServices";
import InvoiceDetailTable from "../tables/invoiceDetailTable";
import _ from "lodash";
import NewInvoiceModal from "../modals/newInvoiceModal";
import * as Sentry from '@sentry/react'

registerLocale("es", es);

class InvoiceLeadForm extends Form {
  _isMounted = false;

  state = {
    data: {
      id: 0,
      invoice: 0,
      company_id: getCurrentUser().companyId,
      createdUser: getCurrentUser().email,
      creationDate: new Date().toISOString(),
      serverDate: new Date().toISOString(),
    },
    details: [],
    companies: [],
    line: {
      id: 0,
      invoice_id: 0,
      product_id: 0,
      product: "",
      quantity: 0,
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
    invoice: Joi.number().label("No. Factura"),
    company_id: Joi.number().label("Compañîa"),
    createdUser: Joi.string(),
    creationDate: Joi.string(),
    serverDate: Joi.string(),
  };

  async populateInvoiceLead() {
    try {
      const leadNo = this.props.match.params.id;
      if (leadNo === "new") return;

      const { data: invoice } = await getInvoiceHeader(
        getCurrentUser().companyId,
        leadNo
      );
      const invoiceHeader = invoice.results;

      const { data: invoiceDetail } = await getInvoiceDetail(
        invoiceHeader[0].id
      );

      const { data: createdUserData } = await getUserByEmail(
        this.state.data.createdUser
      );

      this.setState({
        data: this.mapToViewInvoiceHeader(invoiceHeader),
        details: this.mapToViewInvoiceDetail(invoiceDetail),
        invoiceDate: new Date(invoiceHeader[0].creationDate),
        action: "Detalle de Conduce",
        serializedInvoiceHeader: invoiceHeader,
        serializedInvoiceDetail: invoiceDetail,
        createdUserName: createdUserData[0].name,
      });

    } catch (ex) {
      Sentry.captureException(ex)

      if (ex.response && ex.response.status === 404)
        return this.props.history.replace("/not-found");
    }
  }

  mapToViewInvoiceHeader(invoiceHeader) {
    return {
      id: invoiceHeader[0].id,
      sequence: parseFloat(invoiceHeader[0].sequence),
      customer_id: invoiceHeader[0].customer.id,
      ncf: invoiceHeader[0].ncf,
      paymentMethod: invoiceHeader[0].paymentMethod,
      paid: invoiceHeader[0].paid,
      printed: invoiceHeader[0].printed ? invoiceHeader.printed : false,
      reference: invoiceHeader[0].reference ? invoiceHeader[0].reference : "",
      subtotal: invoiceHeader[0].subtotal,
      itbis: invoiceHeader[0].itbis,
      discount: invoiceHeader[0].discount,
      company_id: invoiceHeader[0].company.id,
      createdUser: invoiceHeader[0].createdByUser
        ? invoiceHeader[0].createdByUser
        : getCurrentUser().email,
      creationDate: invoiceHeader[0].creationDate,
    };
  }

  mapToViewInvoiceDetail(invoiceDetail) {
    let details = [];
    invoiceDetail.forEach((item) => {
      details.push({
        id: item.id,
        invoice_id: item.invoice.id,
        product_id: item.product.id,
        product: item.product.description,
        quantity: item.quantity,
        price: item.price,
        cost: item.cost,
        itbis: item.itbis,
        discount: item.discount,
        total:
          Math.round(parseFloat(item.price) * parseFloat(item.quantity) * 100) /
          100,
      });
    });

    return details;
  }

  handleChangeQuantity = ({ currentTarget: input }) => {
    const line = { ...this.state.line };
    line[input.name] = input.value;
    this.setState({ line });

    if (this.state.currentProduct.length)
      this.updateLine(this.state.currentProduct);
  };

  componentWillUnmount() {
    this._isMounted = false;
  }

  validateLine() {
    if (!this.state.line.product_id) return true;
    if (!parseFloat(this.state.line.quantity) > 0) return true;

    if (this.state.line.quantity > 0) return false;
  }

  doSubmit = async () => {
    try {
        // const { data: invoiceLeadDetail } = await saveInvoiceLeadDetail(
        //   this.state.data
        // );

    } catch (ex) {
      Sentry.captureException(ex)

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
        <h2>CONDUCE</h2>
        {/* <div className="container pull-left col-lg-9 col-md-11 col-sm-11 ml-3 shadow-sm p-3 mb-5 bg-white rounded border border-secondary">
          <h4 className="bg-dark text-light pl-2 pr-2">{this.state.action}</h4>
          <div className="col-12 pb-3 bg-light">
            
            <form onSubmit={this.handleSubmit}>
              <div className="row">
                <div className="col-8">
                

                {!this.state.data.ncf && (
                  <div className="col-2">
                    <Select
                      name="typeDoc"
                      value={this.state.data.typeDoc}
                      label="NCF"
                      options={this.state.typeDoc}
                      onChange={this.handleChangeNCF}
                      error={null}
                      disabled={this.state.data.id}
                    />
                  </div>
                )}

                <div className="col-2">
                  <label className="mr-1">Fecha</label>
                  <div
                    className="mr-3"
                    disabled={
                      getCurrentUser().role !== "Admin" &&
                      getCurrentUser().role !== "Owner"
                    }>
                    <DatePicker className="form-control form-control-sm"
                      selected={this.state.invoiceDate}
                      onChange={(date) => this.handleChangeInvoiceDate(date)}
                      dateFormat="dd/MM/yyyy"/>
                  </div>
                </div>

                {this.state.data.ncf.length > 0 && this.state.data.id > 0 && (
                  <div className="col-2">
                    <Input
                      type="text"
                      name="ncf"
                      value={this.state.data.ncf}
                      label="NCF"
                      onChange={this.handleChange}
                      disabled="disabled"
                    />
                  </div>
                )}
              </div>

              <InvoiceDetailTable
                invoiceHeader={this.state.data}
                details={this.state.details}
                user={user}
                onDelete={this.handleDeleteDetail}
                onEdit={this.handleEditDetail}
              />

              {this.isInvoiceEditable() && this.renderButton("Guardar")}
            </form>
          </div>

          <button
            type="button"
            data-toggle="modal"
            data-target="#customerModal"
            hidden="hidden"
            ref={(button) => (this.raiseCustomerModal = button)}
          ></button>
          <button
            type="button"
            data-toggle="modal"
            data-target="#productModal"
            hidden="hidden"
            ref={(button) => (this.raiseProductModal = button)}
          ></button>

          <CustomerModal setNewCustomer={this.handleSetNewCustomer} />
          <ProductModal setNewProduct={this.handleSetNewProduct} />

          {this.state.data.id > 0 &&
            (getCurrentUser().role === "Admin" ||
              getCurrentUser().role === "Owner") && (
              <ReactToPrint
                trigger={() => (
                  <span
                    ref={(button) => (this.printButton = button)}
                    className="fa fa-print text-success pull-right pt-2 cursor-pointer"
                    style={{ fontSize: "35px" }}
                  ></span>
                )}
                content={() => this.componentRef}
                onAfterPrint={() => this.invoicePrinted()}
                //onBeforePrint={() => this.invoicePrinted()}
              />
            )}
          <div hidden="hidden">
            <PrintInvoice
              ref={(el) => (this.componentRef = el)}
              invoiceHeader={this.state.serializedInvoiceHeader}
              invoiceDetail={this.state.serializedInvoiceDetail}
              itbisTotal={this.state.data.itbis}
              valorTotal={this.state.data.subtotal}
              discountTotal={this.state.data.discount}
              createdUserName={this.state.createdUserName}
            />
          </div>
        </div>

        <div className="container pull-left col-lg-9 col-md-11 col-sm-11 ml-3 mb-5">
          <NavLink className="btn btn-secondary" to="/invoices">
            {"<-"} Ir al listado
          </NavLink>

          <button
            className="btn button-local mb-3 pull-right"
            onClick={this.newInvoice}
          >
            Nueva Factura
          </button>
        </div>
        <div className="col-1 ml-0 pl-0">
          <button
            hidden
            type="button"
            data-toggle="modal"
            data-target="#newInvoiceModal"
            ref={(button) => (this.raiseNewInvoiceModal = button)}
          ></button>
          <NewInvoiceModal />
        </div> */}
      </React.Fragment>
    );
  }
}

export default InvoiceLeadForm;
