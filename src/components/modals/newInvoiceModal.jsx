import React, { Component } from "react";

class NewInvoiceModal extends Component {
  handleClosePopUp = e => {
    window.location = `/invoice/new`;
    this.closeButton.click();
  };

  render() {
    return (
      <div
        className="modal fade col-12"
        id="newInvoiceModal"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="newInvoiceModalLabel"
        aria-hidden="true"
        data-backdrop="static"
        data-keyboard="false"
      >
        <div className="modal-dialog mt-5" role="document">
          <div className="modal-content">
            <div className="center">
              <button
                className="btn btn-warning w-100 pb-5 pt-5"
                onClick={this.handleClosePopUp}
              >
                <h1>Nueva Factura</h1>
              </button>
            </div>
          </div>
        </div>

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
    );
  }
}

export default NewInvoiceModal;
