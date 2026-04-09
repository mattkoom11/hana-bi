/** Dispatched by `SiteHeader` so any client component can open the cart drawer. */
export const OPEN_CART_EVENT = "hana-bi:open-cart";

export function openCartDrawer(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(OPEN_CART_EVENT));
  }
}
