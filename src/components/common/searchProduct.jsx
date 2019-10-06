import React, { Component } from "react";
import Input from "./input";
import { getProductsByDescription } from "../../services/productService";

class SearchProduct extends Component {
  state = {
    products: [],
    erros: {},
    searchProductInput: ""
  };

  handleChange = async ({ currentTarget: input }) => {
    this.setState({ searchProductInput: input.value });

    let { data: products } = await getProductsByDescription(
      this.props.companyId,
      input.value
    );
    if (input.value === "") products = [];

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
    const { onSelect, onFocus, onBlur, hide } = this.props;
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
        />

        {products && !hide && (
          <div
            className="list-group col-11 shadow-lg bg-white position-absolute p-0"
            style={{ marginTop: "-15px", zIndex: "999" }}
          >
            {products.map(product => (
              <button
                key={product.id}
                onClick={() => onSelect(product)}
                className="list-group-item list-group-item-action w-100"
              >
                {product.description} |
                <span className="text-secondary">
                  <em>{" " + product.category.description}</em>
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
