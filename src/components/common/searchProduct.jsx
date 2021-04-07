import React, { useCallback, useEffect, useState } from "react";
import Input from "./input";
import { getProductsByDescription } from "../../services/productService";
import { formatNumber } from "../../utils/custom";
import _ from "lodash";
import { debounce } from "throttle-debounce";

const SearchProduct = (props) => {
  const [products, setProducts] = useState([]);
  const [productName, setProductName] = useState(props.value);

  useEffect(() => {
    if (props.value) setProductName(props.value);

    if (props.hide && props.clearSearchProduct) {
      setProductName("");
      handleSearchProduct("");
    }
  }, [productName, props]);

  const debounced = useCallback(
    debounce(400, (nextValue) => {
      handleSearchProduct(nextValue);
    }),
    []
  );

  const handleSelectProduct = (product) => {
    setProductName(product.description);
    props.onSelect(product);
  };

  const handleSearchProduct = async (value) => {
    if (value.length >= 3) {
      const productNameQuery = value.toUpperCase().split(" ").join("%20");

      let { data: _products } = await getProductsByDescription(
        props.companyId,
        productNameQuery
      );

      _products = _products.results;

      if (value === "" || value.length < 3) _products = [];

      if (value.length > 3 && _products.length === 0) {
        _products = [
          {
            id: 0,
            description: "No existe el producto, desea crearlo?",
            category: { id: 0, description: "" },
            price: 0,
          },
        ];
      }

      _products = _products.length
        ? _.orderBy(_products, ["ocurrences"], ["desc"])
        : _products;

      setProducts(_products);
    } else {
      setProducts([]);
    }
  };

  const handleChange = (event) => {
    const value = event.target.value;
    setProductName(value);

    debounced(value);
  };

  const { onFocus, onBlur, hide, label = "" } = props;

  return (
    <div>
      <Input
        type="text"
        name="query"
        className="form-control my-3"
        placeholder="Buscar producto..."
        autoComplete="Off"
        onChange={(e) => handleChange(e)}
        onFocus={onFocus}
        onBlur={onBlur}
        value={productName}
        label={label}
      />

      {products.length > 0 && !hide && (
        <div
          className="list-group col-12 shadow bg-white position-absolute p-0"
          style={{ marginTop: "-15px", zIndex: "999", maxWidth: "600px" }}
        >
          {products.map((product) => (
            <button
              key={product.id}
              onClick={() => handleSelectProduct(product)}
              className="list-group-item list-group-item-action w-100 py-2"
            >
              <span>{product.description}</span>
              <span
                className="text-secondary ml-2"
                style={{ fontSize: ".8em" }}
              >
                (${formatNumber(product.price)})
              </span>
              {/* {product.category.description.length > 0 && " | "} */}
              <span
                className="text-info pull-right mb-0"
                style={{ fontSize: ".7em" }}
              >
                <em>{product.category.description}</em>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchProduct;
