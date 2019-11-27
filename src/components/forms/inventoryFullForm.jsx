import React from "react";
import Joi from "joi-browser";
import toast from "react-toastify";
import DatePicker from "react-datepicker";
import Form from "../common/form";
import SearchProduct from "../common/searchProduct";
import Input from "../common/input";
import Select from "../common/select";
import ProductModal from "../modals/productModal";
import { getCurrentUser } from "../../services/authService";
import { saveProduct } from "../../services/productService";
import { getProviders } from "../../services/providerService";
import {
  saveProductTrackingHeader,
  saveProductTracking,
  updateProductStock,
  getProductsTrackingsByHeader
} from "../../services/inventoryService";
import ProductsInvTable from "../tables/productsInvTable";

class InventoryFullForm extends Form {
  _isMounted = false;

  state = {
    data: {
      id: 0,
      provider_id: 0,
      ncf: "",
      totalAmount: 0,
      itbis: 0,
      cost: "",
      docDate: new Date().toISOString(),
      creationDate: new Date().toISOString(),
      serverDate: new Date().toISOString(),
      company_id: getCurrentUser().companyId,
      createdUser: getCurrentUser().email
    },
    inventory: {
      header_id: 0,
      id: 0,
      product_id: "",
      typeTracking: "E",
      quantity: "",
      price: "",
      cost: "",
      company_id: getCurrentUser().companyId,
      createdUser: getCurrentUser().email,
      creationDate: new Date().toISOString()
    },
    header: {},
    providers: [],
    product: {},
    details: [],
    detailsToDelete: [],
    typeTrackings: [
      { id: "E", name: "Entrada" },
      { id: "S", name: "Salida" }
    ],
    errors: {},
    docDate: new Date(),
    creationDate: new Date(),
    action: "Nuevo Registro de Inventario",
    hideSearch: false,
    availableStock: 0,
    searchProductText: "",
    showDetail: false
  };

  schema = {
    id: Joi.number(),
    provider_id: Joi.optional(),
    ncf: Joi.optional(),
    totalAmount: Joi.optional(),
    itbis: Joi.optional(),
    cost: Joi.optional(),
    docDate: Joi.optional(),
    company_id: Joi.number().label("Compañîa"),
    createdUser: Joi.string(),
    creationDate: Joi.string(),
    serverDate: Joi.string()
  };

  // async getProductStock(productId) {
  //   const { data: stock } = await getProductsStocks(productId);

  //   if (stock.length)
  //     this.setState({ availableStock: stock[0].quantityAvailable });
  // }

  handleSelectProduct = async product => {
    const handler = e => {
      e.preventDefault();
    };
    handler(window.event);

    if (product.id === 0) {
      this.raiseProductModal.click();
      return false;
    }

    const inventory = { ...this.state.inventory };
    inventory.product_id = product.id;
    inventory.price = product.price;
    inventory.cost = product.cost;

    // this.getProductStock(product.id);

    this.setState({
      inventory,
      product,
      searchProductText: product.description,
      hideSearch: true
    });
  };

  handleFocusProduct = value => {
    setTimeout(() => {
      this.setState({ hideSearch: value });
    }, 200);
  };

  handleSetNewProduct = e => {
    this.setState({ searchProductText: `${e.description}` });
    this.handleSelectProduct(e);
  };

  async populateProviders() {
    const { data: providers } = await getProviders();
    this.setState({ providers });
  }

  async populateDetail() {
    const { data: details } = await getProductsTrackingsByHeader(
      this.state.header.id
    );
    this.setState({ details });
  }

  async componentDidMount() {
    this._isMounted = true;
    await this.populateProviders();
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  updateProduct = async inventory => {
    const product = { ...this.state.product };
    product.price = inventory.price;
    product.cost = inventory.cost;
    product.category_id = product.category.id;
    product.company_id = product.company.id;

    await saveProduct(product);
  };

  attachNewProduct = async () => {
    try {
      const inventory = { ...this.state.inventory };
      inventory.header_id = this.state.header.id;

      await saveProductTracking(inventory);
      await updateProductStock(inventory);

      if (inventory.typeTracking === "E") this.updateProduct(inventory);
      this.populateDetail();
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
        console.log(this.state.errors);
      }
    }
  };

  doSubmit = async () => {
    try {
      const { data: header } = await saveProductTrackingHeader(this.state.data);

      this.setState({ header, showDetail: true });
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
        console.log(this.state.errors);
      }
    }
  };

  handleChangeDocDate = date => {
    const data = { ...this.state.data };
    data.docDate = date.toISOString();
    this.setState({ data, docDate: date });
  };

  handleChangeCreationDate = date => {
    const data = { ...this.state.data };
    data.creationDate = date.toISOString();
    this.setState({ data, creationDate: date });
  };

  handleChangeInput = ({ currentTarget: input }) => {
    const inventory = { ...this.state.inventory };
    inventory[input.name] = input.value;

    this.setState({ inventory });
  };

  render() {
    return (
      <div className="container pull-left col-lg-7 col-md-11 col-sm-11 ml-3 shadow-lg p-3 mb-5 bg-white rounded">
        <h2 className="bg-dark text-light pl-2 pr-2">{this.state.action}</h2>

        <form onSubmit={this.handleSubmit}>
          <div className="header">
            <div className="col-12 pb-3 bg-light">
              <div className="row mb-3 mr-2 ml-1">
                <label htmlFor="creationDate">Fecha Documento</label>
                <DatePicker
                  selected={this.state.creationDate}
                  onChange={date => this.handleChangeCreationDate(date)}
                  dateFormat="dd/MM/yyyy"
                />
              </div>

              <div className="row">
                <div className="col">
                  {this.renderSelect(
                    "provider_id",
                    "Proveedor",
                    this.state.providers
                  )}
                </div>
                <div className="col">{this.renderInput("ncf", "NCF")}</div>
              </div>

              <div className="row">
                <div className="col">
                  {this.renderInput("totalAmount", "Monto Total")}
                </div>
                <div className="col">{this.renderInput("itbis", "ITBIS")}</div>
                <div className="col">
                  <label htmlFor="docDate">Fecha Documento</label>
                  <DatePicker
                    selected={this.state.docDate}
                    onChange={date => this.handleChangeDocDate(date)}
                    dateFormat="dd/MM/yyyy"
                  />
                </div>
              </div>
              {!this.state.showDetail && this.renderButton("Agregar detalle")}
            </div>
          </div>
        </form>

        {this.state.showDetail && (
          <div className="detail">
            <div className="col pb-3 bg-light">
              <div className="row">
                <table className="w-100">
                  <thead>
                    <tr>
                      <td className="w-50">
                        <SearchProduct
                          onSelect={this.handleSelectProduct}
                          onFocus={() => this.handleFocusProduct(false)}
                          onBlur={() => this.handleFocusProduct(true)}
                          hide={this.state.hideSearch}
                          companyId={getCurrentUser().companyId}
                          value={this.state.searchProductText}
                          label="Producto"
                        />
                      </td>
                      <td>
                        <Select
                          name="typeTracking"
                          value={this.state.inventory.typeTracking}
                          label="Tipo"
                          options={this.state.typeTrackings}
                          onChange={this.handleChangeInput}
                          error={null}
                        />
                      </td>
                      <td>
                        <Input
                          type="text"
                          name="quantity"
                          value={this.state.inventory.quantity}
                          label="Cantidad"
                          onChange={this.handleChangeInput}
                        />
                      </td>
                      <td>
                        <Input
                          type="text"
                          name="price"
                          value={this.state.inventory.price}
                          label="Precio"
                          onChange={this.handleChangeInput}
                        />
                      </td>
                      <td>
                        <Input
                          type="text"
                          name="cost"
                          value={this.state.inventory.cost}
                          label="Costo"
                          onChange={this.handleChangeInput}
                        />
                      </td>
                    </tr>
                  </thead>
                </table>
              </div>

              {/* {false && (
                <div className="row">
                  {false && (
                    <div className="col">
                      {this.renderSelect(
                        "company_id",
                        "Compañía",
                        this.state.companies
                      )}
                    </div>
                  )}
                  <div className="col">
                    <Input
                      disabled="disabled"
                      type="text"
                      name="available"
                      value={formatNumber(this.state.availableStock)}
                      label="Disponible"
                    />
                  </div>
                </div>
              )} */}

              <button
                className="btn btn-success pl-5 pr-5"
                onClick={this.attachNewProduct}
              >
                Agregar
              </button>

              <div className="mt-2">
                <ProductsInvTable
                  products={this.state.details}
                  user={getCurrentUser()}
                  sortColumn={{ path: "creationDate", order: "desc" }}
                  onDelete={this.handleDelete}
                  onSort={this.handleSort}
                />
              </div>

              <button
                type="button"
                data-toggle="modal"
                data-target="#productModal"
                hidden="hidden"
                ref={button => (this.raiseProductModal = button)}
              ></button>

              <ProductModal setNewProduct={this.handleSetNewProduct} />
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default InventoryFullForm;
