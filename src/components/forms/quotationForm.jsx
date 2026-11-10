import React from "react";
import _ from "lodash";
import * as Sentry from "@sentry/react";
import { NavLink } from "react-router-dom";
import Joi from "joi-browser";
import { toast } from "react-toastify";
import ReactToPrint from "react-to-print";
import Form from "../common/form";
import Input from "../common/input";
import { InvoiceProductSearch as SearchProduct, InvoiceCustomerSearch as SearchCustomer } from "../common/invoiceSearch";
import Loading from "../common/loading";
import { formatNumber, formatNumberThreeDecimals } from "../../utils/custom";
import CustomerModal from "../modals/customerModal";
import ProductModal from "../modals/productModal";
import DatePicker from "react-datepicker";
import { registerLocale } from "react-datepicker";
import es from "date-fns/locale/es";
import PrintQuotation from "../reports/printQuotation";
import { getCurrentUser } from "../../services/authService";
import { getUserByEmail } from "../../services/userService";
import { getProductsStocks } from "../../services/inventoryService";
import { getProducts } from "../../services/productService";
import {
  saveQuotationHeader,
  saveQuotationDetail,
  getQuotationHeader,
  getQuotationDetail,
  deleteQuotationDetail,
} from "../../services/quotationServices";

import QuotationDetailTable from "../tables/quotationDetailTable";

import {
  mapToViewQuotationDetail,
  mapToViewQuotationHeader,
} from "../mappers/mapQuotation";

registerLocale("es", es);

class QuotationForm extends Form {
  _isMounted = false;

  state = {
    data: {
      id: 0,
      customer_id: "",
      printed: false,
      reference: "",
      subtotal: 0,
      itbis: 0,
      discount: 0,
      company_id: getCurrentUser().companyId,
      createdUser: getCurrentUser().email,
      creationDate: new Date().toISOString(),
      serverDate: new Date().toISOString(),
    },
    saving: false,
    loading: true,
    disabledSave: false,
    quotationDate: new Date(),
    products: [],
    details: [],
    detailsOriginal: [],
    detailsToDelete: [],
    companies: [],
    line: {
      id: 0,
      header_id: 0,
      product_id: 0,
      product: "",
      quantity: "",
      price: 0,
      cost: 0,
      itbis: 0,
      discount: 0,
      total: 0,
    },
    errors: {},
    currentProduct: {},
    editingProductId: 0,
    detailBusy: false,
    createdUserName: "",
    action: "Nueva Cotización",
    clearSearchProduct: false,
    hideSearchProduct: false,
    hideSearchCustomer: false,
    searchCustomerText: "",
    searchProductText: "",
    serializedQuotationHeader: {},
    serializedQuotationDetail: [],
  };

  //Schema (Joi)
  schema = {
    id: Joi.number(),
    customer_id: Joi.number().label("Cliente"),
    printed: Joi.optional(),
    reference: Joi.optional(),
    subtotal: Joi.number().min(1),
    itbis: Joi.optional(),
    discount: Joi.optional(),
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
    line.quantity = "";
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

  newQuotation = () => {
    window.location = `/quotation/new`;
  };

  updateLine = (product) => {
    const line = { ...this.state.line };

    const discount = isNaN(parseFloat(line.discount))
      ? 0
      : Math.round(parseFloat(line.discount) * 100) / 100;

    const numericQuantity = Number(line.quantity);
    const quantity = Number.isFinite(numericQuantity) ? Math.round(numericQuantity * 100) / 100 : 0;
    const price = Math.round(parseFloat(product.price) * 100) / 100;
    const itbis = Math.round(parseFloat(product.itbis) * 1000) / 1000;
    const total = Math.round(price * quantity * 100) / 100;

    // Keep empty and partial decimal input while typing; normalize only on Add.
    line.product_id = product.id;
    line.product = product.description;
    line.price = price;
    line.cost = Math.round(product.cost * 100) / 100;
    line.itbis = Math.round(itbis * 1000) / 1000;
    line.discount = Math.round(discount * 100) / 100;
    line.total = total;

    this.setState({ line });
    return line;
  };

  updateTotals = async () => {
    const data = { ...this.state.data };
    data.itbis = 0;
    data.discount = 0;
    data.subtotal = 0;

    this.state.details.forEach((item) => {
      const gross = Math.round(Number(item.total) * 100) / 100;
      const net = gross - Number(item.discount);
      data.itbis += gross > 0 ? Math.round(Number(item.itbis) * net / gross * 1000) / 1000 : 0;
      data.discount += Math.round(parseFloat(item.discount) * 100) / 100;
      data.subtotal += Math.round(parseFloat(item.total) * 100) / 100;
    });

    data.discount = Math.round(data.discount * 100) / 100;
    data.subtotal = Math.round(data.subtotal * 100) / 100;
    data.itbis = Math.round(data.itbis * 1000) / 1000;

    await new Promise(resolve => this.setState({ data }, resolve));
  };

  async populateQuotation() {
    try {
      const header_id = this.props.match.params.id;
      if (header_id === "new") {
        this.setState({ loading: false });
        return;
      }

      const { data: quotation } = await getQuotationHeader(
        getCurrentUser().companyId,
        header_id
      );
      const quotationHeader = quotation.results;

      const { data: quotationDetail } = await getQuotationDetail(
        quotationHeader[0].id
      );

      const { data: createdUserData } = await getUserByEmail(
        this.state.data.createdUser
      );

      const quotationHeaderMapped = mapToViewQuotationHeader(quotationHeader);

      this.setState({
        data: quotationHeaderMapped,
        details: mapToViewQuotationDetail(quotationDetail),
        detailsOriginal: mapToViewQuotationDetail(quotationDetail),
        quotationDate: new Date(quotationHeader[0].creationDate),
        searchCustomerText: `${quotationHeader[0].customer.firstName} ${quotationHeader[0].customer.lastName}`,
        hideSearchCustomer: true,
        action: "Detalle de Cotización No. ",
        serializedQuotationHeader: quotationHeader,
        serializedQuotationDetail: quotationDetail,
        createdUserName: createdUserData[0].name,
        loading: false,
      });

      this.forceUpdate();

      if (sessionStorage["printInvoice"] === "y") {
        sessionStorage["printInvoice"] = "";
        this.printButton.click();
      }

      if (sessionStorage["newQuotation"] === "y") {
        sessionStorage["newQuotation"] = null;
      }
    } catch (ex) {
      sessionStorage["newQuotation"] = null;

      try {
        Sentry.captureException(ex);
      } catch (_ex) {
        console.log(ex);
      }

      if (ex.response && ex.response.status === 404)
        return this.props.history.replace("/not-found");
    }
  }

  handleChangeQuotationDate = (date) => {
    const data = { ...this.state.data };
    data.creationDate = date.toISOString();
    this.setState({ data, quotationDate: date });
  };

  focusQuantity = () => {
    const input = document.getElementById("quantity");
    if (input && !input.disabled) { input.focus(); input.select(); }
  };

  handleSelectProduct = async (product) => {
    const handler = (e) => {
      if (e && e.preventDefault) e.preventDefault();
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

    this.resetLineValues();
    this.setState({ editingProductId: 0 });
    const available = await this.availableInStock(product.id);
    if (available > 0) {
      toast.success(`Cantidad disponible: ${formatNumber(available)}`);
    } else {
      toast.error(`No tiene disponible en inventario`);
    }

    this.updateLine(product);

    this.setState({
      hideSearchProduct: true,
      currentProduct: product,
      searchProductText: product.description,
    }, this.focusQuantity);
  };

  handleFocusProduct = (value) => {
    setTimeout(() => {
      this.setState({ hideSearchProduct: value });
    }, 200);
  };

  handleSelectCustomer = async (customer) => {
    const handler = (e) => {
      if (e && e.preventDefault) e.preventDefault();
    };
    handler(window.event);

    if (customer.id === 0) {
      this.raiseCustomerModal.click();
      return false;
    }

    const data = { ...this.state.data };
    data.customer_id = customer.id;

    this.setState({
      data,
      hideSearchCustomer: true,
      searchCustomerText: `${customer.firstName} ${customer.lastName}`,
    });
  };

  handleFocusCustomer = (value) => {
    setTimeout(() => {
      this.setState({ hideSearchCustomer: value });
    }, 200);
  };

  handleAddDetail = async event => {
    if (event) event.preventDefault();
    if (this.state.detailBusy || this.validateLine()) return;
    const line = this.updateLine(this.state.currentProduct);
    if (Number(line.discount) < 0 || Number(line.discount) > Number(line.price)) {
      toast.error("El descuento por unidad debe estar entre cero y el precio.");
      return;
    }
    line.quantity = Math.round(Number(line.quantity) * 100) / 100;
    line.itbis = Math.round(line.itbis * line.quantity * 1000) / 1000;
    line.discount = Math.round(line.discount * line.quantity * 100) / 100;
    const original = this.state.details;
    const details = this.state.editingProductId
      ? original.map(item => item.product_id === this.state.editingProductId ? line : item)
      : [...original, line];
    await new Promise(resolve => this.setState({ details, detailBusy: true }, resolve));
    try {
      await this.updateTotals();
      if (this.state.data.id) await this.saveOneItem(line);
      this.handleCleanProduct();
    } catch (error) {
      await new Promise(resolve => this.setState({ details: original }, resolve));
      await this.updateTotals();
      toast.error("No se pudo guardar el producto. Revisa la cotización antes de reintentar.");
    } finally {
      this.setState({ detailBusy: false });
    }
  };

  handleDeleteDetail = async detail => {
    if (this.state.detailBusy || !window.confirm(`¿Eliminar ${detail.product} de la cotización?`)) return;
    const original = this.state.details;
    const details = original.filter(item => item.product_id !== detail.product_id);
    await new Promise(resolve => this.setState({ details, detailBusy: true }, resolve));
    try {
      await this.updateTotals();
      if (this.state.data.id) await this.deleteOneItem(detail);
      if (this.state.editingProductId === detail.product_id) this.handleCleanProduct();
    } catch (error) {
      await new Promise(resolve => this.setState({ details: original }, resolve));
      await this.updateTotals();
      toast.error("No se pudo eliminar el producto de la cotización.");
    } finally {
      this.setState({ detailBusy: false });
    }
  };

  handleEditDetail = detail => {
    if (this.state.detailBusy) return;
    const line = { ...detail, discount: detail.discount / detail.quantity, itbis: detail.itbis / detail.quantity };
    // Keep the original row until Actualizar is pressed; clearing cancels the edit.
    this.setState({
      line, editingProductId: detail.product_id,
      currentProduct: { id: detail.product_id, description: detail.product, price: detail.price,
        cost: detail.cost || 0, itbis: detail.itbis / detail.quantity },
      searchProductText: detail.product
    });
  };

  handleChangeQtyDisc = ({ currentTarget: input }) => {
    const line = { ...this.state.line };
    const value = input.name === "quantity" ? input.value.replace(",", ".") : input.value;
    if (input.name === "quantity" && !/^\d*(?:\.\d{0,2})?$/.test(value)) return;
    line[input.name] = value;
    this.setState({ line }, () => {
      if (this.state.currentProduct.id) this.updateLine(this.state.currentProduct);
    });
  };

  handleLineKeyDown = event => {
    if (event.key === "Enter") {
      event.preventDefault();
      if (!event.repeat && !event.nativeEvent.isComposing) this.handleAddDetail(event);
    }
  };

  handleBlurDiscount = () => {
    if (this.state.line.discount === "") {
      const line = { ...this.state.line };
      line.discount = 0;
      this.setState({ line });
    }
  };

  handleSetNewCustomer = (e) => {
    this.handleSelectCustomer(e);
    this.forceUpdate();
  };

  handleSetNewProduct = (e) => {
    this.setState({ searchProductText: `${e.description}` });
    this.handleSelectProduct(e);
  };

  isQuotationEditable = () => {
    const isNew = this.state.data.id === 0;
    const isUserCapable =
      getCurrentUser().role === "Admin" || getCurrentUser().role === "Owner";

    if (isNew) return isNew;
    else return !isNew && isUserCapable;
  };

  async componentDidMount() {
    this._isMounted = true;

    try {
      await this.populateProducts();
      await this.populateQuotation(false);
    } catch (ex) {
      try {
        Sentry.captureException(ex);
      } catch (_ex) {
        console.log(ex);
      }
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  validateLine() {
    if (!this.state.line.product_id) return true;
    if (!Number.isFinite(Number(this.state.line.quantity)) || Number(this.state.line.quantity) <= 0) return true;

    if (this.state.line.quantity > 0) return false;
  }

  async quotationPrinted() {
    const { data } = { ...this.state };
    data.printed = true;
    this.setState({ data });

    try {
      await saveQuotationHeader(this.state.data);
    } catch (ex) {
      try {
        Sentry.captureException(ex);
      } catch (_ex) {
        console.log(ex);
      }
      console.log("Exception for printed quotation --> " + ex);
    }
  }

  async saveOneItem(item) {
    const detail = {
      id: item.id,
      header_id: this.state.data.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.price,
      itbis: item.itbis,
      discount: item.discount,
      creationDate: new Date().toISOString(),
    };

    const { data: result } = await saveQuotationDetail(detail);

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
  }

  async deleteOneItem(item) {
    await deleteQuotationDetail(item.id);
  }

  doSubmit = async () => {
    try {
      if (this.state.disabledSave || this.state.detailBusy) return false;

      this.setState({ disabledSave: true, saving: true });

      const { data: quotationHeader } = await saveQuotationHeader(
        this.state.data
      );

      for (const item of this.state.details) {
        const detail = {
          id: item.id,
          header_id: quotationHeader.id,
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price,
          itbis: item.itbis,
          discount: item.discount,
          creationDate: new Date().toISOString(),
        };

        await saveQuotationDetail(detail);
      }

      try {
        for (const item of this.state.detailsToDelete) {
          await deleteQuotationDetail(item.id);
        }
      } catch (ex) {
        try {
          Sentry.captureException(ex);
        } catch (_ex) {
          console.log(ex);
        }
        console.log("Exception for deleteQuotationDetail --> " + ex);
      }

      this.setState({ disabledSave: false, saving: false });

      sessionStorage["newQuotation"] = "y";
      window.location = `/quotation/${quotationHeader.id}`;
    } catch (ex) {
      this.setState({ disabledSave: false, saving: false });
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

  handleCleanProduct = () => {
    this.setState({ currentProduct: {}, editingProductId: 0, searchProductText: "" });
    this.resetLineValues();
  };

  handleClearCustomerSelection = () => {
    this.setState(previous => ({
      data: { ...previous.data, customer_id: "" }, searchCustomerText: ""
    }));
  };

  render() {
    const { user } = this.props;
    const role = getCurrentUser().role;

    return (
      <React.Fragment>
        <div className="container-fluid">
          <h4 className="bg-dark text-light pl-2 pr-2 list-header">
            {this.state.action}
            {this.state.data.id > 0 &&
              !this.state.action.includes("Nueva") &&
              this.state.data.id}
          </h4>
          <div
            className="col-12 pb-3 bg-light"
            disabled={!this.isQuotationEditable()}
          >
            <form onSubmit={this.handleSubmit}>
              <div className="row">
                <div className="col-8">
                  <SearchCustomer
                    onClear={this.handleClearCustomerSelection}
                    onSelect={this.handleSelectCustomer}
                    onFocus={() => this.handleFocusCustomer(false)}
                    onBlur={() => this.handleFocusCustomer(true)}
                    hide={this.state.hideSearchCustomer}
                    value={this.state.searchCustomerText}
                    companyId={getCurrentUser().companyId}
                    label="Cliente"
                  />
                </div>

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
                      selected={this.state.quotationDate}
                      onChange={(date) => this.handleChangeQuotationDate(date)}
                      dateFormat="dd/MM/yyyy hh:mm aa"
                      disabled={true}
                    />
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-8">
                  {this.renderInput(
                    "reference",
                    "Nota",
                    "text",
                    "",
                    "Opcional"
                  )}
                </div>
              </div>

              <div className="row mr-0 ml-0 pr-0 pl-0">
                <div className="col-5 mr-0 ml-0 pr-0 pl-0">
                  <SearchProduct
                    onClear={this.handleCleanProduct}
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


                <div className="col-1 mr-0 ml-0 pr-0 pl-0">
                  <Input
                    type="text"
                    name="quantity"
                    inputMode="decimal"
                    autoComplete="off"
                    onKeyDown={this.handleLineKeyDown}
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
                    onKeyDown={this.handleLineKeyDown}
                    value={this.state.line.discount}
                    label="Desc/Unidad"
                    onChange={this.handleChangeQtyDisc}
                    onBlur={this.handleBlurDiscount}
                    disabled={role !== "Admin" && role !== "Owner"}
                  />
                </div>
                <div
                  className="col-1 pt-0 pb-0 mr-0 ml-0 pr-0 pl-0"
                  style={{ marginTop: "1.98em" }}
                >
                  <button
                    className="btn btn-info btn-sm ml-1 pl-3 pr-3"
                    onClick={this.handleAddDetail}
                    type="button"
                    disabled={this.state.detailBusy || this.validateLine()}
                  >
                    {this.state.editingProductId ? "Actualizar" : "Agregar"}
                  </button>
                </div>
              </div>

              {this.state.loading && (
                <div className="d-flex justify-content-center">
                  <Loading />
                </div>
              )}

              {!this.state.loading && (
                <QuotationDetailTable
                  quotationHeader={this.state.data}
                  details={this.state.details}
                  user={user}
                  onDelete={this.handleDeleteDetail}
                  onEdit={this.handleEditDetail}
                />
              )}

              {!this.saving && this.isQuotationEditable() && this.renderButton("Guardar")}
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

          <div className="container-fluid mt-3">
            {(role === "Admin" || role === "Owner" || role === "Caja") && (
              <NavLink className="btn btn-secondary" to="/quotations">
                {"<-"} Ir al listado
              </NavLink>
            )}

            <button
              className="btn btn-success mb-3 pull-right"
              onClick={this.newQuotation}
            >
              Nueva Cotización
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
                  onAfterPrint={() => this.quotationPrinted()}
                  //onBeforePrint={() => this.quotationPrinted()}
                />
              )}
          </div>

          <div hidden="hidden">
            <PrintQuotation
              ref={(el) => (this.componentRef = el)}
              quotationHeader={this.state.serializedQuotationHeader}
              quotationDetail={this.state.serializedQuotationDetail}
              itbisTotal={this.state.data.itbis}
              valorTotal={this.state.data.subtotal}
              discountTotal={this.state.data.discount}
            />
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default QuotationForm;