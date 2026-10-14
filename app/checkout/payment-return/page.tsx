import Link from "next/link";
import {
  completePayStationOrder,
  verifyPayStationPayment,
} from "@/lib/paystation";
import { formatPrice } from "@/lib/utils";

type PaymentResult =
  | { status: "success"; orderNumber: string; total: string; currency: string }
  | { status: "pending" | "failed" | "unavailable"; orderNumber?: string };

async function checkPayment(invoiceNumber: string): Promise<PaymentResult> {
  try {
    const payment = await verifyPayStationPayment(invoiceNumber);
    if (payment.status !== "success") {
      return { status: payment.status, orderNumber: payment.order.number };
    }

    const order = await completePayStationOrder(
      payment.order,
      payment.transactionId
    );
    return {
      status: "success",
      orderNumber: order.number,
      total: order.total,
      currency: order.currency,
    };
  } catch (error) {
    console.error("PayStation return verification failed", error);
    return { status: "unavailable" };
  }
}

export default async function PaymentReturnPage({
  searchParams,
}: {
  searchParams: Promise<{ invoice_number?: string }>;
}) {
  const { invoice_number: invoiceNumber } = await searchParams;
  const result = invoiceNumber
    ? await checkPayment(invoiceNumber)
    : { status: "unavailable" as const };

  const isPaid = result.status === "success";
  const title =
    result.status === "success"
      ? "Payment confirmed."
      : result.status === "failed"
        ? "Payment not completed."
        : result.status === "pending"
          ? "Payment pending."
          : "Payment verification pending.";

  return (
    <div className="flex min-h-[55vh] flex-col justify-between px-4 pb-24 pt-32 lg:px-6">
      <div>
        <p className="mb-4 text-xs font-bold uppercase tracking-wide">
          {isPaid ? "Thank you" : "Checkout"}
        </p>
        <h1 className="max-w-5xl text-[14vw] leading-[0.94] font-normal tracking-[-0.065em] md:text-[8vw]">
          {title}
        </h1>
      </div>
      <div className="mt-16 border-t-2 border-current pt-5">
        {result.status === "success" && (
          <>
            <p className="text-sm">
              Order number: <span className="font-bold">{result.orderNumber}</span>
            </p>
            <p className="mt-2 text-sm">
              Total:{" "}
              <span className="font-bold">
                {formatPrice(result.total, result.currency)}
              </span>
            </p>
          </>
        )}
        {result.status === "pending" && (
          <p className="text-sm">
            We have not received final payment confirmation yet. Refresh this
            page in a moment to check again.
          </p>
        )}
        {result.status === "failed" && (
          <p className="text-sm">
            The payment was not completed. Your order remains unpaid.
          </p>
        )}
        {result.status === "unavailable" && (
          <p className="text-sm">
            We could not verify the payment right now. Your order has not been
            marked as paid. Please refresh this page or contact us for help.
          </p>
        )}
        <Link
          href="/"
          className="link-hover mt-6 inline-flex text-xl md:text-2xl"
        >
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
