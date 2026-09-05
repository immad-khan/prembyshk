export const CURRENCY_PREFIX = "Rs ";

export function formatPrice(amount: number): string {
  return `${CURRENCY_PREFIX}${amount.toLocaleString("en-PK")}`;
}

export function ratingToStars(rating: number): number {
  return Math.round((rating / 10) * 2) / 2;
}

export function formatRating(rating: number): string {
  return (rating / 10).toFixed(1);
}

export const SHIPPING_FEE = 350;

export function shippingFor(subtotal: number): number {
  if (subtotal === 0) return 0;
  return SHIPPING_FEE;
}
