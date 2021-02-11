import React, { Component } from "react";
import Input from "./input";
import { getProductsByDescription } from "../../services/productService";
import { formatNumber } from '../../utils/custom';

class SearchProduct extends Component {
  state = {
    products: [],
    erros: {},
    searchProductInput: ""
  };

  handleChange = async ({ currentTarget: input }) => {
    const descrp = input.value
      .toUpperCase()
      .split(" ")
      .join("%20");

    this.setState({ searchProductInput: input.value });

    let { data: products } = await getProductsByDescription(
      this.props.companyId,
      descrp
    );
    products = products.results;

    if (input.value === "") products = [];

    if (input.value.length > 0 && products.length === 0)
      products = [
        {
          id: 0,
          description: "No existe el producto, desea crearlo?",
          category: { id: 0, description: "" }
        }
      ];

    this.setState({ products });
  };

  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.hide && this.props === nextProps) return false;
    else return true;
  }

  componentDidUpdate() {
    if (this.props.hide)
      this.setState({ searchProductInput: this.props.value });
  }

  render() {
    const { onSelect, onFocus, onBlur, hide, label = "" } = this.props;
    const { products } = this.state;

    return (
      <div>
        <Input
          type="text"
          name="query"
          className="form-control my-3"
          placeholder="Buscar producto..."
          autoComplete="Off"
          onChange={this.handleChange}
          onFocus={onFocus}
          onBlur={onBlur}
          value={this.state.searchProductInput}
          label={label}
        />

        {products && !hide && (
          <div
            className="list-group col-12 shadow bg-white position-absolute p-0"
            style={{ marginTop: "-15px", zIndex: "999" }}
          >
            {products.map(product => (
              <button
                key={product.id}
                onClick={() => onSelect(product)}
                className="list-group-item list-group-item-action w-100 py-2"
              >
                <span>{product.description}</span> 
                <span className="text-secondary ml-2" style={{ fontSize: ".8em" }}>(${formatNumber(product.price)})</span>
                {/* {product.category.description.length > 0 && " | "} */}
                <span className="text-info pull-right mb-0" style={{fontSize: ".7em"}}>
                  <em>{product.category.description}</em>
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }
}

export default SearchProduct;
