import { getCurrentUser } from "../../services/authService";

export function mapToViewQuotationHeader(quotationHeader) {
  return {
    id: quotationHeader[0].id,
    customer_id: quotationHeader[0].customer_id,
    printed: quotationHeader[0].printed ? quotationHeader.printed : false,
    reference: quotationHeader[0].reference ? quotationHeader[0].reference : "",
    subtotal: quotationHeader[0].subtotal,
    itbis: quotationHeader[0].itbis,
    discount: quotationHeader[0].discount,
    company_id: quotationHeader[0].company_id,
    createdUser: quotationHeader[0].createdByUser
      ? quotationHeader[0].createdByUser
      : getCurrentUser().email,
    creationDate: quotationHeader[0].creationDate,
  };
}

export function mapToViewQuotationDetail(quotationDetail) {
  let details = [];
  for (const item of quotationDetail) {
    details.push({
      id: item.id,
      header_id: item.header.id,
      product_id: item.product.id,
      product: item.product.description,
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
