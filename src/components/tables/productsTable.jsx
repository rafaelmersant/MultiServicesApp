import React, { Component } from "react";
import { Link } from "react-router-dom";
import Table from "../common/table";
import auth, { getCurrentUser } from "../../services/authService";
import { formatNumber } from "../../utils/custom";
import { toast } from "react-toastify";
import {
  replaceProductStock,
  saveProductTracking,
} from "../../services/inventoryService";

class ProductsTable extends Component {
  state = {
    values: [],
  };

  handleChange = (event) => {
    const { values } = { ...this.state };
    values[event.target.id] = event.target.value;
  };

  async updateInventory(product, quantity) {
    if (product.id > 0) {
      const inventory = {
        header_id: 1,
        id: 0,
        product_id: product.id,
        typeTracking: "E",
        concept: "INVE",
        quantity: quantity,
        price: product.price,
        cost: product.cost,
        itbis: product.itbis,
        company_id: getCurrentUser().companyId,
        createdUser: getCurrentUser().email,
        creationDate: new Date().toISOString(),
      };

      try {
        await saveProductTracking(inventory);
      } catch (error) {
        console.log(error);
      }

      try {
        //await updateProductStock(inventory);
        await replaceProductStock(inventory);
      } catch (error) {
        console.log(error);
      }

      toast.success("La cantidad fue actualizada!");
      window.location.reload();
    }
  }

  updateInventoryProduct = async (product) => {
    await this.updateInventory(product, this.state.values[product.id]);
    //this.props.onRefreshList();
  };

  columns = [
    {
      path: "description",
      label: "Descripción",
      content: (product) => {
        if (
          auth.getCurrentUser().role === "Admin" ||
          auth.getCurrentUser().role === "Owner"
        ) {
          return (
            <Link to={`/product/${product.id}`}> {product.description} </Link>
          );
        } else {
          return <span className="text-info"> {product.description} </span>;
        }
      },
    },
    // {
    //   path: "quantity",
    //   label: "Cantidad",
    //   content: (item) => (
    //     <div className="text-right">{formatNumber(item.quantity ?? 0)}</div>
    //   ),
    // },
    {
      path: "quantity",
      label: "Cantidad / Sumar Cantidad",
      content: (item) => (
        <div className="d-flex justify-content-start min-quantity-column">
          <div>
            <input
              // id={item.id}
              type="text"
              readOnly={true}
              className="form-control form-control-sm"
              value={item.quantity ?? 0}
              onChange={this.handleChange}
            />
          </div>

          <div>
            <input
              id={item.id}
              type="text"
              className={`form-control form-control-sm ${
                item.updated === false ? "bg-white" : "bg-warning"
              }`}
              value={this.state.values[item.id]}
              onChange={this.handleChange}
            />
          </div>

          <div>
            <a
              href="#"
              className="fa fa-save text-danger ml-2"
              style={{ fontSize: "29px", textDecoration: "none" }}
              onClick={() => this.updateInventoryProduct(item)}
            />
          </div>
        </div>
      ),
    },
    {
      path: "price",
      label: "Precio",
      content: (item) => (
        <div className="text-right">{formatNumber(item.price)}</div>
      ),
    },
    {
      path: "cost",
      label: "Costo",
      content: (item) => (
        <div className="text-right">{formatNumber(item.cost)}</div>
      ),
    },
    {
      path: "itbis",
      label: "ITBIS",
      content: (item) => (
        <div className="text-right">{formatNumber(item.itbis)}</div>
      ),
    },
    { path: "category.description", label: "Categoria" },
    { path: "creationDate", label: "Creado (m/d/a)" },
  ];

  deleteColumn = {
    key: "delete",
    content: (product) => (
      <div className="text-center">
        <span
          onClick={() => this.props.onDelete(product)}
          className="fa fa-trash text-danger cursor-pointer trash-size"
        ></span>
      </div>
    ),
  };

  constructor() {
    super();
    const user = auth.getCurrentUser().email;
    const role = auth.getCurrentUser().role;

    if (user && (role === "Admin" || role === "Owner"))
      this.columns.push(this.deleteColumn);
  }

  render() {
    const { products, sortColumn, onSort } = this.props;

    return (
      <Table
        columns={this.columns}
        data={products}
        sortColumn={sortColumn}
        onSort={onSort}
      />
    );
  }
}

export default ProductsTable;
