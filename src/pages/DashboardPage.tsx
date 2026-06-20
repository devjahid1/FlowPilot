import { useState } from "react";
import { Link } from "react-router-dom";
import { FiEdit2, FiLogOut, FiPlus, FiTrash2 } from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";
import { useAppData, type Incident, type Launch, type Rule } from "@/context/AppDataContext";

function StatusPill({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-white/10 dark:text-slate-200">{children}</span>;
}

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const {
    launches,
    renewals,
    incidents,
    rules,
    subscription,
    trialMessage,
    canUsePremium,
    saveLaunch,
    deleteLaunch,
    saveIncident,
    deleteIncident,
    saveRule,
    deleteRule,
    toggleRule,
  } = useAppData();
  const [launchForm, setLaunchForm] = useState<Omit<Launch, "id"> & { id?: string }>({ title: "", owner: "", date: "", status: "On Track" });
  const [ruleForm, setRuleForm] = useState<Omit<Rule, "id"> & { id?: string }>({ name: "", trigger: "", action: "", enabled: true });

  const submitLaunch = (event: React.FormEvent) => {
    event.preventDefault();
    saveLaunch(launchForm);
    setLaunchForm({ title: "", owner: "", date: "", status: "On Track" });
  };

  const submitRule = (event: React.FormEvent) => {
    event.preventDefault();
    saveRule(ruleForm);
    setRuleForm({ name: "", trigger: "", action: "", enabled: true });
  };

  const setIncidentStatus = (incident: Incident, status: Incident["status"]) => saveIncident({ ...incident, status });

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950 dark:bg-[#050816] dark:text-white">
      <header className="border-b border-slate-200 bg-white px-5 py-4 dark:border-white/10 dark:bg-white/[0.03]">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link to="/" className="font-semibold text-cyan-700 dark:text-cyan-300">FlowPilot</Link>
            <h1 className="mt-2 text-2xl font-semibold">Dashboard</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">{user?.email}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <StatusPill>{subscription.premium ? `Premium: ${subscription.plan}` : `${subscription.trialLimit - subscription.usageCount} free uses left`}</StatusPill>
            {!subscription.premium && <Link to="/checkout?plan=pro" className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white dark:bg-cyan-300 dark:text-slate-950">Upgrade</Link>}
            <button onClick={logout} className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold dark:border-white/10">
              <FiLogOut /> Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8">
        {trialMessage && (
          <div className="mb-6 rounded-lg border border-amber-300 bg-amber-50 p-4 text-amber-900 dark:border-amber-300/30 dark:bg-amber-300/10 dark:text-amber-100">
            {trialMessage} <Link className="font-semibold underline" to="/checkout?plan=pro">Upgrade to continue.</Link>
          </div>
        )}

        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <div className="rounded-lg border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-white/[0.04]">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold">Launches</h2>
              {!canUsePremium && <StatusPill>Premium locked</StatusPill>}
            </div>
            <form onSubmit={submitLaunch} className="mt-5 grid gap-3 md:grid-cols-5">
              <input required placeholder="Launch name" value={launchForm.title} onChange={(e) => setLaunchForm({ ...launchForm, title: e.target.value })} className="rounded-lg border border-slate-200 px-3 py-2 md:col-span-2 dark:border-white/10 dark:bg-slate-950" />
              <input required placeholder="Owner" value={launchForm.owner} onChange={(e) => setLaunchForm({ ...launchForm, owner: e.target.value })} className="rounded-lg border border-slate-200 px-3 py-2 dark:border-white/10 dark:bg-slate-950" />
              <input required type="date" value={launchForm.date} onChange={(e) => setLaunchForm({ ...launchForm, date: e.target.value })} className="rounded-lg border border-slate-200 px-3 py-2 dark:border-white/10 dark:bg-slate-950" />
              <button disabled={!canUsePremium} className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50 dark:bg-cyan-300 dark:text-slate-950"><FiPlus /> Save</button>
            </form>
            <div className="mt-5 space-y-3">
              {launches.map((launch) => (
                <div key={launch.id} className="flex flex-col gap-3 rounded-lg border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-white/10">
                  <div><p className="font-semibold">{launch.title}</p><p className="text-sm text-slate-500 dark:text-slate-400">{launch.owner} · {launch.date} · {launch.status}</p></div>
                  <div className="flex gap-2">
                    <button onClick={() => setLaunchForm(launch)} className="rounded-full border border-slate-200 p-2 dark:border-white/10"><FiEdit2 /></button>
                    <button onClick={() => deleteLaunch(launch.id)} className="rounded-full border border-slate-200 p-2 text-rose-600 dark:border-white/10"><FiTrash2 /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-white/[0.04]">
            <h2 className="text-xl font-semibold">Renewals</h2>
            <div className="mt-5 space-y-3">
              {renewals.map((renewal) => (
                <div key={renewal.id} className="rounded-lg border border-slate-200 p-4 dark:border-white/10">
                  <div className="flex items-center justify-between"><p className="font-semibold">{renewal.company}</p><StatusPill>{renewal.status}</StatusPill></div>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{renewal.renewalDate} · {renewal.value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-white/[0.04]">
          <h2 className="text-xl font-semibold">Incidents</h2>
          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            {(["Open", "In Progress", "Resolved"] as Incident["status"][]).map((status) => (
              <div key={status} className="rounded-lg bg-slate-50 p-4 dark:bg-slate-950">
                <h3 className="font-semibold">{status}</h3>
                <div className="mt-4 space-y-3">
                  {incidents.filter((incident) => incident.status === status).map((incident) => (
                    <div key={incident.id} className="rounded-lg border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.04]">
                      <p className="font-medium">{incident.title}</p>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{incident.severity}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {(["Open", "In Progress", "Resolved"] as Incident["status"][]).map((next) => <button key={next} onClick={() => setIncidentStatus(incident, next)} className="rounded-full border border-slate-200 px-3 py-1 text-xs dark:border-white/10">{next}</button>)}
                        <button onClick={() => deleteIncident(incident.id)} className="rounded-full border border-slate-200 px-3 py-1 text-xs text-rose-600 dark:border-white/10">Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-white/[0.04]">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold">AI Rules</h2>
            {!canUsePremium && <StatusPill>Premium locked</StatusPill>}
          </div>
          <form onSubmit={submitRule} className="mt-5 grid gap-3 lg:grid-cols-4">
            <input required placeholder="Rule name" value={ruleForm.name} onChange={(e) => setRuleForm({ ...ruleForm, name: e.target.value })} className="rounded-lg border border-slate-200 px-3 py-2 dark:border-white/10 dark:bg-slate-950" />
            <input required placeholder="Trigger" value={ruleForm.trigger} onChange={(e) => setRuleForm({ ...ruleForm, trigger: e.target.value })} className="rounded-lg border border-slate-200 px-3 py-2 dark:border-white/10 dark:bg-slate-950" />
            <input required placeholder="Action" value={ruleForm.action} onChange={(e) => setRuleForm({ ...ruleForm, action: e.target.value })} className="rounded-lg border border-slate-200 px-3 py-2 dark:border-white/10 dark:bg-slate-950" />
            <button disabled={!canUsePremium} className="rounded-lg bg-slate-950 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50 dark:bg-cyan-300 dark:text-slate-950">Save rule</button>
          </form>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {rules.map((rule) => (
              <div key={rule.id} className="rounded-lg border border-slate-200 p-4 dark:border-white/10">
                <div className="flex items-center justify-between gap-3"><p className="font-semibold">{rule.name}</p><button onClick={() => toggleRule(rule.id)} className={`rounded-full px-3 py-1 text-xs font-semibold ${rule.enabled ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{rule.enabled ? "Enabled" : "Disabled"}</button></div>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">When {rule.trigger}, then {rule.action}</p>
                <div className="mt-3 flex gap-2">
                  <button onClick={() => setRuleForm(rule)} className="rounded-full border border-slate-200 px-3 py-1 text-xs dark:border-white/10">Edit</button>
                  <button onClick={() => deleteRule(rule.id)} className="rounded-full border border-slate-200 px-3 py-1 text-xs text-rose-600 dark:border-white/10">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
