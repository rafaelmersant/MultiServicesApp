import React, { Component } from "react";
import { formatNumber } from "../../utils/custom";
import _ from "lodash";

class TableBody extends Component {
  renderCell = (item, column) => {
    if (column.content) return column.content(item);

    if (column.path.toLowerCase().includes("duedate"))
      return this.formatDateWithoutTime(_.get(item, column.path));

    if (column.path.toLowerCase().includes("docdate"))
      return this.formatDateWithoutTime(_.get(item, column.path));

    if (column.path.toLowerCase().includes("date"))
      return this.formatDate(_.get(item, column.path));

    if (
      column.path.toLowerCase().includes("price") ||
      column.path.toLowerCase().includes("cost") ||
      column.path.toLowerCase().includes("quantity") ||
      column.path.toLowerCase().includes("itbis") ||
      column.path.toLowerCase().includes("discount") ||
      column.path.toLowerCase().includes("total")
    )
      return formatNumber(_.get(item, column.path));

    return _.get(item, column.path);
  };

  createKey = (item, column) => {
    return item.id + (column.path || column.key);
  };

  formatDate = (stringDate) => {
    const time = new Date(stringDate);
    let timeFormatted = time.toLocaleString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
    const dateFormatted = new Date(stringDate).toLocaleDateString();

    return `${dateFormatted} ${timeFormatted}`;
  };

  formatDateWithoutTime = (stringDate) => {
    return new Date(stringDate).toLocaleDateString();
  };

  render() {
    const { data, columns } = this.props;

    return (
      <tbody>
        {data.map((item) => (
          <tr key={item.product_id || item.id}>
            {columns.map((column) => (
              <td key={this.createKey(item, column)} className="py-1">
                {this.renderCell(item, column)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    );
  }
}

export default TableBody;
