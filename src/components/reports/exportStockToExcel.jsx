import React, { Component } from "react";
import ReactExport from "react-export-excel";

class ExportStockToExcel extends React.Component {
  render() {
    const { sheetName, data } = this.props;

    const ExcelFile = ReactExport.ExcelFile;
    const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
    const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

    return (
      <ExcelFile>
        <ExcelSheet data={data} name={sheetName}>
          <ExcelColumn label="Producto" value="product.description" />
          <ExcelColumn label="Cantidad" value="quantityAvailable" />
        </ExcelSheet>
      </ExcelFile>
    );
  }
}

export default ExportStockToExcel;
