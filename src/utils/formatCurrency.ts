export function formatCurrency(amount: number): string {
  if (amount >= 10000000) {
    const cr = amount / 10000000;
    return `₹${cr % 1 === 0 ? cr.toFixed(0) : cr.toFixed(1)} Cr`;
  }
  if (amount >= 100000) {
    const lakh = amount / 100000;
    return `₹${lakh % 1 === 0 ? lakh.toFixed(0) : lakh.toFixed(1)} L`;
  }
  if (amount >= 1000) {
    const k = amount / 1000;
    return `₹${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}K`;
  }
  return `₹${amount}`;
}

export function formatCurrencyFull(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function formatPricePerSqft(price: number): string {
  return `₹${price.toLocaleString('en-IN')}/sq.ft`;
}

export function formatRent(amount: number): string {
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)} L/mo`;
  }
  return `₹${(amount / 1000).toFixed(0)}K/mo`;
}
