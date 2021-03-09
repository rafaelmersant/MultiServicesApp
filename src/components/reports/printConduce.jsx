import React, { Component } from "react";
import { formatNumber } from "../../utils/custom";

class PrintConduce extends Component {
  render() {
    const {
      invoiceHeader,
      invoiceDetail,
      invoiceLeadDetail,
      createdUserName,
    } = this.props;

    console.log("DETALLE", invoiceLeadDetail);
    console.log("serializer", invoiceHeader);
    console.log("serializer", invoiceDetail);
    return <div>CONDUCE</div>;
  }
}

//       <div className="mt-1" style={{ width: "408px" }}>
//         {invoiceHeader.length && (
//           <div>
//             <div className="text-center">
//               <img
//                 width="210px"
//                 src={process.env.PUBLIC_URL + "/images/FERRINMAS_small.jpg"}
//                 alt="FERRINMAS"
//               />
//             </div>
//             <div className="text-center">
//               <span className="font-receipt font-receipt-small">
//                 {invoiceHeader[0].company.phoneNumber}
//               </span>
//             </div>
//             <div className="text-center">
//               <span className="font-receipt font-receipt-small">
//                 {invoiceHeader[0].company.email}
//               </span>
//             </div>

//             {invoiceHeader[0].company.rnc.length > 0 && (
//               <div className="text-center">
//                 <span className="font-receipt font-receipt-small">
//                   RNC: {invoiceHeader[0].company.rnc}
//                 </span>
//               </div>
//             )}

//             <span className="font-receipt font-receipt-small d-block">
//               Fecha: {new Date().toLocaleDateString("en-GB")}
//               <span className="ml-2">
//                 Hora: {new Date().toLocaleTimeString()}
//               </span>
//             </span>

//             {invoiceHeader[0].ncf.length > 0 && (
//               <span className="font-receipt font-receipt-small d-block">
//                 NCF: {invoiceHeader[0].ncf}
//               </span>
//             )}

//             <span className="font-receipt font-receipt-small d-block">
//               Cliente: {invoiceHeader[0].customer.firstName}{" "}
//               {invoiceHeader[0].customer.lastName}
//             </span>

//             {invoiceHeader[0].customer.identification.length > 0 && (
//               <span className="font-receipt font-receipt-small d-block">
//                 Cédula/RNC: {invoiceHeader[0].customer.identification}
//               </span>
//             )}
//             {invoiceHeader[0].customer.address.length > 0 && (
//               <span className="font-receipt font-receipt-small d-block">
//                 Dirección: {invoiceHeader[0].customer.address}
//               </span>
//             )}
//           </div>
//         )}

//         <div className="d-block">
//           <span className="d-block">
//             ---------------------------------------------------------------
//           </span>

//           <span
//             className="font-receipt font-receipt-small-2"
//             style={{ marginLeft: "45px" }}
//           >
//             {invoiceHeader.length &&
//               !invoiceHeader[0].ncf.includes("B01") &&
//               "FACTURA PARA CONSUMIDOR FINAL"}
//           </span>

//           <span
//             className="font-receipt font-receipt-small-2"
//             style={{ marginLeft: "25px" }}
//           >
//             {invoiceHeader.length &&
//               invoiceHeader[0].ncf.includes("B01") &&
//               "FACTURA PARA CREDITO FISCAL"}
//           </span>
//         </div>

//         {invoiceDetail.length && (
//           <table>
//             <thead>
//               <tr key="h1">
//                 <td colSpan="3">
//                   ---------------------------------------------------------------
//                 </td>
//               </tr>
//               <tr key="h2">
//                 <td style={{ cellSpacing: "10px" }}>
//                   <span className="font-receipt">ITEM</span>
//                 </td>
//                 <td className="text-right" style={{ cellSpacing: "10px" }}>
//                   <span className="font-receipt">ITBIS</span>
//                 </td>
//                 <td className="text-right" style={{ cellSpacing: "10px" }}>
//                   <span className="font-receipt">VALOR</span>
//                 </td>
//               </tr>
//               <tr key="h3">
//                 <td colSpan="3">
//                   ---------------------------------------------------------------
//                 </td>
//               </tr>
//             </thead>
//             <tbody>
//               {invoiceDetail.map((item) => (
//                 <React.Fragment key={"F" + item.id}>
//                   <tr key={"M" + item.id}>
//                     <td colSpan="3">
//                       <span className="font-receipt font-receipt-small">
//                         {item.product.description}
//                       </span>
//                     </td>
//                   </tr>

//                   <tr key={item.product.id}>
//                     <td>
//                       <span className="font-receipt font-receipt-small">
//                         {item.quantity} x {formatNumber(item.product.price)}
//                       </span>
//                     </td>
//                     <td className="text-right">
//                       <span className="font-receipt font-receipt-small">
//                         {formatNumber(item.itbis)}
//                       </span>
//                     </td>
//                     <td className="text-right">
//                       <span className="font-receipt font-receipt-small">
//                         {formatNumber(item.quantity * item.product.price)}
//                       </span>
//                     </td>
//                   </tr>

//                   {item.discount > 0 && (
//                     <tr key={"D" + item.product.id}>
//                       <td colSpan="2">
//                         <span className="font-receipt font-receipt-small">
//                           {"DESCUENTO"}
//                         </span>
//                       </td>
//                       <td className="text-right">
//                         {"-"}
//                         <span className="font-receipt font-receipt-small">
//                           {formatNumber(item.discount)}
//                         </span>
//                       </td>
//                     </tr>
//                   )}

//                   <tr>
//                     <td colSpan="3">
//                       <span
//                         className="font-receipt font-receipt-small"
//                         style={{ color: "white", fontSize: "0.6em" }}
//                       >
//                         |
//                       </span>
//                     </td>
//                   </tr>
//                 </React.Fragment>
//               ))}

//               <tr key="f1">
//                 <td colSpan="3">
//                   ---------------------------------------------------------------
//                 </td>
//               </tr>
//               <tr key="f2">
//                 <td colSpan="2">
//                   <span className="font-receipt font-receipt-medium">
//                     SUBTOTAL
//                   </span>
//                 </td>
//                 <td className="text-right">
//                   <span className="font-receipt font-receipt-medium">
//                     {formatNumber(valorTotal - itbisTotal)}
//                   </span>
//                 </td>
//               </tr>

//               <tr key="f4">
//                 <td colSpan="2">
//                   <span className="font-receipt font-receipt-medium">
//                     DESCUENTO
//                   </span>
//                 </td>
//                 <td className="text-right">
//                   <span className="font-receipt font-receipt-medium">
//                     {formatNumber(discountTotal)}
//                   </span>
//                 </td>
//               </tr>

//               <tr key="f3">
//                 <td colSpan="2">
//                   <span className="font-receipt font-receipt-medium">
//                     ITBIS
//                   </span>
//                 </td>
//                 <td className="text-right">
//                   <span className="font-receipt font-receipt-medium">
//                     {formatNumber(itbisTotal)}
//                   </span>
//                 </td>
//               </tr>

//               <tr key="f5">
//                 <td colSpan="2">
//                   <span className="font-receipt font-receipt-big">
//                     <b>TOTAL A PAGAR</b>
//                   </span>
//                 </td>
//                 <td className="text-right">
//                   <span className="font-receipt font-receipt-big">
//                     <b>{formatNumber(valorTotal - discountTotal)}</b>
//                   </span>
//                 </td>
//               </tr>
//             </tbody>
//           </table>
//         )}
//         <div className="mt-4">
//           <span className="font-receipt font-receipt-small-F">
//             Items: {invoiceDetail.length}
//           </span>
//         </div>
//         <div>
//           <span className="font-receipt font-receipt-small-F">
//             No. Factura:{" "}
//           </span>
//           <span className="font-receipt font-receipt-small-F">
//             {invoiceHeader.length && invoiceHeader[0].sequence}
//           </span>
//         </div>
//         <div>
//           <span className="font-receipt font-receipt-small-F">
//             Método de pago:{" "}
//           </span>
//           <span className="font-receipt font-receipt-small-F">
//             {invoiceHeader.length && invoiceHeader[0].paymentMethod}
//           </span>
//         </div>
//         <div>
//           <span className="font-receipt font-receipt-small-F">
//             Le atendió: {createdUserName}
//           </span>
//         </div>
//         <div className="mt-4" style={{ marginLeft: "115px" }}>
//           GRACIAS POR SU COMPRA!
//         </div>
//         <div
//           className="mt-4 font-receipt-small-F"
//           style={{ height: "55px", fontFamily: "TimesNewRoman" }}
//         >
//           II
//         </div>
//       </div>
//     );
//   }
// }

export default PrintConduce;