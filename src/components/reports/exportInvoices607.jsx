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
        filename="Reporte606"
        element={
          <button className="btn button-local"> Exportar a Excel </button>
        }
      >
        <ExcelSheet data={data} name={sheetName}>
          <ExcelColumn label="RNC/Cédula" value="identification" />
          <ExcelColumn label="NCF" value="ncf" />
          <ExcelColumn label="Monto Facturado" value="total" />
          <ExcelColumn label="Fecha de Retención" value="creationDate" />
        </ExcelSheet>
      </ExcelFile>
    );
  }
}

export default ExportInvoices607;
