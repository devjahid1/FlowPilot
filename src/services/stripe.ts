import { loadStripe } from "@stripe/stripe-js";

export type PlanId = "starter" | "pro" | "enterprise";

export const plans: Record<
  PlanId,
  { id: PlanId; name: string; price: number; priceLabel: string; stripePriceEnv: string; features: string[] }
> = {
  starter: {
    id: "starter",
    name: "Starter",
    price: 9,
    priceLabel: "$9/month",
    stripePriceEnv: "VITE_STRIPE_STARTER_PRICE_ID",
    features: ["Unlimited launches", "10 active AI rules", "Basic renewal tracking"],
  },
  pro: {
    id: "pro",
    name: "Pro",
    price: 29,
    priceLabel: "$29/month",
    stripePriceEnv: "VITE_STRIPE_PRO_PRICE_ID",
    features: ["Unlimited AI rules", "Incident board", "Priority automation templates"],
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    price: 99,
    priceLabel: "$99/month",
    stripePriceEnv: "VITE_STRIPE_ENTERPRISE_PRICE_ID",
    features: ["Advanced governance", "Team reporting", "Dedicated workspace controls"],
  },
};

export const stripePromise = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
  : null;

export async function createCheckoutSession(planId: PlanId, userId: string) {
  const endpoint = import.meta.env.VITE_STRIPE_CHECKOUT_ENDPOINT;
  if (!endpoint) {
    return null;
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ planId, userId }),
  });

  if (!response.ok) {
    throw new Error("Unable to create Stripe Checkout session.");
  }

  return (await response.json()) as { sessionId: string };
}
