import React, { Component } from "react";
import Input from "./input";
import { getCustomersByName } from "../../services/customerService";
import { getCurrentUser } from "../../services/authService";
import SearchBox from "./searchBox";
import SearchCustomer from "./searchCustomer";

class SearchInvoiceBlock extends Component {
  state = {
    invoiceNo: "",
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
    const { onSelect, onFocus, onBlur, hide, label = "" } = this.props;
    const { customers, invoiceNo } = this.state;
    const companyId = getCurrentUser().companyId;

    return (
      <div>
        <div className="row">
          <div className="col">
            <SearchBox
              value={invoiceNo}
              onChange={this.handleSearch}
              placeholder="Factura No."
            />
          </div>
          <div className="col">
            <SearchCustomer
              onSelect={this.handleSelectCustomer}
              onFocus={() => this.handleFocusCustomer(false)}
              onBlur={() => this.handleFocusCustomer(true)}
              hide={this.state.hideSearchCustomer}
              value={this.state.searchCustomerText}
              companyId={companyId}
              label=""
            />
          </div>
        </div>
      </div>
    );
  }
}

export default SearchInvoiceBlock;
