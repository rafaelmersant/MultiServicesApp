import React, { Component } from "react";
import _ from "lodash";
import DatePicker from "react-datepicker";
import { registerLocale } from "react-datepicker";
import es from "date-fns/locale/es";
import "react-datepicker/dist/react-datepicker.css";
import Loading from "../common/loading";
import { paginate } from "../../utils/paginate";
import { getEmployeesSalesByRange } from "../../services/invoiceServices";
import EmployeesSalesTable from "../tables/employeesSales";

registerLocale("es", es);

class EmployeesSales extends Component {
  state = {
    data: {
      start_date: new Date(),
      end_date: new Date(),
    },
    loading: true,
    employees: [],
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

    let { data: employees } = await getEmployeesSalesByRange(
      start_date,
      end_date
    );

    employees = this.mapToModel(employees);

    this.setState({ employees, loading: false });
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
        createdUser: item.createdUser,
      });
    });

    return result;
  };

  getPagedData = () => {
    const { sortColumn, employees: allEmployees } = this.state;
    const totalAmount = _.sumBy(allEmployees, (item) =>
      parseFloat(item.subtotal)
    );
    const totalITBIS = _.sumBy(allEmployees, (item) => parseFloat(item.itbis));
    const totalDiscount = _.sumBy(allEmployees, (item) =>
      parseFloat(item.discount)
    );
    const totalCost = _.sumBy(allEmployees, (item) => parseFloat(item.cost));
    const sorted = _.orderBy(
      allEmployees,
      [sortColumn.path],
      [sortColumn.order]
    );
    const employees = paginate(sorted, 1, 9999999);

    return {
      totalCount: allEmployees.length,
      totalAmount,
      totalITBIS,
      employees,
    };
  };

  render() {
    const { sortColumn } = this.state;
    const { user } = this.props;

    const { employees, totalAmount, totalITBIS } = this.getPagedData();

    return (
      <div className="container-fluid">
        <div className="row">
          <div className="col">
            <h2 className="text-info bg-light mb-3">Reporte de Ventas por Empleados</h2>

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

            {employees.length === 0 && (
              <h5>No existen registros para este rango de fecha</h5>
            )}

            {!this.state.loading && employees.length > 0 && (
              <div className="col-5 maxHeightCuadre">
                <EmployeesSalesTable
                  employees={employees}
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

export default EmployeesSales;