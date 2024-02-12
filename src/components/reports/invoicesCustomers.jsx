import React, { Component } from "react";
import _ from "lodash";
import DatePicker from "react-datepicker";
import { registerLocale } from "react-datepicker";
import es from "date-fns/locale/es";
import "react-datepicker/dist/react-datepicker.css";
import Loading from "../common/loading";
import { paginate } from "../../utils/paginate";
import { getInvoicesCustomersByRange } from "../../services/invoiceServices";
import InvoicesCustomersTable from "../tables/invoicesCustomersTable";

registerLocale("es", es);

class InvoicesCustomers extends Component {
  state = {
    data: {
      start_date: new Date(),
      end_date: new Date(),
    },
    loading: true,
    customers: [],
    dataExcel: [],
    totalCount: 0,
    totalAmount: 0,
    start_date: new Date().toISOString().substring(0, 10),
    end_date: new Date().toISOString().substring(0, 10),
    sortColumn: { path: "creationDate", order: "desc" },
  };

  async componentDidMount() {
    let { start_date, end_date } = { ...this.state };
    this.populateData(start_date, end_date);
  }

  async populateData(start_date, end_date) {
    this.setState({ loading: true });
    this.forceUpdate();

    let { data: customers } = await getInvoicesCustomersByRange(
      start_date,
      end_date
    );

    customers = this.mapToModel(customers);

    this.setState({ customers, loading: false });
  }

  handlePageChange = (page) => {
    this.setState({ currentPage: page });
  };

  handleSearchYear = ({ currentTarget: input }) => {
    this.setState({ searchYear: input.value });
  };

  handleSearchButton = () => {
    this.populateData(this.state.start_date, this.state.end_date);
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
        subtotal: item.subtotal,
        itbis: item.itbis,
        cost: item.cost,
        discount: item.discount,
        customer_name: item.customer_name,
      });
    });

    return result;
  };

  getPagedData = () => {
    const { sortColumn, customers: allCustomers } = this.state;
    const totalAmount = _.sumBy(allCustomers, (item) =>
      parseFloat(item.subtotal)
    );
    const totalITBIS = _.sumBy(allCustomers, (item) => parseFloat(item.itbis));
    const totalDiscount = _.sumBy(allCustomers, (item) =>
      parseFloat(item.discount)
    );
    const totalCost = _.sumBy(allCustomers, (item) => parseFloat(item.cost));
    const sorted = _.orderBy(
      allCustomers,
      [sortColumn.path],
      [sortColumn.order]
    );
    const customers = paginate(sorted, 1, 9999999);

    return {
      totalCount: allCustomers.length,
      totalAmount,
      totalITBIS,
      customers,
    };
  };

  render() {
    const { sortColumn } = this.state;
    const { user } = this.props;

    const { customers, totalAmount, totalITBIS } = this.getPagedData();

    return (
      <div className="container-fluid">
        <div className="row">
          <div className="col">
            <h2 className="text-info bg-light mb-3">Reporte de Ventas por Clientes</h2>

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

            {customers.length === 0 && (
              <h5>No existen registros para este rango de fecha</h5>
            )}

            {!this.state.loading && customers.length > 0 && (
              <div className="col-5 maxHeightCuadre">
                <InvoicesCustomersTable
                  customers={customers}
                  totalAmount={totalAmount}
                  totalITBIS={totalITBIS}
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

export default InvoicesCustomers;