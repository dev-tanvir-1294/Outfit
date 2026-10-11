import {
  createOrder,
  getProductById,
  listProductVariations,
} from "@/lib/woocommerce";

interface CheckoutLine {
  productId: number;
  quantity: number;
  options?: Record<string, string>;
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

export async function POST(request: Request) {
  const body = await request.json();

  const lineItems = Array.isArray(body.lineItems) ? body.lineItems : [];
  if (lineItems.length === 0) {
    return Response.json({ error: "Your cart is empty" }, { status: 400 });
  }

  try {
    const resolvedLineItems = await Promise.all(
      (lineItems as CheckoutLine[]).map(async (line) => {
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
      paymentMethod: body.paymentMethod ?? "cod",
      paymentMethodTitle: body.paymentMethodTitle,
      billing: body.billing ?? {},
      shipping: body.shipping ?? {},
      lineItems: resolvedLineItems,
    });

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
