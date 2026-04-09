import type { CartItem } from "@/store/cart";

export type CheckoutResult = { ok: true } | { ok: false; message: string };

/**
 * Creates a Stripe Checkout session and redirects. Call only from the client.
 * @param onBeforeRedirect — e.g. close the cart drawer before navigation.
 */
export async function startCheckoutSession(
  items: CartItem[],
  onBeforeRedirect?: () => void
): Promise<CheckoutResult> {
  if (items.length === 0) {
    return { ok: false, message: "Your cart is empty." };
  }

  const missingPrice = items.find((item) => !item.stripePriceId);
  if (missingPrice) {
    return {
      ok: false,
      message: `“${missingPrice.name}” has no Stripe price ID. Configure products in the Stripe Dashboard.`,
    };
  }

  try {
    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map((item) => ({
          priceId: item.stripePriceId!,
          quantity: item.quantity,
        })),
        cancelUrl: `${window.location.origin}/cart`,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      const msg =
        typeof error.error === "string" && error.error
          ? error.error
          : "We couldn’t reach checkout. Try again.";
      return { ok: false, message: msg };
    }

    const data = await response.json();
    const url = data?.url;
    if (typeof url !== "string" || !url) {
      return { ok: false, message: "Checkout link was missing. Please try again." };
    }

    onBeforeRedirect?.();
    window.location.href = url;
    return { ok: true };
  } catch (error) {
    console.error("Checkout error:", error);
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to start checkout. Please try again.",
    };
  }
}
