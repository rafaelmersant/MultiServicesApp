import React, { Component } from "react";

class NewInvoiceModal extends Component {
  handleClosePopUp = e => {
    this.props.setNewCategory(e);
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
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="newInvoiceModalLabel">
                Agregar nueva categoria
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

            <ProductCategoryForm popUp={true} closeMe={this.handleClosePopUp} />
          </div>
        </div>
      </div>
    );
  }
}

export default NewInvoiceModal;
