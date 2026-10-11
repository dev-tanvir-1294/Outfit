import { getStoreCurrency, listPaymentGateways } from "@/lib/woocommerce";
import type { WooPaymentGateway } from "@/lib/types";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";

const DEFAULT_GATEWAYS: WooPaymentGateway[] = [
  { id: "cod", title: "Cash on delivery", description: "", enabled: true },
];

export default async function CheckoutPage() {
  const currency = getStoreCurrency();

  let gateways: WooPaymentGateway[] = DEFAULT_GATEWAYS;
  try {
    const available = await listPaymentGateways();
    if (available.length > 0) gateways = available;
  } catch {
    // keep the COD default
  }

  return <CheckoutForm gateways={gateways} currency={currency} />;
}
