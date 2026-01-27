import React, { Component } from "react";
import ReactExport from "react-export-excel";

class ExportCuadreToExcel extends Component {
  render() {
    const { sheetName, data } = this.props;

    const ExcelFile = ReactExport.ExcelFile;
    const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
    const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

    return (
      <ExcelFile
        filename="ReporteCuadre"
        element={
          <button className="btn button-local"> Exportar a Excel </button>
        }
      >
        <ExcelSheet data={data} name={sheetName}>
          <ExcelColumn label="Fecha" value="creationDate" />
          <ExcelColumn label="Costo con ITBIS" value="costWithITBIS" />
          <ExcelColumn label="ITBIS" value="itbis" />
          <ExcelColumn label="Descuento" value="discount" />
          <ExcelColumn label="Total" value="subtotal" />
          <ExcelColumn label="Utilidad" value="utility" />
        </ExcelSheet>
      </ExcelFile>
    );
  }
}

export default ExportCuadreToExcel;
