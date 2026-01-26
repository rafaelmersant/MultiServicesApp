import React, { Component } from "react";
import { toast } from "react-toastify";
import DatePicker from "react-datepicker";
import { getCurrentUser } from "../../services/authService";
import SearchCustomer from "./searchCustomer";
import Select from "./select";
import Input from "./input";

class SearchInvoiceBlock extends Component {
  state = {
    data: {
      invoice: "",
      paymentMethod: "ALL",
      start_date: new Date(),
      end_date: new Date(),
    },
    paymentMethods: [
      { id: "ALL", name: "Todos" },
      { id: "CASH", name: "Efectivo" },
      { id: "CARD", name: "Tarjeta de Crédito" },
      { id: "TRANS", name: "Transferencia" },
      { id: "CREDIT", name: "Crédito" },
    ],
    start_date: new Date().toISOString().substring(0, 10),
    end_date: new Date().toISOString().substring(0, 10),
    hideSearchCustomer: false,
    searchCustomerText: "",
  };

  handleChange = async ({ currentTarget: input }) => {
    let { data, searchCustomerText } = { ...this.state };

    data[input.name] = input.value;

    if (input.name === "invoice") {
      data["paymentMethod"] = "ALL";
      searchCustomerText = "";

      this.handleFocusCustomer(true);
      this.props.onInvoiceChange(input.value);
    }

    if (input.name === "paymentMethod") {
      data["invoice"] = "";
      this.props.onPaymentMethodChange(input.value);
    }

    this.setState({ data, searchCustomerText });
  };

  handleFocusCustomer = (value) => {
    setTimeout(() => {
      this.setState({ hideSearchCustomer: value });
    }, 200);
  };

  handleSelectCustomer = async (customer) => {
    const handler = (e) => {
      e.preventDefault();
    };
    handler(window.event);

    if (customer.id === 0) {
      toast.error("Lo sentimos, no puede crear un nuevo cliente desde aqui.");
      return false;
    }

    const data = { ...this.state.data };
    data.customer_id = customer.id;
    data.invoice = "";

    this.setState({
      data,
      hideSearchCustomer: true,
      searchCustomerText: `${customer.firstName} ${customer.lastName}`,
    });

    this.props.onCustomerChange(customer);
  };

  handleClearCustomerSelection = () => {
    const handler = (e) => {
      e.preventDefault();
    };
    handler(window.event);

    this.handleSelectCustomer({ id: null, firstName: "", lastName: "" });
    this.setState({ searchCustomerText: "" });
  };

  handleChangeStartDate = (date) => {
    const data = { ...this.state.data };
    data.start_date = new Date(date.toISOString());
    this.setState({ data, start_date: date.toISOString().substring(0, 10) });

    this.props.onStartDateChange(date.toISOString().substring(0, 10));
  };

  handleChangeEndDate = (date) => {
    const data = { ...this.state.data };
    data.end_date = new Date(date.toISOString());
    this.setState({ data, end_date: date.toISOString().substring(0, 10) });
  
    this.props.onEndDateChange(date.toISOString().substring(0, 10));
  };

  render() {
    const { paymentMethodOff, source } = { ...this.props };
    const companyId = getCurrentUser().companyId;

    const placeholderSearch =
      source === "quotations" ? "Número de Cotización" : "Número de Factura";
    const labelSearch =
      source === "quotations" ? "Cotización No." : "Factura No.";

    return (
      <div>
        <div className="row">
          <div>
            <Input
              name="invoice"
              value={this.state.data.invoice}
              onChange={this.handleChange}
              placeholder={placeholderSearch}
              label={labelSearch}
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
          {this.state.searchCustomerText && (
            <div
              style={{
                marginTop: "36px",
              }}
            >
              <span
                className="fa fa-trash text-danger"
                style={{
                  fontSize: "24px",
                  position: "absolute",
                  marginLeft: "-39px",
                  cursor: "pointer",
                }}
                title="Limpiar filtro de cliente"
                onClick={this.handleClearCustomerSelection}
              ></span>
            </div>
          )}

          <div>
            <label className="mr-1">Fecha Inicial</label>
            <div className="mr-3">
              <DatePicker
                className="form-control form-control-sm"
                selected={this.state.data.start_date}
                onChange={(date) => this.handleChangeStartDate(date)}
                dateFormat="dd/MM/yyyy"
              />
            </div>
          </div>

          <div>
            <label className="mr-1">Fecha Final</label>
            <div className="mr-3">
              <DatePicker
                className="form-control form-control-sm"
                selected={this.state.data.end_date}
                onChange={(date) => this.handleChangeEndDate(date)}
                dateFormat="dd/MM/yyyy"
              />
            </div>
          </div>

           {!paymentMethodOff && (
            <div className="col">
              <Select
                name="paymentMethod"
                value={this.state.data.paymentMethod}
                label="Metodo de Pago"
                options={this.state.paymentMethods}
                onChange={this.handleChange}
                error={null}
              />
            </div>
          )}
          
        </div>
      </div>
    );
  }
}

export default SearchInvoiceBlock;
