import {
  completePayStationOrder,
  verifyPayStationPayment,
} from "@/lib/paystation";

interface PayStationIpn {
  invoice_number?: unknown;
  trx_status?: unknown;
  trx_amount?: unknown;
}

function toAmount(value: unknown): number | null {
  const amount =
    typeof value === "number" || typeof value === "string"
      ? Number(value)
      : Number.NaN;
  return Number.isFinite(amount) && amount >= 0 ? amount : null;
}

function amountsMatch(first: number, second: number): boolean {
  return Math.round(first * 100) === Math.round(second * 100);
}

export async function POST(request: Request) {
  let payload: PayStationIpn;
  try {
    const parsed: unknown = await request.json();
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      return Response.json({ error: "Invalid IPN payload" }, { status: 400 });
    }
    payload = parsed as PayStationIpn;
  } catch {
    return Response.json({ error: "Invalid IPN payload" }, { status: 400 });
  }

  const invoiceNumber =
    typeof payload.invoice_number === "string"
      ? payload.invoice_number
      : "";
  if (
    !invoiceNumber ||
    typeof payload.trx_status !== "string" ||
    payload.trx_status.toLowerCase() !== "success"
  ) {
    return Response.json({ error: "Invalid payment notification" }, { status: 422 });
  }

  try {
    const payment = await verifyPayStationPayment(invoiceNumber);
    const notifiedAmount = toAmount(payload.trx_amount);
    const orderAmount = toAmount(payment.order.total);
    if (
      payment.status !== "success" ||
      notifiedAmount === null ||
      orderAmount === null ||
      !amountsMatch(notifiedAmount, orderAmount)
    ) {
      return Response.json(
        { error: "Payment notification could not be verified" },
        { status: 422 }
      );
    }

    await completePayStationOrder(payment.order, payment.transactionId);
    return Response.json({ status: "success" });
  } catch (error) {
    console.error("PayStation IPN processing failed", error);
    return Response.json(
      { error: "Payment notification could not be processed" },
      { status: 503 }
    );
  }
}
