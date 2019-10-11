import React from "react";
import Joi from "joi-browser";
import { toast } from "react-toastify";
import Form from "./common/form";
import Input from "./common/input";
import SearchProduct from "./common/searchProduct";
import SearchCustomer from "./common/searchCustomer";
import { formatNumber } from "../utils/custom";
import { getCurrentUser } from "../services/authService";
import { getProducts } from "../services/productService";
import {
  saveInvoiceHeader,
  getNextInvoiceSequence,
  saveInvoiceDetail,
  getInvoiceHeader,
  getInvoiceDetail
} from "../services/invoiceServices";
import {
  saveProductTracking,
  updateProductStock,
  getProductsStocks
} from "../services/inventoryService";
import InvoiceDetailTable from "./invoiceDetailTable";
import _ from "lodash";

class InvoiceForm extends Form {
  _isMounted = false;

  state = {
    data: {
      id: 0,
      sequence: 0,
      customer_id: "",
      ncf: "",
      paymentMethod: "CASH",
      paid: true,
      reference: "",
      subtotal: 0,
      itbis: 0,
      discount: 0,
      company_id: getCurrentUser().companyId,
      createdUser: getCurrentUser().email,
      creationDate: new Date().toISOString()
    },
    products: [],
    details: [],
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
      discount: "",
      total: 0
    },
    paymentMethods: [
      { id: "CASH", name: "Efectivo" },
      { id: "CREDIT", name: "Tarjeta de Credito" }
    ],
    errors: {},
    currentProduct: {},
    action: "Nueva Factura",
    hideSearchProduct: false,
    hideSearchCustomer: false,
    ncf: false,
    searchCustomerText: "",
    searchProductText: ""
  };

  //Schema (Joi)
  schema = {
    id: Joi.number(),
    sequence: Joi.number().label("No. Factura"),
    customer_id: Joi.number().label("Cliente"),
    ncf: Joi.optional().label("NCF"),
    paymentMethod: Joi.optional(),
    paid: Joi.optional(),
    reference: Joi.optional(),
    subtotal: Joi.optional(),
    itbis: Joi.optional(),
    discount: Joi.optional(),
    company_id: Joi.number().label("Compañîa"),
    createdUser: Joi.string(),
    creationDate: Joi.string()
  };

  async populateProducts() {
    const companyId = getCurrentUser().companyId;
    const { data: products } = await getProducts(companyId);
    this.setState({ products });
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

  updateLine = product => {
    const line = { ...this.state.line };

    const discount = isNaN(parseFloat(line.discount))
      ? 0
      : Math.round(parseFloat(line.discount) * 100) / 100;

    const quantity = Math.round(parseFloat(line.quantity) * 100) / 100;
    const price = Math.round(parseFloat(product.price) * 100) / 100;
    const itbis = Math.round(parseFloat(product.itbis) * 100) / 100;
    const total = Math.round(price * quantity * 100) / 100;

    line.id = product.id;
    line.quantity = quantity;
    line.product_id = product.id;
    line.product = product.description;
    line.price = price;
    line.cost = Math.round(product.cost * 100) / 100;
    line.itbis = Math.round(itbis * quantity * 100) / 100;
    line.discount = Math.round(discount * 100) / 100;
    line.total = Math.round((total + itbis - discount) * 100) / 100;

    this.setState({ line });
  };

  async updateInventory(entry) {
    const inventory = {
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

  refreshNextInvoiceSequence() {
    const companyId = getCurrentUser().companyId;
    const { data } = { ...this.state };

    data.sequence = getNextInvoiceSequence(companyId);
    this.setState({ data });
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

      this.setState({
        data: this.mapToViewInvoiceHeader(invoiceHeader),
        details: this.mapToViewInvoiceDetail(invoiceDetail),
        action: "Detalle de Factura"
      });
    } catch (ex) {
      if (ex.response && ex.response.status === 404)
        return this.props.history.replace("/not-found");
    }
  }

  mapToViewInvoiceHeader(invoiceHeader) {
    return {
      id: invoiceHeader[0].id,
      sequence: invoiceHeader[0].sequence,
      customer_id: invoiceHeader[0].customer_id,
      ncf: invoiceHeader[0].ncf,
      paymentMethod: invoiceHeader[0].paymentMethod,
      paid: invoiceHeader[0].paid,
      reference: invoiceHeader[0].reference,
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
      console.log(item.quantity);
      details.push({
        id: item.id,
        invoice_id: item.invoice.id,
        product_id: item.product.id,
        product: item.product.description,
        quantity: 0, //item.quantity,
        price: item.price,
        cost: 0, //item.cost,
        itbis: 0, //item.itbis,
        discount: 0, //item.discount,
        total: 0 //item.price * item.quantity + item.itbis - item.discount
      });
    });

    return details;
    // return {
    //   id: invoiceDetail[0].id,
    //   sequence: invoiceDetail[0].sequence,
    //   customer_id: invoiceDetail[0].customer_id,
    //   ncf: invoiceDetail[0].ncf,
    //   paymentMethod: invoiceDetail[0].paymentMethod,
    //   paid: invoiceDetail[0].paid,
    //   reference: invoiceDetail[0].reference,
    //   subtotal: invoiceDetail[0].subtotal,
    //   itbis: invoiceDetail[0].itbis,
    //   discount: invoiceDetail[0].discount,
    //   company_id: invoiceDetail[0].company.id,
    //   createdUser: invoiceDetail[0].createdByUser
    //     ? invoiceDetail[0].createdByUser
    //     : getCurrentUser().email,
    //   creationDate: invoiceDetail[0].creationDate
    // };
  }

  handleSelectProduct = async product => {
    const handler = e => {
      e.preventDefault();
    };
    handler(window.event);

    const product_found = _.find(this.state.details, function(item) {
      return item.id === product.id;
    });

    if (product_found !== undefined) {
      toast.error("Este producto ya fue agregado.");
      return false;
    }

    this.updateLine(product);

    this.setState({
      hideSearchProduct: true,
      currentProduct: product,
      searchProductText: product.description
    });

    const { data: stock } = await getProductsStocks(product.id);
    const available = stock.length ? stock[0].quantityAvailable : 0;
    if (available > 0) toast.success(`Cantidad disponible: ${available}`);
    else toast.error(`No tiene disponible en inventario`);
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

    this.updateLine(this.state.currentProduct);

    const data = { ...this.state.data };
    const { line } = this.state;
    data.itbis += parseFloat(line.itbis);
    data.subtotal += parseFloat(line.total);
    data.discount += parseFloat(line.discount);
    console.log("data.discount", data.discount);

    setTimeout(() => {
      let details = [...this.state.details];
      if (this.state.line.id) details.push(this.state.line);

      this.setState({
        data,
        details,
        currentProduct: {},
        searchProductText: ""
      });

      this.resetLineValues();
    }, 100);
  };

  handleDeleteDetail = detail => {
    let details = { ...this.state.details };
    _.remove(details, { id: detail.id });

    console.log(details);
    //this.setState({ details });
  };

  handleEditDetail = detail => {
    console.log(detail);
  };

  handleChangePaid = () => {
    const { data } = { ...this.state };
    data.paid = !data.paid;
    this.setState({ data });
  };

  handleChangeNCF = () => {
    this.setState({ ncf: !this.state.ncf });
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

  async componentDidMount() {
    this._isMounted = true;

    await this.populateProducts();
    await this.populateInvoice();

    const companyId = getCurrentUser().companyId;
    const { data: sequence } = await getNextInvoiceSequence(companyId);

    const { data } = { ...this.state };
    data.sequence = sequence.sequence;
    this.setState({ data });
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  doSubmit = async () => {
    try {
      console.log(this.state.data);
      const { data: invoiceHeader } = await saveInvoiceHeader(this.state.data);

      this.state.details.forEach(async item => {
        const detail = {
          id: 0,
          invoice_id: invoiceHeader.id,
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price,
          itbis: item.itbis,
          discount: item.discount,
          creationDate: new Date().toISOString()
        };
        await saveInvoiceDetail(detail);
        await this.updateInventory(detail);
      });

      this.props.history.push("/invoices");
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
      <div className="container pull-left col-lg-9 col-md-11 col-sm-11 ml-3 shadow-lg p-3 mb-5 bg-white rounded">
        <h2 className="bg-dark text-light pl-2 pr-2">{this.state.action}</h2>
        <div className="col-12 pb-3 bg-light">
          <form onSubmit={this.handleSubmit}>
            <div className="row">
              <div className="col-11">
                <SearchCustomer
                  onSelect={this.handleSelectCustomer}
                  onFocus={() => this.handleFocusCustomer(false)}
                  onBlur={() => this.handleFocusCustomer(true)}
                  hide={this.state.hideSearchCustomer}
                  value={this.state.searchCustomerText}
                  companyId={getCurrentUser().companyId}
                />
              </div>
              <div className="col-1 mt-4">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="chkNCF"
                  checked={this.state.ncf}
                  onChange={this.handleChangeNCF}
                />
                <label className="form-check-label" htmlFor="chkNCF">
                  NCF
                </label>
              </div>
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
              <div className="col mt-4">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="chkPaid"
                  checked={this.state.data.paid}
                  onChange={this.handleChangePaid}
                />
                <label className="form-check-label" htmlFor="chkPaid">
                  Pagada
                </label>
              </div>
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
                  label="Desc."
                  onChange={this.handleChangeDiscount}
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
              details={this.state.details}
              user={user}
              onDelete={this.handleDeleteDetail}
              onEdit={this.handleEditDetail}
            />

            {this.renderButton("Guardar")}
          </form>
        </div>
      </div>
    );
  }
}

export default InvoiceForm;
