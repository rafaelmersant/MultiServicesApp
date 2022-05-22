import React, { Component } from "react";
import ProviderForm from "../forms/providerForm";

class ProviderModal extends Component {
  handleClosePopUp = e => {
    this.props.setNewProvider(e);
    this.closeButton.click();
  };

  render() {
    return (
      <div
        className="modal fade col-12"
        id="providerModal"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="providerModalLabel"
        aria-hidden="true"
        data-backdrop="static"
        data-keyboard="false"
      >
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="providerModalLabel">
                Agregar nuevo proveedor
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

            <ProviderForm popUp={true} closeMe={this.handleClosePopUp} />
          </div>
        </div>
      </div>
    );
  }
}

export default ProviderModal;