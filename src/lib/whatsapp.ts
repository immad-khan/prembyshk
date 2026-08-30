export const WHATSAPP_NUMBER = "923038064241";
export const WHATSAPP_DISPLAY = "+92 303 806 4241";

export function whatsappLink(message: string, phone = WHATSAPP_NUMBER): string {
  const encoded = encodeURIComponent(message.trim());
  return `https://wa.me/${phone}?text=${encoded}`;
}

export function defaultProductMessage(name: string, slug: string): string {
  return `Assalam o Alaikum! I'm interested in the "${name}" (${slug}) from Prem by SHK. Please share more details and availability. Thank you.`;
}
