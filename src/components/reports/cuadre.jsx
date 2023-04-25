import React, { Component } from "react";
import _ from "lodash";
import DatePicker from "react-datepicker";
import { registerLocale } from "react-datepicker";
import es from "date-fns/locale/es";
import "react-datepicker/dist/react-datepicker.css";
import Loading from "../common/loading";
import { paginate } from "../../utils/paginate";
import CuadreTable from "../tables/cuadreTable";
import { getInvoicesHeaderByRange } from "../../services/invoiceServices";
// import ExportInvoices607 from "./reports/exportInvoices607";

registerLocale("es", es);

class Cuadre extends Component {
  state = {
    data: {
      start_date: new Date(),
      end_date: new Date(),
    },
    loading: true,
    invoices: [],
    invoicesExcel: [],
    totalCount: 0,
    totalAmount: 0,
    totalUtility: 0,
    totalITBIS: 0,
    totalDiscount: 0,
    start_date: new Date().toISOString().substring(0, 10),
    end_date: new Date().toISOString().substring(0, 10),
    sortColumn: { path: "creationDate", order: "desc" },
  };

  async componentDidMount() {
    let { start_date, end_date } = { ...this.state };
    this.populateInvoices(start_date, end_date);
  }

  async populateInvoices(start_date, end_date) {
    this.setState({ loading: true });
    this.forceUpdate();

    let { data: invoices } = await getInvoicesHeaderByRange(start_date, end_date);

    invoices = this.mapToModel(invoices.results);

    this.setState({ invoices, loading: false });
  }

  handlePageChange = (page) => {
    this.setState({ currentPage: page });
  };

  handleSearchYear = ({ currentTarget: input }) => {
    this.setState({ searchYear: input.value });
  };

  handleSearchButton = () => {
    this.populateInvoices(this.state.start_date, this.state.end_date);
  };

  handleSort = (sortColumn) => {
    this.setState({ sortColumn });
  };

  handleChangeStartDate = (date) => {
    const data = { ...this.state.data };
    data.start_date = new Date(date.toISOString());
    this.setState({ data, start_date: date.toISOString().substring(0, 10) });
  };

  handleChangeEndDate = (date) => {
    const data = { ...this.state.data };
    data.end_date = new Date(date.toISOString());
    this.setState({ data, end_date: date.toISOString().substring(0, 10) });
  };

  mapToModel = (data) => {
    let result = [];

    data.forEach((item) => {
      result.push({
        id: item.id,
        creationDate: item.creationDate,
        subtotal: item.subtotal - item.discount,
        cost: item.cost,
        amountWithoutITBIS: item.subtotal - item.itbis,
        discount: item.discount,
        itbis: item.itbis
      });
    });

    return result;
  };

  getPagedData = () => {
    const { sortColumn, invoices: allInvoices } = this.state;
    const totalAmount = _.sumBy(allInvoices, (item) => parseFloat(item.subtotal))
    const totalUtility = _.sumBy(allInvoices, (item) => parseFloat(item.subtotal - item.discount - item.cost))
    const totalITBIS = _.sumBy(allInvoices, (item) => parseFloat(item.itbis))
    const totalDiscount = _.sumBy(allInvoices, (item) => parseFloat(item.discount))
    const sorted = _.orderBy(allInvoices, [sortColumn.path], [sortColumn.order]);
    const invoices = paginate(sorted, 1, 9999999);

    return { totalCount: allInvoices.length, totalAmount, totalUtility, totalITBIS, totalDiscount, invoices };
  };

  invoicesExportFormat = (data) => {
    let result = [];

    data.forEach((item) => {
      result.push({
        id: item.id,
        creationDate: new Date(item.creationDate).toLocaleDateString(),
        subtotal: item.subtotal,
        amountWithoutITBIS: item.subtotal - item.itbis,
        discount: item.discount,
        itbis: item.itbis
      });
    });

    return result;
  };

  render() {
    const { sortColumn } = this.state;
    const { user } = this.props;

    const { invoices, totalAmount, totalUtility, totalITBIS, totalDiscount } = this.getPagedData();

    return (
      <div className="container-fluid">
        <div className="row">
          <div className="col">
            <h2 className="text-info bg-light mb-3">Reporte - Cuadre</h2>

            {/* <ExportInvoices607
              data={this.entriesExportFormat(entries)}
              sheetName="Cuadre"
            /> */}

            <div className="d-flex flex-row">
              <div className="col-2">
                <label className="mr-1">Fecha Inicial</label>
                <div className="mr-3">
                  <DatePicker
                    className="form-control form-control-sm"
                    selected={this.state.data.start_date}
                    onChange={(date) => this.handleChangeStartDate(date)}
                    dateFormat="dd/MM/yyyy"
                  />
                </div>
              </div>

              <div className="col-2">
                <label className="mr-1">Fecha Final</label>
                <div className="mr-3">
                  <DatePicker
                    className="form-control form-control-sm"
                    selected={this.state.data.end_date}
                    onChange={(date) => this.handleChangeEndDate(date)}
                    dateFormat="dd/MM/yyyy"
                  />
                </div>
              </div>

              <div className="form-group mt-1">
                <button
                  className="btn btn-info ml-2 my-4"
                  style={{ maxHeight: 36 }}
                  onClick={this.handleSearchButton}
                >
                  Filtrar
                </button>
              </div>
            </div>

            {this.state.loading && (
              <div>
                <p className="text-left">Cargando...</p>
                <div className="d-flex justify-content-left mb-3">
                  <Loading />
                </div>
              </div>
            )}

            {invoices.length === 0 && (
              <h5>No existen registros para este rango de fecha</h5>
            )}

            {!this.state.loading && invoices.length > 0 && (
              <div className="col-7 maxHeightCuadre">
                <CuadreTable
                  invoices={invoices}
                  totalAmount={totalAmount}
                  totalUtility={totalUtility}
                  totalITBIS={totalITBIS}
                  totalDiscount={totalDiscount}
                  user={user}
                  sortColumn={sortColumn}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default Cuadre;