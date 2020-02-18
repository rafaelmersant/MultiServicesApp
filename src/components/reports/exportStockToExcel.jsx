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
          <ExcelColumn label="Producto" value="product" />
          <ExcelColumn label="Cantidad" value="quantity" />
          <ExcelColumn label="Costo" value="cost" />
          <ExcelColumn label="Precio" value="price" />
          <ExcelColumn label="Costo Total" value="costTotal" />
          <ExcelColumn label="Precio Total" value="priceTotal" />
        </ExcelSheet>
      </ExcelFile>
    );
  }
}

export default ExportStockToExcel;
