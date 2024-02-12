import React, { Component } from "react";
import ReactExport from "react-export-excel";

class ExportInvoices607 extends Component {
  render() {
    const { sheetName, data } = this.props;

    const ExcelFile = ReactExport.ExcelFile;
    const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
    const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

    return (
      <ExcelFile
        filename="Reporte607"
        element={
          <button className="btn button-local"> Exportar a Excel </button>
        }
      >
        <ExcelSheet data={data} name={sheetName}>
          <ExcelColumn label="Fecha" value="creationDate" />
          <ExcelColumn label="RNC" value="rnc" />
          <ExcelColumn label="NCF" value="ncf" />
          <ExcelColumn label="Monto" value="amount" />
          {/* <ExcelColumn label="Descuento" value="discount" /> */}
          <ExcelColumn label="ITBIS" value="itbis" />
          <ExcelColumn label="Total" value="subtotal" />
        </ExcelSheet>
      </ExcelFile>
    );
  }
}

export default ExportInvoices607;
