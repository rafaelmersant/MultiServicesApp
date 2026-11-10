// Selling prices include ITBIS. Round the complete line, not each unit first.
export function includedLineItbis(price, quantity, unitTax) {
  const grossPrice = Number(price), count = Number(quantity), storedTax = Number(unitTax);
  if (![grossPrice, count, storedTax].every(Number.isFinite) || grossPrice < 0 || count < 0 || storedTax < 0) {
    throw new Error("Precio, cantidad o ITBIS inválido.");
  }
  if (storedTax === 0) return 0;
  const rate = [18, 16].find(value => Math.abs(storedTax - grossPrice * value / (100 + value)) <= 0.001000001);
  if (!rate) throw new Error("El ITBIS del producto no corresponde a su precio. Corrige el producto antes de agregarlo.");
  const grossLine = Math.round(grossPrice * count * 100) / 100;
  return Math.round((grossLine * rate / (100 + rate) + Number.EPSILON) * 1000) / 1000;
}
