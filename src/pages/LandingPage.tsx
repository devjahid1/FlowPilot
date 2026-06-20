import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiArrowRight,
  FiBarChart2,
  FiCheck,
  FiChevronDown,
  FiCommand,
  FiCpu,
  FiLayers,
  FiPlay,
  FiShield,
  FiTarget,
  FiZap,
} from "react-icons/fi";
import Navbar from "@/components/Navbar";
import DemoModal from "@/components/DemoModal";
import { plans } from "@/services/stripe";

const companies = ["Linear", "Vercel", "Stripe", "Ramp", "Notion", "Figma"];
const features = [
  [FiCpu, "AI workflow routing", "Classify requests, assign owners, and trigger next steps from one intelligent intake layer."],
  [FiTarget, "Priority scoring", "Spot revenue risk, blocked launches, and urgent accounts before they become noisy escalations."],
  [FiLayers, "Connected workspaces", "Sync context across CRM, support, product, and docs without forcing teams into another silo."],
  [FiBarChart2, "Executive reporting", "Turn live operating data into clean dashboards your leadership team can trust every Monday."],
  [FiShield, "Governed automation", "Ship automations with audit trails, approval rules, role controls, and enterprise-grade privacy."],
  [FiZap, "Launch playbooks", "Package repeatable workflows for onboarding, renewals, incidents, beta programs, and releases."],
] as const;
const faqs = [
  ["Can FlowPilot replace our project management tool?", "FlowPilot coordinates work across your current tools instead of forcing a rip-and-replace."],
  ["How long does implementation take?", "Most teams launch the first workflow in less than a week."],
  ["How does the free trial work?", "Every new account gets two premium actions before upgrading is required."],
  ["Is this connected to Stripe test mode?", "Yes. Configure Stripe env vars for hosted checkout, or use the built-in local test checkout for demo subscriptions."],
];

function SectionHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <motion.div
      className="mx-auto max-w-3xl text-center"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-300">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl dark:text-white">{title}</h2>
      <p className="mt-4 leading-7 text-slate-600 dark:text-slate-300">{description}</p>
    </motion.div>
  );
}

function DashboardPreview() {
  return (
    <motion.div
      className="relative mx-auto w-full max-w-5xl overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xl shadow-slate-300/40 dark:border-white/10 dark:bg-slate-950"
      initial={{ opacity: 0, y: 36, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.15 }}
    >
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-white/10">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-rose-400" />
          <span className="h-3 w-3 rounded-full bg-amber-400" />
          <span className="h-3 w-3 rounded-full bg-emerald-400" />
        </div>
        <div className="hidden rounded-full bg-slate-100 px-4 py-1 text-xs font-medium text-slate-500 sm:block dark:bg-white/10 dark:text-slate-300">
          live operations cockpit
        </div>
      </div>
      <div className="grid lg:grid-cols-[220px_1fr]">
        <aside className="hidden border-r border-slate-200 bg-slate-50 p-4 lg:block dark:border-white/10 dark:bg-white/[0.03]">
          {["Launches", "Renewals", "Incidents", "AI Rules"].map((item, index) => (
            <div
              key={item}
              className={`mb-2 flex items-center gap-3 rounded-md px-3 py-2 text-sm ${
                index === 0 ? "bg-slate-950 text-white dark:bg-cyan-400 dark:text-slate-950" : "text-slate-600 dark:text-slate-300"
              }`}
            >
              <FiCommand aria-hidden />
              {item}
            </div>
          ))}
        </aside>
        <div className="p-4 sm:p-6">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              ["Pipeline saved", "$1.8M", "22% ahead"],
              ["Auto-routed", "14.2K", "this month"],
              ["Risk reduced", "38%", "renewals"],
            ].map(([label, value, meta]) => (
              <div key={label} className="rounded-lg border border-slate-200 p-4 dark:border-white/10">
                <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
                <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">{value}</p>
                <p className="mt-1 text-xs font-medium text-emerald-600 dark:text-emerald-300">{meta}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-lg border border-slate-200 p-4 dark:border-white/10">
              <div className="mb-6 flex items-center justify-between">
                <p className="font-medium text-slate-900 dark:text-white">Workflow velocity</p>
                <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700 dark:bg-cyan-400/10 dark:text-cyan-200">+31%</span>
              </div>
              <div className="flex h-44 items-end gap-3">
                {[52, 74, 58, 88, 66, 96, 78, 112].map((height, index) => (
                  <motion.span key={height + index} className="w-full rounded-t bg-slate-900 dark:bg-cyan-300" initial={{ height: 12 }} animate={{ height }} transition={{ duration: 0.7, delay: index * 0.05 }} />
                ))}
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 p-4 dark:border-white/10">
              <p className="font-medium text-slate-900 dark:text-white">Priority queue</p>
              <div className="mt-4 space-y-3">
                {["Enterprise renewal risk", "Beta launch approval", "Security review SLA"].map((item, index) => (
                  <div key={item} className="flex items-center justify-between rounded-md bg-slate-50 p-3 dark:bg-white/[0.04]">
                    <span className="text-sm text-slate-700 dark:text-slate-200">{item}</span>
                    <span className={`h-2.5 w-2.5 rounded-full ${index === 0 ? "bg-rose-500" : index === 1 ? "bg-amber-400" : "bg-emerald-400"}`} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function LandingPage() {
  const [demoOpen, setDemoOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <main className="min-h-screen overflow-hidden bg-slate-50 text-slate-950 dark:bg-[#050816] dark:text-white">
      <Navbar />
      <section className="px-5 pb-20 pt-20 sm:px-6 lg:px-8 lg:pb-28 lg:pt-24">
        <div className="mx-auto max-w-7xl">
          <motion.div className="mx-auto max-w-4xl text-center" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
            <p className="mx-auto inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-semibold text-cyan-800 dark:border-cyan-300/20 dark:bg-cyan-300/10 dark:text-cyan-100">
              <FiZap aria-hidden /> AI operations for high-growth SaaS teams
            </p>
            <h1 className="mt-7 text-4xl font-semibold tracking-tight text-slate-950 sm:text-6xl lg:text-7xl dark:text-white">FlowPilot</h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl dark:text-slate-300">
              Automate customer operations, surface revenue risk, and keep teams aligned with one premium workflow intelligence platform.
            </p>
            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <Link to="/login" className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-300 transition hover:-translate-y-0.5 hover:bg-cyan-700 dark:bg-cyan-300 dark:text-slate-950">
                Start Free <FiArrowRight aria-hidden />
              </Link>
              <button type="button" onClick={() => navigate("/checkout?plan=pro")} className="inline-flex items-center justify-center gap-2 rounded-full border border-cyan-300 bg-white px-6 py-3 text-sm font-semibold text-cyan-800 transition hover:-translate-y-0.5 dark:border-cyan-300 dark:bg-white/10 dark:text-white">
                Start 14-Day Trial
              </button>
              <button type="button" onClick={() => setDemoOpen(true)} className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-800 transition hover:-translate-y-0.5 hover:border-cyan-300 hover:text-cyan-700 dark:border-white/10 dark:bg-white/10 dark:text-white">
                <FiPlay aria-hidden /> Watch Demo
              </button>
            </div>
          </motion.div>
          <div className="mt-14"><DashboardPreview /></div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white px-5 py-8 dark:border-white/10 dark:bg-white/[0.03]">
        <div className="mx-auto max-w-7xl">
          <p className="text-center text-sm font-medium uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Trusted by teams scaling serious operations</p>
          <div className="mt-6 grid grid-cols-2 gap-4 text-center text-lg font-semibold text-slate-500 sm:grid-cols-3 lg:grid-cols-6 dark:text-slate-300">
            {companies.map((company) => <span key={company} className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 dark:border-white/10 dark:bg-white/[0.04]">{company}</span>)}
          </div>
        </div>
      </section>

      <section id="features" className="px-5 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeading eyebrow="Features" title="Everything your operating rhythm needs" description="Context, automation, and reporting for teams that need to move faster without process debt." />
          <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {features.map(([Icon, title, text]) => (
              <article key={title} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-950 text-white dark:bg-cyan-300 dark:text-slate-950"><Icon aria-hidden /></div>
                <h3 className="mt-5 text-xl font-semibold text-slate-950 dark:text-white">{title}</h3>
                <p className="mt-3 leading-7 text-slate-600 dark:text-slate-300">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="bg-slate-950 px-5 py-24 text-white sm:px-6 lg:px-8 dark:bg-white/[0.04]">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">How it works</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">From scattered work to calm execution in three steps.</h2>
          </div>
          <div className="grid gap-4">
            {["Connect your tools", "Map no-code workflow rules", "Automate, alert, and report"].map((step, index) => (
              <div key={step} className="flex gap-4 rounded-lg border border-white/10 bg-white/[0.06] p-5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cyan-300 font-semibold text-slate-950">{index + 1}</span>
                <div><h3 className="font-semibold">{step}</h3><p className="mt-2 text-sm leading-6 text-slate-300">Configure once, then improve as your team learns what matters.</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-24 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Testimonials" title="Built for teams that need leverage now" description="Operations, success, and product leaders use FlowPilot to turn work into measurable progress." />
        <div className="mx-auto mt-14 grid max-w-7xl gap-5 lg:grid-cols-3">
          {["We cut weekly status meetings in half.", "Renewal risk moved out of spreadsheets.", "Leadership finally trusts the operating dashboard."].map((quote, index) => (
            <article key={quote} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
              <p className="text-lg leading-8 text-slate-700 dark:text-slate-200">&ldquo;{quote}&rdquo;</p>
              <p className="mt-6 font-semibold text-slate-950 dark:text-white">{["Maya Chen", "Andre Wilkins", "Leah Martin"][index]}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="pricing" className="bg-white px-5 py-24 sm:px-6 lg:px-8 dark:bg-white/[0.03]">
        <SectionHeading eyebrow="Pricing" title="Plans that scale with your workflows" description="Start with two free premium actions, then upgrade when your team is ready." />
        <div className="mx-auto mt-14 grid max-w-7xl gap-5 lg:grid-cols-3">
          {Object.values(plans).map((plan) => (
            <article key={plan.id} className={`rounded-lg border p-6 shadow-sm ${plan.id === "pro" ? "border-cyan-300 bg-slate-950 text-white dark:bg-cyan-300 dark:text-slate-950" : "border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/[0.04]"}`}>
              <h3 className="text-xl font-semibold">{plan.name}</h3>
              <p className="mt-6 text-4xl font-semibold">{plan.priceLabel}</p>
              <Link to={`/checkout?plan=${plan.id}`} className={`mt-7 inline-flex w-full items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition ${plan.id === "pro" ? "bg-white text-slate-950 dark:bg-slate-950 dark:text-white" : "bg-slate-950 text-white dark:bg-white dark:text-slate-950"}`}>
                Start 14-Day Trial
              </Link>
              <ul className="mt-7 space-y-3">
                {plan.features.map((item) => <li key={item} className="flex gap-3 text-sm"><FiCheck className="mt-0.5 shrink-0 text-emerald-500" />{item}</li>)}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section id="faq" className="px-5 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <SectionHeading eyebrow="FAQ" title="Questions before you launch" description="Practical answers for evaluating FlowPilot as your workflow intelligence layer." />
          <div className="mt-12 divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white dark:divide-white/10 dark:border-white/10 dark:bg-white/[0.04]">
            {faqs.map(([question, answer]) => (
              <details key={question} className="group p-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-slate-950 dark:text-white">{question}<FiChevronDown className="shrink-0 transition group-open:rotate-180" /></summary>
                <p className="mt-4 leading-7 text-slate-600 dark:text-slate-300">{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 pb-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl rounded-lg bg-slate-950 p-8 text-white sm:p-10 lg:flex lg:items-center lg:justify-between lg:gap-10 dark:bg-cyan-300 dark:text-slate-950">
          <div><p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300 dark:text-slate-700">Newsletter</p><h2 className="mt-3 text-3xl font-semibold tracking-tight">Get the operating memo SaaS leaders read.</h2></div>
          <form className="mt-8 flex w-full flex-col gap-3 sm:flex-row lg:mt-0 lg:max-w-md">
            <input type="email" required placeholder="you@company.com" className="min-h-12 flex-1 rounded-full border border-white/15 bg-white px-5 text-sm text-slate-950 outline-none" />
            <button className="rounded-full bg-cyan-300 px-5 text-sm font-semibold text-slate-950 dark:bg-slate-950 dark:text-white">Subscribe</button>
          </form>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white px-5 py-10 dark:border-white/10 dark:bg-white/[0.03]">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <Link to="/" className="font-semibold text-slate-950 dark:text-white">FlowPilot</Link>
          <span className="text-sm text-slate-500 dark:text-slate-400">© 2026 FlowPilot Inc.</span>
        </div>
      </footer>

      <DemoModal open={demoOpen} onClose={() => setDemoOpen(false)} />
    </main>
  );
}
