import {
  createOrder,
  getProductById,
  listPaymentGateways,
  listProductVariations,
} from "@/lib/woocommerce";
import { initiatePayStationPayment } from "@/lib/paystation";

interface CheckoutLine {
  productId: number;
  quantity: number;
  options?: Record<string, string>;
}

function asStringRecord(value: unknown): Record<string, string> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value).filter(
      (entry): entry is [string, string] => typeof entry[1] === "string"
    )
  );
}

function parseCheckoutLine(value: unknown): CheckoutLine | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return null;
  }
  const candidate = value as Record<string, unknown>;
  if (
    typeof candidate.productId !== "number" ||
    typeof candidate.quantity !== "number"
  ) {
    return null;
  }

  const options = asStringRecord(candidate.options);
  return {
    productId: candidate.productId,
    quantity: candidate.quantity,
    ...(Object.keys(options).length > 0 ? { options } : {}),
  };
}

function normalizeAttributeName(name: string): string {
  return name.trim().toLowerCase().replace(/^pa_/, "");
}

function matchesVariation(
  options: Record<string, string>,
  attributes: { name: string; option: string }[]
): boolean {
  const normalizedOptions = new Map(
    Object.entries(options).map(([name, value]) => [
      normalizeAttributeName(name),
      value.trim().toLowerCase(),
    ])
  );

  return (
    attributes.every((attribute) => {
      const selectedValue = normalizedOptions.get(
        normalizeAttributeName(attribute.name)
      );
      const variationValue = attribute.option.trim().toLowerCase();
      return (
        variationValue === "" ||
        variationValue === "any" ||
        selectedValue === variationValue
      );
    }) &&
    [...normalizedOptions.keys()].every((name) =>
      attributes.some(
        (attribute) => normalizeAttributeName(attribute.name) === name
      )
    )
  );
}

function isPayStationGateway(methodId: string, title = ""): boolean {
  return `${methodId} ${title}`.toLowerCase().includes("paystation");
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    const parsed: unknown = await request.json();
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      return Response.json({ error: "Invalid checkout request" }, { status: 400 });
    }
    body = parsed as Record<string, unknown>;
  } catch {
    return Response.json({ error: "Invalid checkout request" }, { status: 400 });
  }

  const lineItems = Array.isArray(body.lineItems)
    ? body.lineItems.map(parseCheckoutLine)
    : [];
  if (lineItems.length === 0) {
    return Response.json({ error: "Your cart is empty" }, { status: 400 });
  }
  if (lineItems.some((line) => line === null)) {
    return Response.json({ error: "A cart item is invalid" }, { status: 400 });
  }
  const validLineItems = lineItems.filter(
    (line): line is CheckoutLine => line !== null
  );

  try {
    const paymentMethod =
      typeof body.paymentMethod === "string" ? body.paymentMethod : "cod";
    let paymentMethodTitle =
      typeof body.paymentMethodTitle === "string"
        ? body.paymentMethodTitle
        : paymentMethod;
    const payStationSelected = isPayStationGateway(
      paymentMethod,
      paymentMethodTitle
    );
    if (payStationSelected) {
      const gateways = await listPaymentGateways();
      const gateway = gateways.find((candidate) => candidate.id === paymentMethod);
      if (!gateway || !isPayStationGateway(gateway.id, gateway.title)) {
        throw new Error("PayStation is not enabled in WooCommerce");
      }
      paymentMethodTitle = gateway.title;
    }

    const resolvedLineItems = await Promise.all(
      validLineItems.map(async (line) => {
        if (
          !Number.isInteger(line.productId) ||
          line.productId <= 0 ||
          !Number.isInteger(line.quantity) ||
          line.quantity <= 0
        ) {
          throw new Error("A cart item has an invalid product or quantity");
        }

        const product = await getProductById(line.productId);
        if (product.type !== "variable") return line;
        if (!line.options || Object.keys(line.options).length === 0) {
          throw new Error(`Please select options for ${product.name}`);
        }

        const variations = await listProductVariations(line.productId);
        const variation = variations.find((candidate) =>
          matchesVariation(line.options!, candidate.attributes)
        );
        if (!variation) {
          throw new Error(
            `The selected options for ${product.name} are unavailable`
          );
        }

        return { ...line, variationId: variation.id };
      })
    );

    const order = await createOrder({
      paymentMethod,
      paymentMethodTitle,
      billing: asStringRecord(body.billing),
      shipping: asStringRecord(body.shipping),
      lineItems: resolvedLineItems,
    });

    if (payStationSelected) {
      const billing = asStringRecord(body.billing);
      const name = [billing.first_name, billing.last_name]
        .filter((value) => Boolean(value.trim()))
        .join(" ");
      let payment: Awaited<ReturnType<typeof initiatePayStationPayment>>;
      try {
        payment = await initiatePayStationPayment(order, {
          name,
          phone: billing.phone?.trim() ?? "",
          email: billing.email?.trim() ?? "",
          address: billing.address_1 ?? "",
        });
      } catch (error) {
        const detail =
          error instanceof Error ? error.message : "Unknown payment error";
        throw new Error(
          `Order ${order.number} was created but payment could not be started. Do not place the order again yet. ${detail}`
        );
      }
      return Response.json({ order, paymentUrl: payment.paymentUrl });
    }

    return Response.json({ order });
  } catch (err) {
    return Response.json(
      {
        error:
          err instanceof Error ? err.message : "Failed to place order",
      },
      { status: 400 }
    );
  }
}
