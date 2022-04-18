import React, { Component } from "react";

class ProductProvidersModal extends Component {
  handleClosePopUp = (e) => {
    this.closeButton.click();
  };

  formatDateWithoutTime = (stringDate) => {
    return new Date(stringDate).toLocaleDateString();
  };

  render() {
    return (
      <div
        className="modal fade col-12"
        id="productProvidersModal"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="productProvidersModalLabel"
        aria-hidden="true"
        data-backdrop="static"
        data-keyboard="false"
      >
        <div className="modal-dialog modal-lg" role="document">
          <div className="modal-content">
            <div className="modal-header bg-warning">
              <h5 className="modal-title" id="productProvidersModalLabel">
                Proveedores
              </h5>
              <button
                ref={(button) => (this.closeButton = button)}
                type="button"
                className="close"
                data-dismiss="modal"
                aria-label="Close"
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>

            <table className="table table-stripped">
              <thead>
                <tr>
                  <th>Proveedor</th>
                  <th>Precio</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {this.props.data &&
                  this.props.data.map((item) => (
                    <tr key={item.id}>
                      <td key={item.id}>{item.firstName}</td>
                      <td>{item.price}</td>
                      <td>{this.formatDateWithoutTime(item.creationDate)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }
}

export default ProductProvidersModal;
