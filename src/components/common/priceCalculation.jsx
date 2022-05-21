import React, { Component } from "react";
import Input from "./input";
import { formatNumber } from '../../utils/custom';

class PriceCalculation extends Component {
  state = {
    data: {
      costGross: 0,
      discount: 0,
      costNet: 0,
      itbis: 0,
      costPlusITBIS: 0,
      percentage: 0,
      priceSales: 0,
      itbisSales: 0,
      priceSalesFinal: 0,
    },
    itbis: true,
    resetValues: false,
  };

  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.resetValues && this.props === nextProps) return false;
    else return true;
  }

  componentDidUpdate() {
    if (this.props.resetValues) this.resetValues();
  }

  resetValues = () => {
    const { data } = { ...this.state };

    data.costGross = 0;
    data.discount = 0;
    data.costNet = 0;
    data.itbis = 0;
    data.costPlusITBIS = 0;
    data.percentage = 0;
    data.priceSales = 0;
    data.itbisSales = 0;
    data.priceSalesFinal = 0;

    this.props.onResetValues(false);
    this.setState({ data });
  };

  calculatePrice = () => {
    const data = { ...this.state.data };
    const discount =
      Math.round((data.discount / 100) * data.costGross * 100) / 100;
    const costNet = Math.round((data.costGross - discount) * 100) / 100;
    
    data.costNet = costNet;

    if (this.state.itbis) {
      data.itbis = Math.round(costNet * 0.18 * 100) / 100;
      data.costPlusITBIS = Math.round(costNet * 1.18 * 100) / 100;
      data.itbisSales = Math.round(data.priceSales * 0.18 * 100) / 100;
      data.priceSalesFinal = parseFloat(data.priceSales) + parseFloat(data.itbisSales);
    } else {
      data.itbis = 0;
      data.itbisSales = 0;
      data.costPlusITBIS = costNet;
      data.priceSalesFinal = data.priceSales;
    }

    // OLD FORMULA
    // const percent = data.costPlusITBIS * (data.percentage / 100 + 1);
    // const pricePercent = Math.round(percent * 100) / 100;
    // data.priceSales = pricePercent;

    //if (data.priceSales >= data.costPlusITBIS) {
    if (data.priceSales >= data.costNet) {
      let percent = (data.priceSales - data.costNet) / data.costNet;
      percent = parseFloat(percent) * 100
      data.percentage = percent;
    }
    
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

  handleChangeITBIS = (e) => {
    this.setState({ itbis: !this.state.itbis });

    setTimeout(() => {
      this.calculatePrice();

      this.props.onChange(this.state.data);
    }, 300);
  };

  render() {
    return (
      <div className="row bg-warning">
        <div className="col">
          <Input
            type="text"
            name="costGross"
            value={this.state.data.costGross}
            label="Costo Bruto"
            autoComplete="off"
            onChange={this.handleChangeInput}
            classForLabel="font-calculation"
          />
        </div>

        <div className="col">
          <Input
            type="text"
            name="discount"
            value={this.state.data.discount}
            label="% Desc."
            autoComplete="off"
            onChange={this.handleChangeInput}
            classForLabel="font-calculation"
          />
        </div>

        <div className="col">
          <Input
            type="text"
            name="costNet"
            value={this.state.data.costNet}
            label="Costo Neto"
            disabled="disabled"
            onChange={this.handleChangeInput}
            classForLabel="font-calculation"
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
            classForLabel="font-calculation"
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
            name="costPlusITBIS"
            value={this.state.data.costPlusITBIS}
            label="Costo+ITBIS"
            disabled="disabled"
            onChange={this.handleChangeInput}
            classForLabel="font-calculation"
          />
        </div>

        <div className="col">
          <Input
            type="text"
            name="priceSales"
            value={this.state.data.priceSales}
            label="Precio"
            autoComplete="off"
            onChange={this.handleChangeInput}
            classForLabel="font-calculation"
          />
        </div>

        <div className="col">
          <Input
            type="text"
            name="itbisSales"
            value={this.state.data.itbisSales}
            label="ITBIS Venta"
            disabled="disabled"
            onChange={this.handleChangeInput}
            classForLabel="font-calculation"
          />
        </div>

        <div className="col">
          <Input
            type="text"
            name="priceSalesFinal"
            value={this.state.data.priceSalesFinal}
            label="Precio Venta"
            disabled="disabled"
            onChange={this.handleChangeInput}
            classForLabel="font-calculation"
          />
        </div>

        <div className="col">
          <Input
            type="text"
            name="percentage"
            value={formatNumber(this.state.data.percentage)}
            label="Porcentaje"
            disabled="disabled"
            onChange={this.handleChangeInput}
            classForLabel="font-calculation"
          />
        </div>
      </div>
    );
  }
}

export default PriceCalculation;
