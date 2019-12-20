import React, { Component } from "react";
import CustomerForm from "../forms/customerForm";

class CustomerModal extends Component {
  handleClosePopUp = e => {
    this.props.setNewCustomer(e);
    this.closeButton.click();
  };

  render() {
    return (
      <div
        className="modal fade col-12"
        id="customerModal"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="customerModalLabel"
        aria-hidden="true"
        data-backdrop="static"
        data-keyboard="false"
      >
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="customerModalLabel">
                Agregar nuevo cliente
              </h5>
              <button
                ref={button => (this.closeButton = button)}
                type="button"
                className="close"
                data-dismiss="modal"
                aria-label="Close"
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>

            <CustomerForm popUp={true} closeMe={this.handleClosePopUp} />
          </div>
        </div>
      </div>
    );
  }
}

export default CustomerModal;
