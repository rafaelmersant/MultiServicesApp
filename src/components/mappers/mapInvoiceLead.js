import { getCurrentUser } from "../../services/authService";
import _ from "lodash";

//Map Invoice Header data for invoice lead (Conduce)
export function mapToViewInvoiceHeader(invoiceHeader) {
  return {
    id: invoiceHeader[0].id,
    sequence: parseFloat(invoiceHeader[0].sequence),
    customer_id: invoiceHeader[0].customer.id,
    customer_firstName: invoiceHeader[0].customer.firstName
      ? invoiceHeader[0].customer.firstName
      : "",
    customer_lastName: invoiceHeader[0].customer.lastName
      ? invoiceHeader[0].customer.lastName
      : "",
    ncf: invoiceHeader[0].ncf,
    paymentMethod: invoiceHeader[0].paymentMethod,
    paid: invoiceHeader[0].paid,
    reference: invoiceHeader[0].reference ? invoiceHeader[0].reference : "",
    subtotal: invoiceHeader[0].subtotal,
    itbis: invoiceHeader[0].itbis,
    discount: invoiceHeader[0].discount,
    company_id: invoiceHeader[0].company.id,
    createdUser: invoiceHeader[0].createdByUser
      ? invoiceHeader[0].createdByUser
      : getCurrentUser().email,
    creationDate: invoiceHeader[0].creationDate,
  };
}

//Map invoice detail and its delivered (Conduces)
export function mapToViewInvoiceDetailWithConduces(
  invoiceDetail,
  invoiceLeadDetail
) {
  let details = [];

  try {
    invoiceDetail.forEach((item) => {
      const delivered = _.sumBy(invoiceLeadDetail, (detail) => {
        return detail.product.id === item.product.id ? detail.quantity : 0;
      });

      console.log(`product_id: ${item.product.id} delivered: ${delivered}`);

      details.push({
        id: item.id,
        invoice_id: item.invoice.id,
        product_id: item.product.id,
        product: item.product.description,
        quantity: item.quantity,
        quantityDelivered: delivered,
        quantityToDeliver: 0,
      });
    });
  } catch (error) {
    console.log("mapToViewInvoiceDetailWithConduces error:", error);
  }

  return details;
}

//Map invoice lead header
export function mapToViewInvoiceLeadHeader(invoiceLeadHeader, invoiceNo, data) {
  try {
    if (invoiceLeadHeader.length) {
      return {
        id: invoiceLeadHeader[0].id,
        invoice: invoiceLeadHeader[0].invoice.sequence,
        company_id: invoiceLeadHeader[0].company.id,
        createdUser: invoiceLeadHeader[0].createdByUser
          ? invoiceLeadHeader[0].createdByUser
          : getCurrentUser().email,
        creationDate: invoiceLeadHeader[0].creationDate,
      };
    }
  } catch (error) {
    console.error("Error mapping InvoiceLeadHeader:", error);
  }

  data.invoice = invoiceNo;

  return data;
}
