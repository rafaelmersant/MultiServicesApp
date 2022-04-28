import React from "react";
import _ from "lodash";
import * as Sentry from "@sentry/react";
import { NavLink } from "react-router-dom";
import Joi from "joi-browser";
import { toast } from "react-toastify";
import ReactToPrint from "react-to-print";
import Form from "../common/form";
import Input from "../common/input";
import SearchProduct from "../common/searchProduct";
import SearchCustomer from "../common/searchCustomer";
import Loading from "../common/loading";
import { formatNumber } from "../../utils/custom";
import CustomerModal from "../modals/customerModal";
import ProductModal from "../modals/productModal";
import DatePicker from "react-datepicker";
import { registerLocale } from "react-datepicker";
import es from "date-fns/locale/es";
import PrintQuotation from "../reports/printQuotation";
import { getCurrentUser } from "../../services/authService";
import { getUserByEmail } from "../../services/userService";
import { getProductsStocks } from "../../services/inventoryService";
import { getProducts, getProduct } from "../../services/productService";
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
      quantity: 0,
      price: 0,
      cost: 0,
      itbis: 0,
      discount: 0,
      total: 0,
    },
    errors: {},
    currentProduct: {},
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

  newQuotation = () => {
    window.location = `/quotation/new`;
  };

  updateLine = (product) => {
    const line = { ...this.state.line };

    const discount = isNaN(parseFloat(line.discount))
      ? 0
      : Math.round(parseFloat(line.discount) * 100) / 100;

    const quantity = Math.round(parseFloat(line.quantity) * 100) / 100;
    const price = Math.round(parseFloat(product.price) * 100) / 100;
    const itbis = Math.round(parseFloat(product.itbis) * 100) / 100;
    const total = Math.round(price * quantity * 100) / 100;

    line.quantity = quantity;
    line.product_id = product.id;
    line.product = product.description;
    line.price = price;
    line.cost = Math.round(product.cost * 100) / 100;
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

    this.state.details.forEach((item) => {
      data.itbis += Math.round(parseFloat(item.itbis) * 100) / 100;
      data.discount += Math.round(parseFloat(item.discount) * 100) / 100;
      data.subtotal += Math.round(parseFloat(item.total) * 100) / 100;
    });

    data.itbis = Math.round(data.itbis * 100) / 100;
    data.discount = Math.round(data.discount * 100) / 100;
    data.subtotal = Math.round(data.subtotal * 100) / 100;

    this.setState({ data });
  };

  async populateQuotation() {
    try {
      const header_id = this.props.match.params.id;
      if (header_id === "new")  {
        this.setState({ loading: false})
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
        loading: false
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
    //   if (line.quantity > this.state.currentProduct.quantity) {
    //     toast.error(
    //       `La cantidad no puede exceder lo disponible: ${this.state.currentProduct.quantity}`
    //     );
    //     return false;
    //   }

      line.itbis = Math.round(line.itbis * line.quantity * 100) / 100;
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
    if (!parseFloat(this.state.line.quantity) > 0) return true;

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

  doSubmit = async () => {
    try {
      if (this.state.disabledSave) return false;

      this.setState({ disabledSave: true });

      const { data: quotationHeader } = await saveQuotationHeader(this.state.data);

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

      this.setState({ disabledSave: false });

      sessionStorage["newQuotation"] = "y";
      window.location = `/quotation/${quotationHeader.id}`;
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
    this.setState({currentProduct: {}, searchProductText: ""});
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
              !this.state.action.includes("Nueva")
              && this.state.data.id}
          </h4>
          <div
            className="col-12 pb-3 bg-light"
            disabled={!this.isQuotationEditable()}
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
                {Object.keys(this.state.currentProduct).length > 0  && (
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
              
              {!this.state.loading && (<QuotationDetailTable
                quotationHeader={this.state.data}
                details={this.state.details}
                user={user}
                onDelete={this.handleDeleteDetail}
                onEdit={this.handleEditDetail}
              />)}

              {this.isQuotationEditable() && this.renderButton("Guardar")}
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
            {this.state.data.id > 0 && (role === "Admin" || role === "Owner" || role === "Caja") && (
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