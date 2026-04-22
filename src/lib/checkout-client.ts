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

  try {
    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map((item) =>
          item.stripePriceId
            ? { priceId: item.stripePriceId, quantity: item.quantity }
            : { name: `${item.name} — Size ${item.size}`, price: Math.round(item.price * 100), quantity: item.quantity }
        ),
        cancelUrl: `${window.location.origin}/cart`,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      const msg =
        typeof error.error === "string" && error.error
          ? error.error
          : "We couldn't reach checkout. Try again.";
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
