import React, { Component } from "react";

class PrintInvoice extends Component {
  render() {
    console.log(this.props);
    return <h2>Print invoice</h2>;
  }
}

export default PrintInvoice;
