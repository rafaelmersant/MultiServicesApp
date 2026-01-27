export function formatNumber(amount) {
  return parseFloat(amount)
    .toFixed(2)
    .replace(/\d(?=(\d{3})+\.)/g, "$&,");
}

export function formatNumberThreeDecimals(amount) {
  return parseFloat(amount)
    .toFixed(3)
    .replace(/\d(?=(\d{3})+\.)/g, "$&,");
}