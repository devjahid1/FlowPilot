import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { CardElement, Elements, useElements, useStripe } from "@stripe/react-stripe-js";
import { FiCreditCard } from "react-icons/fi";
import { createCheckoutSession, plans, stripePromise, type PlanId } from "@/services/stripe";
import { useAuth } from "@/context/AuthContext";
import { useAppData } from "@/context/AppDataContext";

type StripeControls = {
  stripe?: ReturnType<typeof useStripe>;
  elements?: ReturnType<typeof useElements>;
};

function CheckoutFormCore({ planId, stripe, elements }: { planId: PlanId } & StripeControls) {
  const plan = plans[planId];
  const { user } = useAuth();
  const { markPremium } = useAppData();
  const navigate = useNavigate();
  const [cardName, setCardName] = useState("");
  const [manualCard, setManualCard] = useState("4242 4242 4242 4242");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setMessage("");

    try {
      if (!user) {
        navigate("/login", { state: { from: `/checkout?plan=${planId}` } });
        return;
      }

      const session = await createCheckoutSession(planId, user.uid);
      if (session && stripe) {
        const result = await (stripe as unknown as { redirectToCheckout: (input: { sessionId: string }) => Promise<{ error?: Error }> }).redirectToCheckout({
          sessionId: session.sessionId,
        });
        if (result.error) throw result.error;
        return;
      }

      if (stripe && elements) {
        const card = elements.getElement(CardElement);
        if (!card) throw new Error("Card field is not ready.");
      } else if (manualCard.replace(/\s/g, "") !== "4242424242424242") {
        throw new Error("Use Stripe test card 4242 4242 4242 4242 for local test mode.");
      }

      markPremium(planId);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Payment failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="rounded-lg border border-slate-200 bg-white p-6 shadow-xl dark:border-white/10 dark:bg-white/[0.04]">
      <h1 className="text-3xl font-semibold text-slate-950 dark:text-white">Start {plan.name}</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-300">{plan.priceLabel} after your 14-day trial.</p>
      <label className="mt-6 block text-sm font-medium text-slate-700 dark:text-slate-200">
        Name on card
        <input value={cardName} onChange={(event) => setCardName(event.target.value)} required className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-3 outline-none focus:border-cyan-400 dark:border-white/10 dark:bg-slate-950" />
      </label>
      <div className="mt-4 rounded-lg border border-slate-200 p-4 dark:border-white/10 dark:bg-slate-950">
        {stripePromise ? (
          <CardElement options={{ hidePostalCode: true }} />
        ) : (
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            Stripe test card
            <input value={manualCard} onChange={(event) => setManualCard(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-3 outline-none dark:border-white/10 dark:bg-slate-900" />
          </label>
        )}
      </div>
      {message && <p className="mt-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-200">{message}</p>}
      <button disabled={busy} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-3 font-semibold text-white disabled:opacity-60 dark:bg-cyan-300 dark:text-slate-950">
        <FiCreditCard /> {busy ? "Processing..." : "Pay with Stripe Test Card"}
      </button>
      <p className="mt-4 text-xs leading-5 text-slate-500 dark:text-slate-400">
        Local test mode accepts 4242 4242 4242 4242 and marks the account premium. Add Stripe env vars and a checkout endpoint to redirect through real Stripe test subscriptions.
      </p>
    </form>
  );
}

function StripeCheckoutForm({ planId }: { planId: PlanId }) {
  const stripe = useStripe();
  const elements = useElements();
  return <CheckoutFormCore planId={planId} stripe={stripe} elements={elements} />;
}

export default function CheckoutPage() {
  const [params] = useSearchParams();
  const selected = (params.get("plan") as PlanId | null) ?? "pro";
  const planId = selected in plans ? selected : "pro";
  const options = useMemo(() => ({}), []);

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-10 dark:bg-[#050816]">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
        <section>
          <Link to="/" className="text-sm font-semibold text-cyan-700 dark:text-cyan-300">Back to pricing</Link>
          <h2 className="mt-8 text-4xl font-semibold tracking-tight text-slate-950 dark:text-white">Stripe test checkout</h2>
          <p className="mt-4 leading-7 text-slate-600 dark:text-slate-300">
            Choose a plan, collect payment details, and unlock premium dashboard features after a successful test payment.
          </p>
          <div className="mt-8 grid gap-3">
            {Object.values(plans).map((plan) => (
              <Link key={plan.id} to={`/checkout?plan=${plan.id}`} className={`rounded-lg border p-4 ${plan.id === planId ? "border-cyan-300 bg-cyan-50 dark:bg-cyan-300/10" : "border-slate-200 bg-white dark:border-white/10 dark:bg-white/[0.04]"}`}>
                <p className="font-semibold text-slate-950 dark:text-white">{plan.name}</p>
                <p className="text-sm text-slate-600 dark:text-slate-300">{plan.priceLabel}</p>
              </Link>
            ))}
          </div>
        </section>
        {stripePromise ? (
          <Elements stripe={stripePromise} options={options}>
            <StripeCheckoutForm planId={planId} />
          </Elements>
        ) : (
          <CheckoutFormCore planId={planId} />
        )}
      </div>
    </main>
  );
}
