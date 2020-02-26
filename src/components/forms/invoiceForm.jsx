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
import { getProducts, getProduct } from "../../services/productService";
import { getNextNCF, saveEntry } from "../../services/ncfService";
import {
  saveInvoiceHeader,
  saveInvoiceDetail,
  saveInvoiceSequence,
  getInvoiceSequence,
  getInvoiceHeader,
  getInvoiceDetail,
  deleteInvoiceDetail
} from "../../services/invoiceServices";
import {
  saveProductTracking,
  updateProductStock,
  getProductsStocks
} from "../../services/inventoryService";
import InvoiceDetailTable from "../tables/invoiceDetailTable";
import _ from "lodash";
import NewInvoiceModal from "../modals/newInvoiceModal";

registerLocale("es", es);

class InvoiceForm extends Form {
  _isMounted = false;

  state = {
    data: {
      id: 0,
      sequence: 0,
      ncf: "",
      customer_id: "",
      paymentMethod: "CASH",
      paid: false,
      reference: "",
      subtotal: 0,
      itbis: 0,
      discount: 0,
      typeDoc: "B02",
      company_id: getCurrentUser().companyId,
      createdUser: getCurrentUser().email,
      creationDate: new Date().toISOString(),
      serverDate: new Date().toISOString()
    },
    invoiceDate: new Date(),
    products: [],
    details: [],
    detailsToDelete: [],
    companies: [],
    line: {
      id: 0,
      invoice_id: 0,
      product_id: 0,
      product: "",
      quantity: 1,
      price: 0,
      cost: 0,
      itbis: 0,
      discount: 0,
      total: 0
    },
    paymentMethods: [
      { id: "CASH", name: "Efectivo" },
      { id: "CARD", name: "Tarjeta de Credito" },
      { id: "CREDIT", name: "Crédito" }
    ],
    typeDoc: [
      { id: "0", name: "No usar" },
      { id: "B01", name: "B01" },
      { id: "B02", name: "B02" }
    ],
    errors: {},
    currentProduct: {},
    invoiceSequence: {
      id: 0,
      sequence: 1,
      company_id: getCurrentUser().companyId,
      creationDate: new Date().toISOString(),
      createdUser: getCurrentUser().email
    },
    itbisAmount: 0.18,
    createdUserName: "",
    action: "Nueva Factura",
    hideSearchProduct: false,
    hideSearchCustomer: false,
    searchCustomerText: "",
    searchProductText: "",
    serializedInvoiceHeader: {},
    serializedInvoiceDetail: []
  };

  //Schema (Joi)
  schema = {
    id: Joi.number(),
    ncf: Joi.optional(),
    sequence: Joi.number().label("No. Factura"),
    customer_id: Joi.number().label("Cliente"),
    paymentMethod: Joi.optional(),
    paid: Joi.optional(),
    reference: Joi.optional(),
    subtotal: Joi.number().min(1),
    itbis: Joi.optional(),
    discount: Joi.optional(),
    typeDoc: Joi.optional(),
    company_id: Joi.number().label("Compañîa"),
    createdUser: Joi.string(),
    creationDate: Joi.string(),
    serverDate: Joi.string()
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
    line.quantity = 1;
    line.price = 0;
    line.cost = 0;
    line.itbis = 0;
    line.discount = 0;
    line.total = 0;

    this.setState({ line });
  }

  availableInStock = async productId => {
    const { data: stock } = await getProductsStocks(productId);
    return stock.length ? stock[0].quantityAvailable : 0;
  };

  newInvoice = () => {
    window.location = `/invoice/new`;
  };

  updateLine = product => {
    const line = { ...this.state.line };
    const { itbisAmount: _itbis } = { ...this.state };

    const discount = isNaN(parseFloat(line.discount))
      ? 0
      : Math.round(parseFloat(line.discount) * 100) / 100;

    const quantity = Math.round(parseFloat(line.quantity) * 100) / 100;
    const price = Math.round(parseFloat(product.price) * 100) / 100;
    const itbis =
      Math.round(parseFloat((price - discount) * _itbis) * 100) / 100;
    const total = Math.round((price - discount + itbis) * quantity * 100) / 100;

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

    this.state.details.forEach(item => {
      data.itbis += Math.round(parseFloat(item.itbis) * 100) / 100;
      data.discount += Math.round(parseFloat(item.discount) * 100) / 100;
      data.subtotal += Math.round(parseFloat(item.total) * 100) / 100;
    });

    this.setState({ data });

    //console.log("UpdateTotals - data", data);
  };

  async updateInventory(entry) {
    const inventory = {
      header_id: 1,
      id: 0,
      product_id: entry.product_id,
      typeTracking: "S",
      concept: "INVO",
      quantity: entry.quantity,
      company_id: getCurrentUser().companyId,
      createdUser: getCurrentUser().email,
      creationDate: new Date().toISOString()
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
    try {
      const sequence = this.props.match.params.id;
      if (sequence === "new") return;

      const { data: invoiceHeader } = await getInvoiceHeader(
        getCurrentUser().companyId,
        sequence
      );

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
        searchCustomerText: `${invoiceHeader[0].customer.firstName} ${invoiceHeader[0].customer.lastName}`,
        hideSearchCustomer: true,
        ncf: invoiceHeader[0].ncf.length,
        action: "Detalle de Factura",
        serializedInvoiceHeader: invoiceHeader,
        serializedInvoiceDetail: invoiceDetail,
        createdUserName: createdUserData[0].name
      });

      this.forceUpdate();

      if (sessionStorage["printInvoice"] === "y") {
        this.printButton.click();
        sessionStorage["printInvoice"] = "";
      }

      if (sessionStorage["newInvoice"] === "y") {
        this.raiseNewInvoiceModal.click();
        sessionStorage["newInvoice"] = null;
      }
    } catch (ex) {
      sessionStorage["newInvoice"] = null;

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
      reference: invoiceHeader[0].reference ? invoiceHeader[0].reference : "",
      subtotal: invoiceHeader[0].subtotal,
      itbis: invoiceHeader[0].itbis,
      discount: invoiceHeader[0].discount,
      company_id: invoiceHeader[0].company.id,
      createdUser: invoiceHeader[0].createdByUser
        ? invoiceHeader[0].createdByUser
        : getCurrentUser().email,
      creationDate: invoiceHeader[0].creationDate
    };
  }

  mapToViewInvoiceDetail(invoiceDetail) {
    let details = [];
    invoiceDetail.forEach(item => {
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
          Math.round(
            (parseFloat(item.price) * parseFloat(item.quantity) -
              parseFloat(item.discount) +
              parseFloat(item.itbis)) *
              100
          ) / 100
      });
    });

    return details;
  }

  handleChangeInvoiceDate = date => {
    const data = { ...this.state.data };
    data.creationDate = date.toISOString();
    this.setState({ data, invoiceDate: date });
  };

  handleSelectProduct = async product => {
    const handler = e => {
      e.preventDefault();
    };
    handler(window.event);

    if (product.id === 0) {
      this.raiseProductModal.click();
      return false;
    }

    const product_found = _.find(this.state.details, function(item) {
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
      //return false; //Uncomment this line for blocking the sales without stock
    }

    this.updateLine(product);

    this.setState({
      hideSearchProduct: true,
      currentProduct: product,
      searchProductText: product.description
    });
  };

  handleFocusProduct = value => {
    setTimeout(() => {
      this.setState({ hideSearchProduct: value });
    }, 200);
  };

  handleSelectCustomer = async customer => {
    const handler = e => {
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
      searchCustomerText: `${customer.firstName} ${customer.lastName}`
    });
  };

  handleFocusCustomer = value => {
    setTimeout(() => {
      this.setState({ hideSearchCustomer: value });
    }, 200);
  };

  handleAddDetail = () => {
    const handler = e => {
      e.preventDefault();
    };
    handler(window.event);

    setTimeout(() => {
      this.updateLine(this.state.currentProduct);
      const details = [...this.state.details];
      const line = { ...this.state.line };

      line.itbis = Math.round(line.itbis * line.quantity * 100) / 100;
      line.discount = Math.round(line.discount * line.quantity * 100) / 100;
      line.total = Math.round(line.total * 100) / 100;

      if (this.state.line.product_id) details.push(line);

      this.setState({
        details,
        currentProduct: {},
        searchProductText: ""
      });

      this.updateTotals();
      this.resetLineValues();
    }, 150);
  };

  handleDeleteDetail = (detail, soft = false) => {
    const detailsToDelete = [...this.state.detailsToDelete];
    if (!soft) detailsToDelete.push(detail);

    const details = this.state.details.filter(
      d => d.product_id !== detail.product_id
    );

    this.setState({ details, detailsToDelete });

    setTimeout(() => {
      this.updateTotals();
    });
  };

  handleEditDetail = async detail => {
    const handler = e => {
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
      searchProductText: line.product
    });

    this.handleDeleteDetail(detail, true);
  };

  handleChangePaid = async () => {
    const { data } = { ...this.state };
    data.paid = !data.paid;
    this.setState({ data });

    if (this.state.data.paid && this.state.data.id) {
      await saveInvoiceHeader(this.state.data);
    }
  };

  handleChangeNCF = async ({ currentTarget: input }) => {
    this.setNCF(input.value);
  };

  handleChangeQuantity = ({ currentTarget: input }) => {
    const line = { ...this.state.line };
    line[input.name] = input.value;
    this.setState({ line });

    if (this.state.currentProduct.length)
      this.updateLine(this.state.currentProduct);
  };

  handleChangeDiscount = ({ currentTarget: input }) => {
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

  handleSetNewCustomer = e => {
    this.handleSelectCustomer(e);
    this.forceUpdate();
  };

  handleSetNewProduct = e => {
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

  async getNextNCF() {
    const { data: entry } = await getNextNCF(
      this.state.data.typeDoc,
      getCurrentUser().companyId
    );

    if (entry.length) {
      const nextNCF =
        entry.length && entry[0].current + 1 <= entry[0].end
          ? entry[0].current + 1
          : 0;

      const data = { ...this.state.data };
      const sec = `00000000${nextNCF}`.substr(
        `00000000${nextNCF}`.length - 8,
        8
      );
      data.ncf = `${entry[0].typeDoc}${sec}`;
      this.setState({ data });

      const _entry = { ...entry[0] };
      _entry.current += 1;
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

    await this.populateProducts();
    await this.populateInvoice(false);

    if (!this.state.data.id) {
      await this.refreshNextInvoiceSequence();
      this.setNCF(this.state.data.typeDoc);
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  doSubmit = async () => {
    try {
      //console.log("doSubmit - state", this.state);
      if (this.state.data.typeDoc !== "0") this.getNextNCF();

      setTimeout(async () => {
        if (!this.state.data.id) await this.refreshNextInvoiceSequence();
        const { data: invoiceHeader } = await saveInvoiceHeader(
          this.state.data
        );

        this.state.details.forEach(async item => {
          const detail = {
            id: item.id,
            invoice_id: invoiceHeader.id,
            product_id: item.product_id,
            quantity: item.quantity,
            price: item.price,
            itbis: item.itbis,
            discount: item.discount,
            creationDate: new Date().toISOString()
          };

          await saveInvoiceDetail(detail);
          await saveInvoiceSequence(this.state.invoiceSequence);
          await this.updateInventory(detail);
        });

        this.state.detailsToDelete.forEach(async item => {
          await deleteInvoiceDetail(item.id);
        });
      }, 100);

      setTimeout(() => {
        //sessionStorage["printInvoice"] = "y";
        sessionStorage["newInvoice"] = "y";
        window.location = `/invoice/${this.state.data.sequence}`;
      }, this.state.details.length * 390);
    } catch (ex) {
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
          <h2 className="bg-dark text-light pl-2 pr-2">{this.state.action}</h2>
          <div
            className="col-12 pb-3 bg-light"
            disabled={!this.isInvoiceEditable()}
          >
            <form onSubmit={this.handleSubmit}>
              <div className="row pull-right">
                <label className="mr-1">Fecha</label>
                <div
                  className="mr-3"
                  disabled={
                    getCurrentUser().role !== "Admin" ||
                    getCurrentUser().role !== "Owner"
                  }
                >
                  <DatePicker
                    selected={this.state.invoiceDate}
                    onChange={date => this.handleChangeInvoiceDate(date)}
                    dateFormat="dd/MM/yyyy"
                  />
                </div>
              </div>

              <div className="row">
                <div className="col-8" style={{ paddingLeft: "0" }}>
                  <SearchCustomer
                    onSelect={this.handleSelectCustomer}
                    onFocus={() => this.handleFocusCustomer(false)}
                    onBlur={() => this.handleFocusCustomer(true)}
                    hide={this.state.hideSearchCustomer}
                    value={this.state.searchCustomerText}
                    companyId={getCurrentUser().companyId}
                  />
                </div>

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
                <div className="col-4">
                  {this.renderSelect(
                    "paymentMethod",
                    "Metodo de Pago",
                    this.state.paymentMethods
                  )}
                </div>
                <div className="col-6">
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
                <div className="col-1 mr-0 ml-0 pr-0 pl-0">
                  <Input
                    type="text"
                    name="quantity"
                    value={this.state.line.quantity}
                    label="Cant."
                    onChange={this.handleChangeQuantity}
                  />
                </div>
                <div className="col-5 mr-0 ml-0 pr-0 pl-0">
                  <SearchProduct
                    onSelect={this.handleSelectProduct}
                    onFocus={() => this.handleFocusProduct(false)}
                    onBlur={() => this.handleFocusProduct(true)}
                    hide={this.state.hideSearchProduct}
                    companyId={getCurrentUser().companyId}
                    value={this.state.searchProductText}
                    label="Producto"
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
                    onChange={this.handleChangeDiscount}
                    onBlur={this.handleBlurDiscount}
                  />
                </div>
                <div
                  className="col-1 pt-0 pb-0 mr-0 ml-0 pr-0 pl-0"
                  style={{ marginTop: "1.98em" }}
                >
                  <button
                    className="btn btn-info"
                    onClick={this.handleAddDetail}
                    disabled={!this.state.line.product_id}
                  >
                    Agregar
                  </button>
                </div>
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
            ref={button => (this.raiseCustomerModal = button)}
          ></button>
          <button
            type="button"
            data-toggle="modal"
            data-target="#productModal"
            hidden="hidden"
            ref={button => (this.raiseProductModal = button)}
          ></button>

          <CustomerModal setNewCustomer={this.handleSetNewCustomer} />
          <ProductModal setNewProduct={this.handleSetNewProduct} />

          {this.state.data.id > 0 &&
            (getCurrentUser().role === "Admin" ||
              getCurrentUser().role === "Owner") && (
              <ReactToPrint
                trigger={() => (
                  <button
                    ref={button => (this.printButton = button)}
                    className="fa fa-print text-success pull-right"
                    style={{ fontSize: "30px" }}
                  ></button>
                )}
                content={() => this.componentRef}
              />
            )}
          <div hidden="hidden">
            <PrintInvoice
              ref={el => (this.componentRef = el)}
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
            className="btn btn-warning mb-3 pull-right"
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
            ref={button => (this.raiseNewInvoiceModal = button)}
          ></button>
          <NewInvoiceModal />
        </div>
      </React.Fragment>
    );
  }
}

export default InvoiceForm;
