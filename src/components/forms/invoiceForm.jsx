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
import Loading from "../common/loading";
import { formatNumber } from "../../utils/custom";
import CustomerModal from "../modals/customerModal";
import ProductModal from "../modals/productModal";
import DatePicker from "react-datepicker";
import { registerLocale } from "react-datepicker";
import es from "date-fns/locale/es";
import PrintInvoice from "../reports/printInvoice";
import { getCurrentUser } from "../../services/authService";
import { getUserByEmail } from "../../services/userService";
import { getProducts, getProduct } from "../../services/productService";
import { getNextNCF, saveEntry } from "../../services/ncfService";
import {
  saveInvoiceHeader,
  saveInvoiceDetail,
  saveInvoiceSequence,
  getInvoiceSequence,
  getInvoiceHeader,
  getInvoiceDetail,
  deleteInvoiceDetail,
  getAvailablePoints,
} from "../../services/invoiceServices";
import {
  saveProductTracking,
  updateProductStock,
  getProductsStocks,
} from "../../services/inventoryService";
import InvoiceDetailTable from "../tables/invoiceDetailTable";
import _ from "lodash";
import NewInvoiceModal from "../modals/newInvoiceModal";
import * as Sentry from "@sentry/react";
import {
  mapToViewInvoiceDetail,
  mapToViewInvoiceHeader,
} from "../mappers/mapInvoice";

registerLocale("es", es);

class InvoiceForm extends Form {
  _isMounted = false;

  state = {
    data: {
      id: 0,
      sequence: 0,
      ncf: "",
      customer_id: "",
      paymentMethod: "",
      invoiceType: "CASH",
      invoiceStatus: "",
      paid: false,
      printed: false,
      reference: "",
      subtotal: 0,
      itbis: 0,
      discount: 0,
      cost: 0,
      typeDoc: "B02",
      company_id: getCurrentUser().companyId,
      createdUser: getCurrentUser().email,
      creationDate: new Date().toISOString(),
      serverDate: new Date().toISOString(),
    },
    loading: true,
    disabledSave: false,
    invoiceDate: new Date(),
    products: [],
    details: [],
    detailsOriginal: [],
    detailsToDelete: [],
    companies: [],
    availablePoints: 0,
    line: {
      id: 0,
      invoice_id: 0,
      product_id: 0,
      product: "",
      quantity: 0,
      price: 0,
      cost: 0,
      itbis: 0,
      discount: 0,
      total: 0,
    },
    paymentMethods: [
      // { id: "", name: "Ninguno" },
      { id: "TRANS", name: "Transferencia" },
      { id: "CREDIT", name: "Crédito" },
      { id: "POINTS", name: "Puntos Superavit" },
    ],
    invoiceTypes: [
      { id: "CASH", name: "Contado" },
      { id: "CREDIT", name: "Crédito" },
    ],
    typeDoc: [
      { id: "0", name: "No usar" },
      { id: "B01", name: "B01" },
      { id: "B02", name: "B02" },
    ],
    errors: {},
    currentProduct: {},
    invoiceSequence: {
      id: 0,
      sequence: 1,
      company_id: getCurrentUser().companyId,
      creationDate: new Date().toISOString(),
      createdUser: getCurrentUser().email,
    },
    createdUserName: "",
    action: "Nueva Factura",
    clearSearchProduct: false,
    hideSearchProduct: false,
    hideSearchCustomer: false,
    searchCustomerText: "",
    searchProductText: "",
    serializedInvoiceHeader: {},
    serializedInvoiceDetail: [],
  };

  //Schema (Joi)
  schema = {
    id: Joi.number(),
    ncf: Joi.optional(),
    sequence: Joi.number().label("No. Factura"),
    customer_id: Joi.number().label("Cliente"),
    paymentMethod: Joi.optional(),
    invoiceType: Joi.optional(),
    invoiceStatus: Joi.optional(),
    paid: Joi.optional(),
    printed: Joi.optional(),
    reference: Joi.optional(),
    subtotal: Joi.number().min(1),
    itbis: Joi.optional(),
    discount: Joi.optional(),
    cost: Joi.optional(),
    typeDoc: Joi.optional(),
    company_id: Joi.number().label("Compañîa"),
    createdUser: Joi.string(),
    creationDate: Joi.string(),
    serverDate: Joi.string(),
  };

  async populateProducts() {
    const companyId = getCurrentUser().companyId;
    const { data: products } = await getProducts(companyId);
    this.setState({ products: products.results });
  }

  resetLineValues() {
    const line = { ...this.state.line };
    line.id = 0;
    line.product_id = 0;
    line.product = "";
    line.quantity = 0;
    line.price = 0;
    line.cost = 0;
    line.itbis = 0;
    line.discount = 0;
    line.total = 0;

    this.setState({ line });
  }

  availableInStock = async (productId) => {
    const { data: stock } = await getProductsStocks(productId);
    return stock.length ? stock[0].quantityAvailable : 0;
  };

  newInvoice = () => {
    window.location = `/invoice/new`;
  };

  updateLine = (product) => {
    const line = { ...this.state.line };

    const discount = isNaN(parseFloat(line.discount))
      ? 0
      : Math.round(parseFloat(line.discount) * 100) / 100;

    const quantity = Math.round(parseFloat(line.quantity) * 100) / 100;
    const price = Math.round(parseFloat(product.price) * 100) / 100;
    const itbis = Math.round(parseFloat(product.itbis) * 100) / 100;
    const cost = Math.round(parseFloat(product.cost) * 100) / 100;
    const total = Math.round(price * quantity * 100) / 100;

    line.quantity = quantity;
    line.product_id = product.id;
    line.product = product.description;
    line.price = price;
    line.cost = Math.round(cost * 100) / 100;
    line.itbis = Math.round(itbis * 100) / 100;
    line.discount = Math.round(discount * 100) / 100;
    line.total = total;

    this.setState({ line });
  };

  updateTotals = () => {
    const data = { ...this.state.data };
    data.itbis = 0;
    data.discount = 0;
    data.subtotal = 0;
    data.cost = 0;

    this.state.details.forEach((item) => {
      data.itbis += Math.round(parseFloat(item.itbis) * 100) / 100;
      data.discount += Math.round(parseFloat(item.discount) * 100) / 100;
      data.subtotal += Math.round(parseFloat(item.total) * 100) / 100;
      data.cost += Math.round(parseFloat(item.cost) * 100) / 100;
    });

    data.itbis = Math.round(data.itbis * 100) / 100;
    data.discount = Math.round(data.discount * 100) / 100;
    data.subtotal = Math.round(data.subtotal * 100) / 100;
    data.cost = Math.round(data.cost * 100) / 100;

    this.setState({ data });

    // console.log("UpdateTotals - data", data);
  };

  async updateInventory(entry, edited = false) {
    let typeTracking = entry.quantity > 0 && edited ? "E" : "S";
    const quantity = Math.abs(entry.quantity);

    const inventory = {
      header_id: 1,
      id: 0,
      product_id: entry.product_id,
      typeTracking: typeTracking,
      concept: "INVO",
      quantity: quantity,
      company_id: getCurrentUser().companyId,
      createdUser: getCurrentUser().email,
      creationDate: new Date().toISOString(),
    };

    await saveProductTracking(inventory);
    await updateProductStock(inventory);
  }

  async refreshNextInvoiceSequence() {
    const newSequence = { ...this.state.invoiceSequence };

    const companyId = getCurrentUser().companyId;
    const { data: sequence } = await getInvoiceSequence(companyId);

    if (sequence.length) {
      newSequence.sequence = sequence[0].sequence + 1;
      newSequence.id = sequence[0].id;
      newSequence.company_id = sequence[0].company.id;
    }

    const { data } = { ...this.state };
    data.sequence = newSequence.sequence;

    this.setState({ data, invoiceSequence: newSequence });
  }

  async populateInvoice() {
    //if (getCurrentUser().role === "Caja") window.location = '/conduces/';

    try {
      const sequence = this.props.match.params.id;
      if (sequence === "new") {
        this.setState({ loading: false });
        return;
      }

      const { data: invoice } = await getInvoiceHeader(
        getCurrentUser().companyId,
        sequence
      );
      const invoiceHeader = invoice.results;

      const { data: invoiceDetail } = await getInvoiceDetail(
        invoiceHeader[0].id
      );

      const { data: createdUserData } = await getUserByEmail(
        this.state.data.createdUser
      );

      const invoiceHeaderMapped = mapToViewInvoiceHeader(invoiceHeader);

      const { data: availablePoints } = await getAvailablePoints(
        invoiceHeader[0].customer_id
      );

      this.setState({
        data: invoiceHeaderMapped,
        details: mapToViewInvoiceDetail(invoiceDetail),
        detailsOriginal: mapToViewInvoiceDetail(invoiceDetail),
        invoiceDate: new Date(invoiceHeader[0].creationDate),
        searchCustomerText: `${invoiceHeader[0].customer_firstName} ${invoiceHeader[0].customer_lastName}`,
        hideSearchCustomer: true,
        ncf: invoiceHeader[0].ncf.length,
        action: "Detalle de Factura No. ",
        serializedInvoiceHeader: invoiceHeader,
        serializedInvoiceDetail: invoiceDetail,
        createdUserName: createdUserData[0].name,
        loading: false,
        availablePoints: availablePoints.total_points,
      });

      this.forceUpdate();

      if (sessionStorage["printInvoice"] === "y") {
        sessionStorage["printInvoice"] = "";
        this.printButton.click();
      }

      if (sessionStorage["newInvoice"] === "y") {
        sessionStorage["newInvoice"] = null;
        //this.raiseNewInvoiceModal.click();
      }
    } catch (ex) {
      sessionStorage["newInvoice"] = null;

      try {
        Sentry.captureException(ex);
      } catch (_ex) {
        console.log(ex);
      }

      if (ex.response && ex.response.status === 404)
        return this.props.history.replace("/not-found");
    }
  }

  handleChangeInvoiceDate = (date) => {
    const data = { ...this.state.data };
    data.creationDate = date.toISOString();
    this.setState({ data, invoiceDate: date });
  };

  handleSelectProduct = async (product) => {
    console.log("Product Selected:", product);

    const handler = (e) => {
      e.preventDefault();
    };
    handler(window.event);

    this.setState({ clearSearchProduct: false });

    if (product.id === 0) {
      this.raiseProductModal.click();
      return false;
    }

    const product_found = _.find(this.state.details, function (item) {
      return item.product_id === product.id;
    });

    if (product_found !== undefined) {
      toast.error("Este producto ya fue agregado.");
      return false;
    }

    const available = await this.availableInStock(product.id);
    if (available > 0) {
      toast.success(`Cantidad disponible: ${formatNumber(available)}`);
    } else {
      toast.error(`No tiene disponible en inventario`);
      return false; //Uncomment this line for blocking the sales without stock
    }

    this.updateLine(product);

    this.setState({
      hideSearchProduct: true,
      currentProduct: product,
      searchProductText: product.description,
    });
  };

  handleFocusProduct = (value) => {
    setTimeout(() => {
      this.setState({ hideSearchProduct: value });
    }, 200);
  };

  handleSelectCustomer = async (customer) => {
    const handler = (e) => {
      e.preventDefault();
    };
    handler(window.event);

    if (customer.id === 0) {
      this.raiseCustomerModal.click();
      return false;
    }

    const data = { ...this.state.data };
    data.customer_id = customer.id;

    // const { data: availablePoints } = await getAvailablePoints(customer.id);

    console.log("customer selected:", customer);

    this.setState({
      data,
      hideSearchCustomer: true,
      searchCustomerText: `${customer.firstName} ${customer.lastName}`,
      availablePoints: 0//availablePoints.total_points,
    });
  };

  handleFocusCustomer = (value) => {
    this.setState({ hideSearchCustomer: value });
  };

  handleAddDetail = () => {
    const handler = (e) => {
      e.preventDefault();
    };
    handler(window.event);

    setTimeout(() => {
      this.updateLine(this.state.currentProduct);
      const details = [...this.state.details];
      const line = { ...this.state.line };

      //Check if quantity is higher than available one
      if (line.quantity > this.state.currentProduct.quantity) {
        toast.error(
          `La cantidad no puede exceder lo disponible: ${this.state.currentProduct.quantity}`
        );
        return false;
      }

      //Only Admin and Owner can add total discount for product
      if (
        getCurrentUser().role !== "Admin" &&
        getCurrentUser().role !== "Owner" &&
        line.discount > this.state.currentProduct.discount_max
      ) {
        toast.error(
          `No puede exceder el tope de descuento para este producto. Tope RD$${this.state.currentProduct.discount_max}`
        );
        return false;
      }

      line.itbis = Math.round(line.itbis * line.quantity * 100) / 100;
      line.cost = Math.round(line.cost * line.quantity * 100) / 100;
      line.discount = Math.round(line.discount * line.quantity * 100) / 100;
      line.total = Math.round(line.total * 100) / 100;

      if (this.state.line.product_id) details.push(line);

      this.setState({
        details,
        currentProduct: {},
        searchProductText: "",
        clearSearchProduct: true,
      });

      this.updateTotals();
      this.resetLineValues();
    }, 150);
  };

  handleDeleteDetail = (detail, soft = false) => {
    let answer = true;

    if (!soft) {
      answer = window.confirm(
        `Seguro que desea eliminar el producto: \n ${detail.product}`
      );
    }

    if (answer) {
      const detailsToDelete = [...this.state.detailsToDelete];
      if (!soft) detailsToDelete.push(detail);

      const details = this.state.details.filter(
        (d) => d.product_id !== detail.product_id
      );

      this.setState({ details, detailsToDelete });

      setTimeout(() => {
        this.updateTotals();
      });
    }
  };

  handleEditDetail = async (detail) => {
    const handler = (e) => {
      e.preventDefault();
    };
    handler(window.event);

    const line = { ...detail };
    const { data: product } = await getProduct(detail.product_id);

    if (line.discount > 0) line.discount = line.discount / line.quantity;

    this.setState({
      line,
      currentProduct: product.results[0],
      hideSearchProduct: true,
      searchProductText: line.product,
    });

    this.handleDeleteDetail(detail, true);
  };

  handleChangePaid = async () => {
    const { data } = { ...this.state };
    data.paid = !data.paid;
    this.setState({ data });

    if (this.state.data.id) {
      await saveInvoiceHeader(this.state.data);
      window.location = `/invoice/${this.state.data.sequence}`;
    }
  };

  handleChangeNCF = async ({ currentTarget: input }) => {
    this.setNCF(input.value);
  };

  handleChangeQtyDisc = ({ currentTarget: input }) => {
    const line = { ...this.state.line };
    line[input.name] = input.value;
    this.setState({ line });

    if (this.state.currentProduct.length)
      this.updateLine(this.state.currentProduct);
  };

  handleBlurDiscount = () => {
    if (this.state.line.discount === "") {
      const line = { ...this.state.line };
      line.discount = 0;
      this.setState({ line });
    }
  };

  handleSetNewCustomer = async (e) => {
    this.setState({ searchCustomerText: `${e.firstName} ${e.lastName}` });
    await this.handleSelectCustomer(e);
  };

  handleSetNewProduct = (e) => {
    this.setState({ searchProductText: `${e.description}` });
    this.handleSelectProduct(e);
  };

  async setNCF(typeDoc) {
    const data = { ...this.state.data };
    data.typeDoc = typeDoc;
    this.setState({ data });

    const { data: entry } = await getNextNCF(
      typeDoc,
      getCurrentUser().companyId
    );

    const hasNCF =
      entry.length && entry[0].current + 1 <= entry[0].end
        ? entry[0].current + 1
        : 0;

    if (hasNCF === 0 && typeDoc !== "0") {
      toast.error(`No tiene secuencia disponible para NCF ${typeDoc}.`);

      data.typeDoc = "0";
      this.setState({ data });
      return false;
    }
  }

  async getNCF() {
    const { data: entry } = await getNextNCF(
      this.state.data.typeDoc,
      getCurrentUser().companyId
    );

    if (entry.length) {
      const currentNCF =
        entry[0].current === 0 ? entry[0].start : entry[0].current + 1;

      const nextNCF =
        entry.length && currentNCF <= entry[0].end ? currentNCF : 0;
      console.log("CURRENT: ", nextNCF);

      const data = { ...this.state.data };
      const sec = `00000000${nextNCF}`.substring(
        `00000000${nextNCF}`.length - 8
      );

      data.ncf = `${entry[0].typeDoc}${sec}`;
      this.setState({ data });

      const _entry = { ...entry[0] };
      _entry.current = currentNCF;
      _entry.company_id = getCurrentUser().companyId;

      await saveEntry(_entry);
    }
  }

  isInvoiceEditable = () => {
    const isPaid = this.state.data.paid;
    const isNew = this.state.data.id === 0;

    const isUserCapable =
      getCurrentUser().role === "Admin" || getCurrentUser().role === "Owner";

    if (isNew) return !isPaid && isNew;
    else return !isPaid && !isNew && isUserCapable;
  };

  async componentDidMount() {
    this._isMounted = true;

    try {
      await this.populateProducts();
      await this.populateInvoice(false);
    } catch (ex) {
      try {
        Sentry.captureException(ex);
      } catch (_ex) {
        console.log(ex);
      }
    }

    if (!this.state.data.id) {
      await this.refreshNextInvoiceSequence();
      this.setNCF(this.state.data.typeDoc);
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  validateLine() {
    if (!this.state.line.product_id) return true;
    if (!parseFloat(this.state.line.quantity) > 0) return true;

    if (this.state.line.quantity > 0) return false;
  }

  async invoicePrinted() {
    const { data } = { ...this.state };
    data.printed = true;
    this.setState({ data });

    try {
      await saveInvoiceHeader(this.state.data);
    } catch (ex) {
      try {
        Sentry.captureException(ex);
      } catch (_ex) {
        console.log(ex);
      }
      console.log("Exception for printed invoice --> " + ex);
    }
  }

  doSubmit = async () => {
    try {
      if (
        this.state.data.paymentMethod === "POINTS" &&
        this.state.data.discount > this.state.availablePoints
      ) {
        toast.error(
          "El descuento no puede exceder los puntos superavit disponibles."
        );
        return false;
      }

      if (this.state.disabledSave) return false;

      this.setState({ disabledSave: true });

      if (!this.state.data.id) {
        await this.refreshNextInvoiceSequence();

        if (this.state.data.typeDoc !== "0") await this.getNCF();
      }

      const { data: invoiceHeader } = await saveInvoiceHeader(this.state.data);

      for (const item of this.state.details) {
        const detail = {
          id: item.id,
          invoice_id: invoiceHeader.id,
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price,
          itbis: item.itbis,
          cost: item.cost,
          discount: item.discount,
          creationDate: new Date().toISOString(),
        };

        await saveInvoiceDetail(detail);
        if (!this.state.data.id)
          await saveInvoiceSequence(this.state.invoiceSequence);

        try {
          if (this.state.detailsOriginal.length) {
            const _item = this.state.detailsOriginal.find(
              (__item) => __item.product_id === item.product_id
            );

            if (this.state.data.id && _item.quantity !== item.quantity) {
              const newQuantity = _item.quantity - item.quantity;
              detail.quantity = newQuantity;
              await this.updateInventory(detail, true);
            }
          }

          if (!this.state.data.id) await this.updateInventory(detail);
        } catch (ex) {
          try {
            Sentry.captureException(ex);
          } catch (_ex) {
            console.log(ex);
          }
          console.log("Exception for updateInventory --> " + ex);
        }
      }

      try {
        for (const item of this.state.detailsToDelete) {
          await deleteInvoiceDetail(item.id);
        }
      } catch (ex) {
        try {
          Sentry.captureException(ex);
        } catch (_ex) {
          console.log(ex);
        }
        console.log("Exception for deleteInvoiceDetail --> " + ex);
      }

      this.setState({ disabledSave: false });

      sessionStorage["newInvoice"] = "y";
      window.location = `/invoice/${this.state.data.sequence}`;
    } catch (ex) {
      try {
        Sentry.captureException(ex);
      } catch (_ex) {
        console.log(ex);
      }

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

  handleCleanProduct = async () => {
    this.setState({ currentProduct: {}, searchProductText: "" });
  };

  handleCleanCustomer = async () => {
    const data = { ...this.state.data };
    data.customer_id = 0;

    this.setState({
      data,
      hideSearchCustomer: true,
      searchCustomerText: "",
      availablePoints: 0,
    });
  };

  render() {
    const { user } = this.props;
    const role = getCurrentUser().role;

    return (
      <React.Fragment>
        <div className="mb-2 ml-3">
          <h6 className="text-danger">
            Puntos Superavit disponibles: {this.state.availablePoints}
          </h6>
        </div>

        <div className="container-fluid">
          <h4 className="bg-dark text-light pl-2 pr-2 list-header">
            {this.state.action}
            {this.state.data.sequence > 0 &&
              !this.state.action.includes("Nueva") &&
              this.state.data.sequence}
          </h4>
          <div
            className="col-12 pb-3 bg-light"
            disabled={!this.isInvoiceEditable()}
          >
            <form onSubmit={this.handleSubmit}>
              <div className="row">
                <div className="col-8">
                  <SearchCustomer
                    onSelect={this.handleSelectCustomer}
                    onFocus={() => this.handleFocusCustomer(false)}
                    onBlur={() => this.handleFocusCustomer(true)}
                    hide={this.state.hideSearchCustomer}
                    value={this.state.searchCustomerText}
                    companyId={getCurrentUser().companyId}
                    label="Cliente"
                  />
                </div>

                {this.state.data.customer_id > 0 && (
                  <div
                    style={{
                      marginTop: "36px",
                    }}
                  >
                    <span
                      className="fa fa-trash text-danger"
                      style={{
                        fontSize: "24px",
                        position: "absolute",
                        marginLeft: "-29px",
                        cursor: "pointer",
                      }}
                      title="Limpiar filtro de cliente"
                      onClick={this.handleCleanCustomer}
                    ></span>
                  </div>
                )}

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
                    }
                  >
                    <DatePicker
                      className="form-control form-control-sm"
                      selected={this.state.invoiceDate}
                      onChange={(date) => this.handleChangeInvoiceDate(date)}
                      dateFormat="dd/MM/yyyy hh:mm aa"
                    />
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

              <div className="row">
                <div className="col-3">
                  {this.renderSelect(
                    "invoiceType",
                    "Tipo de Factura",
                    this.state.invoiceTypes,
                    true
                  )}
                </div>
                <div className="col-3">
                  {this.renderSelect(
                    "paymentMethod",
                    "Metodo de Pago",
                    this.state.paymentMethods
                  )}
                </div>
                <div className="col-5">
                  {this.renderInput(
                    "reference",
                    "Referencia",
                    "text",
                    "",
                    "Opcional"
                  )}
                </div>
                {this.state.data.id > 0 && (
                  <div className="col mt-4">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="chkPaid"
                      checked={this.state.data.paid}
                      onChange={this.handleChangePaid}
                      disabled={this.state.data.id && this.state.data.paid}
                    />
                    <label className="form-check-label" htmlFor="chkPaid">
                      Pagada
                    </label>
                  </div>
                )}
              </div>

              <div className="row mr-0 ml-0 pr-0 pl-0">
                <div className="col-5 mr-0 ml-0 pr-0 pl-0">
                  <SearchProduct
                    onSelect={this.handleSelectProduct}
                    onFocus={() => this.handleFocusProduct(false)}
                    onBlur={() => this.handleFocusProduct(true)}
                    clearSearchProduct={this.state.clearSearchProduct}
                    hide={this.state.hideSearchProduct}
                    companyId={getCurrentUser().companyId}
                    value={this.state.searchProductText}
                    label="Producto"
                  />
                </div>
                {Object.keys(this.state.currentProduct).length > 0 && (
                  <div
                    style={{
                      marginTop: "36px",
                    }}
                  >
                    <span
                      className="fa fa-trash text-danger"
                      style={{
                        fontSize: "24px",
                        position: "absolute",
                        marginLeft: "-29px",
                        cursor: "pointer",
                      }}
                      title="Limpiar filtro de producto"
                      onClick={this.handleCleanProduct}
                    ></span>
                  </div>
                )}

                <div className="col-1 mr-0 ml-0 pr-0 pl-0">
                  <Input
                    type="text"
                    name="quantity"
                    value={this.state.line.quantity}
                    label="Cant."
                    onChange={this.handleChangeQtyDisc}
                  />
                </div>

                <div className="col-2 mr-0 ml-0 pr-0 pl-0">
                  <Input
                    type="text"
                    name="price"
                    value={formatNumber(this.state.line.price)}
                    label="Precio"
                    onChange={this.handleChange}
                    disabled="disabled"
                  />
                </div>
                <div className="col-2 mr-0 ml-0 pr-0 pl-0">
                  <Input
                    type="text"
                    name="itbis"
                    value={formatNumber(this.state.line.itbis)}
                    label="ITBIS"
                    onChange={this.handleChange}
                    disabled="disabled"
                  />
                </div>
                <div className="col-1 mr-0 ml-0 pr-0 pl-0">
                  <Input
                    type="text"
                    name="discount"
                    value={this.state.line.discount}
                    label="Desc/Unidad"
                    onChange={this.handleChangeQtyDisc}
                    onBlur={this.handleBlurDiscount}
                    // disabled={role !== "Admin" && role !== "Owner"}
                  />
                </div>
                <div
                  className="col-1 pt-0 pb-0 mr-0 ml-0 pr-0 pl-0"
                  style={{ marginTop: "1.98em" }}
                >
                  <button
                    className="btn btn-info btn-sm ml-1 pl-3 pr-3"
                    onClick={this.handleAddDetail}
                    disabled={this.validateLine()}
                  >
                    Agregar
                  </button>
                </div>
              </div>

              {this.state.loading && (
                <div className="d-flex justify-content-center">
                  <Loading />
                </div>
              )}

              {!this.state.loading && (
                <InvoiceDetailTable
                  invoiceHeader={this.state.data}
                  details={this.state.details}
                  user={user}
                  onDelete={this.handleDeleteDetail}
                  onEdit={this.handleEditDetail}
                />
              )}

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

          {!this.isInvoiceEditable() &&
            (role === "Admin" || role === "Owner") &&
            this.state.data.invoiceStatus !== "ANULADA" && (
              <button
                className="btn btn-danger mb-2 ml-3"
                onClick={this.handleChangePaid}
              >
                Re-Abrir factura
              </button>
            )}

          <div className="container-fluid mt-3">
            {(role === "Admin" || role === "Owner" || role === "Caja") && (
              <NavLink className="btn btn-secondary" to="/invoices">
                {"<-"} Ir al listado
              </NavLink>
            )}

            <button
              className="btn btn-success mb-3 pull-right"
              onClick={this.newInvoice}
            >
              Nueva Factura
            </button>
          </div>

          <div className="d-flex justify-content-end w-100 pr-3 mb-3">
            {this.state.data.id > 0 &&
              (role === "Admin" || role === "Owner" || role === "Caja") && (
                <ReactToPrint
                  trigger={() => (
                    <span
                      ref={(button) => (this.printButton = button)}
                      className="fa fa-print text-success cursor-pointer"
                      style={{ fontSize: "35px" }}
                    ></span>
                  )}
                  content={() => this.componentRef}
                  onAfterPrint={() => this.invoicePrinted()}
                  //onBeforePrint={() => this.invoicePrinted()}
                />
              )}
          </div>

          <div hidden="hidden">
            <PrintInvoice
              ref={(el) => (this.componentRef = el)}
              invoiceHeader={this.state.serializedInvoiceHeader}
              invoiceDetail={this.state.serializedInvoiceDetail}
              itbisTotal={this.state.data.itbis}
              valorTotal={this.state.data.subtotal}
              discountTotal={this.state.data.discount}
              availablePoints={this.state.availablePoints}
            />
          </div>
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
        </div>
      </React.Fragment>
    );
  }
}

export default InvoiceForm;
