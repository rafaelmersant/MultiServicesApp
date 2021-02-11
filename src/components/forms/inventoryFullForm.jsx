import React from "react";
import { NavLink } from "react-router-dom";
import Joi from "joi-browser";
import { toast } from "react-toastify";
import DatePicker from "react-datepicker";
import Form from "../common/form";
import SearchProduct from "../common/searchProduct";
import Input from "../common/input";
// import Select from "../common/select";
import ProductModal from "../modals/productModal";
import { getCurrentUser } from "../../services/authService";
import { saveProduct } from "../../services/productService";
import { getProviders } from "../../services/providerService";
import {
  saveProductTrackingHeader,
  saveProductTracking,
  updateProductStock,
  getProductsTrackingsByHeader,
  getProductsTrackingsHeaderById,
  deleteTracking,
} from "../../services/inventoryService";
import ProductsInvTable from "../tables/productsInvTable";
import PriceCalculation from "../common/priceCalculation";

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
      reference: "",
      paid: false,
      docDate: new Date().toISOString(),
      creationDate: new Date().toISOString(),
      serverDate: new Date().toISOString(),
      company_id: getCurrentUser().companyId,
      createdUser: getCurrentUser().email,
    },
    inventory: {
      header_id: 1, //Default header
      id: 0,
      product_id: "",
      typeTracking: "E",
      quantity: "",
      price: "",
      cost: "",
      company_id: getCurrentUser().companyId,
      createdUser: getCurrentUser().email,
      creationDate: new Date().toISOString(),
    },
    header: {},
    providers: [],
    product: {},
    details: [],
    detailsToDelete: [],
    typeTrackings: [
      { id: "E", name: "Entrada" },
      { id: "S", name: "Salida" },
    ],
    errors: {},
    docDate: new Date(),
    creationDate: new Date(),
    action: "Nuevo Registro de Inventario",
    hideSearch: false,
    availableStock: 0,
    searchProductText: "",
    showDetail: false,
    resetValues: false,
    buttonAction: "Agregar Detalle",
  };

  schema = {
    id: Joi.number(),
    provider_id: Joi.optional(),
    ncf: Joi.optional(),
    totalAmount: Joi.optional(),
    itbis: Joi.optional(),
    cost: Joi.optional(),
    reference: Joi.optional(),
    paid: Joi.optional(),
    docDate: Joi.optional(),
    company_id: Joi.number().label("Compañîa"),
    createdUser: Joi.string(),
    creationDate: Joi.string(),
    serverDate: Joi.string(),
  };

  handleSelectProduct = async (product) => {
    const handler = (e) => {
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

    this.setState({
      inventory,
      product,
      searchProductText: product.description,
      hideSearch: true,
      resetValues: true,
    });
  };

  handleFocusProduct = (value) => {
    setTimeout(() => {
      this.setState({ hideSearch: value });
    }, 200);
  };

  handleSetNewProduct = (e) => {
    this.setState({ searchProductText: `${e.description}` });
    this.handleSelectProduct(e);
  };

  handleResetValues = (e) => {
    this.setState({ resetValues: e });
  };

  async populateProviders() {
    const { data: providers } = await getProviders(getCurrentUser().companyId);
    this.setState({ providers });
  }

  async populateDetail() {
    const { data: details } = await getProductsTrackingsByHeader(
      this.state.header.id
    );

    this.setState({ details: details.results });
  }

  async populateHeader() {
    try {
      const headerId = this.props.match.params.id;
      if (headerId === "new") return;

      let { data: header } = await getProductsTrackingsHeaderById(headerId);
      header = header.results;

      this.setState({
        data: this.mapToViewModel(header),
        header: header[0],
        showDetail: true,
        docDate: new Date(header[0].docDate),
        creationDate: new Date(header[0].creationDate),
        buttonAction: "Guardar cambios",
        action: "Editar Entrada de Inventario",
      });

      setTimeout(() => {
        this.populateDetail();
      }, 200);
    } catch (ex) {
      if (ex.response && ex.response.status === 404)
        return this.props.history.replace("/not-found");
    }
  }

  mapToViewModel(header) {
    return {
      id: header[0].id,
      provider_id: header[0].provider.id,
      ncf: header[0].ncf ? header[0].ncf : "",
      totalAmount: header[0].totalAmount ? header[0].totalAmount : 0,
      itbis: header[0].itbis ? header[0].itbis : 0,
      cost: header[0].cost ? header[0].cost : 0,
      docDate: header[0].docDate,
      paid: header[0].paid,
      reference: header[0].reference ? header[0].reference : "",
      creationDate: header[0].creationDate,
      serverDate: header[0].serverDate,
      company_id: header[0].company.id,
      createdUser: header[0].createdUser
        ? header[0].createdUser
        : getCurrentUser().email,
    };
  }

  async componentDidMount() {
    this._isMounted = true;
    await this.populateProviders();
    await this.populateHeader();
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  updateProduct = async (inventory) => {
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

      const cleanInventory = { ...this.state.inventory };
      cleanInventory.product_id = "";
      cleanInventory.quantity = "";
      cleanInventory.price = "";
      cleanInventory.cost = "";
      cleanInventory.typeTracking = "E";

      this.setState({ inventory: cleanInventory, searchProductText: "" });

      this.setState({ resetValues: true });
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
      if (this.state.showDetail) toast.success("Los cambios fueron guardados!");

      window.location = `/inventoryFull/${header.id}`;
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

  handleChangeDocDate = (date) => {
    const data = { ...this.state.data };
    data.docDate = date.toISOString();
    this.setState({ data, docDate: date });
  };

  handleChangeCreationDate = (date) => {
    const data = { ...this.state.data };
    data.creationDate = date.toISOString();
    this.setState({ data, creationDate: date });
  };

  handleChangeInput = ({ currentTarget: input }) => {
    const inventory = { ...this.state.inventory };
    inventory[input.name] = input.value;

    this.setState({ inventory });
  };

  handleChangePaid = async () => {
    const { data } = { ...this.state };
    data.paid = !data.paid;
    this.setState({ data });
  };

  newEntry = () => {
    window.location = `/inventoryFull/new`;
  };

  handleDelete = async (detail) => {
    const answer = window.confirm(
      "Esta seguro de eliminar este producto? \nNo podrá deshacer esta acción"
    );
    if (answer) {
      const originalDetail = this.state.details;
      const details = this.state.details.filter((m) => m.id !== detail.id);
      this.setState({ details });

      try {
        await deleteTracking(detail);
      } catch (ex) {
        if (ex.response && ex.response.status === 404)
          toast.error("Este producto ya fue eliminado");

        this.setState({ details: originalDetail });
      }
    }
  };

  handleChangeCalculation = (e) => {
    const inventory = { ...this.state.inventory };
    inventory.cost = e.priceC2;
    inventory.price = e.priceSales;

    this.setState({ inventory });
  };

  render() {
    return (
      <React.Fragment>
        <div className="row">
        <div className="col-8">
          <button className="btn btn-success mb-3 pull-right" onClick={this.newEntry}>
            Nueva Entrada
          </button>
        </div>
        </div>
        
        <div className="container pull-left col-lg-8 col-md-11 col-sm-11 ml-3 shadow p-3 mb-5 bg-white rounded">
          <h2 className="bg-dark text-light pl-2 pr-2">{this.state.action}</h2>

          <form onSubmit={this.handleSubmit}>
            <div className="header">
              <div className="col-12 pb-3 bg-light">
                <div className="row mb-3 mr-2 ml-1">
                  <label htmlFor="creationDate" style={{ marginRight: "10px" }}>
                    Fecha
                  </label>
                  <DatePicker
                    selected={this.state.creationDate}
                    onChange={(date) => this.handleChangeCreationDate(date)}
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
                  <div className="col-3">{this.renderInput("ncf", "NCF")}</div>
                  <div
                    className="col-3"
                    style={{ marginTop: "35px", paddingLeft: "30px" }}
                  >
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

                <div className="row">
                  <div className="col">
                    {this.renderInput("totalAmount", "Monto Total")}
                  </div>
                  <div className="col">
                    {this.renderInput("itbis", "ITBIS")}
                  </div>

                  <div className="col-3">
                    {this.renderInput("reference", "Factura/Referencia")}
                  </div>

                  <div className="col">
                    <label htmlFor="docDate">Fecha Documento</label>
                    <DatePicker
                      selected={this.state.docDate}
                      onChange={(date) => this.handleChangeDocDate(date)}
                      dateFormat="dd/MM/yyyy"
                    />
                  </div>
                </div>

                {this.renderButton(this.state.buttonAction)}
              </div>
            </div>
          </form>

          {this.state.showDetail && (
            <div className="detail">
              <div className="col pb-3 bg-light">
                <div className="row">
                  <table style={{ width: "95%" }} className="ml-3">
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
                            name="cost"
                            value={this.state.inventory.cost}
                            label="Costo"
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
                      </tr>
                    </thead>
                  </table>
                </div>

                <PriceCalculation
                  onChange={this.handleChangeCalculation}
                  onResetValues={this.handleResetValues}
                  resetValues={this.state.resetValues}
                />

                <button
                  className="btn btn-success pl-5 pr-5 mt-3"
                  onClick={this.attachNewProduct}
                  disabled={
                    !this.state.inventory.product_id ||
                    !this.state.inventory.quantity.length
                  }
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
                  ref={(button) => (this.raiseProductModal = button)}
                ></button>

                <ProductModal setNewProduct={this.handleSetNewProduct} />
              </div>
            </div>
          )}
        </div>

        <div className="container pull-left col-lg-9 col-md-11 col-sm-11 ml-3 mb-5">
          <NavLink className="btn btn-secondary" to="/inventoriesFull">
            {"<-"} Ir al listado
          </NavLink>
        </div>
      </React.Fragment>
    );
  }
}

export default InventoryFullForm;
