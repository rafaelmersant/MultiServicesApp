import React from "react";
import { NavLink } from "react-router-dom";
import Joi from "joi-browser";
import { toast } from "react-toastify";
import ReactToPrint from "react-to-print";
import http from "../../services/httpService";
import { environment } from "../../settings";
import Form from "../common/form";
import Input from "../common/input";
import Select from "../common/select";
import SearchProduct from "../common/searchProduct";
import SearchCustomer from "../common/searchCustomer";
import Loading from "../common/loading";
import { formatNumber, formatNumberThreeDecimals } from "../../utils/custom";
import CustomerModal from "../modals/customerModal";
import ProductModal from "../modals/productModal";
import DatePicker from "react-datepicker";
import { registerLocale } from "react-datepicker";
import es from "date-fns/locale/es";
import PrintInvoice from "../reports/printInvoice";
import { getCurrentUser } from "../../services/authService";
import { getUserByEmail, getUsers } from "../../services/userService";
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
      employee_id: "",
      paymentMethod: "CASH",
      invoiceType: "CASH",
      invoiceStatus: "",
      paid: false,
      printed: false,
      reference: "",
      subtotal: 0,
      itbis: 0,
      discount: 0,
      cost: 0,
      amount_points: 0,
      typeDoc: "B02",
      company_id: getCurrentUser().companyId,
      createdUser: getCurrentUser().email,
      creationDate: new Date().toISOString(),
      serverDate: new Date().toISOString(),
    },
    electronicRecord: null,
    electronicPrintData: null,
    electronicNotice: "",
    electronicZeroTax: "",
    electronicDueDate: "",
    saving: false,
    loading: true,
    disabledSave: false,
    invoiceDate: new Date(),
    products: [],
    details: [],
    detailsOriginal: [],
    detailsToDelete: [],
    companies: [],
    users: [],
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
      { id: "CASH", name: "Efectivo" },
      { id: "CARD", name: "Tarjeta de Crédito" },
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
      { id: "E31", name: "E31 · Crédito fiscal electrónico" },
      { id: "E32", name: "E32 · Consumo electrónico" },
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
    paidWith: "",
    paidReturn: "",
  };

  //Schema (Joi)
  schema = {
    id: Joi.number(),
    ncf: Joi.optional(),
    sequence: Joi.number().label("No. Factura"),
    customer_id: Joi.number().label("Cliente"),
    employee_id: Joi.optional(),
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
    amount_points: Joi.optional(),
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

  async populateUsers() {
    let { data: users } = await getUsers();
    users = users.filter(u => u.userRole === "Caja");
    this.setState({ users });
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
    const itbis = Math.round(parseFloat(product.itbis) * 1000) / 1000;
    const cost = Math.round(parseFloat(product.cost) * 100) / 100;
    const total = Math.round(price * quantity * 100) / 100;

    line.quantity = quantity;
    line.product_id = product.id;
    line.product = product.description;
    line.price = price;
    line.cost = Math.round(cost * 100) / 100;
    line.itbis = Math.round(itbis * 1000) / 1000;
    line.discount = Math.round(discount * 100) / 100;
    line.total = total;

    this.setState({ line });
  };

  updateTotals = async () => {
    const data = { ...this.state.data };
    data.itbis = 0;
    data.discount = 0;
    data.subtotal = 0;
    data.cost = 0;
    data.amount_points = 0;

    for (const item of this.state.details) {
      data.itbis += Math.round(parseFloat(item.itbis) * 1000) / 1000;
      data.discount += Math.round(parseFloat(item.discount) * 100) / 100;
      data.subtotal += Math.round(parseFloat(item.total) * 100) / 100;
      data.cost += Math.round(parseFloat(item.cost) * 100) / 100;

      //Puntos Superavit (Exclude CEMENTO product)
      const CEMENTO_TITAN = 651;
      const CEMENTO_2_LIBRA = 639;
      const CEMENTO_5_LIBRA = 640;
      const CEMENTO_ARGOS = 641;
      const CEMENTO_BLANCO_LIBRAS = 642;
      const CEMENTO_GRIS_LIBRA = 650;
      const POLVO_MOSAICO_AMARILLO = 2350;
      const POLVO_MOSAICO_AZUL = 2351;
      const POLVO_MOSAICO_NEGRO = 2352;
      const POLVO_MOSAICO_ROJO = 2353;
      const POLVO_MOSAICO_VERDE = 2354;
      const YESO = 3401;
      const YESO_FUNDA = 3402;

      const products_excluded = [
        CEMENTO_TITAN,
        CEMENTO_2_LIBRA,
        CEMENTO_5_LIBRA,
        CEMENTO_ARGOS,
        CEMENTO_BLANCO_LIBRAS,
        CEMENTO_GRIS_LIBRA,
        POLVO_MOSAICO_AMARILLO,
        POLVO_MOSAICO_AZUL,
        POLVO_MOSAICO_NEGRO,
        POLVO_MOSAICO_ROJO,
        POLVO_MOSAICO_VERDE,
        YESO,
        YESO_FUNDA,
      ];
      if (products_excluded.indexOf(item.product_id) === -1) {
        const discount = Math.round(parseFloat(item.discount) * 100) / 100;
        const total = Math.round(parseFloat(item.total) * 100) / 100;
        data.amount_points += total - discount;
      }
    }

    data.discount = Math.round(data.discount * 100) / 100;
    data.subtotal = Math.round(data.subtotal * 100) / 100;
    data.itbis =
      Math.round(((data.subtotal - data.discount) * 18 / 118) * 1000) / 1000;
    data.cost = Math.round(data.cost * 100) / 100;
    data.amount_points = Math.round(data.amount_points * 100) / 100;
    data.amount_points =
      this.state.data.customer_id === 1 ? 0 : data.amount_points;

    this.setState({ data });

    // console.log("UpdateTotals - data", data);
  };

  async updateInventory(entry, edited = false) {
    try {
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
    } catch (ex) {
      try {
        Sentry.captureException(ex);
      } catch (_ex) {
        console.log("Custom ERROR:", ex);
      }
    }
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

    const sequence = this.props.match.params.id;

    try {
      if (sequence === "new") {
        this.setState({ loading: false });
        return;
      }

      const { data: invoice } = await getInvoiceHeader(
        getCurrentUser().companyId,
        sequence,
      );
      const invoiceHeader = invoice.results;

      const { data: invoiceDetail } = await getInvoiceDetail(
        invoiceHeader[0].id,
      );

      const { data: createdUserData } = await getUserByEmail(
        this.state.data.createdUser,
      );

      const invoiceHeaderMapped = mapToViewInvoiceHeader(invoiceHeader);

      const { data: availablePoints } = await getAvailablePoints(
        invoiceHeader[0].customer_id,
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

      let checkoutNotice = null;
      try { checkoutNotice = JSON.parse(sessionStorage.getItem("ecfCheckoutNotice") || "null"); } catch (error) { /* no prior notice */ }
      if (checkoutNotice && String(checkoutNotice.sequence) === String(invoiceHeader[0].sequence)) {
        this.setState({ electronicNotice: checkoutNotice.message });
        sessionStorage.removeItem("ecfCheckoutNotice");
      }
      if (localStorage.getItem("ms_apiToken")) {
        try {
          getCurrentUser();
          const { data: status } = await http.get(`${environment.apiUrl}/ecf/electronic-invoices/sale-status/`, { params: { invoice: invoiceHeader[0].id } });
          if (status.record) this.setState({ electronicRecord: status.record, electronicNotice: (checkoutNotice && checkoutNotice.message) || `e-CF ${status.record.encf || "sin número reservado"}: ${status.record.dgii_status || status.record.status}. ${status.record.last_error || ""}` });
        } catch (error) { /* The saved sale remains available even if fiscal status is temporarily unavailable. */ }
      }
      this.forceUpdate();

      if (sessionStorage["printInvoice"] === "y") {
        sessionStorage["printInvoice"] = "";
        if (this.printButton) this.printButton.click();
      }

      if (sessionStorage["newInvoice"] === "y") {
        sessionStorage["newInvoice"] = null;
        //this.raiseNewInvoiceModal.click();
      }
    } catch (ex) {
      sessionStorage["newInvoice"] = null;

      try {
        Sentry.captureMessage(
          `Exception: ${ex} | Extra:->sequence: ${sequence}`,
        );
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
    this.setState({
      searchCustomerText: `${customer.firstName} ${customer.lastName}`,
    });

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

    const { data: availablePoints } = await getAvailablePoints(customer.id);

    this.setState({
      data,
      hideSearchCustomer: true,
      availablePoints: availablePoints.total_points,
    });
  };

  handleClearCustomerSelection = () => {
    const handler = (e) => {
      e.preventDefault();
    };
    handler(window.event);

    const data = { ...this.state.data };
    data.customer_id = 0;

    this.handleSelectCustomer({ id: null, firstName: "", lastName: "" });
    this.setState({ data, searchCustomerText: "" });
  };

  handleFocusCustomer = (value) => {
    setTimeout(() => {
      this.setState({ hideSearchCustomer: value });
    }, 300);
  };

  handleAddDetail = () => {
    const handler = (e) => {
      e.preventDefault();
    };
    handler(window.event);

    setTimeout(async () => {
      this.updateLine(this.state.currentProduct);
      const details = [...this.state.details];
      const line = { ...this.state.line };

      //Check if quantity is higher than available one
      if (line.quantity > this.state.currentProduct.quantity) {
        toast.error(
          `La cantidad no puede exceder lo disponible: ${this.state.currentProduct.quantity}`,
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
          `No puede exceder el tope de descuento para este producto. Tope RD$${this.state.currentProduct.discount_max}`,
        );
        return false;
      }

      try {
        line.itbis = Math.round(line.itbis * line.quantity * 1000) / 1000;
        line.cost = Math.round(line.cost * line.quantity * 100) / 100;
        line.discount = Math.round(line.discount * line.quantity * 100) / 100;
        line.total = Math.round(line.total * 100) / 100;
        line.invoice_id = this.state.data.id;
      } catch (ex) {
        try {
          Sentry.captureException(ex);
        } catch (_ex) {
          console.log("Custom ERROR:", ex);
        }
      }

      if (this.state.line.product_id) details.push(line);

      this.setState({
        details,
        currentProduct: {},
        searchProductText: "",
        clearSearchProduct: true,
      });

      await this.updateTotals();
      this.resetLineValues();

      if (this.state.data.id) {
        this.saveOneItem(line);
      }
    }, 400);
  };

  handleDeleteDetail = async (detail, soft = false) => {
    let answer = false;

    if (!soft) {
      answer = window.confirm(
        `Seguro que desea eliminar el producto: \n ${detail.product}`,
      );
    }

    if (answer || soft) {
      const details = this.state.details.filter(
        (d) => d.product_id !== detail.product_id,
      );

      this.setState({ details });
    }

    if (answer) {
      //const detailsToDelete = [...this.state.detailsToDelete];
      //if (!soft) detailsToDelete.push(detail);

      setTimeout(async () => {
        await this.updateTotals();

        if (this.state.data.id) {
          console.log("ITEM TO DELETE:", detail);
          await this.deleteOneItem(detail);
        }
      }, 200);
    }
  };

  handleEditDetail = async (detail) => {
    this.setState({ searchProductText: detail.product });

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

  handleChangePaidWith = ({ currentTarget: input }) => {
    const totalDiscount = parseFloat(this.state.data.discount);
    const totalAmount = parseFloat(this.state.data.subtotal) - totalDiscount;
    const paidWith = parseFloat(input.value);
    const paidReturn = formatNumber(paidWith - totalAmount);

    console.log("Discount:", totalDiscount);
    console.log("totalAmount:", totalAmount);

    if (totalAmount) this.setState({ paidWith, paidReturn });
  };

  async setNCF(typeDoc) {
    const data = { ...this.state.data };
    data.typeDoc = typeDoc;
    this.setState({ data });
    if (["E31", "E32", "0"].includes(typeDoc)) return true;

    const { data: entry } = await getNextNCF(
      typeDoc,
      getCurrentUser().companyId,
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
    if (["E31", "E32"].includes(this.state.data.typeDoc)) return;
    const { data: entry } = await getNextNCF(
      this.state.data.typeDoc,
      getCurrentUser().companyId,
    );

    if (entry.length) {
      const currentNCF =
        entry[0].current === 0 ? entry[0].start : entry[0].current + 1;

      const nextNCF =
        entry.length && currentNCF <= entry[0].end ? currentNCF : 0;
      console.log("CURRENT: ", nextNCF);

      const data = { ...this.state.data };
      const sec = `00000000${nextNCF}`.substring(
        `00000000${nextNCF}`.length - 8,
      );

      data.ncf = `${entry[0].typeDoc}${sec}`;
      this.setState({ data });

      const _entry = { ...entry[0] };
      _entry.current = currentNCF;
      _entry.company_id = getCurrentUser().companyId;

      await saveEntry(_entry);
    }
  }

  async revertNCF() {
    if (["E31", "E32"].includes(this.state.data.typeDoc)) return;
    const { data: entry } = await getNextNCF(
      this.state.data.typeDoc,
      getCurrentUser().companyId,
    );

    if (entry.length) {
      const currentNCF = entry[0].current - 1;

      const _entry = { ...entry[0] };
      _entry.current = currentNCF;
      _entry.company_id = getCurrentUser().companyId;

      await saveEntry(_entry);
    }
  }

  isInvoiceEditable = () => {
    if (this.state.electronicRecord) return false;
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
      await this.populateUsers();
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

  async saveInvoice() {
    const isNewInvoice = !this.state.data.id;
    const isElectronic = ["E31", "E32"].includes(this.state.data.typeDoc);
    let electronicReady = true;
    try {
      await this.updateTotals();
    } catch (ex) {
      try {
        Sentry.captureException(ex);
      } catch (_ex) {
        console.log("Custom ERROR:", ex);
      }
    }

    if (this.state.disabledSave) return false;
    this.setState({ disabledSave: true, saving: true });

    if (isNewInvoice) {
      await this.refreshNextInvoiceSequence();
      this.state.data.paid = !(isElectronic && this.state.data.paymentMethod === "CREDIT");

      if (this.state.data.typeDoc !== "0") await this.getNCF();
    }

    const { data: invoiceHeader } = await saveInvoiceHeader(this.state.data);
    if (isElectronic) {
      this.setState({ data: { ...this.state.data, id: invoiceHeader.id, sequence: invoiceHeader.sequence } });
    }

    for (const item of this.state.details) {
      try {
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

        if (isNewInvoice)
          await saveInvoiceSequence(this.state.invoiceSequence);

        if (this.state.detailsOriginal.length) {
          const _item = this.state.detailsOriginal.find(
            (__item) => __item.product_id === item.product_id,
          );

          if (!isNewInvoice) {
            if (_item && _item.quantity !== item.quantity) {
              const newQuantity = _item.quantity - item.quantity;
              detail.quantity = newQuantity;
              await this.updateInventory(detail, true);
            } else {
              if (!_item) await this.updateInventory(detail, false);
            }
          }
        }

        if (isNewInvoice) await this.updateInventory(detail);
      } catch (ex) {
        electronicReady = false;
        try {
          Sentry.captureMessage(`Exception: ${ex} | item: ${item}`);
        } catch (_ex) {
          console.log(ex);
        }
        console.log("Exception for updateInventory --> " + ex);
      }
    }

    try {
      for (const item of this.state.detailsToDelete) {
        await deleteInvoiceDetail(item.id);
        await this.updateInventory(item, true);
      }
    } catch (ex) {
      electronicReady = false;
      try {
        Sentry.captureException(ex);
      } catch (_ex) {
        console.log(ex);
      }
      console.log("Exception for deleteInvoiceDetail --> " + ex);
    }

    this.setState({ disabledSave: isElectronic, saving: false });
    return { invoiceHeader, electronicReady };
  }

  async saveOneItem(item) {
    const { data: invoiceHeader } = await saveInvoiceHeader(this.state.data);

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

    const { data: result } = await saveInvoiceDetail(detail);
    const result_product_id = result.product
      ? result.product.id
      : result.product_id;

    const newDetails = this.state.details.map((item) => {
      if (item.product_id === result_product_id) {
        return { ...item, id: result.id };
      }
      return item;
    });

    this.setState({ details: newDetails });

    try {
      if (this.state.detailsOriginal.length) {
        const _item = this.state.detailsOriginal.find(
          (__item) => __item.product_id === item.product_id,
        );

        if (_item && _item.quantity !== item.quantity) {
          const newQuantity = _item.quantity - item.quantity;
          detail.quantity = newQuantity;
          await this.updateInventory(detail, true);
        } else {
          if (!_item) await this.updateInventory(detail, false);
        }
      }
    } catch (ex) {
      try {
        Sentry.captureException(ex);
      } catch (_ex) {
        console.log(ex);
      }
      console.log("Exception for updateInventory --> " + ex);
    }
  }

  async deleteOneItem(item) {
    await saveInvoiceHeader(this.state.data);
    console.log("HEADER SAVED:", this.state.data);
    await deleteInvoiceDetail(item.id);
    await this.updateInventory(item, true);
  }

  doSubmit = async () => {
    try {
      if (!this.state.data.employee_id) {
      toast.error(
        "Debe especificar el vendedor que registra la factura.",
      );
      return false;
    }

    if (
      this.state.data.paymentMethod === "POINTS" &&
      this.state.data.discount > this.state.availablePoints
    ) {
      toast.error(
        "El descuento no puede exceder los puntos superavit disponibles.",
      );
      return false;
    }
    
      const electronic = ["E31", "E32"].includes(this.state.data.typeDoc);
      if (this.state.electronicRecord) {
        toast.info("Esta venta ya tiene un registro e-CF. Continúa desde Facturación e-CF sin volver a guardar la venta.");
        return;
      }
      if (electronic && !localStorage.getItem("ms_apiToken")) {
        toast.error("Cierra sesión y vuelve a entrar para emitir e-CF.");
        return;
      }
      if (electronic && this.state.data.paymentMethod === "CREDIT" && !this.state.electronicDueDate) {
        toast.error("Indica la fecha límite de pago de esta venta a crédito.");
        return;
      }
      const saved = await this.saveInvoice();
      if (!saved) return;
      if (electronic) {
        const { invoiceHeader, electronicReady } = saved;
        let message = "Venta guardada. Si el comprobante no aparece, prepara su borrador desde Facturación e-CF. No crees otra venta.";
        this.setState({ saving: true, electronicNotice: "Venta guardada. Procesando e-CF…" });
        try {
          getCurrentUser();
          const payload = {};
          if (this.state.electronicZeroTax) payload.zero_tax_treatment = this.state.electronicZeroTax;
          if (this.state.electronicDueDate) payload.FechaLimitePago = this.state.electronicDueDate.split("-").reverse().join("-");
          const { data: result } = await http.post(`${environment.apiUrl}/ecf/electronic-invoices/checkout-sale/`, {
            invoice: invoiceHeader.id, document_type: this.state.data.typeDoc.substring(1), payload, process: electronicReady
          }, { timeout: 120000 });
          message = result.pending ? `e-CF pendiente: ${result.message}. Continúa desde Facturación e-CF.` : `e-CF ${result.record.encf}: ${result.record.dgii_status || result.record.status}. PDF disponible.`;
        } catch (error) {
          message = "Venta guardada; no se confirmó el proceso e-CF. Revisa Facturación e-CF antes de reintentar. No vuelvas a crear esta venta.";
        }
        sessionStorage.setItem("ecfCheckoutNotice", JSON.stringify({ sequence: invoiceHeader.sequence, message }));
        window.location = `/invoice/${invoiceHeader.sequence}`;
        return;
      }

      sessionStorage["newInvoice"] = "y";
      window.location = `/invoice/new`;
      //window.location = `/invoice/${this.state.data.sequence}`;

      // setTimeout(() => {
      //   window.location = `/invoice/new`;
      // }, 500);
    } catch (ex) {
      try {
        Sentry.captureMessage(
          `Exception: ${ex} | sequence: ${this.state.data.sequence}`,
        );
      } catch (_ex) {
        console.log(ex);
      }

      if (
        ex.response &&
        ex.response.status >= 400 &&
        ex.response.status < 500
      ) {
        if (ex.message === "invoice sequence duplicated") {
          const newSequence = { ...this.state.invoiceSequence };
          await saveInvoiceSequence(newSequence);
          await this.revertNCF();

          toast.error(
            "Hubo un error en la información enviada. Favor intente guardar nuevamente",
          );

          this.setState({ disabledSave: false, saving: false });
        } else {
          toast.error("Hubo un error en la información enviada.");
        }
      }

      if (ex.response && ex.response.status >= 500) {
        const errors = { ...this.state.errors };
        errors.email = ex.response.data;
        this.setState({ errors });

        toast.error(
          "Parece que hubo un error en el servidor. Favor contacte al administrador.",
        );

        Sentry.captureMessage(
          `Exception: ${ex} | ERRORS: ${this.state.errors}`,
        );
        console.log("errors", this.state.errors);
      }
    }
  };

  handleCleanProduct = async () => {
    this.setState({ currentProduct: {}, searchProductText: "" });
  };

  prepareElectronicThermalPrint = async () => {
    if (!(this.state.data.ncf || "").startsWith("E")) return;
    try {
      getCurrentUser();
      const { data } = await http.get(`${environment.apiUrl}/ecf/electronic-invoices/sale-thermal-data/`, { params: { invoice: this.state.data.id } });
      await new Promise((resolve, reject) => {
        const image = new window.Image();
        image.onload = resolve;
        image.onerror = () => reject(new Error("No se pudo cargar el QR fiscal."));
        image.src = data.qr_image;
      });
      await new Promise(resolve => this.setState({ electronicPrintData: data }, resolve));
    } catch (error) {
      toast.error("No se pudo preparar la impresión e-CF con su QR. No se imprimió un ticket tradicional.");
      throw error;
    }
  };

  downloadElectronicRepresentation = async () => {
    try {
      getCurrentUser();
      const response = await http.get(`${environment.apiUrl}/ecf/electronic-invoices/sale-representation/`, {
        params: { invoice: this.state.data.id }, responseType: "blob"
      });
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = `RI-${this.state.data.ncf}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error("No se pudo obtener la representación e-CF. Verifica tu sesión y el estado del comprobante en Facturación e-CF.");
    }
  };

  render() {
    const { user } = this.props;
    const role = getCurrentUser().role;

    return (
      <React.Fragment>
        {this.state.electronicNotice && <div className="alert alert-info mx-3">{this.state.electronicNotice} <a href="/ecf">Abrir Facturación e-CF</a></div>}
        {["E31", "E32"].includes(this.state.data.typeDoc) && !this.state.data.id && <div className="mx-3 mb-2"><label>Líneas sin ITBIS (si aplica)</label><select className="form-control" value={this.state.electronicZeroTax} onChange={e => this.setState({ electronicZeroTax: e.target.value })}><option value="">Sin tratamiento adicional</option><option value="4">Exentas</option><option value="3">Gravadas a tasa 0%</option></select>{this.state.data.paymentMethod === "CREDIT" && <label>Fecha límite de pago<input type="date" className="form-control" value={this.state.electronicDueDate} onChange={e => this.setState({ electronicDueDate: e.target.value })} /></label>}</div>}
        <div className="mb-2 ml-3 mr-3 d-flex justify-content-between align-items-center">
          <h6 className="text-danger mb-0">
            Puntos Superavit disponibles: {this.state.availablePoints}
          </h6>

          <div className="d-flex align-items-center">
            <label className="mb-0 mr-2">Vendedor</label>
            <div style={{ minWidth: "250px" }}>
              {this.renderSelect("employee_id", "", this.state.users)}
            </div>
          </div>
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
                <div className="col-7">
                  <SearchCustomer
                    onSelect={this.handleSetNewCustomer}
                    onFocus={() => this.handleFocusCustomer(false)}
                    onBlur={() => this.handleFocusCustomer(true)}
                    hide={this.state.hideSearchCustomer}
                    value={this.state.searchCustomerText}
                    companyId={getCurrentUser().companyId}
                    label="Cliente"
                  />
                </div>
                {this.state.data.customer_id && (
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
                        marginLeft: "-39px",
                        cursor: "pointer",
                      }}
                      title="Limpiar filtro de cliente"
                      onClick={this.handleClearCustomerSelection}
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
                    true,
                  )}
                </div>
                <div className="col-3">
                  {this.renderSelect(
                    "paymentMethod",
                    "Metodo de Pago",
                    this.state.paymentMethods,
                  )}
                </div>
                <div className="col-5">
                  {this.renderInput(
                    "reference",
                    "Referencia",
                    "text",
                    "",
                    "Opcional",
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
                    value={formatNumberThreeDecimals(this.state.line.itbis)}
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

              <secion className="d-flex justify-content-end">
                <table>
                  <tr>
                    <td>Pago con:</td>
                    <td>
                      <input
                        type="text"
                        name="paidWith"
                        className="form form-control text-right font-weight-bold"
                        value={this.state.paidWith}
                        style={{ fontSize: "1.4rem", maxWidth: "130px" }}
                        onChange={this.handleChangePaidWith}
                        autocomplete="off"
                      />
                    </td>
                  </tr>
                  <tr>
                    <td>Devuelta:</td>
                    <td>
                      <input
                        type="text"
                        name="paidWith"
                        className="form form-control text-right font-weight-bold"
                        value={this.state.paidReturn}
                        style={{ fontSize: "1.4rem", maxWidth: "130px" }}
                        disabled={true}
                      />
                    </td>
                  </tr>
                </table>
              </secion>

              <div>
                {!this.state.saving &&
                  this.isInvoiceEditable() &&
                  this.renderButton("Guardar")}
                {this.state.saving && (
                  <span className="spinner-border text-info ml-2 align-middle"></span>
                )}
              </div>
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

          {/* {!this.isInvoiceEditable() &&
            (role === "Admin" || role === "Owner") &&
            this.state.data.invoiceStatus !== "ANULADA" &&
            this.state.data.paymentMethod !== "POINTS" && (
              <button
                className="btn btn-danger mb-2 ml-3"
                onClick={this.handleChangePaid}
              >
                Re-Abrir factura
              </button>
            )} */}

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
              (role === "Admin" || role === "Owner" || role === "Caja") && !(this.state.electronicRecord && !["accepted", "accepted_conditional"].includes(this.state.electronicRecord.status)) && !(this.state.electronicNotice && !(this.state.data.ncf || "").startsWith("E")) && (
                <React.Fragment>
                {(this.state.data.ncf || "").startsWith("E") && <button type="button" className="btn btn-outline-success mr-3" onClick={this.downloadElectronicRepresentation}>PDF e-CF</button>}
                <ReactToPrint
                  trigger={() => (
                    <span
                      ref={(button) => (this.printButton = button)}
                      className="fa fa-print text-success cursor-pointer"
                      style={{ fontSize: "35px" }}
                    ></span>
                  )}
                  content={() => this.componentRef}
                  onBeforeGetContent={this.prepareElectronicThermalPrint}
                  onPrintError={() => toast.error("No se pudo iniciar la impresión. Verifica la impresora y vuelve a intentarlo.")}
                  pageStyle={(this.state.data.ncf || "").startsWith("E") ? "@page { size: auto; margin: 2mm; } @media print { html, body { width: 100% !important; max-width: none !important; margin: 0 !important; padding: 0 !important; } .ecf-thermal-receipt { width: 100% !important; max-width: none !important; box-sizing: border-box; } }" : undefined}
                  onAfterPrint={() => this.invoicePrinted()}
                  //onBeforePrint={() => this.invoicePrinted()}
                />
                </React.Fragment>
              )}
          </div>

          <div hidden="hidden">
            <PrintInvoice
              electronicData={this.state.electronicPrintData}
              ref={(el) => (this.componentRef = el)}
              invoiceHeader={this.state.serializedInvoiceHeader}
              invoiceDetail={this.state.serializedInvoiceDetail}
              itbisTotal={this.state.data.itbis}
              valorTotal={this.state.data.subtotal}
              discountTotal={this.state.data.discount}
              availablePoints={this.state.availablePoints}
              amountPoints={this.state.data.amount_points}
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
