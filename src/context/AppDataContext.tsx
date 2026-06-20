import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import { createId, readStorage, writeStorage } from "@/utils/storage";
import type { PlanId } from "@/services/stripe";

export type Launch = { id: string; title: string; owner: string; date: string; status: string };
export type Renewal = { id: string; company: string; status: string; renewalDate: string; value: string };
export type Incident = { id: string; title: string; severity: string; status: "Open" | "In Progress" | "Resolved" };
export type Rule = { id: string; name: string; trigger: string; action: string; enabled: boolean };
export type Subscription = { premium: boolean; plan: PlanId | null; usageCount: number; trialLimit: number };

type AppData = {
  launches: Launch[];
  renewals: Renewal[];
  incidents: Incident[];
  rules: Rule[];
  subscription: Subscription;
  trialMessage: string;
  canUsePremium: boolean;
  consumePremiumUse: () => boolean;
  markPremium: (plan: PlanId) => void;
  saveLaunch: (launch: Omit<Launch, "id"> & { id?: string }) => void;
  deleteLaunch: (id: string) => void;
  saveIncident: (incident: Incident) => void;
  deleteIncident: (id: string) => void;
  saveRule: (rule: Omit<Rule, "id"> & { id?: string }) => void;
  deleteRule: (id: string) => void;
  toggleRule: (id: string) => void;
};

const AppDataContext = createContext<AppData | null>(null);

function defaults() {
  return {
    launches: [
      { id: "launch_1", title: "Enterprise onboarding v2", owner: "Maya", date: "2026-07-08", status: "On Track" },
      { id: "launch_2", title: "Billing insights beta", owner: "Andre", date: "2026-07-18", status: "At Risk" },
    ] as Launch[],
    renewals: [
      { id: "renewal_1", company: "Northstar Labs", status: "Healthy", renewalDate: "2026-08-14", value: "$42,000" },
      { id: "renewal_2", company: "SignalForge", status: "Needs Attention", renewalDate: "2026-07-28", value: "$18,500" },
      { id: "renewal_3", company: "Arcbyte", status: "Renewed", renewalDate: "2026-06-12", value: "$31,200" },
    ] as Renewal[],
    incidents: [
      { id: "incident_1", title: "Webhook delivery latency", severity: "High", status: "Open" },
      { id: "incident_2", title: "CRM sync retry backlog", severity: "Medium", status: "In Progress" },
      { id: "incident_3", title: "Invoice export bug", severity: "Low", status: "Resolved" },
    ] as Incident[],
    rules: [
      { id: "rule_1", name: "Escalate renewal risk", trigger: "Health score below 70", action: "Notify CSM lead", enabled: true },
      { id: "rule_2", name: "Launch blocker alert", trigger: "Task blocked for 48h", action: "Create incident", enabled: false },
    ] as Rule[],
    subscription: { premium: false, plan: null, usageCount: 0, trialLimit: 2 } as Subscription,
  };
}

export function AppDataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const storageKey = `flowpilot:data:${user?.uid ?? "guest"}`;
  const initial = readStorage(storageKey, defaults());
  const [launches, setLaunches] = useState<Launch[]>(initial.launches);
  const [renewals] = useState<Renewal[]>(initial.renewals);
  const [incidents, setIncidents] = useState<Incident[]>(initial.incidents);
  const [rules, setRules] = useState<Rule[]>(initial.rules);
  const [subscription, setSubscription] = useState<Subscription>(initial.subscription);
  const [trialMessage, setTrialMessage] = useState("");

  useEffect(() => {
    const next = readStorage(storageKey, defaults());
    setLaunches(next.launches);
    setIncidents(next.incidents);
    setRules(next.rules);
    setSubscription(next.subscription);
    setTrialMessage("");
  }, [storageKey]);

  useEffect(() => {
    writeStorage(storageKey, { launches, renewals, incidents, rules, subscription });
  }, [incidents, launches, renewals, rules, storageKey, subscription]);

  const persist = (next: Partial<ReturnType<typeof defaults>>) => {
    writeStorage(storageKey, { launches, renewals, incidents, rules, subscription, ...next });
  };

  const canUsePremium = subscription.premium || subscription.usageCount < subscription.trialLimit;

  const consumePremiumUse = () => {
    if (subscription.premium) return true;
    if (subscription.usageCount >= subscription.trialLimit) {
      setTrialMessage("Your free trial has ended. Upgrade to continue.");
      return false;
    }
    const next = { ...subscription, usageCount: subscription.usageCount + 1 };
    setSubscription(next);
    persist({ subscription: next });
    setTrialMessage(next.usageCount >= next.trialLimit ? "Your free trial has ended. Upgrade to continue." : "");
    return true;
  };

  const markPremium = (plan: PlanId) => {
    const next = { ...subscription, premium: true, plan };
    setSubscription(next);
    persist({ subscription: next });
    setTrialMessage("");
  };

  const saveLaunch: AppData["saveLaunch"] = (launch) => {
    if (!consumePremiumUse()) return;
    const next = launch.id
      ? launches.map((item) => (item.id === launch.id ? ({ ...launch, id: launch.id } as Launch) : item))
      : [{ ...launch, id: createId("launch") }, ...launches];
    setLaunches(next);
    persist({ launches: next });
  };

  const deleteLaunch = (id: string) => {
    const next = launches.filter((item) => item.id !== id);
    setLaunches(next);
    persist({ launches: next });
  };

  const saveIncident = (incident: Incident) => {
    const next = incidents.map((item) => (item.id === incident.id ? incident : item));
    setIncidents(next);
    persist({ incidents: next });
  };

  const deleteIncident = (id: string) => {
    const next = incidents.filter((item) => item.id !== id);
    setIncidents(next);
    persist({ incidents: next });
  };

  const saveRule: AppData["saveRule"] = (rule) => {
    if (!consumePremiumUse()) return;
    const next = rule.id
      ? rules.map((item) => (item.id === rule.id ? ({ ...rule, id: rule.id } as Rule) : item))
      : [{ ...rule, id: createId("rule") }, ...rules];
    setRules(next);
    persist({ rules: next });
  };

  const deleteRule = (id: string) => {
    const next = rules.filter((item) => item.id !== id);
    setRules(next);
    persist({ rules: next });
  };

  const toggleRule = (id: string) => {
    if (!canUsePremium) {
      setTrialMessage("Your free trial has ended. Upgrade to continue.");
      return;
    }
    const next = rules.map((item) => (item.id === id ? { ...item, enabled: !item.enabled } : item));
    setRules(next);
    persist({ rules: next });
  };

  const value = useMemo(
    () => ({
      launches,
      renewals,
      incidents,
      rules,
      subscription,
      trialMessage,
      canUsePremium,
      consumePremiumUse,
      markPremium,
      saveLaunch,
      deleteLaunch,
      saveIncident,
      deleteIncident,
      saveRule,
      deleteRule,
      toggleRule,
    }),
    [launches, renewals, incidents, rules, subscription, trialMessage, canUsePremium],
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const context = useContext(AppDataContext);
  if (!context) throw new Error("useAppData must be used inside AppDataProvider.");
  return context;
}
