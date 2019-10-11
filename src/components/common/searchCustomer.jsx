import React, { Component } from "react";
import Input from "./input";
import { getCustomersByName } from "../../services/customerService";

class SearchCustomer extends Component {
  state = {
    customers: [],
    erros: {},
    searchCustomerInput: ""
  };

  handleChange = async ({ currentTarget: input }) => {
    this.setState({ searchCustomerInput: input.value });

    let { data: customers } = await getCustomersByName(
      this.props.companyId,
      input.value
    );
    if (input.value === "") customers = [];

    this.setState({ customers });
  };

  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.hide && this.props === nextProps) return false;
    else return true;
  }

  componentDidUpdate() {
    if (this.props.hide)
      this.setState({ searchCustomerInput: this.props.value });
  }

  render() {
    const { onSelect, onFocus, onBlur, hide } = this.props;
    const { customers } = this.state;

    return (
      <div>
        <Input
          type="text"
          label="Cliente"
          id="searchCustomerId"
          name="query"
          className="form-control my-3"
          placeholder="Buscar Cliente..."
          autoComplete="Off"
          onChange={this.handleChange}
          onFocus={onFocus}
          onBlur={onBlur}
          value={this.state.searchCustomerInput}
        />

        {customers && !hide && (
          <div
            className="list-group col-11 shadow-lg bg-white position-absolute p-0"
            style={{ marginTop: "-15px", zIndex: "999" }}
          >
            {customers.map(customer => (
              <button
                key={customer.id}
                onClick={() => onSelect(customer)}
                className="list-group-item list-group-item-action w-100"
              >
                {customer.firstName} {customer.lastName} |
                <span className="text-secondary">
                  <em>{" " + customer.email}</em>
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }
}

export default SearchCustomer;