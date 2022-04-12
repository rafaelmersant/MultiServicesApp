import { getCurrentUser } from "../../services/authService";

export function mapToViewInvoiceHeader(invoiceHeader) {
  return {
    id: invoiceHeader[0].id,
    sequence: parseFloat(invoiceHeader[0].sequence),
    customer_id: invoiceHeader[0].customer_id,
    ncf: invoiceHeader[0].ncf,
    paymentMethod: invoiceHeader[0].paymentMethod,
    paid: invoiceHeader[0].paid,
    printed: invoiceHeader[0].printed ? invoiceHeader.printed : false,
    reference: invoiceHeader[0].reference ? invoiceHeader[0].reference : "",
    subtotal: invoiceHeader[0].subtotal,
    itbis: invoiceHeader[0].itbis,
    discount: invoiceHeader[0].discount,
    company_id: invoiceHeader[0].company_id,
    createdUser: invoiceHeader[0].createdByUser
      ? invoiceHeader[0].createdByUser
      : getCurrentUser().email,
    creationDate: invoiceHeader[0].creationDate,
  };
}

export function mapToViewInvoiceDetail(invoiceDetail) {
  let details = [];
  for (const item of invoiceDetail) {
    details.push({
      id: item.id,
      invoice_id: item.invoice_id,
      product_id: item.product_id,
      product: item.product_description,
      quantity: item.quantity,
      price: item.price,
      cost: item.cost,
      itbis: item.itbis,
      discount: item.discount,
      total:
        Math.round(parseFloat(item.price) * parseFloat(item.quantity) * 100) /
        100,
    });
  }

  return details;
}
