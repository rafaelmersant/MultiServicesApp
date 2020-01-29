import React, { Component } from "react";
import Input from "./input";

class PriceCalculation extends Component {
  state = {
    data: {
      priceC1: 0,
      discount: 0,
      cost: 0,
      itbis: 0,
      priceC2: 0,
      percentage: 0,
      priceSales: 0
    },
    itbis: true
  };

  calculatePrice = () => {
    const data = { ...this.state.data };
    const discount =
      Math.round((data.discount / data.priceC1) * 100 * 100) / 100;
    const cost = data.priceC1 - discount;
    data.cost = cost;

    if (this.state.itbis) {
      data.itbis = Math.round(cost * 0.18 * 100) / 100;
      data.priceC2 = Math.round(cost * 1.18 * 100) / 100;
    } else {
      data.priceC2 = cost;
    }

    const percent = data.priceC2 * (data.percentage / 100 + 1);
    const pricePercent = Math.round(percent * 100) / 100;
    data.priceSales = pricePercent;

    this.setState({ data });
  };

  handleChangeInput = ({ currentTarget: input }) => {
    const data = { ...this.state.data };
    data[input.name] = input.value;

    this.setState({ data });

    setTimeout(() => {
      this.calculatePrice();

      this.props.onChange(this.state.data);
    }, 300);
  };

  handleChangeITBIS = e => {
    this.setState({ itbis: !this.state.itbis });

    setTimeout(() => {
      this.calculatePrice();

      this.props.onChange(this.state.data);
    }, 300);

    //const { data } = { ...this.state };

    // if (!this.state.itbis) {
    //   if (data.cost > 0)
    //     data.itbis = Math.round(parseFloat(data.cost * 1.18) * 100) / 100;
    // } else {
    //   data.itbis = 0;
    // }

    //this.setState({ data, itbis: !this.state.itbis });
  };

  render() {
    return (
      <div className="row bg-warning">
        <div className="col">
          <Input
            type="text"
            name="priceC1"
            value={this.state.data.priceC1}
            label="Costo Bruto"
            autocomplete="off"
            onChange={this.handleChangeInput}
          />
        </div>

        <div className="col">
          <Input
            type="text"
            name="discount"
            value={this.state.data.discount}
            label="% Desc."
            autocomplete="off"
            onChange={this.handleChangeInput}
          />
        </div>

        <div className="col">
          <Input
            type="text"
            name="cost"
            value={this.state.data.cost}
            label="Costo Neto"
            disabled="disabled"
            onChange={this.handleChangeInput}
          />
        </div>

        <div style={{ backgroundColor: "black" }}>
          <input
            type="checkbox"
            className="form-check-input"
            id="chkITBIS"
            title="Click para activar/desactivar ITBIS"
            checked={this.state.itbis}
            onChange={this.handleChangeITBIS}
          />
        </div>

        <div className="col">
          <Input
            type="text"
            name="itbis"
            value={this.state.data.itbis}
            label="ITBIS"
            disabled="disabled"
            onChange={this.handleChangeInput}
          />
        </div>

        <div className="col">
          <Input
            type="text"
            name="priceC2"
            value={this.state.data.priceC2}
            label="Costo + ITBIS"
            disabled="disabled"
            onChange={this.handleChangeInput}
          />
        </div>

        <div className="col">
          <Input
            type="text"
            name="percentage"
            value={this.state.data.percentage}
            label="Porcentaje %"
            autocomplete="off"
            onChange={this.handleChangeInput}
          />
        </div>

        <div className="col">
          <Input
            type="text"
            name="priceSales"
            value={this.state.data.priceSales}
            label="Precio Venta"
            disabled="disabled"
            onChange={this.handleChangeInput}
          />
        </div>
      </div>
    );
  }
}

export default PriceCalculation;
