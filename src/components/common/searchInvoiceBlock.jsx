import React, { Component } from "react";
import { toast } from "react-toastify";
import { getCurrentUser } from "../../services/authService";
import SearchBox from "./searchBox";
import SearchCustomer from "./searchCustomer";
import Select from "./select";

class SearchInvoiceBlock extends Component {
  state = {
    data: {
      invoiceNo: "",
      paymentMethod: "ALL"
    },
    paymentMethods: [
      { id: "ALL", name: "Todos" },
      { id: "CASH", name: "Efectivo" },
      { id: "CARD", name: "Tarjeta de Credito" },
      { id: "CREDIT", name: "Crédito" }
    ],
    hideSearchCustomer: false,
    searchCustomerText: ""
  };

  handleChange = async ({ currentTarget: input }) => {
    const data = { ...this.state };
    data[input.name] = input.value;

    this.setState({ data });
  };

  handleFocusCustomer = value => {
    setTimeout(() => {
      this.setState({ hideSearchCustomer: value });
    }, 200);
  };

  handleSelectCustomer = async customer => {
    const handler = e => {
      e.preventDefault();
    };
    handler(window.event);

    if (customer.id === 0) {
      toast.error("Lo sentimos, no puede crear un nuevo cliente desde aqui.");
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

  render() {
    const { onSelect, onFocus, onBlur, hide, label = "" } = this.props;
    const companyId = getCurrentUser().companyId;

    return (
      <div>
        <div className="row">
          <div className="col">
            <SearchBox
              value={this.state.data.invoiceNo}
              onChange={this.handleChange}
              placeholder="Digitar Número de Factura"
              label="Factura No."
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
              label="Cliente"
            />
          </div>

          <div>
            <Select
              name="paymentMethod"
              value={this.state.data.paymentMethod}
              label="Metodo de Pago"
              options={this.state.paymentMethods}
              onChange={this.handleChange}
              error={null}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default SearchInvoiceBlock;
